import Parser from 'rss-parser';
import { normalizeCanonicalUrl, normalizePersianText, stripHtml } from './normalizer';

export interface RawFeedItem {
  title: string;
  link: string;
  content: string;
  summary: string;
  publishedAt: Date;
  author?: string;
  imageUrl?: string;
}

const parser = new Parser({
  timeout: 5000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; NIOPDC-MediaMonitor/1.0; +https://niopdc.ir)',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  },
  customFields: {
    item: [
      ['description', 'description'],
      ['content:encoded', 'contentEncoded'],
      ['enclosure', 'enclosure'],
      ['media:content', 'mediaContent']
    ]
  }
});

export async function fetchRssFeed(rssUrl: string): Promise<{ items: RawFeedItem[]; responseTimeMs: number; httpStatus: number }> {
  const startTime = Date.now();
  try {
    const feed = await parser.parseURL(rssUrl);
    const responseTimeMs = Date.now() - startTime;

    const items: RawFeedItem[] = (feed.items || []).map(item => {
      const rawTitle = item.title || '';
      const rawLink = item.link || item.guid || '';
      const rawContent = (item as any).contentEncoded || item.content || item.description || '';
      const cleanContent = normalizePersianText(stripHtml(rawContent));
      const cleanSummary = cleanContent.slice(0, 300);

      let pubDate = new Date();
      if (item.pubDate) {
        const parsed = new Date(item.pubDate);
        if (!isNaN(parsed.getTime())) pubDate = parsed;
      } else if (item.isoDate) {
        const parsed = new Date(item.isoDate);
        if (!isNaN(parsed.getTime())) pubDate = parsed;
      }

      // Extract potential image
      let imageUrl: string | undefined = undefined;
      if ((item as any).enclosure?.url) {
        imageUrl = (item as any).enclosure.url;
      } else if ((item as any).mediaContent?.$?.url) {
        imageUrl = (item as any).mediaContent.$.url;
      }

      return {
        title: normalizePersianText(rawTitle),
        link: normalizeCanonicalUrl(rawLink),
        content: cleanContent,
        summary: cleanSummary,
        publishedAt: pubDate,
        author: item.creator || (item as any)['dc:creator'] || undefined,
        imageUrl
      };
    });

    return {
      items: items.filter(it => it.title.length > 5 && it.link.length > 5),
      responseTimeMs,
      httpStatus: 200
    };
  } catch (error: any) {
    const responseTimeMs = Date.now() - startTime;
    throw {
      message: error?.message || 'Error fetching RSS feed',
      responseTimeMs,
      httpStatus: error?.status || 500
    };
  }
}
