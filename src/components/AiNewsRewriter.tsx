import React, { useState } from 'react';
import { RewriteResult } from '../types';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  FileEdit, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  Share2,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface AiNewsRewriterProps {
  initialRawText?: string;
  onRewriteDone?: (result: RewriteResult) => void;
}

const SAMPLE_RAW_TEXTS = [
  {
    title: 'نمونه ۱: اطلاعیه ساماندهی کارت‌های سوخت',
    text: `به گزارش روابط عمومی شرکت ملی پخش فرآورده‌های نفتی ایران، مدیرعامل شرکت اعلام کرد با توجه به بند قانونی تبصره ۸ قانون بودجه سال جاری و ضرورت مدیریت مصرف، استفاده از کارت‌های شخصی سوخت در جایگاه‌های سراسر کشور افزایش یافته و هم‌اکنون به مرز ۹۰ درصد رسیده است. وی افزود کارت‌های آزاد موجود در جایگاه‌ها برای موارد اضطراری و مسافران فاقد کارت تعبیه شده و هیچ‌گونه کاهشی در سهمیه ۶۰ لیتر خودروها و ۱۰۰ لیتر اعتباری رخ نداده است.`
  },
  {
    title: 'نمونه ۲: کشف شبکه قاچاق سوخت در سواحل جنوب',
    text: `روابط عمومی منطقه هرمزگان شرکت ملی پخش خبر داد طی عملیات مشترک اطلاعاتی با دریابانی و ضابطین قضایی، یک بارانداز و خط لوله مخفی قاچاق گازوئیل به طول بیش از ۳ کیلومتر در سواحل بندرعباس کشف و منهدم گردید. از این محل بیش از ۸۰۰ هزار لیتر نفتگاز که به قصد انتقال به شناورهای غیرمجاز دپو شده بود ضبط و به مخازن انبار نفت شهید رجایی اعاده گردید و ۳ متهم اصلی تحویل مراجع قضایی شدند.`
  },
  {
    title: 'نمونه ۳: آمادگی برای موج سرما و ناترازی گاز',
    text: `معاون عملیات و نظارت بر توزیع فرآورده اعلام کرد در پی ورود سامانه بارشی و برودت شدید هوا در ۲۲ استان کشور، کلیه انبارهای نفت و ناوگان ۱۴ هزار دستگاهی نفتکش‌ها در حالت آماده‌باش کامل هستند. وی تصریح کرد روزانه بیش از ۲۶۰ میلیون لیتر انواع فرآورده توزیع می‌شود و ذخایر سوخت جایگزین نیروگاه‌ها به میزان ۹۸ درصد تکمیل بوده و هیچ مشکلی در تأمین بنزین، نفتگاز و نفت سفید مناطق سردسیر و صعب‌العبور وجود ندارد.`
  }
];

export const AiNewsRewriter: React.FC<AiNewsRewriterProps> = ({
  initialRawText = '',
  onRewriteDone
}) => {
  const [rawText, setRawText] = useState(initialRawText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [sourceEngine, setSourceEngine] = useState<'gemini' | 'internal_engine' | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (sectionKey: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyAll = () => {
    if (!result) return;
    const fullContent = `${result.superTitle ? result.superTitle + '\n' : ''}${result.title}

${result.lead}

${result.body}

خلاصه شبکه‌های اجتماعی:
${result.socialSummary}

${result.hashtags.join(' ')}`;
    handleCopy('all', fullContent);
  };

  const executeRewrite = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText })
      });

      if (!response.ok) {
        throw new Error('خطا در برقراری ارتباط با سرویس بازنویسی');
      }

      const data = await response.json();
      if (data.success && data.result) {
        setResult(data.result);
        setSourceEngine(data.source || 'gemini');
        if (onRewriteDone) onRewriteDone(data.result);
      } else {
        throw new Error(data.error || 'پاسخ نامعتبر از سرور');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'خطا در بازنویسی خبر');
    } finally {
      setLoading(false);
    }
  };

  const countWords = (str: string) => {
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>موتور هوشمند روزنامه‌نگاری هرم وارونه (Inverted Pyramid)</span>
            </div>
            <h2 className="text-xl font-black text-slate-100">
              ویراستار و بازنویس تخصصی اخبار شرکت ملی پخش فرآورده‌های نفتی
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              تبدیل گزارش‌های اداری، اطلاعیه‌ها و پیش‌نویس‌های خام به اخبار استاندارد ژورنالیستی؛ با حذف کلیشه‌های تکراری، حفظ دقیق آمار و اسامی، و تولید خروجی ۶گانه (روتیتر، تیتر هوشمند، لید پویا، متن منسجم، خلاصه شبکه‌های اجتماعی، و ۵ هشتگ).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>مطابق شیوه‌نامه خبرگزاری‌های انرژی</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Input & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left/Input Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileEdit className="w-4 h-4 text-amber-400" />
                <span>متن خام خبر یا گزارش اداری:</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {rawText.length} کاراکتر • {countWords(rawText)} کلمه
              </span>
            </div>

            <textarea
              rows={12}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="متن اولیه، مصاحبه، اطلاعیه منطقه یا پیش‌نویس روابط عمومی را اینجا وارد کنید..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 leading-relaxed font-sans resize-y"
            />

            {/* Quick Samples for Testing */}
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block mb-1.5 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>نمونه‌های آماده برای تست سریع:</span>
              </span>
              <div className="space-y-1">
                {SAMPLE_RAW_TEXTS.map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => setRawText(sample.text)}
                    className="w-full text-right text-[11px] text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 p-2 rounded-lg transition border border-slate-800/60 flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{sample.title}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0 transform -rotate-180" />
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                onClick={executeRewrite}
                disabled={loading || !rawText.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>در حال بازنویسی حرفه‌ای با اصول هرم وارونه...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>بازنویسی حرفه‌ای خبر (هرم وارونه)</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right/Output Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 animate-in fade-in">
              
              {/* Output Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-lg">
                    خروجی استاندارد روزنامه‌نگاری انرژی
                  </span>
                  {sourceEngine === 'gemini' && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      پردازش‌شده با Gemini 3.8 Flash
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCopyAll}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition cursor-pointer shadow"
                >
                  {copiedSection === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>کپی کامل خبر و متعلقات</span>
                </button>
              </div>

              {/* 1. Super-title (روتیتر) */}
              {result.superTitle && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500 font-semibold">۱. روتیتر (تکمیل‌کننده تیتر):</span>
                    <button
                      onClick={() => handleCopy('superTitle', result.superTitle || '')}
                      className="text-amber-400 hover:text-amber-300 transition text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSection === 'superTitle' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>کپی</span>
                    </button>
                  </div>
                  <p className="text-xs font-medium text-amber-300/90">{result.superTitle}</p>
                </div>
              )}

              {/* 2. Main Title (تیتر) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-slate-400 font-bold">۲. تیتر اصلی (کوتاه، هوشمند، بدون کلیشه):</span>
                  <button
                    onClick={() => handleCopy('title', result.title)}
                    className="text-amber-400 hover:text-amber-300 transition text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'title' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>کپی</span>
                  </button>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-100 leading-snug">
                  {result.title}
                </h3>
              </div>

              {/* 3. Lead (لید) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-amber-400 font-bold">۳. لید پویا و جذاب (خلاصه مهمترین رکن رویداد):</span>
                  <button
                    onClick={() => handleCopy('lead', result.lead)}
                    className="text-amber-400 hover:text-amber-300 transition text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'lead' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>کپی</span>
                  </button>
                </div>
                <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                  {result.lead}
                </p>
              </div>

              {/* 4. Body (متن کامل خبر) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400 font-bold">۴. متن کامل خبر (روان، منسجم، با رعایت نیم‌فاصله):</span>
                  <button
                    onClick={() => handleCopy('body', result.body)}
                    className="text-amber-400 hover:text-amber-300 transition text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'body' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>کپی</span>
                  </button>
                </div>
                <div className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed">
                  {result.body}
                </div>
              </div>

              {/* 5. Social Summary (خلاصه ۲۵ تا ۴۰ کلمه‌ای) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">۵. خلاصه برای شبکه‌های اجتماعی:</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      countWords(result.socialSummary) >= 25 && countWords(result.socialSummary) <= 40
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {countWords(result.socialSummary)} کلمه (بازه استاندارد: ۲۵-۴۰)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy('socialSummary', result.socialSummary)}
                    className="text-amber-400 hover:text-amber-300 transition text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'socialSummary' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>کپی</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  {result.socialSummary}
                </p>
              </div>

              {/* 6. Hashtags (۵ هشتگ مرتبط) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="text-slate-400 font-bold flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-amber-400" />
                    <span>۶. پنج هشتگ تخصصی و ایندکس:</span>
                  </span>
                  <button
                    onClick={() => handleCopy('hashtags', result.hashtags.join(' '))}
                    className="text-amber-400 hover:text-amber-300 transition text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSection === 'hashtags' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>کپی همه</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((h, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold bg-slate-900 text-amber-400 px-3 py-1 rounded-lg border border-slate-800"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 shadow-md flex flex-col items-center justify-center min-h-[400px]">
              <FileEdit className="w-12 h-12 text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-300">در انتظار دریافت متن خبر...</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                متن خام مورد نظر را در کادر سمت راست وارد کنید و دکمه «بازنویسی حرفه‌ای» را بزنید یا یکی از نمونه‌های آماده را انتخاب فرمایید.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
