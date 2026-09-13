import { prisma, logSystemEvent } from '../db';
import { generateArticleHash, normalizeCanonicalUrl } from './normalizer';
import { fetchRssFeed, RawFeedItem } from './rssParser';
import { scrapeArticleHtml } from './htmlScraper';
import { analyzeArticle } from '../ai/analyzer';
import { clusterArticleToEvent } from './clustering';

export interface CollectionSummary {
  runId: string;
  sourceId?: string;
  fetchedCount: number;
  newCount: number;
  duplicateCount: number;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
}

export async function runCollectionForSource(sourceId: string): Promise<CollectionSummary> {
  const source = await prisma.source.findUnique({
    where: { id: sourceId }
  });

  if (!source) {
    throw new Error(`منبع با شناسه ${sourceId} یافت نشد.`);
  }

  if (!source.enabled) {
    return {
      runId: 'disabled',
      sourceId,
      fetchedCount: 0,
      newCount: 0,
      duplicateCount: 0,
      status: 'success'
    };
  }

  // Create CollectionRun
  const run = await prisma.collectionRun.create({
    data: {
      sourceId: source.id,
      startedAt: new Date(),
      status: 'running'
    }
  });

  await logSystemEvent('info', 'SOURCE_SYNC_STARTED', `شروع جمع‌آوری از منبع ${source.name}`, {
    sourceId: source.id,
    type: source.type
  });

  let rawItems: RawFeedItem[] = [];
  let responseTimeMs = 0;
  let httpStatus = 200;
  let fetchError: any = null;

  try {
    if (source.type === 'rss' && source.rssUrl) {
      const result = await fetchRssFeed(source.rssUrl);
      rawItems = result.items;
      responseTimeMs = result.responseTimeMs;
      httpStatus = result.httpStatus;
    } else if (source.type === 'html' && source.url) {
      const result = await scrapeArticleHtml(source.url);
      rawItems = [result.item];
      responseTimeMs = result.responseTimeMs;
      httpStatus = result.httpStatus;
    } else {
      throw new Error(`آدرس معتبر RSS یا وب‌سایت برای منبع ${source.name} تعریف نشده است.`);
    }
  } catch (err: any) {
    fetchError = err;
    responseTimeMs = err.responseTimeMs || 0;
    httpStatus = err.httpStatus || 500;
  }

  // If fetch failed completely
  if (fetchError) {
    const errorMsg = fetchError.message || String(fetchError);
    await prisma.source.update({
      where: { id: source.id },
      data: {
        lastFetchedAt: new Date(),
        lastErrorAt: new Date(),
        status: 'error',
        httpStatus,
        responseTimeMs,
        lastErrorMessage: errorMsg
      }
    });

    await prisma.collectionRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        status: 'failed',
        errorMessage: errorMsg
      }
    });

    await logSystemEvent('error', 'SOURCE_SYNC_FAILED', `خطا در واکشی منبع ${source.name}: ${errorMsg}`, {
      sourceId: source.id,
      httpStatus
    });

    return {
      runId: run.id,
      sourceId: source.id,
      fetchedCount: 0,
      newCount: 0,
      duplicateCount: 0,
      status: 'failed',
      errorMessage: errorMsg
    };
  }

  // Process fetched items
  let newCount = 0;
  let duplicateCount = 0;

  // Pre-load all regions to associate regional news
  const allRegions = await prisma.region.findMany({ select: { id: true, name: true, province: true } });

  for (const item of rawItems) {
    const canonicalUrl = normalizeCanonicalUrl(item.link);
    const hash = generateArticleHash(canonicalUrl, item.title);

    // Check if article already exists
    const existing = await prisma.article.findFirst({
      where: {
        OR: [
          { hash },
          { canonicalUrl }
        ]
      }
    });

    if (existing) {
      duplicateCount++;
      continue;
    }

    // Detect matched region
    let matchedRegionId: string | null = source.regionId || null;
    if (!matchedRegionId) {
      const fullText = `${item.title} ${item.content}`;
      for (const reg of allRegions) {
        if (fullText.includes(reg.name) || (reg.province && fullText.includes(reg.province))) {
          matchedRegionId = reg.id;
          break;
        }
      }
    }

    // Create new article
    const article = await prisma.article.create({
      data: {
        title: item.title,
        originalTitle: item.title,
        url: item.link,
        canonicalUrl,
        sourceId: source.id,
        regionId: matchedRegionId,
        author: item.author,
        publishedAt: item.publishedAt,
        discoveredAt: new Date(),
        content: item.content || item.summary,
        summary: item.summary,
        imageUrl: item.imageUrl,
        language: 'fa',
        hash,
        status: 'new',
        isSeed: false
      }
    });

    newCount++;

    // AI / NLP Analysis
    try {
      const analysis = await analyzeArticle(item.title, item.content || item.summary);

      await prisma.articleAnalysis.create({
        data: {
          articleId: article.id,
          importanceScore: analysis.importanceScore,
          mediaValueScore: analysis.mediaValueScore,
          publicInterestScore: analysis.publicInterestScore,
          crisisScore: analysis.crisisScore,
          sentiment: analysis.sentiment,
          topics: JSON.stringify(analysis.topics),
          entities: JSON.stringify(analysis.entities),
          keywords: JSON.stringify(analysis.keywords),
          summary: analysis.summary,
          isRumorPotential: analysis.isRumorPotential
        }
      });

      // Cluster article into Event
      await clusterArticleToEvent(article.id, item.title, analysis.summary, analysis.importanceScore);

      // If crisis or rumor potential detected, register Rumor & FactCheck
      if (analysis.isRumorPotential || analysis.crisisScore >= 7) {
        await prisma.rumor.create({
          data: {
            title: `احتمال شایعه / موج خبری: ${item.title.slice(0, 60)}...`,
            description: analysis.summary,
            firstSeenAt: new Date(),
            source: source.name,
            status: 'needs_review',
            riskLevel: analysis.crisisScore >= 8 ? 'critical' : 'high',
            confidence: 65,
            relatedEventId: article.eventId
          }
        });

        await prisma.factCheck.create({
          data: {
            articleId: article.id,
            claim: item.title,
            status: 'PENDING_REVIEW',
            confidence: 60,
            evidence: 'شناسایی شده توسط سیستم پایش رسانه؛ نیاز به بررسی و ارائه پاسخ رسمی توسط روابط عمومی.',
            checkedAt: new Date()
          }
        });
      }
    } catch (analysisErr) {
      console.error('[Article analysis error]', analysisErr);
    }
  }

  // Update source health and stats
  const currentTotal = await prisma.article.count({ where: { sourceId: source.id } });
  const status: 'healthy' | 'slow' = responseTimeMs > 4000 ? 'slow' : 'healthy';

  await prisma.source.update({
    where: { id: source.id },
    data: {
      lastFetchedAt: new Date(),
      lastSuccessAt: new Date(),
      status,
      httpStatus,
      responseTimeMs,
      lastErrorMessage: null,
      articleCount: currentTotal
    }
  });

  // Finish CollectionRun
  await prisma.collectionRun.update({
    where: { id: run.id },
    data: {
      finishedAt: new Date(),
      status: 'success',
      fetchedCount: rawItems.length,
      newCount,
      duplicateCount
    }
  });

  await logSystemEvent('info', 'SOURCE_SYNC_SUCCESS', `جمع‌آوری موفق از منبع ${source.name} (${newCount} خبر جدید، ${duplicateCount} تکراری)`, {
    sourceId: source.id,
    fetched: rawItems.length,
    newCount,
    responseTimeMs
  });

  return {
    runId: run.id,
    sourceId: source.id,
    fetchedCount: rawItems.length,
    newCount,
    duplicateCount,
    status: 'success'
  };
}

/**
 * Runs collection over all active sources
 */
export async function runAllSourcesCollection(): Promise<{
  totalSources: number;
  totalFetched: number;
  totalNew: number;
  totalDuplicates: number;
  results: CollectionSummary[];
}> {
  const sources = await prisma.source.findMany({
    where: {
      enabled: true,
      OR: [
        { rssUrl: { not: null } },
        { url: { not: null } }
      ]
    },
    orderBy: { priority: 'asc' }
  });

  let totalFetched = 0;
  let totalNew = 0;
  let totalDuplicates = 0;
  const results: CollectionSummary[] = [];

  for (const src of sources) {
    try {
      const res = await runCollectionForSource(src.id);
      results.push(res);
      totalFetched += res.fetchedCount;
      totalNew += res.newCount;
      totalDuplicates += res.duplicateCount;
    } catch (err: any) {
      results.push({
        runId: 'failed',
        sourceId: src.id,
        fetchedCount: 0,
        newCount: 0,
        duplicateCount: 0,
        status: 'failed',
        errorMessage: err?.message || String(err)
      });
    }
  }

  return {
    totalSources: sources.length,
    totalFetched,
    totalNew,
    totalDuplicates,
    results
  };
}
