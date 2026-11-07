import * as cheerio from 'cheerio';
import { normalizeCanonicalUrl, normalizePersianText, stripHtml } from './normalizer';
import { RawFeedItem } from './rssParser';

export async function scrapeArticleHtml(url: string): Promise<{ item: RawFeedItem; responseTimeMs: number; httpStatus: number }> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NIOPDC-MediaMonitor/1.0; +https://niopdc.ir)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fa,en-US;q=0.7,en;q=0.3'
      }
    });

    const responseTimeMs = Date.now() - startTime;
    if (!response.ok) {
      throw { message: `HTTP status ${response.status}`, responseTimeMs, httpStatus: response.status };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDesc = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || undefined;
    const ogPubTime = $('meta[property="article:published_time"]').attr('content');

    // Prefer an actual news card/article over the website's global page title.
    // This prevents the homepage itself from being stored as a fabricated news item.
    const articleRoot = $('article, .news-item, .item-news, .news-card, .post-item, .views-row').filter((_, el) => {
      const node = $(el);
      return node.find('h1, h2, h3, h4, a[href]').length > 0;
    }).first();

    const articleHeading = articleRoot.find('h1, h2, h3, h4').first().text().trim();
    const pageHeading = $('main h1, article h1, h1').first().text().trim();
    const cleanTitle = normalizePersianText(stripHtml(articleHeading || pageHeading || ogTitle));

    const articleHref = articleRoot.find('a[href]').first().attr('href');
    let articleUrl = url;
    if (articleHref) {
      try {
        articleUrl = new URL(articleHref, url).toString();
      } catch {
        articleUrl = url;
      }
    }

    const contentRoot = articleRoot.length
      ? articleRoot
      : $('article, .news-body, .item-text, .entry-content, .news-content, #newsBody, .body-text').first();

    const rawContent = contentRoot.length
      ? contentRoot.text()
      : $('main p, .news-list p').map((_, el) => $(el).text()).get().join('\n');

    const cleanContent = normalizePersianText(stripHtml(rawContent || ogDesc));
    const cleanSummary = normalizePersianText(stripHtml(ogDesc || cleanContent.slice(0, 300)));

    // A homepage's site name + generic description is not a news article.
    if (cleanTitle.length < 6 || (!articleRoot.length && !ogPubTime && cleanContent.length < 80)) {
      throw {
        message: 'در صفحه منبع، مطلب خبری قابل تشخیص پیدا نشد؛ صفحه اصلی به‌عنوان خبر ذخیره نشد.',
        responseTimeMs,
        httpStatus: response.status
      };
    }

    let publishedAt = new Date();
    if (ogPubTime) {
      const parsed = new Date(ogPubTime);
      if (!isNaN(parsed.getTime())) publishedAt = parsed;
    }

    clearTimeout(timeout);
    return {
      item: {
        title: cleanTitle,
        link: normalizeCanonicalUrl(articleUrl),
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
    throw {
      message: err?.message || 'Error scraping HTML',
      responseTimeMs: Date.now() - startTime,
      httpStatus: err?.httpStatus || 500
    };
  }
}
