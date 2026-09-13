import * as cheerio from 'cheerio';
import { normalizeCanonicalUrl, normalizePersianText, stripHtml } from './normalizer';
import { RawFeedItem } from './rssParser';

export async function scrapeArticleHtml(url: string): Promise<{ item: RawFeedItem; responseTimeMs: number; httpStatus: number }> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fa,en-US;q=0.7,en;q=0.3'
      }
    });

    const responseTimeMs = Date.now() - startTime;
    clearTimeout(timeout);

    if (!response.ok) {
      throw { message: `HTTP status ${response.status}`, responseTimeMs, httpStatus: response.status };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Meta extraction
    const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    const ogDesc = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || undefined;
    const ogPubTime = $('meta[property="article:published_time"]').attr('content');

    let publishedAt = new Date();
    if (ogPubTime) {
      const parsed = new Date(ogPubTime);
      if (!isNaN(parsed.getTime())) publishedAt = parsed;
    }

    // Extract main text content
    const articleElem = $('article, .news-body, .item-text, .entry-content, .news-content, #newsBody, .body-text');
    let content = '';
    if (articleElem.length > 0) {
      content = articleElem.first().text();
    } else {
      content = $('p').map((_, el) => $(el).text()).get().join('\n');
    }

    const cleanTitle = normalizePersianText(stripHtml(ogTitle));
    const cleanContent = normalizePersianText(stripHtml(content || ogDesc));
    const cleanSummary = normalizePersianText(stripHtml(ogDesc || cleanContent.slice(0, 300)));

    return {
      item: {
        title: cleanTitle,
        link: normalizeCanonicalUrl(url),
        content: cleanContent,
        summary: cleanSummary,
        publishedAt,
        imageUrl: ogImage
      },
      responseTimeMs,
      httpStatus: response.status
    };
  } catch (err: any) {
    clearTimeout(timeout);
    const responseTimeMs = Date.now() - startTime;
    throw {
      message: err?.message || 'Error scraping HTML',
      responseTimeMs,
      httpStatus: err?.httpStatus || 500
    };
  }
}
