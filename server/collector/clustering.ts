import { prisma } from '../db';
import { calculateTextSimilarity } from './normalizer';

export async function clusterArticleToEvent(
  articleId: string,
  title: string,
  summary: string,
  importanceScore: number
): Promise<string> {
  const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);

  // Get active events from the last 3 days
  const activeEvents = await prisma.event.findMany({
    where: {
      status: 'active',
      lastSeenAt: { gte: threeDaysAgo }
    },
    orderBy: { lastSeenAt: 'desc' },
    take: 20
  });

  let bestEventId: string | null = null;
  let highestScore = 0;

  for (const event of activeEvents) {
    const titleSim = calculateTextSimilarity(title, event.title);
    const descSim = calculateTextSimilarity(summary, event.description);
    const combinedScore = (titleSim * 0.7) + (descSim * 0.3);

    if (combinedScore > highestScore) {
      highestScore = combinedScore;
      bestEventId = event.id;
    }
  }

  // Threshold for matching an existing event
  if (bestEventId && highestScore >= 0.35) {
    await prisma.event.update({
      where: { id: bestEventId },
      data: {
        lastSeenAt: new Date(),
        articleCount: { increment: 1 },
        importanceScore: Math.max(importanceScore, 5)
      }
    });

    await prisma.article.update({
      where: { id: articleId },
      data: { eventId: bestEventId }
    });

    return bestEventId;
  }

  // Create new event
  const cleanEventTitle = title.length > 80 ? title.slice(0, 80) + '...' : title;
  const newEvent = await prisma.event.create({
    data: {
      title: cleanEventTitle,
      description: summary.slice(0, 300),
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
      importanceScore,
      articleCount: 1,
      status: 'active'
    }
  });

  await prisma.article.update({
    where: { id: articleId },
    data: { eventId: newEvent.id }
  });

  return newEvent.id;
}
