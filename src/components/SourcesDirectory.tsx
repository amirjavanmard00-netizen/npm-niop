import React, { useState } from 'react';
import { SourceEntry } from '../data/sourcesData';
import { DbSource } from '../types';
import { 
  Globe2, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Radio, 
  Building2, 
  FileText,
  Filter,
  RefreshCw,
  Power,
  Zap,
  Clock,
  AlertCircle
} from 'lucide-react';

interface SourcesDirectoryProps {
  sources: (SourceEntry | DbSource)[];
  onSyncSource?: (id: string) => Promise<void>;
  onToggleSource?: (id: string, enabled: boolean) => Promise<void>;
  isSyncingSourceId?: string | null;
}

export const SourcesDirectory: React.FC<SourcesDirectoryProps> = ({ 
  sources,
  onSyncSource,
  onToggleSource,
  isSyncingSourceId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = sources.filter(s => {
    const domain = (s as any).domain || (s as any).url || '';
    const topics = (s as any).topics || [];
    const matchesSearch = s.name.includes(searchTerm) || domain.includes(searchTerm) || topics.some((t: string) => t.includes(searchTerm));
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'official': return 'مراجع رسمی و دولتی';
      case 'domestic_agency': return 'خبرگزاری‌های معتبر داخلی';
      case 'energy_specialized': return 'نشریات تخصصی انرژی و اقتصادی';
      case 'international': return 'پلتفرم‌های بین‌المللی انرژی';
      default: return 'سایر منابع';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Directory Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
              <Globe2 className="w-4 h-4" />
              <span>پایش بلادرنگ مراجع اطلاعاتی انرژی</span>
            </div>
            <h2 className="text-xl font-black text-slate-100">
              رصدخانه جامع منابع رسانه‌ای و پایش خودکار
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              جمع‌آوری پیوسته، اعتبارسنجی داده و خزش RSS/HTML از درگاه‌های رسمی وزارت نفت، ۳۷ منطقه پخش و خبرگزاری‌های تراز اول با پایگاه داده پایدار SQLite و هوش مصنوعی.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>موتور وب‌اسکرپینگ و RSS فعال</span>
            </span>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-800 mt-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی منبع، دامنه یا حوزه خبری..."
              className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedCategory === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              همه منابع ({sources.length})
            </button>
            <button
              onClick={() => setSelectedCategory('official')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedCategory === 'official' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              رسمی دولتی
            </button>
            <button
              onClick={() => setSelectedCategory('domestic_agency')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedCategory === 'domestic_agency' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              خبرگزاری‌ها
            </button>
            <button
              onClick={() => setSelectedCategory('energy_specialized')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedCategory === 'energy_specialized' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              تخصصی انرژی
            </button>
            <button
              onClick={() => setSelectedCategory('international')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedCategory === 'international' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              بین‌المللی
            </button>
          </div>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => {
          const isDbSource = 'status' in s && typeof s.status === 'string';
          const isEnabled = (s as any).enabled !== false;
          const domain = (s as any).domain || (s as any).url || s.id;
          const status = (s as any).status || 'healthy';
          const isSyncing = isSyncingSourceId === s.id;
          const responseTime = (s as any).responseTimeMs;
          const articleCount = (s as any)._count?.articles ?? (s as any).articleCount ?? 0;

          return (
            <div
              key={s.id}
              className={`bg-slate-900 border rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3 transition ${
                !isEnabled ? 'opacity-60 border-slate-800/50' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {getCategoryName(s.category)}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {status === 'healthy' || status === 'active' ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        برخط
                      </span>
                    ) : status === 'slow' ? (
                      <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold font-mono">
                        <Clock className="w-3 h-3 text-amber-400" />
                        کند
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold font-mono" title={(s as any).lastErrorMessage || 'عدم دسترسی به سرور منبع'}>
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        خطا {(s as any).httpStatus ? `(${ (s as any).httpStatus })` : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Real error banner if unreachable */}
                {(s as any).status === 'error' && (s as any).lastErrorMessage && (
                  <div className="mb-2 p-2 rounded-lg bg-rose-950/40 border border-rose-900/60 text-[11px] text-rose-300 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="overflow-hidden">
                      <span className="font-bold text-rose-200 block text-[10px]">گزارش خطای منبع:</span>
                      <p className="line-clamp-2 text-rose-300/90 font-mono text-[10px] dir-ltr text-left">
                        {(s as any).lastErrorMessage}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-100">{s.name}</h4>
                    <span className="text-xs text-amber-400/80 font-mono block mt-0.5" dir="ltr">{domain}</span>
                  </div>

                  {onToggleSource && (
                    <button
                      onClick={() => onToggleSource(s.id, !isEnabled)}
                      title={isEnabled ? 'غیرفعال‌سازی منبع' : 'فعال‌سازی منبع'}
                      className={`p-1.5 rounded-lg border transition text-xs ${
                        isEnabled
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900/60'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Performance & Article Count metadata */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="bg-slate-950/70 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">اخبار ذخیره‌شده:</span>
                    <span className="font-bold text-slate-200 font-mono">{articleCount} خبر</span>
                  </div>
                  <div className="bg-slate-950/70 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">سرعت پاسخگویی:</span>
                    <span className="font-bold text-amber-300 font-mono">
                      {responseTime ? `${responseTime} ms` : 'کمتر از ۱s'}
                    </span>
                  </div>
                </div>

                {/* Topics */}
                {Array.isArray((s as any).topics) && (s as any).topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {(s as any).topics.slice(0, 3).map((t: string, idx: number) => (
                      <span key={idx} className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>اعتبار: </span>
                  <span className="font-mono font-bold text-slate-200">{s.reliability || 95}٪</span>
                </div>

                <div className="flex items-center gap-2">
                  {onSyncSource && isEnabled && (
                    <button
                      onClick={() => onSyncSource(s.id)}
                      disabled={isSyncing}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold text-[11px] flex items-center gap-1 transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'در حال خزش...' : 'پایش فوری'}</span>
                    </button>
                  )}

                  <a
                    href={domain.startsWith('http') ? domain : `https://${domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-200 transition p-1"
                    title="مشاهده مستقیم وبگاه"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
