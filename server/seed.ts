import { prisma } from './db';
import { regions37Data } from '../src/data/regionsData';
import { monitoredSourcesData } from '../src/data/sourcesData';
import { top10NewsData } from '../src/data/newsData';
import { generateArticleHash, normalizeCanonicalUrl } from './collector/normalizer';

// Map RSS URLs for top Iranian news and energy sources
const KNOWN_RSS_MAP: Record<string, string> = {
  shana: 'https://www.shana.ir/rss',
  irna: 'https://www.irna.ir/rss',
  isna: 'https://www.isna.ir/rss',
  mehr: 'https://www.mehrnews.com/rss',
  tasnim: 'https://www.tasnimnews.com/fa/rss/all',
  fars: 'https://www.farsnews.ir/rss',
  energypress: 'https://energypress.ir/feed/',
  donya_eqtesad: 'https://donya-e-eqtesad.com/fa/rss/all',
  mop: 'https://www.mop.ir/rss'
};

export async function seedDatabase(force = false) {
  const existingRegionsCount = await prisma.region.count();
  if (existingRegionsCount > 0 && !force) {
    console.log('[Seed] Database already contains data. Skipping full seed.');
    return;
  }

  console.log('[Seed] Seeding database with initial models and verified data...');

  // 1. Seed Users
  await prisma.user.upsert({
    where: { email: 'admin@niopdc.ir' },
    update: {},
    create: {
      email: 'admin@niopdc.ir',
      name: 'مدیر ارشد سامانه مانیتورینگ',
      role: 'admin'
    }
  });

  await prisma.user.upsert({
    where: { email: 'analyst@niopdc.ir' },
    update: {},
    create: {
      email: 'analyst@niopdc.ir',
      name: 'کارشناس تحلیل رسانه و افکار عمومی',
      role: 'analyst'
    }
  });

  // 2. Seed 37 NIOPDC Regions
  console.log(`[Seed] Seeding ${regions37Data.length} operational regions...`);
  for (let idx = 0; idx < regions37Data.length; idx++) {
    const reg = regions37Data[idx];
    const code = `REG_${reg.id.toUpperCase()}`;
    await prisma.region.upsert({
      where: { id: reg.id },
      update: {
        name: `منطقه ${reg.name}`,
        code,
        province: reg.name,
        enabled: true,
        description: reg.summary || `منطقه عملیاتی ${reg.name} شرکت ملی پخش`
      },
      create: {
        id: reg.id,
        name: `منطقه ${reg.name}`,
        code,
        province: reg.name,
        enabled: true,
        description: reg.summary || `منطقه عملیاتی ${reg.name} شرکت ملی پخش`
      }
    });
  }

  // 3. Seed Sources
  console.log(`[Seed] Seeding ${monitoredSourcesData.length} monitored news sources...`);
  for (const src of monitoredSourcesData) {
    const rssUrl = KNOWN_RSS_MAP[src.id] || null;
    const webUrl = src.domain ? (src.domain.startsWith('http') ? src.domain : `https://${src.domain}`) : null;

    await prisma.source.upsert({
      where: { id: src.id },
      update: {
        name: src.name,
        category: src.category,
        url: webUrl,
        rssUrl,
        type: rssUrl ? 'rss' : (webUrl ? 'html' : 'api'),
        reliability: src.reliability || 90,
        status: src.status === 'active' ? 'healthy' : 'warning',
        enabled: true
      },
      create: {
        id: src.id,
        name: src.name,
        category: src.category,
        url: webUrl,
        rssUrl,
        type: rssUrl ? 'rss' : (webUrl ? 'html' : 'api'),
        reliability: src.reliability || 90,
        status: src.status === 'active' ? 'healthy' : 'warning',
        enabled: true
      }
    });
  }

  // 4. Seed Seed Articles & Events
  console.log(`[Seed] Seeding initial verified news articles and analyses...`);
  for (let i = 0; i < top10NewsData.length; i++) {
    const item = top10NewsData[i];
    const canonicalUrl = normalizeCanonicalUrl(item.sourceUrl || `https://niopdc.ir/news/${item.id}`);
    const hash = generateArticleHash(canonicalUrl, item.title);

    // Pick source
    const sourceId = (item.source || '').includes('شانا') ? 'shana' : 'niopdc';

    // Upsert Article
    let article = await prisma.article.findFirst({
      where: {
        OR: [{ id: item.id }, { hash }]
      }
    });

    if (!article) {
      // Create Event
      const event = await prisma.event.create({
        data: {
          title: item.title,
          description: item.summary,
          importanceScore: item.importanceScore,
          articleCount: 1,
          status: 'active'
        }
      });

      article = await prisma.article.create({
        data: {
          id: item.id,
          title: item.title,
          originalTitle: item.title,
          url: canonicalUrl,
          canonicalUrl,
          sourceId,
          publishedAt: new Date(Date.now() - (i + 1) * 3600 * 1000),
          discoveredAt: new Date(Date.now() - (i + 1) * 3600 * 1000),
          content: item.fullPackage?.websiteFullText || item.summary,
          summary: item.summary,
          imageUrl: item.fullPackage?.suggestedHeroImage,
          hash,
          status: 'processed',
          isSeed: true,
          eventId: event.id
        }
      });
    }

    // Upsert Analysis
    await prisma.articleAnalysis.upsert({
      where: { articleId: article.id },
      update: {
        importanceScore: item.importanceScore,
        mediaValueScore: item.appealScore || 8,
        publicInterestScore: 9,
        crisisScore: item.category === 'anti_smuggling' ? 4 : 2,
        sentiment: item.category === 'crisis_management' ? 'negative' : 'positive',
        topics: JSON.stringify(item.tags || ['فرآورده‌های نفتی']),
        entities: JSON.stringify(['شرکت ملی پخش فرآورده‌های نفتی ایران', 'وزارت نفت']),
        keywords: JSON.stringify(item.fullPackage?.seoKeywords || item.tags || []),
        summary: item.summary,
        isRumorPotential: false
      },
      create: {
        articleId: article.id,
        importanceScore: item.importanceScore,
        mediaValueScore: item.appealScore || 8,
        publicInterestScore: 9,
        crisisScore: item.category === 'anti_smuggling' ? 4 : 2,
        sentiment: item.category === 'crisis_management' ? 'negative' : 'positive',
        topics: JSON.stringify(item.tags || ['فرآورده‌های نفتی']),
        entities: JSON.stringify(['شرکت ملی پخش فرآورده‌های نفتی ایران', 'وزارت نفت']),
        keywords: JSON.stringify(item.fullPackage?.seoKeywords || item.tags || []),
        summary: item.summary,
        isRumorPotential: false
      }
    });

    // Create FactCheck if applicable
    if (i === 0) {
      const existingFactCheck = await prisma.factCheck.findFirst({
        where: { articleId: article.id }
      });
      if (!existingFactCheck) {
        await prisma.factCheck.create({
          data: {
            articleId: article.id,
            claim: 'شایعه تغییر نرخ و کاهش سهمیه ۶۰ لیتر بنزین یارانه‌ای همزمان با توزیع بنزین سوپر',
            status: 'FALSE',
            confidence: 100,
            evidence: 'سخنگوی دولت و وزیر نفت صراحتاً اعلام کردند سهمیه یارانه‌ای دست‌نخورده باقی مانده و بنزین سوپر صرفاً توسط بخش خصوصی و با نرخ تجاری عرضه می‌شود.',
            checkedAt: new Date(),
            checkedBy: 'واحد راستی‌آزمایی اتاق خبر هوشمند'
          }
        });
      }
    }
  }

  // 5. Seed regional stories as articles linked to regions
  for (const reg of regions37Data.slice(0, 15)) {
    const canonicalUrl = normalizeCanonicalUrl(reg.link || `https://niopdc.ir/regional/${reg.id}`);
    const hash = generateArticleHash(canonicalUrl, reg.topStory);

    const exists = await prisma.article.findUnique({ where: { hash } });
    if (!exists) {
      const art = await prisma.article.create({
        data: {
          title: reg.topStory,
          url: canonicalUrl,
          canonicalUrl,
          sourceId: 'niopdc',
          regionId: reg.id,
          publishedAt: new Date(Date.now() - 4 * 3600 * 1000),
          discoveredAt: new Date(),
          content: reg.summary,
          summary: reg.summary,
          hash,
          status: 'processed',
          isSeed: true
        }
      });

      await prisma.articleAnalysis.upsert({
        where: { articleId: art.id },
        update: {
          importanceScore: reg.importance,
          mediaValueScore: 7,
          publicInterestScore: 8,
          crisisScore: reg.category === 'anti_smuggling' ? 5 : 2,
          sentiment: reg.category === 'anti_smuggling' ? 'neutral' : 'positive',
          topics: JSON.stringify([reg.name, 'پایش منطقه‌ای']),
          entities: JSON.stringify([`منطقه ${reg.name}`, 'شرکت ملی پخش']),
          keywords: JSON.stringify(reg.keyDetails || []),
          summary: reg.summary
        },
        create: {
          articleId: art.id,
          importanceScore: reg.importance,
          mediaValueScore: 7,
          publicInterestScore: 8,
          crisisScore: reg.category === 'anti_smuggling' ? 5 : 2,
          sentiment: reg.category === 'anti_smuggling' ? 'neutral' : 'positive',
          topics: JSON.stringify([reg.name, 'پایش منطقه‌ای']),
          entities: JSON.stringify([`منطقه ${reg.name}`, 'شرکت ملی پخش']),
          keywords: JSON.stringify(reg.keyDetails || []),
          summary: reg.summary
        }
      });
    }
  }

  // Record Log
  await prisma.systemLog.create({
    data: {
      level: 'info',
      action: 'DATABASE_SEEDED',
      message: 'بانک اطلاعات اولیه سامانه با موفقیت مقداردهی شد.'
    }
  });

  console.log('[Seed] Database initialization completed successfully.');
}

// Auto-run if executed directly via node or tsx
if (process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase(true)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}
