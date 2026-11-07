import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { RegionsTable } from './components/RegionsTable';
import { NewsMonitoringView } from './components/NewsMonitoringView';
import { ContentPackageModal } from './components/ContentPackageModal';
import { AiNewsRewriter } from './components/AiNewsRewriter';
import { SourcesDirectory } from './components/SourcesDirectory';
import { ReportExportModal } from './components/ReportExportModal';

import { regions37Data } from './data/regionsData';
import { ContentPackage27, NewsItem, DbArticle, DbSource, DbStats, RegionNews } from './types';
import { 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Globe2, 
  FileText, 
  ArrowUpRight,
  Database,
  Radio,
  Clock,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'regions' | 'rewriter' | 'package' | 'sources'>('monitoring');
  
  // Database & Live Collector State
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [dbArticles, setDbArticles] = useState<DbArticle[]>([]);
  const [dbSources, setDbSources] = useState<DbSource[]>([]);
  const [dbRegions, setDbRegions] = useState<any[]>([]);
  const [articleFilter, setArticleFilter] = useState<'all' | 'real' | 'seed'>('all');
  const [isSyncingSourceId, setIsSyncingSourceId] = useState<string | null>(null);

  // Active Content Package for 27 items modal/studio
  const [currentPackage, setCurrentPackage] = useState<ContentPackage27 | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);

  // Bulletin Export Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Rewriter State
  const [rewriterRawText, setRewriterRawText] = useState<string>('');

  // Live Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [refreshNotification, setRefreshNotification] = useState<string | null>(null);

  // Fetch live stats, articles, and sources from backend
  const fetchLiveData = useCallback(async () => {
    try {
      const [healthRes, statsRes, articlesRes, sourcesRes, regionsRes] = await Promise.all([
        fetch('/api/health').then(r => r.ok ? r.json() : null),
        fetch('/api/stats').then(r => r.ok ? r.json() : null),
        fetch('/api/articles?limit=80').then(r => r.ok ? r.json() : null),
        fetch('/api/sources').then(r => r.ok ? r.json() : null),
        fetch('/api/regions').then(r => r.ok ? r.json() : null)
      ]);

      setDbConnected(Boolean(healthRes?.status === 'ok' && healthRes?.database === 'connected'));
      setDbStats(statsRes || null);
      setDbArticles(articlesRes?.items && Array.isArray(articlesRes.items) ? articlesRes.items : []);
      setDbSources(Array.isArray(sourcesRes) ? sourcesRes : []);
      setDbRegions(Array.isArray(regionsRes) ? regionsRes : []);
    } catch (err) {
      setDbConnected(false);
      setDbStats(null);
      setDbArticles([]);
      setDbSources([]);
      setDbRegions([]);
      console.warn('[Frontend] Could not fetch live database data', err);
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Handle manual collection sync across all sources
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    setRefreshNotification('در حال ارتباط با درگاه‌ها و مانیتورینگ بلادرنگ منابع خبری...');
    try {
      const res = await fetch('/api/collector/sync', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.details || `HTTP ${res.status}`);
      await fetchLiveData();

      const newItemsCount = data?.stats?.totalNew ?? 0;
      setRefreshNotification(
        newItemsCount > 0 
          ? `پایش بلادرنگ با موفقیت انجام شد (${newItemsCount} خبر و رویداد جدید به پایگاه داده اضافه شد).`
          : 'پایش بلادرنگ با موفقیت انجام شد (تمامی منابع پالایش و به‌روزرسانی شدند).'
      );
    } catch (err) {
      setRefreshNotification('خطا در ارتباط با سرور زمان‌بندی خزش اخبار.');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setRefreshNotification(null), 5000);
    }
  };

  // Handle single source sync
  const handleSyncSource = async (sourceId: string) => {
    setIsSyncingSourceId(sourceId);
    try {
      const res = await fetch(`/api/sources/${sourceId}/sync`, { method: 'POST' });
      const data = await res.json();
      await fetchLiveData();
      if (data?.status === 'failed' || data?.errorMessage || data?.error) {
        setRefreshNotification(`خطا در ارتباط با منبع: ${data?.errorMessage || data?.details || data?.error || 'عدم دسترسی'}`);
      } else {
        setRefreshNotification(`منبع با موفقیت پایش شد (${data?.newCount || 0} خبر جدید).`);
      }
      setTimeout(() => setRefreshNotification(null), 5000);
    } catch (err: any) {
      console.error('Failed to sync source', err);
      setRefreshNotification(`خطا در اتصال به سرور: ${err?.message || 'خطای ناشناخته'}`);
      setTimeout(() => setRefreshNotification(null), 5000);
    } finally {
      setIsSyncingSourceId(null);
    }
  };

  // Handle source toggle
  const handleToggleSource = async (sourceId: string, enabled: boolean) => {
    try {
      await fetch(`/api/sources/${sourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      await fetchLiveData();
    } catch (err) {
      console.error('Failed to toggle source', err);
    }
  };

  // Helper to map DB Article to NewsItem
  const mapDbToNewsItem = (art: DbArticle): NewsItem => {
    let keywords: string[] = ['فرآورده‌های نفتی', 'انرژی'];
    if (art.analysis?.keywords) {
      try {
        keywords = JSON.parse(art.analysis.keywords);
      } catch {
        keywords = art.analysis.keywords.split(',').map(s => s.trim());
      }
    }

    const isBreaking = (art.analysis?.crisisScore || 0) >= 6;
    const importance = art.analysis?.importanceScore || 7;
    const appeal = art.analysis?.mediaValueScore || 7;
    const viral = (art.analysis?.publicInterestScore || 7) * 10;

    return {
      id: art.id,
      title: art.title,
      catchyTitle: art.originalTitle || art.title,
      summary: art.summary,
      importanceScore: importance,
      appealScore: appeal,
      viralProbability: Math.min(100, Math.max(10, viral)),
      category: isBreaking ? 'crisis_management' : 'policy',
      isOfficial: art.source?.category === 'official',
      isBreaking,
      timeAgo: calculateTimeAgo(art.publishedAt),
      source: art.source?.name || 'منبع مانیتورینگ',
      sourceUrl: art.url,
      impactOnPeople: art.analysis?.summary || 'اطلاع‌رسانی مستقیم به عموم مصرف‌کنندگان و شهروندان.',
      impactOnIndustry: 'تأثیر بر مدیریت زنجیره تأمین و بهینه‌سازی جریان سوخت کشور.',
      tags: keywords.slice(0, 4),
      fullPackage: undefined
    };
  };

  // Filtered news items
  const combinedNewsItems: NewsItem[] = React.useMemo(() => {
    if (dbArticles.length === 0) return [];

    let filtered = dbArticles;
    if (articleFilter === 'real') {
      filtered = dbArticles.filter(a => !a.isSeed);
    } else if (articleFilter === 'seed') {
      filtered = dbArticles.filter(a => a.isSeed);
    }

    const mapped = filtered.map(mapDbToNewsItem);
    return mapped;
  }, [dbArticles, articleFilter]);

  // Combined sources
  const currentSources = dbSources;

  // Dynamic statistics computed from PostgreSQL
  const currentStats = React.useMemo(() => {
    if (!dbStats) return [
      { label: 'اخبار ثبت‌شده', value: '—', trend: 'در انتظار اتصال به پایگاه داده' },
      { label: 'مناطق تحت پوشش', value: '۳۷ منطقه', trend: 'فهرست مرجع مناطق عملیاتی' },
      { label: 'منابع پایش', value: `${dbSources.length} منبع`, trend: 'وضعیت پس از اولین پایش مشخص می‌شود' },
      { label: 'تحلیل احساسات', value: '—', trend: 'پس از دریافت خبر واقعی نمایش داده می‌شود' }
    ];
    return [
      {
        label: 'مجموع اخبار در پایگاه داده',
        value: `${dbStats.totalArticles} خبر`,
        trend: `${dbStats.realArticles} خبر زنده کشف‌شده`
      },
      {
        label: 'مناطق ۳۷گانه تحت پوشش',
        value: '۳۷ منطقه فعال',
        trend: 'پوشش کامل تراز انرژی کشور'
      },
      {
        label: 'رصد شبانه‌روزی مراجع',
        value: `${dbStats.activeSources} منبع فعال`,
        trend: `${dbStats.healthySources} منبع با پاسخ برخط`
      },
      {
        label: 'شاخص سلامت افکار عمومی',
        value: `${dbStats.sentiments.positive} مثبت / ${dbStats.sentiments.neutral} خنثی`,
        trend: dbStats.sentiments.negative > 0 ? `${dbStats.sentiments.negative} مورد هشدار انتقادی` : 'پایش آرامش فضا'
      }
    ];
  }, [dbStats, dbSources.length]);

  const handleOpenNewsPackage = async (news: NewsItem) => {
    if (news.fullPackage) {
      setCurrentPackage(news.fullPackage);
      setIsPackageModalOpen(true);
    } else {
      // Generate package dynamically for this item
      setIsGeneratingPackage(true);
      setIsPackageModalOpen(true);
      try {
        const response = await fetch('/api/ai/generate-package', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: news.title, context: news.summary })
        });
        const data = await response.json();
        if (data.success && data.package) {
          setCurrentPackage(data.package);
        }
      } catch (e) {
        console.error('Failed to generate package', e);
      } finally {
        setIsGeneratingPackage(false);
      }
    }
  };

  const handleGenerateCustomPackage = async (topic: string, context?: string) => {
    setIsGeneratingPackage(true);
    try {
      const response = await fetch('/api/ai/generate-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, context })
      });
      const data = await response.json();
      if (data.success && data.package) {
        setCurrentPackage(data.package);
      }
    } catch (e) {
      console.error('Failed to generate custom package', e);
    } finally {
      setIsGeneratingPackage(false);
    }
  };

  const handleSendToRewriter = (text: string) => {
    setRewriterRawText(text);
    setActiveTab('rewriter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      
      {/* Official Header with Nav and Live DB Badge */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
        dbStatus={{
          totalArticles: dbStats?.totalArticles ?? 0,
          realArticles: dbStats?.realArticles ?? 0,
          isHealthy: dbConnected,
          isRunning: isRefreshing
        }}
      />

      {/* Real-time Notification Banner */}
      {refreshNotification && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs py-2 px-4 text-center font-bold flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{refreshNotification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* News Feed Stream Filter Bar (Active in Monitoring tab) */}
        {activeTab === 'monitoring' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">
                پایگاه داده PostgreSQL:
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {dbStats?.totalArticles ?? 0} خبر ثبت‌شده • {dbStats?.realArticles ?? 0} خبر واقعی
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setArticleFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  articleFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                همه اخبار ({dbStats?.totalArticles ?? 0})
              </button>
              <button
                onClick={() => setArticleFilter('real')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  articleFilter === 'real'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3 h-3 text-emerald-400" />
                <span>اخبار واقعی و خزش‌شده ({dbStats?.realArticles ?? 0})</span>
              </button>
              <button
                onClick={() => setArticleFilter('seed')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  articleFilter === 'seed'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                داده‌های نمونه ({dbStats?.seedArticles ?? 0})
              </button>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <NewsMonitoringView
            top10News={combinedNewsItems}
            alerts={[]}
            campaigns={[]}
            videos={[]}
            stats={currentStats}
            onOpenContentPackage={handleOpenNewsPackage}
            onSendToRewriter={handleSendToRewriter}
          />
        )}

        {activeTab === 'regions' && (
          <RegionsTable
            regions={dbRegions.length ? dbRegions.map((region: any) => {
              const count = region._count?.articles ?? 0;
              const latest = region.articles?.[0];
              return {
                id: String(region.id),
                name: region.name,
                newsCount7Days: count,
                topStory: latest?.title || 'هنوز خبر واقعی برای این منطقه ثبت نشده است',
                publishDate: latest?.publishedAt ? calculateTimeAgo(latest.publishedAt) : 'بدون خبر ثبت‌شده',
                importance: 0,
                status: count > 0 ? 'active_7d' : 'no_recent',
                category: 'supply',
                link: latest?.url || '',
                summary: latest?.summary || 'در انتظار دریافت خبر از منابع پایش',
                keyDetails: []
              };
            }) : regions37Data.map(region => ({
              ...region,
              newsCount7Days: 0,
              topStory: 'هنوز خبر واقعی برای این منطقه ثبت نشده است',
              publishDate: 'بدون خبر ثبت‌شده',
              importance: 0,
              status: 'no_recent' as const,
              link: '',
              summary: 'در انتظار دریافت خبر از منابع پایش',
              keyDetails: []
            }))}
            onSelectRegionForRewrite={handleSendToRewriter}
            onOpenContentPackage={(title, summary) => {
              handleGenerateCustomPackage(title, summary);
              setIsPackageModalOpen(true);
            }}
          />
        )}

        {activeTab === 'rewriter' && (
          <AiNewsRewriter
            initialRawText={rewriterRawText}
            onRewriteDone={(res) => {
              // Handled within rewriter
            }}
          />
        )}

        {activeTab === 'package' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                  <FileText className="w-4 h-4" />
                  <span>میز تولید محتوای جامع روابط عمومی</span>
                </div>
                <h2 className="text-xl font-black text-slate-100">
                  بسته هوشمند ۲۷ خروجی رسانه‌ای برای هر خبر و رویداد
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  تولید خودکار تمام ۲۷ قلم خروجی مورد نیاز روابط عمومی: تیتر اصلی، تیتر جذاب، خلاصه، جزئیات، اوزان و ویرال، مخاطب هدف، زمان انتشار، سئو، متادیسکریپشن، ۱۰ کلمه کلیدی، متن پرتال، متن‌های شبکه‌های اجتماعی (تلگرام، اینستا، لینکدین، X)، سناریوی تصویر/ویدیو/اینفوگرافیک، هشتگ‌ها و منابع استنادی.
                </p>
              </div>

              <button
                onClick={() => setIsPackageModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer self-start md:self-auto"
              >
                <Sparkles className="w-4 h-4" />
                <span>مشاهده و ویرایش بسته جاری</span>
              </button>
            </div>

            {/* Quick Grid of Available Packages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {combinedNewsItems.slice(0, 6).map((news) => (
                <div
                  key={news.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      بسته ۲۷گانه هوشمند
                    </span>
                    <h4 className="text-sm font-black text-slate-100 mt-2 leading-snug">
                      {news.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {news.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">ویرال: {news.viralProbability}٪</span>
                    <button
                      onClick={() => handleOpenNewsPackage(news)}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>باز کردن بسته ۲۷</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <SourcesDirectory 
            sources={currentSources}
            onSyncSource={handleSyncSource}
            onToggleSource={handleToggleSource}
            isSyncingSourceId={isSyncingSourceId}
          />
        )}

      </main>

      {/* Content Package Modal (Full 27 items) */}
      <ContentPackageModal
        contentPackage={currentPackage}
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        onGenerateCustomPackage={handleGenerateCustomPackage}
        isGenerating={isGeneratingPackage}
      />

      {/* Official Bulletin Export Modal */}
      <ReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        top10News={combinedNewsItems}
        regions={regions37Data}
        alerts={officialAlertsData}
      />

      {/* Official Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 mt-12 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-300">
              سامانه هوشمند مانیتورینگ رسانه و تولید محتوای شرکت ملی پخش فرآورده‌های نفتی ایران
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
            <span>پایش شبانه‌روزی ۳۷ منطقه عملیاتی</span>
            <span>•</span>
            <span>سازگار با دستورالعمل‌های ژورنالیسم انرژی و هرم وارونه</span>
            <span>•</span>
            <span className="text-amber-400/90 font-mono">اتاق خبر دیجیتال • پایگاه داده PostgreSQL</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

function calculateTimeAgo(dateStr?: string): string {
  if (!dateStr) return 'به تازگی';
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'کمتر از ۱ ساعت پیش';
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} روز پیش`;
  } catch {
    return 'امروز';
  }
}
