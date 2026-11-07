import { prisma } from './db';
import { regions37Data } from '../src/data/regionsData';
import { monitoredSourcesData } from '../src/data/sourcesData';

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

/**
 * Idempotently seeds only reference data (regions and source definitions).
 * It deliberately does not create demo users, sample articles, synthetic
 * analyses, or fabricated fact-checks. Dashboard article counts must come
 * from collected source material.
 */
export async function seedDatabase(_force = false) {
  console.log(`[Seed] Ensuring ${regions37Data.length} operational regions...`);

  for (const reg of regions37Data) {
    const code = `REG_${reg.id.toUpperCase()}`;
    const data = {
      name: `منطقه ${reg.name}`,
      code,
      province: reg.name,
      enabled: true,
      description: reg.summary || `منطقه عملیاتی ${reg.name} شرکت ملی پخش`
    };

    await prisma.region.upsert({
      where: { id: reg.id },
      update: data,
      create: { id: reg.id, ...data }
    });
  }

  console.log(`[Seed] Ensuring ${monitoredSourcesData.length} monitored sources...`);

  for (const src of monitoredSourcesData) {
    const rssUrl = KNOWN_RSS_MAP[src.id] || null;
    const webUrl = src.domain
      ? (src.domain.startsWith('http') ? src.domain : `https://${src.domain}`)
      : null;
    const data = {
      name: src.name,
      category: src.category,
      url: webUrl,
      rssUrl,
      type: rssUrl ? 'rss' : (webUrl ? 'html' : 'api'),
      reliability: src.reliability || 90,
      enabled: true
    };

    await prisma.source.upsert({
      where: { id: src.id },
      update: data,
      create: {
        id: src.id,
        ...data,
        status: src.status === 'active' ? 'healthy' : 'warning'
      }
    });
  }

  await prisma.systemLog.create({
    data: {
      level: 'info',
      action: 'REFERENCE_DATA_SYNCED',
      message: `اطلاعات پایه سامانه به‌روزرسانی شد: ${regions37Data.length} منطقه و ${monitoredSourcesData.length} منبع.`
    }
  });

  console.log('[Seed] Reference data initialization completed. No demo news were inserted.');
}

if (process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase(true)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}
