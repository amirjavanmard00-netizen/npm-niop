import { GoogleGenAI } from '@google/genai';
import { CRISIS_KEYWORDS, ENERGY_KEYWORDS } from '../collector/normalizer';

export interface AnalysisResult {
  importanceScore: number;
  mediaValueScore: number;
  publicInterestScore: number;
  crisisScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  entities: string[];
  keywords: string[];
  summary: string;
  isRumorPotential: boolean;
}

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export async function analyzeArticle(title: string, content: string): Promise<AnalysisResult> {
  const ai = getGenAI();
  const enabled = process.env.AI_ANALYSIS_ENABLED !== 'false';

  if (ai && enabled) {
    try {
      const prompt = `تو سیستم مانیتورینگ رسانه و تحلیلگر ارشد افکار عمومی شرکت ملی پخش فرآورده‌های نفتی ایران هستی.
خبر زیر را به دقت تحلیل کن و یک خروجی JSON با معیارهای زیر تحویل بده:
- importanceScore: نمره اهمیت راهبردی برای شرکت و کشور (۱ تا ۱۰)
- mediaValueScore: ارزش رسانه‌ای و خبری (۱ تا ۱۰)
- publicInterestScore: میزان حساسیت و توجه افکار عمومی (۱ تا ۱۰)
- crisisScore: میزان پتانسیل بحران‌آفرینی یا موج منفی (۱ تا ۱۰)
- sentiment: یکی از 'positive' | 'neutral' | 'negative'
- topics: آرایه‌ای از ۲ تا ۵ موضوع اصلی به فارسی
- entities: آرایه‌ای از اشخاص، سازمان‌ها یا مکان‌های نام‌برده شده
- keywords: آرایه‌ای از ۵ تا ۱۰ کلیدواژه مهم
- summary: خلاصه دقیق ۲ تا ۳ جمله‌ای به زبان فارسی رسمی
- isRumorPotential: بولین (true اگر خبر مشکوک، بدون منبع، ادعای گرانی یا بحران شایعه‌ساز است)

متن خبر:
تیتر: ${title}
متن: ${content.slice(0, 3000)}

فقط و فقط یک شیء معتبر JSON برگردان بدون هیچ توضیح اضافه.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const responseText = response.text || '{}';
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        importanceScore: Math.min(10, Math.max(1, Number(parsed.importanceScore) || 5)),
        mediaValueScore: Math.min(10, Math.max(1, Number(parsed.mediaValueScore) || 5)),
        publicInterestScore: Math.min(10, Math.max(1, Number(parsed.publicInterestScore) || 5)),
        crisisScore: Math.min(10, Math.max(1, Number(parsed.crisisScore) || 1)),
        sentiment: ['positive', 'negative', 'neutral'].includes(parsed.sentiment) ? parsed.sentiment : 'neutral',
        topics: Array.isArray(parsed.topics) ? parsed.topics : ['فرآورده‌های نفتی'],
        entities: Array.isArray(parsed.entities) ? parsed.entities : ['شرکت ملی پخش'],
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : ['سوخت'],
        summary: parsed.summary || content.slice(0, 200),
        isRumorPotential: Boolean(parsed.isRumorPotential)
      };
    } catch (err) {
      console.warn('[Gemini analyzer fallback]', err);
    }
  }

  // Deterministic rule-based fallback analyzer
  const fullText = `${title} ${content}`;
  
  // Matched keywords
  const matchedKeywords = ENERGY_KEYWORDS.filter(k => fullText.includes(k));
  
  // Crisis calculation
  const matchedCrisis = CRISIS_KEYWORDS.filter(k => fullText.includes(k));
  const crisisScore = Math.min(10, Math.max(1, 1 + matchedCrisis.length * 2.5));
  
  // Sentiment calculation
  const positiveWords = ['پایداری', 'توسعه', 'موفقیت', 'ارتقا', 'افتتاح', 'تجهیز', 'بهینه‌سازی', 'رشد', 'آرامش', 'صیانت', 'پاسخگویی'];
  const negativeWords = ['قاچاق', 'کمبود', 'تعطیلی', 'اعتصاب', 'اختلال', 'صف', 'گرانی', 'آتش‌سوزی', 'خرابی', 'هشدار'];
  
  let posCount = 0;
  let negCount = 0;
  for (const pw of positiveWords) if (fullText.includes(pw)) posCount++;
  for (const nw of negativeWords) if (fullText.includes(nw)) negCount++;

  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (posCount > negCount + 1) sentiment = 'positive';
  else if (negCount > posCount) sentiment = 'negative';

  const isRumorPotential = matchedCrisis.length >= 2 || fullText.includes('شایعه') || fullText.includes('تکذیب');

  // Topics detection
  const topics: string[] = [];
  if (fullText.includes('سوپر')) topics.push('بنزین سوپر');
  if (fullText.includes('کارت سوخت') || fullText.includes('سامانه هوشمند')) topics.push('سامانه هوشمند سوخت');
  if (fullText.includes('قاچاق')) topics.push('مبارزه با قاچاق فرآورده');
  if (fullText.includes('نیروگاه') || fullText.includes('سوخت مایع') || fullText.includes('زمستان')) topics.push('تأمین سوخت زمستانی');
  if (fullText.includes('CNG') || fullText.includes('سی‌ان‌جی')) topics.push('صنعت CNG');
  if (topics.length === 0) topics.push('زنجیره تأمین و توزیع انرژی');

  // Entities detection
  const entities = ['شرکت ملی پخش فرآورده‌های نفتی'];
  if (fullText.includes('وزارت نفت')) entities.push('وزارت نفت');
  if (fullText.includes('شانا')) entities.push('خبرگزاری شانا');
  if (fullText.includes('تهران')) entities.push('منطقه تهران');
  if (fullText.includes('هرمزگان')) entities.push('منطقه هرمزگان');
  if (fullText.includes('سیستان') || fullText.includes('زاهدان')) entities.push('منطقه زاهدان');

  return {
    importanceScore: Math.min(10, Math.max(5, Math.floor(5 + matchedKeywords.length * 0.6))),
    mediaValueScore: Math.min(10, Math.max(4, Math.floor(5 + matchedKeywords.length * 0.5))),
    publicInterestScore: Math.min(10, Math.max(5, Math.floor(6 + (matchedCrisis.length > 0 ? 3 : 1)))),
    crisisScore: Math.floor(crisisScore),
    sentiment,
    topics,
    entities,
    keywords: matchedKeywords.length > 0 ? matchedKeywords.slice(0, 8) : ['فرآورده‌های نفتی', 'توزیع سوخت'],
    summary: content.slice(0, 240) + '...',
    isRumorPotential
  };
}
