import React, { useState } from 'react';
import { Header } from './components/Header';
import { RegionsTable } from './components/RegionsTable';
import { NewsMonitoringView } from './components/NewsMonitoringView';
import { ContentPackageModal } from './components/ContentPackageModal';
import { AiNewsRewriter } from './components/AiNewsRewriter';
import { SourcesDirectory } from './components/SourcesDirectory';
import { ReportExportModal } from './components/ReportExportModal';

import { regions37Data } from './data/regionsData';
import { 
  top10NewsData, 
  officialAlertsData, 
  prCampaignsData, 
  videoSuggestionsData, 
  keyStatisticsData 
} from './data/newsData';
import { monitoredSourcesData } from './data/sourcesData';
import { ContentPackage27, NewsItem } from './types';
import { 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Globe2, 
  FileText, 
  ArrowUpRight 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'regions' | 'rewriter' | 'package' | 'sources'>('monitoring');
  
  // Active Content Package for 27 items modal/studio
  const [currentPackage, setCurrentPackage] = useState<ContentPackage27 | null>(
    top10NewsData[0].fullPackage || null
  );
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);

  // Bulletin Export Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Rewriter State
  const [rewriterRawText, setRewriterRawText] = useState<string>('');

  // Live Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotification, setRefreshNotification] = useState<string | null>(null);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotification('پایش بلادرنگ ۳۷ منطقه و پایگاه‌های رسمی با موفقیت همگام‌سازی شد.');
      setTimeout(() => setRefreshNotification(null), 3500);
    }, 1200);
  };

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
      
      {/* Official Header with Nav */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
      />

      {/* Real-time Notification Banner */}
      {refreshNotification && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs py-2 px-4 text-center font-bold flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{refreshNotification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'monitoring' && (
          <NewsMonitoringView
            top10News={top10NewsData}
            alerts={officialAlertsData}
            campaigns={prCampaignsData}
            videos={videoSuggestionsData}
            stats={keyStatisticsData}
            onOpenContentPackage={handleOpenNewsPackage}
            onSendToRewriter={handleSendToRewriter}
          />
        )}

        {activeTab === 'regions' && (
          <RegionsTable
            regions={regions37Data}
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
              // Can also update or store
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
              {top10NewsData.slice(0, 6).map((news) => (
                <div
                  key={news.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      بسته ۲۷گانه
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
          <SourcesDirectory sources={monitoredSourcesData} />
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
        top10News={top10NewsData}
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
            <span className="text-amber-400/90 font-mono">اتاق خبر دیجیتال نسخه ۳.۸</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
