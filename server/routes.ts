import { Router } from 'express';
import { prisma, logSystemEvent } from './db';
import { runCollectionForSource, runAllSourcesCollection } from './collector/engine';
import { getSchedulerStatus, triggerManualCollection } from './scheduler';

export const apiRouter = Router();

// 1. System Health & Database status
apiRouter.get('/health', async (req, res) => {
  try {
    const articleCount = await prisma.article.count();
    const sourceCount = await prisma.source.count();
    const regionCount = await prisma.region.count();
    const scheduler = getSchedulerStatus();

    res.json({
      status: 'ok',
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      uptimeSeconds: Math.floor(process.uptime()),
      stats: {
        articleCount,
        sourceCount,
        regionCount
      },
      scheduler,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      uptimeSeconds: Math.floor(process.uptime()),
      error: error?.message || String(error),
      timestamp: new Date().toISOString()
    });
  }
});

// 2. Comprehensive Dashboard Statistics (Real live aggregation)
apiRouter.get('/stats', async (req, res) => {
  try {
    const totalArticles = await prisma.article.count();
    const realArticles = await prisma.article.count({ where: { isSeed: false } });
    const seedArticles = await prisma.article.count({ where: { isSeed: true } });

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const articlesLast24h = await prisma.article.count({
      where: { discoveredAt: { gte: oneDayAgo } }
    });

    const activeSources = await prisma.source.count({ where: { enabled: true } });
    const healthySources = await prisma.source.count({ where: { enabled: true, status: 'healthy' } });

    const totalRegions = await prisma.region.count();
    const activeEvents = await prisma.event.count({ where: { status: 'active' } });
    const totalRumors = await prisma.rumor.count();
    const urgentRumors = await prisma.rumor.count({
      where: { riskLevel: { in: ['high', 'critical'] } }
    });

    // Sentiment breakdown
    const positiveCount = await prisma.articleAnalysis.count({ where: { sentiment: 'positive' } });
    const neutralCount = await prisma.articleAnalysis.count({ where: { sentiment: 'neutral' } });
    const negativeCount = await prisma.articleAnalysis.count({ where: { sentiment: 'negative' } });

    // Recent Collection Run
    const lastRun = await prisma.collectionRun.findFirst({
      orderBy: { startedAt: 'desc' },
      include: { source: { select: { name: true } } }
    });

    res.json({
      totalArticles,
      realArticles,
      seedArticles,
      articlesLast24h,
      activeSources,
      healthySources,
      totalRegions,
      activeEvents,
      totalRumors,
      urgentRumors,
      sentiments: {
        positive: positiveCount,
        neutral: neutralCount,
        negative: negativeCount
      },
      lastCollectionRun: lastRun,
      scheduler: getSchedulerStatus()
    });
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در محاسبه آمارهای زنده', details: error?.message });
  }
});

// 3. Articles Query API (with real search, filters, pagination)
apiRouter.get('/articles', async (req, res) => {
  try {
    const {
      q,
      regionId,
      sourceId,
      sentiment,
      isSeed,
      onlyReal,
      limit = '30',
      offset = '0'
    } = req.query;

    const whereClause: any = {};

    if (onlyReal === 'true') {
      whereClause.isSeed = false;
    } else if (isSeed !== undefined) {
      whereClause.isSeed = isSeed === 'true';
    }

    if (regionId) {
      whereClause.regionId = String(regionId);
    }

    if (sourceId) {
      whereClause.sourceId = String(sourceId);
    }

    if (q) {
      const searchStr = String(q).trim();
      whereClause.OR = [
        { title: { contains: searchStr } },
        { summary: { contains: searchStr } },
        { content: { contains: searchStr } }
      ];
    }

    if (sentiment) {
      whereClause.analysis = {
        sentiment: String(sentiment)
      };
    }

    const take = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
    const skip = Math.max(0, parseInt(String(offset), 10));

    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where: whereClause,
        include: {
          source: { select: { id: true, name: true, category: true, reliability: true } },
          region: { select: { id: true, name: true, code: true } },
          analysis: true,
          event: { select: { id: true, title: true, importanceScore: true } },
          factChecks: true
        },
        orderBy: [
          { publishedAt: 'desc' },
          { discoveredAt: 'desc' }
        ],
        take,
        skip
      }),
      prisma.article.count({ where: whereClause })
    ]);

    res.json({
      items: articles,
      totalCount,
      limit: take,
      offset: skip
    });
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در واکشی اخبار', details: error?.message });
  }
});

// 4. Get Single Article Details
apiRouter.get('/articles/:id', async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: req.params.id },
      include: {
        source: true,
        region: true,
        analysis: true,
        event: {
          include: {
            articles: {
              where: { id: { not: req.params.id } },
              take: 5,
              select: { id: true, title: true, publishedAt: true, source: { select: { name: true } } }
            }
          }
        },
        factChecks: true
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'خبر مورد نظر یافت نشد.' });
    }

    res.json(article);
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در دریافت جزئیات خبر', details: error?.message });
  }
});

// 5. Sources API (List, Toggle, Update)
apiRouter.get('/sources', async (req, res) => {
  try {
    const sources = await prisma.source.findMany({
      include: {
        region: { select: { id: true, name: true } },
        _count: { select: { articles: true } }
      },
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json(sources);
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در دریافت لیست منابع', details: error?.message });
  }
});

apiRouter.post('/sources', async (req, res) => {
  try {
    const { id, name, category, url, rssUrl, type = 'rss', priority = 2, reliability = 90, regionId } = req.body;
    if (!name || !id) {
      return res.status(400).json({ error: 'شناسه و نام منبع الزامی است.' });
    }

    const source = await prisma.source.create({
      data: {
        id,
        name,
        category: category || 'domestic_agency',
        url: url || null,
        rssUrl: rssUrl || null,
        type: rssUrl ? 'rss' : type,
        priority: Number(priority) || 2,
        reliability: Number(reliability) || 90,
        regionId: regionId || null,
        enabled: true,
        status: 'healthy'
      }
    });

    await logSystemEvent('info', 'SOURCE_CREATED', `منبع جدید ${name} اضافه شد.`);
    res.status(201).json(source);
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در ثبت منبع جدید', details: error?.message });
  }
});

apiRouter.patch('/sources/:id', async (req, res) => {
  try {
    const { enabled, priority, rssUrl, url, category, reliability } = req.body;
    const source = await prisma.source.update({
      where: { id: req.params.id },
      data: {
        ...(enabled !== undefined && { enabled: Boolean(enabled) }),
        ...(priority !== undefined && { priority: Number(priority) }),
        ...(rssUrl !== undefined && { rssUrl: rssUrl || null }),
        ...(url !== undefined && { url: url || null }),
        ...(category !== undefined && { category }),
        ...(reliability !== undefined && { reliability: Number(reliability) })
      }
    });

    res.json(source);
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در ویرایش منبع', details: error?.message });
  }
});

// Trigger collection for a specific source
apiRouter.post('/sources/:id/sync', async (req, res) => {
  try {
    const summary = await runCollectionForSource(req.params.id);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در اجرای مانیتورینگ منبع', details: error?.message });
  }
});

// 6. Manual Collection Sync for all enabled sources
apiRouter.post('/collector/sync', async (req, res) => {
  try {
    const result = await triggerManualCollection();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در راه‌اندازی فرآیند جمع‌آوری', details: error?.message });
  }
});

apiRouter.get('/collector/status', (req, res) => {
  res.json(getSchedulerStatus());
});

// 7. Regions API (37 operational regions)
apiRouter.get('/regions', async (req, res) => {
  try {
    const regions = await prisma.region.findMany({
      include: {
        _count: { select: { articles: true, sources: true } },
        articles: {
          take: 3,
          orderBy: { publishedAt: 'desc' },
          select: { id: true, title: true, publishedAt: true, summary: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(regions);
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در دریافت اطلاعات مناطق ۳۷گانه', details: error?.message });
  }
});

// 8. Clustered Events
apiRouter.get('/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        articles: {
          take: 5,
          orderBy: { publishedAt: 'desc' },
          select: { id: true, title: true, url: true, publishedAt: true, source: { select: { name: true } } }
        },
        rumors: true
      },
      orderBy: { lastSeenAt: 'desc' },
      take: 50
    });

    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در دریافت رویدادها', details: error?.message });
  }
});

// 9. Rumors & Misinformation Radar
apiRouter.get('/rumors', async (req, res) => {
  try {
    const rumors = await prisma.rumor.findMany({
      include: {
        relatedEvent: { select: { id: true, title: true } }
      },
      orderBy: { firstSeenAt: 'desc' },
      take: 50
    });

    res.json(rumors);
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در دریافت شایعات', details: error?.message });
  }
});

// 10. Fact-Checks API
apiRouter.get('/factchecks', async (req, res) => {
  try {
    const factChecks = await prisma.factCheck.findMany({
      include: {
        article: { select: { id: true, title: true, url: true } }
      },
      orderBy: { checkedAt: 'desc' },
      take: 50
    });

    res.json(factChecks);
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در دریافت راستی‌آزمایی‌ها', details: error?.message });
  }
});

// 11. System Logs API
apiRouter.get('/logs', async (req, res) => {
  try {
    const { limit = '50', level } = req.query;
    const where: any = {};
    if (level) where.level = String(level);

    const logs = await prisma.systemLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(100, parseInt(String(limit), 10))
    });

    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: 'خطا در دریافت لاگ‌های سیستم', details: error?.message });
  }
});
