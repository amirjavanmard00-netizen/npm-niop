import React, { useState } from 'react';
import { SourceEntry } from '../data/sourcesData';
import { 
  Globe2, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Radio, 
  Building2, 
  FileText,
  Filter
} from 'lucide-react';

interface SourcesDirectoryProps {
  sources: SourceEntry[];
}

export const SourcesDirectory: React.FC<SourcesDirectoryProps> = ({ sources }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = sources.filter(s => {
    const matchesSearch = s.name.includes(searchTerm) || s.domain.includes(searchTerm) || s.topics.some(t => t.includes(searchTerm));
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getCategoryName = (cat: SourceEntry['category']) => {
    switch (cat) {
      case 'official': return 'مراجع رسمی و دولتی';
      case 'domestic_agency': return 'خبرگزاری‌های معتبر داخلی';
      case 'energy_specialized': return 'نشریات تخصصی انرژی و اقتصادی';
      case 'international': return 'پلتفرم‌های بین‌المللی انرژی';
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
              رصدخانه جامع منابع داخلی و بین‌المللی رسانه‌ای
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              جمع‌آوری پیوسته و پالایش داده از درگاه‌های رسمی وزارت نفت، ۳۷ منطقه پخش، پایگاه‌های خبری تراز اول و پلتفرم‌های تحلیل بازار جهانی فرآورده‌های نفتی.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>پروتکل خزش و وب‌اسکرپینگ فعال</span>
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
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3 transition"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  {getCategoryName(s.category)}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {s.lastPing}
                </span>
              </div>

              <h4 className="text-sm font-black text-slate-100">{s.name}</h4>
              <span className="text-xs text-amber-400/80 font-mono block mt-0.5">{s.domain}</span>

              {/* Topics */}
              <div className="flex flex-wrap gap-1 mt-3">
                {s.topics.map((t, idx) => (
                  <span key={idx} className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ضریب اعتبار: </span>
                <span className="font-mono font-bold text-slate-200">{s.reliability}٪</span>
              </div>

              <a
                href={`https://${s.domain}`}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1 text-xs font-semibold"
              >
                <span>مشاهده وبگاه</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
