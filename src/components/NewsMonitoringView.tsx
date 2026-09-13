import React, { useState } from 'react';
import { NewsItem, OfficialAlert, PRCampaignSuggestion, VideoSuggestion } from '../types';
import { 
  Flame, 
  TrendingUp, 
  Star, 
  AlertTriangle, 
  BarChart3, 
  Building2, 
  Lightbulb, 
  Video, 
  Megaphone, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronLeft,
  Share2,
  Users,
  Activity
} from 'lucide-react';

interface NewsMonitoringViewProps {
  top10News: NewsItem[];
  alerts: OfficialAlert[];
  campaigns: PRCampaignSuggestion[];
  videos: VideoSuggestion[];
  stats: { label: string; value: string; trend: string }[];
  onOpenContentPackage: (news: NewsItem) => void;
  onSendToRewriter: (text: string) => void;
}

export const NewsMonitoringView: React.FC<NewsMonitoringViewProps> = ({
  top10News,
  alerts,
  campaigns,
  videos,
  stats,
  onOpenContentPackage,
  onSendToRewriter
}) => {
  const [activeSection, setActiveSection] = useState<
    'top10' | 'high_value' | 'high_appeal' | 'official' | 'stats' | 'alerts' | 'pr_ideas'
  >('top10');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 5 high value news (sorted by importance score)
  const highValueNews = [...top10News]
    .sort((a, b) => b.importanceScore - a.importanceScore)
    .slice(0, 5);

  // 5 high appeal news (sorted by appeal and viral probability)
  const highAppealNews = [...top10News]
    .sort((a, b) => (b.appealScore * 10 + b.viralProbability) - (a.appealScore * 10 + a.viralProbability))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Real-time Operational Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md hover:border-slate-700 transition">
            <span className="text-[11px] text-slate-400 block font-medium line-clamp-1">{stat.label}</span>
            <span className="text-base sm:text-lg font-black text-slate-100 mt-0.5 block font-mono">{stat.value}</span>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-1">{stat.trend}</span>
          </div>
        ))}
      </div>

      {/* Critical Alert Bar (if any critical alert exists) */}
      {alerts.find(a => a.level === 'critical') && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3.5 flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-rose-300">هشدار درجه ۱ ستادی:</span>
              <span className="text-slate-400">{alerts.find(a => a.level === 'critical')?.timestamp}</span>
            </div>
            <p className="text-rose-100 font-medium mt-0.5 leading-relaxed">
              {alerts.find(a => a.level === 'critical')?.title} - {alerts.find(a => a.level === 'critical')?.actionRequired}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex flex-wrap items-center gap-1.5 shadow-md">
        <button
          onClick={() => setActiveSection('top10')}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition cursor-pointer ${
            activeSection === 'top10'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>۱۰ خبر مهم روز</span>
        </button>

        <button
          onClick={() => setActiveSection('high_value')}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition cursor-pointer ${
            activeSection === 'high_value'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>۵ خبر با بیشترین ارزش خبری</span>
        </button>

        <button
          onClick={() => setActiveSection('high_appeal')}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition cursor-pointer ${
            activeSection === 'high_appeal'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>۵ خبر با بیشترین جذابیت مخاطب</span>
        </button>

        <button
          onClick={() => setActiveSection('official')}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition cursor-pointer ${
            activeSection === 'official'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>اطلاعیه‌های رسمی</span>
        </button>

        <button
          onClick={() => setActiveSection('stats')}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition cursor-pointer ${
            activeSection === 'stats'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>مهمترین آمار منتشرشده</span>
        </button>

        <button
          onClick={() => setActiveSection('alerts')}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition cursor-pointer ${
            activeSection === 'alerts'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>هشدارها و بحران‌ها ({alerts.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('pr_ideas')}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition cursor-pointer ${
            activeSection === 'pr_ideas'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>بسته پیشنهادات روابط عمومی</span>
        </button>
      </div>

      {/* Render Selected Section */}

      {/* 1. TOP 10 NEWS */}
      {activeSection === 'top10' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>۱۰ خبر برتر و اولویت‌بندی‌شده روز (شرکت ملی پخش و صنعت انرژی)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">آخرین اعتبارسنجی: امروز ساعت ۱۱:۰۰</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {top10News.map((news, index) => (
              <div
                key={news.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition group relative overflow-hidden"
              >
                {/* Visual Rank Accent */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                  
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 font-mono font-black text-sm border border-amber-500/30 shrink-0 mt-0.5">
                      {index + 1}
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {news.isBreaking && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-500 text-slate-950 animate-pulse">
                            خبر فوری
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {news.source}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">{news.timeAgo}</span>
                      </div>

                      <h4 className="text-base font-black text-slate-100 leading-snug group-hover:text-amber-400 transition">
                        {news.title}
                      </h4>
                      <p className="text-xs font-semibold text-amber-300/90 mt-1">
                        تیتر پیشنهادی جذاب: {news.catchyTitle}
                      </p>
                    </div>
                  </div>

                  {/* Metrics Badges */}
                  <div className="flex sm:flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">اهمیت:</span>
                      <span className="font-mono font-bold text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-rose-400">
                        {news.importanceScore}/۱۰
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">جذابیت:</span>
                      <span className="font-mono font-bold text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-amber-400">
                        {news.appealScore}/۱۰
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">احتمال وایرال:</span>
                      <span className="font-mono font-bold text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-emerald-400">
                        {news.viralProbability}٪
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary & Impact */}
                <div className="py-3 text-xs space-y-2">
                  <p className="text-slate-300 leading-relaxed">
                    {news.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 font-semibold block mb-0.5 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        اثر بر مردم و جامعه:
                      </span>
                      <span className="text-slate-300">{news.impactOnPeople}</span>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 font-semibold block mb-0.5 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-amber-400" />
                        اثر بر صنعت نفت و تراز سوخت:
                      </span>
                      <span className="text-slate-300">{news.impactOnIndustry}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {news.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 font-mono">
                    شناسه خبر: {news.id}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(news.id, `${news.title}\n\n${news.summary}`)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                    >
                      {copiedId === news.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">کپی شد</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>کپی خلاصه</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onSendToRewriter(`${news.title}\n\n${news.summary}\n\nنکات آماری و جزئیات:\n${news.stats || ''}`)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>بازنویسی هرم وارونه</span>
                    </button>

                    <button
                      onClick={() => onOpenContentPackage(news)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 transition shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      <span>مشاهده بسته ۲۷گانه</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. FIVE HIGH-VALUE NEWS */}
      {activeSection === 'high_value' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>۵ خبر با بیشترین ارزش خبری برای ستاد و مراجع بالادستی</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              اخبار دارای بالاترین تأثیر بر سیاست‌گذاری کلان انرژی، قوانین، تراز مالی و مأموریت‌های استراتژیک وزارت نفت.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highValueNews.map((news, i) => (
              <div key={news.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      رتبه ارزش {i + 1} • امتیاز {news.importanceScore}/۱۰
                    </span>
                    <span className="text-slate-400">{news.source}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 leading-snug mb-2">{news.title}</h4>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{news.summary}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">اثر مستقیم بر پایداری زنجیره سوخت</span>
                  <button
                    onClick={() => onOpenContentPackage(news)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>بسته ۲۷ محتوا</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. FIVE HIGH-APPEAL NEWS */}
      {activeSection === 'high_appeal' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span>۵ خبر با بیشترین جذابیت رسانه‌ای و پتانسیل وایرال شدن</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              عناوینی که بیشترین تعامل، کلیک، و بازنشر را در شبکه‌های اجتماعی (تلگرام، اینستاگرام، توییتر) و رسانه‌های عمومی خواهند داشت.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highAppealNews.map((news, i) => (
              <div key={news.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                      پتانسیل وایرال {news.viralProbability}٪ • جذابیت {news.appealScore}/۱۰
                    </span>
                    <span className="text-slate-400">{news.timeAgo}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 leading-snug mb-1">{news.catchyTitle}</h4>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{news.summary}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400">مناسب ریلز اینستاگرام و تیتر تلگرام</span>
                  <button
                    onClick={() => onOpenContentPackage(news)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>تولید چندرسانه‌ای</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. OFFICIAL NOTICES */}
      {activeSection === 'official' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span>مهمترین اطلاعیه‌ها و بیانیه‌های رسمی ستاد شرکت ملی پخش</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              اطلاعیه‌های ابلاغی جهت هماهنگی با مجاری عرضه، رانندگان ناوگان، و عموم مردم در وب‌سایت رسمی niopdc.ir.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1 text-xs">
                <span className="font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/50">
                  اطلاعیه رسمی شماره ۱
                </span>
                <span className="text-slate-400 font-mono">امروز - ۰۹:۰۰</span>
              </div>
              <h4 className="text-sm font-bold text-slate-100">
                پاسخ به ابهامات سهمیه بنزین؛ عدم تغییر در میزان و قیمت سهمیه‌های یارانه‌ای
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                شرکت ملی پخش فرآورده‌های نفتی ایران تأکید می‌نماید هرگونه تغییر در سهمیه‌بندی و نرخ بنزین تکذیب می‌شود و عرضه بنزین سوپر وارداتی هیچ ارتباطی با سهمیه ۶۰ لیتر خودروهای شخصی ندارد.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1 text-xs">
                <span className="font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/50">
                  اطلاعیه رسمی شماره ۲
                </span>
                <span className="text-slate-400 font-mono">دیروز - ۱۸:۳۰</span>
              </div>
              <h4 className="text-sm font-bold text-slate-100">
                فراخوان ثبت‌نام متقاضیان گاز مایع (LPG) در سامانه سدف
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                کلیه خانوارهای فاقد علمک گاز و اصناف متقاضی سیلندر موظفند با ثبت مشخصات در پنجره خدمات دولت هوشمند، سهمیه ماهیانه خود را با کارت بانکی دریافت نمایند.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. STATS */}
      {activeSection === 'stats' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <span>مهمترین شاخص‌های عملکردی و داده‌های آماری پایش‌شده</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              شاخص‌های آماری رسمی از حجم توزیع، مصرف سوخت، ناوگان، و پایداری شبکه در ۲۴ ساعت گذشته.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((s, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 block font-medium">{s.label}</span>
                <span className="text-2xl font-black text-slate-100 mt-2 block font-mono">{s.value}</span>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">وضعیت پایش:</span>
                  <span className="text-emerald-400 font-bold">{s.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. ALERTS & CRISES */}
      {activeSection === 'alerts' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>هشدارها، رصد بحران‌های احتمالی و مقابله با شایعات رسانه‌ای</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              رصدخانه هوشمند شایعات فضای مجازی، افت احتمالی فشار گاز در استان‌های سردسیر و آماده‌باش لجستیک.
            </p>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl p-4 border ${
                  alert.level === 'critical'
                    ? 'bg-rose-950/30 border-rose-800/60'
                    : alert.level === 'warning'
                    ? 'bg-amber-950/30 border-amber-800/60'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    alert.level === 'critical' ? 'bg-rose-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {alert.level === 'critical' ? 'بحران فوری' : 'هشدار نظارتی'}
                  </span>
                  <span className="text-slate-400 font-mono">{alert.timestamp}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 leading-snug">{alert.title}</h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{alert.description}</p>
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 text-xs">
                  <span className="text-slate-400 font-semibold">دستور اقدام اتاق خبر: </span>
                  <span className="text-amber-300 font-medium">{alert.actionRequired}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. PR IDEAS, CAMPAIGNS & VIDEO PROPOSALS */}
      {activeSection === 'pr_ideas' && (
        <div className="space-y-6">
          
          {/* PR Campaigns */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <span>پیشنهاد کمپین‌های رسانه‌ای و جریان‌سازی افکار عمومی</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((camp) => (
                <div key={camp.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">{camp.title}</span>
                    <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">{camp.suggestedTag}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed"><strong className="text-slate-400">محور:</strong> {camp.theme}</p>
                  <p className="text-slate-300 leading-relaxed"><strong className="text-slate-400">هدف:</strong> {camp.objective}</p>
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                    {camp.targetChannels.map((ch, idx) => (
                      <span key={idx} className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Suggestions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-400" />
              <span>سناریوهای پیشنهادی تولید ویدیوی کوتاه و موشن‌گرافیک</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {videos.map((vid) => (
                <div key={vid.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between text-xs space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-mono font-bold text-blue-400">{vid.duration}</span>
                      <span className="text-slate-500 font-semibold">{vid.type}</span>
                    </div>
                    <h4 className="font-bold text-slate-100 mb-1">{vid.title}</h4>
                    <p className="text-amber-300/90 text-[11px] leading-relaxed mb-2"><strong>قلاب (Hook):</strong> «{vid.hook}»</p>
                    <p className="text-slate-400 leading-relaxed text-[11px]">{vid.summaryScript}</p>
                  </div>

                  <button
                    onClick={() => onSendToRewriter(`سناریوی تولید ویدیو:\nعنوان: ${vid.title}\nقلاب شروع: ${vid.hook}\nخلاصه فیلمنامه: ${vid.summaryScript}`)}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-bold py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer w-full"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>تولید متن سناریو با AI</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
