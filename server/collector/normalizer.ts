import crypto from 'crypto';

/**
 * Normalizes Persian text:
 * - Unifies Arabic/Persian letters (ي -> ی, ك -> ک, etc.)
 * - Normalizes zero-width non-joiner (نیم‌فاصله)
 * - Removes non-standard whitespace
 */
export function normalizePersianText(text: string): string {
  if (!text) return '';
  return text
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '\u200C') // Standardize ZWNJ
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips HTML tags and script/style content
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes a URL:
 * - Lowercases host
 * - Removes tracking query parameters (utm_*, ref, fbclid, etc.)
 * - Strips trailing slash
 */
export function normalizeCanonicalUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.hash = '';
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'fbclid', 'source', 'gclid'];
    for (const p of trackingParams) {
      parsed.searchParams.delete(p);
    }
    let clean = parsed.toString();
    if (clean.endsWith('/') && parsed.pathname !== '/') {
      clean = clean.slice(0, -1);
    }
    return clean;
  } catch {
    return rawUrl.trim();
  }
}

/**
 * Creates a unique deterministic SHA256 hash for an article
 */
export function generateArticleHash(canonicalUrl: string, title: string): string {
  const normalizedTitle = normalizePersianText(title).toLowerCase();
  const input = `${canonicalUrl.trim()}::${normalizedTitle}`;
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Calculates Jaccard similarity coefficient between two text strings
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(normalizePersianText(text1).toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(normalizePersianText(text2).toLowerCase().split(/\s+/).filter(w => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }

  const union = new Set([...words1, ...words2]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Common Iranian Energy & Fuel domain entities and keywords
 */
export const ENERGY_KEYWORDS = [
  'بنزین', 'بنزین سوپر', 'نفتگاز', 'گازوئیل', 'مازوت', 'نفت سفید', 'سی‌ان‌جی', 'CNG', 'LPG',
  'سامانه هوشمند سوخت', 'کارت سوخت', 'سهمیه سوخت', 'جایگاه سوخت', 'مجاری عرضه',
  'پالایشگاه', 'شرکت ملی پخش', 'شرکت ملی پالایش و پخش', 'وزارت نفت', 'توزیع فرآورده',
  'قاچاق سوخت', 'کدینگ کارت', 'نرخ فوب', 'تراز انرژی', 'ناترازی', 'ناوگان نفتکش',
  'انبار نفت', 'خطوط لوله', 'پایش سوخت', 'تراکنش سوخت'
];

export const CRISIS_KEYWORDS = [
  'کمبود بنزین', 'شایعه گرانی', 'صف‌های طولانی', 'تعطیلی جایگاه', 'اعتصاب جایگاه‌داران',
  'قاچاق میلیونی', 'انفجار', 'آتش‌سوزی', 'اختلال سامانه', 'قطعی بنزین', 'اعتراض', 'گران شدن'
];
