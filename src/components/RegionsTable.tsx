import React, { useState, useMemo } from 'react';
import { RegionNews } from '../types';
import { 
  Search, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface RegionsTableProps {
  regions: RegionNews[];
  onSelectRegionForRewrite: (text: string) => void;
  onOpenContentPackage: (title: string, summary: string) => void;
}

export const RegionsTable: React.FC<RegionsTableProps> = ({
  regions,
  onSelectRegionForRewrite,
  onOpenContentPackage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | '24h' | '7d' | 'low'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeRegionModal, setActiveRegionModal] = useState<RegionNews | null>(null);

  const filteredRegions = useMemo(() => {
    return regions.filter(region => {
      const matchesSearch = 
        region.name.includes(searchTerm) || 
        region.topStory.includes(searchTerm) || 
        region.summary.includes(searchTerm);

      let matchesFilter = true;
      if (selectedFilter === '24h') {
        matchesFilter = region.status === 'active_24h';
      } else if (selectedFilter === '7d') {
        matchesFilter = region.status === 'active_7d' || region.status === 'active_24h';
      } else if (selectedFilter === 'low') {
        matchesFilter = region.status === 'low_activity' || region.status === 'no_recent';
      }

      let matchesCat = true;
      if (selectedCategory !== 'all') {
        matchesCat = region.category === selectedCategory;
      }

      return matchesSearch && matchesFilter && matchesCat;
    });
  }, [regions, searchTerm, selectedFilter, selectedCategory]);

  const stats = useMemo(() => {
    const active24 = regions.filter(r => r.status === 'active_24h').length;
    const active7 = regions.filter(r => r.status === 'active_7d').length;
    const lowCount = regions.filter(r => r.status === 'low_activity' || r.status === 'no_recent').length;
    const totalStories = regions.reduce((acc, curr) => acc + curr.newsCount7Days, 0);
    return { active24, active7, lowCount, totalStories };
  }, [regions]);

  const getStatusBadge = (status: RegionNews['status']) => {
    switch (status) {
      case 'active_24h':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ۲۴ ساعت اخیر
          </span>
        );
      case 'active_7d':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
            ۷ روز اخیر
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            متوسط
          </span>
        );
      case 'low_activity':
      case 'no_recent':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            نیازمند ارتقا
          </span>
        );
    }
  };

  const getCategoryLabel = (category: RegionNews['category']) => {
    switch (category) {
      case 'supply': return 'تأمین و توزیع';
      case 'anti_smuggling': return 'مبارزه با قاچاق';
      case 'smart_card': return 'سامانه هوشمند سوخت';
      case 'cng_clean': return 'CNG و سوخت پاک';
      case 'hse_safety': return 'ایمنی و پدافند';
      case 'infrastructure': return 'توسعه و بازرسی';
      case 'logistics': return 'لجستیک و حمل‌ونقل';
      default: return 'عملیاتی';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & High-level Statistics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
              <MapPin className="w-4 h-4" />
              <span>شبکه جامع عملیاتی سراسر کشور</span>
            </div>
            <h2 className="text-xl font-black text-slate-100">
              پایش و رصد تحلیلی مناطق ۳۷گانه شرکت ملی پخش فرآورده‌های نفتی
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              پایش مستمر وضعیت اخبار، اطلاعیه‌ها، اقدامات میدانی و عملکرد رسانه‌ای کلیه ۳۷ منطقه تحت مدیریت ستاد مرکزی در ۲۴ ساعت و ۷ روز گذشته.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-950/70 border border-slate-800 px-3.5 py-2.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block font-medium">کل مناطق</span>
              <span className="text-xl font-black text-slate-100">۳۷ منطقه</span>
            </div>
            <div className="bg-slate-950/70 border border-emerald-900/40 px-3.5 py-2.5 rounded-xl">
              <span className="text-[11px] text-emerald-400 block font-medium">فعال ۲۴ ساعت</span>
              <span className="text-xl font-black text-emerald-400">{stats.active24} منطقه</span>
            </div>
            <div className="bg-slate-950/70 border border-blue-900/40 px-3.5 py-2.5 rounded-xl">
              <span className="text-[11px] text-blue-400 block font-medium">اخبار ۷ روز گذشته</span>
              <span className="text-xl font-black text-blue-400">{stats.totalStories} خبر</span>
            </div>
            <div className="bg-slate-950/70 border border-amber-900/40 px-3.5 py-2.5 rounded-xl">
              <span className="text-[11px] text-amber-400 block font-medium">کم‌کارکرد رسانه‌ای</span>
              <span className="text-xl font-black text-amber-400">{stats.lowCount} منطقه</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4">
          
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی نام منطقه، عنوان یا کلمه کلیدی..."
              className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              همه ({regions.length})
            </button>
            <button
              onClick={() => setSelectedFilter('24h')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedFilter === '24h'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ۲۴ ساعت اخیر ({stats.active24})
            </button>
            <button
              onClick={() => setSelectedFilter('7d')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedFilter === '7d'
                  ? 'bg-blue-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              هفته جاری ({stats.active24 + stats.active7})
            </button>
            <button
              onClick={() => setSelectedFilter('low')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                selectedFilter === 'low'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              نیازمند ارتقا ({stats.lowCount})
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-2.5 py-1.5 focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="all">همه محورهای موضوعی</option>
              <option value="anti_smuggling">مبارزه با قاچاق سوخت</option>
              <option value="smart_card">سامانه هوشمند سوخت</option>
              <option value="supply">تأمین و توزیع فرآورده</option>
              <option value="cng_clean">CNG و سوخت پاک</option>
              <option value="hse_safety">HSE و پدافند غیرعامل</option>
              <option value="infrastructure">زیرساخت و کالیبراسیون</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 text-xs font-semibold border-b border-slate-800">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 font-bold text-slate-200">منطقه عملیاتی</th>
                <th className="py-3.5 px-3 text-center">اخبار ۷ روز</th>
                <th className="py-3.5 px-4 min-w-[320px]">مهمترین رویداد و تیتر پایش‌شده</th>
                <th className="py-3.5 px-3">زمان رصد</th>
                <th className="py-3.5 px-3 text-center">ضریب اهمیت</th>
                <th className="py-3.5 px-3 text-center">وضعیت رصد</th>
                <th className="py-3.5 px-3">محور موضوعی</th>
                <th className="py-3.5 px-4 text-center">اقدام اتاق خبر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredRegions.map((region, idx) => (
                <tr 
                  key={region.id}
                  className="hover:bg-slate-800/40 transition group"
                >
                  <td className="py-3.5 px-4 text-center text-slate-500 font-mono">
                    {idx + 1}
                  </td>
                  
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => setActiveRegionModal(region)}
                      className="text-right font-bold text-slate-100 group-hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{region.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition transform -rotate-180" />
                    </button>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="font-mono font-bold text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {region.newsCount7Days}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-200 line-clamp-1 leading-relaxed">
                      {region.topStory}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {region.summary}
                    </p>
                  </td>

                  <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                    {region.publishDate}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className={`inline-block font-mono font-black px-2 py-0.5 rounded text-[11px] ${
                      region.importance >= 8
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : region.importance >= 6
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {region.importance}/۱۰
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {getStatusBadge(region.status)}
                  </td>

                  <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                    <span className="bg-slate-950 px-2 py-1 rounded text-[11px] border border-slate-800">
                      {getCategoryLabel(region.category)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onSelectRegionForRewrite(`منطقه شرکت ملی پخش: ${region.name}\nعنوان رویداد: ${region.topStory}\nخلاصه گزارش: ${region.summary}\nاقدامات: ${region.keyDetails.join(' - ')}`)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition cursor-pointer"
                        title="ارسال به موتور بازنویسی هرم وارونه"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>بازنویسی</span>
                      </button>

                      <button
                        onClick={() => onOpenContentPackage(region.topStory, region.summary)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 transition cursor-pointer"
                        title="تولید بسته ۲۷گانه محتوا"
                      >
                        <span>بسته ۲۷</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRegions.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            هیچ منطقه‌ای با فیلتر جستجوی انتخاب‌شده یافت نشد.
          </div>
        )}
      </div>

      {/* Region Detail Modal */}
      {activeRegionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                  منطقه {activeRegionModal.name}
                </span>
                <h3 className="text-lg font-black text-slate-100 mt-1">
                  {activeRegionModal.topStory}
                </h3>
              </div>
              <button
                onClick={() => setActiveRegionModal(null)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1 font-semibold">شرح رویداد مانیتورشده:</span>
                <p className="text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {activeRegionModal.summary}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-2 font-semibold">اقدامات کلیدی منطقه:</span>
                <ul className="space-y-1.5">
                  {activeRegionModal.keyDetails.map((detail, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">تعداد اخبار ثبت‌شده در ۷ روز:</span>
                  <span className="text-slate-200 font-bold text-sm font-mono">{activeRegionModal.newsCount7Days} خبر</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">ضریب اهمیت خبری:</span>
                  <span className="text-amber-400 font-bold text-sm font-mono">{activeRegionModal.importance} از ۱۰</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
              <a
                href={activeRegionModal.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>پورتال منطقه</span>
              </a>
              <button
                onClick={() => {
                  onSelectRegionForRewrite(`منطقه شرکت ملی پخش: ${activeRegionModal.name}\nرویداد: ${activeRegionModal.topStory}\nشرح: ${activeRegionModal.summary}`);
                  setActiveRegionModal(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>بازنویسی حرفه‌ای هرم وارونه</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
