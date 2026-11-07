import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { apiRouter } from './server/routes';
import { seedDatabase } from './server/seed';
import { startScheduler } from './server/scheduler';
import { requireAuth } from './server/auth';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security Headers for Production
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// CORS configuration for Production
const allowedOrigins = (process.env.CORS_ORIGIN || 'https://npm-niop.onrender.com,http://localhost:3000,http://localhost:5173').split(',').map(origin => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json({ limit: '1mb' }));

// Mount database and media monitoring API routes
app.use('/api', apiRouter);

// Helper to get GoogleGenAI client
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// Professional energy news rewriting endpoint (هرم وارونه)
app.post('/api/ai/rewrite', requireAuth, async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'متن خبر جهت بازنویسی ارسال نشده است.' });
    }

    const ai = getGenAI();

    const systemPrompt = `تو یک روزنامه‌نگار، خبرنگار و ویراستار حرفه‌ای حوزه انرژی و روابط عمومی شرکت ملی پخش فرآورده‌های نفتی ایران هستی با ۲۰ سال سابقه.

متن ارسالی را با رعایت اصول حرفه‌ای خبرنویسی و هرم وارونه، برای انتشار در وبسایت رسمی، خبرگزاری‌ها و شبکه‌های اجتماعی بازنویسی کن؛ به‌گونه‌ای که خبر رسمی و معتبر بماند، اما خشک، کلیشه‌ای و اداری نباشد و مخاطب از خواندن آن لذت ببرد.

دستورالعمل‌های الزامی:
- اصل خبر، آمار، اعداد، اسامی، سمت‌ها، تاریخ‌ها، مکان‌ها و نقل‌قول‌ها را حفظ کن؛ هیچ اطلاعاتی اضافه، حذف یا تحریف نکن.
- تیتر کوتاه، هوشمندانه، جذاب و خبری باشد؛ بدون اغراق و کلیشه.
- روتیتر فقط در صورت نیاز و برای تکمیل تیتر نوشته شود؛ در غیر این صورت خالی یا حذف شود.
- لید کوتاه، دقیق و جذاب باشد و مخاطب را به ادامه خواندن ترغیب کند.
- متن رسمی، روان، خوشخوان، حرفه‌ای و متناسب با ادبیات صنعت نفت و فرآورده‌های نفتی باشد.
- خبر را با روایت جذاب، جمله‌بندی پویا و انتقال هوشمندانه اطلاعات بنویس، اما از داستان‌پردازی یا تغییر واقعیت‌های خبر خودداری کن.
- از تکرار، کلیشه‌های روابط عمومی، جمله‌های طولانی و ادبیات خشک اداری پرهیز کن.
- از تکرار بی‌دلیل نام «شرکت ملی پخش فرآورده‌های نفتی ایران» خودداری کن.
- پاراگراف‌ها کوتاه، منسجم و خوانا باشند.
- نقل‌قول‌ها دقیق و بدون تغییر در مفهوم حفظ شوند.
- از ادبیات تبلیغاتی، شعاری، تحلیل شخصی و حدس‌وگمان خودداری کن.
- دستور خط فارسی، املاء، علائم نگارشی، فاصله و به‌ویژه نیم‌فاصله را در تمام متن دقیق و یکدست رعایت کن (مانند: می‌شود، به‌دلیل، هم‌زمان، به‌کارگیری، آن‌ها).

خروجی را دقیقا در قالب JSON با کلیدهای زیر برگردان:
{
  "superTitle": "روتیتر (فقط در صورت نیاز، وگرنه خالی)",
  "title": "تیتر اصلی هوشمندانه و جذاب",
  "lead": "لید کوتاه و دقیق و جذاب",
  "body": "متن کامل خبر در چند پاراگراف منسجم",
  "socialSummary": "خلاصه ۲۵ تا ۴۰ کلمه‌ای برای شبکه‌های اجتماعی",
  "hashtags": ["#هشتگ۱", "#هشتگ۲", "#هشتگ۳", "#هشتگ۴", "#هشتگ۵"]
}
فقط و فقط JSON معتبر برگردان بدون هیچ متن اضافی.`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${systemPrompt}\n\nمتن خبر:\n${rawText}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        return res.json({ success: true, result: parsed, source: 'gemini' });
      } catch (parseErr) {
        // clean potential markdown fences
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, result: parsed, source: 'gemini' });
      }
    } else {
      return res.status(503).json({
        error: 'سرویس هوش مصنوعی پیکربندی نشده است. کلید GEMINI_API_KEY را در محیط سرور تنظیم کنید.'
      });
    }
  } catch (error: any) {
    console.error('Error in /api/ai/rewrite:', error);
    res.status(500).json({
      error: 'خطا در پردازش خبر',
    });
  }
});

// 27-item deep content package generator
app.post('/api/ai/generate-package', requireAuth, async (req, res) => {
  try {
    const { topic, context } = req.body;
    const ai = getGenAI();

    const prompt = `تو کارشناس ارشد مانیتورینگ رسانه، تحلیلگر ارشد صنعت نفت و انرژی، و متخصص روابط عمومی دیجیتال شرکت ملی پخش فرآورده‌های نفتی ایران هستی.
برای موضوع زیر یک بسته کامل تولید محتوای ۲۷گانه مطابق با چک‌لیست روابط عمومی تهیه کن:
موضوع/خبر: "${topic}"
توضیحات تکمیلی: "${context || ''}"

خروجی باید یک شیء JSON با ساختار زیر باشد:
{
  "mainTitle": "۱. تیتر اصلی",
  "catchyTitle": "۲. تیتر پیشنهادی جذاب",
  "summary": "۳. خلاصه خبر (حداکثر ۱۵۰ کلمه)",
  "importantDetails": ["۴. جزئیات مهم ۱", "جزئیات مهم ۲", "جزئیات مهم ۳"],
  "importanceReason": "۵. دلیل اهمیت",
  "impactOnPeople": "۶. اثر بر مردم",
  "impactOnOilIndustry": "۷. اثر بر صنعت نفت",
  "importanceScore": 9,
  "mediaAppealScore": 9,
  "viralProbability": 85,
  "targetAudience": "۱۱. مخاطب هدف",
  "bestPublishTime": "۱۲. بهترین زمان انتشار (ساعت و بازه روز)",
  "seoTitle": "۱۳. تیتر سئو",
  "metaDescription": "۱۴. متادیسکریپشن",
  "seoKeywords": ["کلمه۱", "کلمه۲", "کلمه۳", "کلمه۴", "کلمه۵", "کلمه۶", "کلمه۷", "کلمه۸", "کلمه۹", "کلمه۱۰"],
  "websiteFullText": "۱۶. متن کامل خبر برای وبسایت رسمی (شامل ۲ تا ۴ پاراگراف شیک و مستند)",
  "telegramText": "۱۷. متن تلگرام آماده انتشار با ایموجی‌های رسمی و بولت‌پوینت",
  "instagramText": "۱۸. متن کپشن اینستاگرام با دعوت به تعامل (Call to Action)",
  "linkedinText": "۱۹. متن لینکدین با لحن تحلیلی و مدیریتی صنعت انرژی",
  "twitterText": "۲۰. متن شبکه ایکس (توییتر) زیر ۲۸۰ کاراکتر",
  "suggestedHeroImage": "۲۱. ایده و پرامپت تصویر شاخص با کیفیت بالا",
  "suggestedInfographic": "۲۲. ایده ساخت اینفوگرافیک آماری و داده‌نما",
  "suggestedShortVideo": "۲۳. سناریوی ویدیوی کوتاه ۶۰ ثانیه‌ای (Reels/Shorts)",
  "persianHashtags": ["#هشتگ۱", "#هشتگ۲", "#هشتگ۳", "#هشتگ۴", "#هشتگ۵"],
  "englishHashtags": ["#NIOPDC", "#Fuel", "#Energy", "#OilProducts", "#Iran"],
  "primarySourceLink": "https://niopdc.ir",
  "otherSourcesLinks": ["https://shana.ir", "https://dolat.ir"]
}
فقط JSON معتبر بدون هیچ کلمه اضافه برگردان.`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });
      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json({ success: true, package: parsed, source: 'gemini' });
    } else {
      return res.status(503).json({
        error: 'سرویس تولید بسته محتوا پیکربندی نشده است. کلید GEMINI_API_KEY را در محیط سرور تنظیم کنید.'
      });
    }
  } catch (err: any) {
    console.error('Error in /api/ai/generate-package:', err);
    res.status(500).json({ error: 'خطا در تولید بسته محتوایی' });
  }
});

// Vite middleware / static files
async function start() {
  try {
    await seedDatabase();
    startScheduler();
  } catch (err) {
    console.error('[Server init warning]', err);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
