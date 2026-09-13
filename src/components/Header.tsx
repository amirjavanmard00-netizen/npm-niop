import React from 'react';
import { 
  Flame, 
  Radio, 
  Layers, 
  PenTool, 
  FileText, 
  Globe2, 
  Download, 
  CheckCircle2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'monitoring' | 'regions' | 'rewriter' | 'package' | 'sources';
  setActiveTab: (tab: 'monitoring' | 'regions' | 'rewriter' | 'package' | 'sources') => void;
  onOpenExportModal: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenExportModal,
  onRefreshData,
  isRefreshing
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 shadow-xl">
      {/* Top Banner with Official Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Official Title */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-slate-950 font-black shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40">
              <Flame className="w-7 h-7 text-slate-950 fill-slate-950" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-amber-400 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded-md">
                  اتاق خبر هوشمند • NIOPDC
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  پایش پیوسته ۳۷ منطقه عملیاتی
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-100 mt-0.5 tracking-tight">
                سامانه هوشمند مانیتورینگ رسانه و تولید محتوای شرکت ملی پخش
              </h1>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-2.5 self-end md:self-center">
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50 cursor-pointer"
              title="به‌روزرسانی و واکشی رصد زنده"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">رصد لحظه‌ای</span>
            </button>

            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>خروجی بولتن روزانه</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-t border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 space-x-reverse overflow-x-auto py-1 scrollbar-none" aria-label="بخش‌های سامانه">
            
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === 'monitoring'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>داشبورد مانیتورینگ روز</span>
            </button>

            <button
              onClick={() => setActiveTab('regions')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === 'regions'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>پایش مناطق ۳۷گانه</span>
              <span className="bg-slate-800 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-slate-700">
                ۳۷
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rewriter')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === 'rewriter'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>موتور بازنویسی خبر (هرم وارونه)</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                AI
              </span>
            </button>

            <button
              onClick={() => setActiveTab('package')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === 'package'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>بسته ۲۷گانه تولید محتوا</span>
            </button>

            <button
              onClick={() => setActiveTab('sources')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === 'sources'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Globe2 className="w-4 h-4" />
              <span>رصدخانه منابع و خبرگزاری‌ها</span>
            </button>

          </nav>
        </div>
      </div>
    </header>
  );
};
