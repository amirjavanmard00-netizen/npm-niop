import React, { useState } from 'react';
import { ContentPackage27 } from '../types';
import { 
  Check, 
  Copy, 
  Sparkles, 
  Send, 
  Share2, 
  Globe, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Hash, 
  Clock, 
  Target, 
  BarChart2, 
  ExternalLink,
  ChevronLeft,
  X,
  RefreshCw,
  Eye
} from 'lucide-react';

interface ContentPackageModalProps {
  contentPackage: ContentPackage27 | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateCustomPackage: (topic: string, context?: string) => Promise<void>;
  isGenerating: boolean;
}

export const ContentPackageModal: React.FC<ContentPackageModalProps> = ({
  contentPackage,
  isOpen,
  onClose,
  onGenerateCustomPackage,
  isGenerating
}) => {
  const [activeTab, setActiveTab] = useState<'strategy' | 'social' | 'seo_portal' | 'multimedia' | 'tags_sources'>('strategy');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    await onGenerateCustomPackage(customTopic.trim());
    setShowCustomInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  چک‌لیست روابط عمومی دیجیتال
                </span>
                <span className="text-xs text-slate-400">بسته جامع ۲۷ خروجی رسانه‌ای</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-100 mt-0.5 line-clamp-1">
                {contentPackage?.mainTitle || 'بسته هوشمند تولید محتوای ۲۷گانه'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">موضوع دلخواه</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Custom Input drawer if toggled */}
        {showCustomInput && (
          <form onSubmit={handleGenerate} className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="موضوع، خبر یا اطلاعیه مورد نظر برای تولید بسته ۲۷گانه (مثال: افتتاح انبار نفت جدید، اصلاح کارمزد جایگاه‌داران...)"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={isGenerating || !customTopic.trim()}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 disabled:opacity-50 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>تولید هوشمند با AI</span>
            </button>
          </form>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-slate-800 bg-slate-950/50 px-4 flex space-x-2 space-x-reverse overflow-x-auto scrollbar-none py-1.5 text-xs">
          <button
            onClick={() => setActiveTab('strategy')}
            className={`px-3 py-1.5 font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'strategy' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>۱. تحلیل راهبردی و اوزان (اقلام ۱ تا ۱۲)</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`px-3 py-1.5 font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'social' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>۲. شبکه‌های اجتماعی (اقلام ۱۷ تا ۲۰)</span>
          </button>

          <button
            onClick={() => setActiveTab('seo_portal')}
            className={`px-3 py-1.5 font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'seo_portal' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>۳. وبسایت و سئو (اقلام ۱۳ تا ۱۶)</span>
          </button>

          <button
            onClick={() => setActiveTab('multimedia')}
            className={`px-3 py-1.5 font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'multimedia' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>۴. سناریوی چندرسانه‌ای (اقلام ۲۱ تا ۲۳)</span>
          </button>

          <button
            onClick={() => setActiveTab('tags_sources')}
            className={`px-3 py-1.5 font-bold rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tags_sources' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>۵. هشتگ‌ها و منابع (اقلام ۲۴ تا ۲۷)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {contentPackage ? (
            <>
              {/* TAB 1: STRATEGY & SCORES */}
              {activeTab === 'strategy' && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Scores */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">۸. امتیاز اهمیت:</span>
                      <span className="text-lg font-black text-rose-400 font-mono">{contentPackage.importanceScore}/۱۰</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">۹. امتیاز جذابیت:</span>
                      <span className="text-lg font-black text-amber-400 font-mono">{contentPackage.mediaAppealScore}/۱۰</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">۱۰. احتمال وایرال:</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">{contentPackage.viralProbability}٪</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">۱۲. زمان انتشار:</span>
                      <span className="text-xs font-bold text-slate-200">{contentPackage.bestPublishTime}</span>
                    </div>
                  </div>

                  {/* Titles */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-400">۱. تیتر اصلی (رسمی و اداری):</span>
                        <button
                          onClick={() => handleCopy('mainTitle', contentPackage.mainTitle)}
                          className="text-amber-400 hover:text-amber-300 transition cursor-pointer"
                        >
                          {copiedKey === 'mainTitle' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-sm font-bold text-slate-100">{contentPackage.mainTitle}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-amber-400">۲. تیتر پیشنهادی جذاب (رسانه‌ای و وایرال):</span>
                        <button
                          onClick={() => handleCopy('catchyTitle', contentPackage.catchyTitle)}
                          className="text-amber-400 hover:text-amber-300 transition cursor-pointer"
                        >
                          {copiedKey === 'catchyTitle' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-sm font-bold text-amber-200">{contentPackage.catchyTitle}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-400">۳. خلاصه خبر (حداکثر ۱۵۰ کلمه):</span>
                      <button
                        onClick={() => handleCopy('summary', contentPackage.summary)}
                        className="text-amber-400 hover:text-amber-300 transition cursor-pointer"
                      >
                        {copiedKey === 'summary' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-xs">{contentPackage.summary}</p>
                  </div>

                  {/* Important Details */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-400 block mb-2">۴. جزئیات مهم و نکات کلیدی:</span>
                    <ul className="space-y-1.5">
                      {contentPackage.importantDetails.map((det, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                          <span>{det}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Strategic Impact */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="font-bold text-slate-400 block mb-1">۵. دلیل اهمیت:</span>
                      <p className="text-slate-300 leading-relaxed">{contentPackage.importanceReason}</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="font-bold text-blue-400 block mb-1">۶. اثر بر مردم:</span>
                      <p className="text-slate-300 leading-relaxed">{contentPackage.impactOnPeople}</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="font-bold text-emerald-400 block mb-1">۷. اثر بر صنعت نفت:</span>
                      <p className="text-slate-300 leading-relaxed">{contentPackage.impactOnOilIndustry}</p>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-400 block mb-1">۱۱. مخاطب هدف:</span>
                    <p className="text-slate-300">{contentPackage.targetAudience}</p>
                  </div>
                </div>
              )}

              {/* TAB 2: SOCIAL MEDIA PLATFORMS */}
              {activeTab === 'social' && (
                <div className="space-y-4 animate-in fade-in">
                  
                  {/* Telegram */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-sky-900/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                        <span className="font-bold text-sky-400">۱۷. متن کانال تلگرام (با ایموجی و قالب استاندارد):</span>
                      </div>
                      <button
                        onClick={() => handleCopy('tg', contentPackage.telegramText)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition cursor-pointer text-[11px] font-bold"
                      >
                        {copiedKey === 'tg' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>کپی تلگرام</span>
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 bg-slate-900/90 p-3 rounded-lg border border-slate-800 leading-relaxed">
                      {contentPackage.telegramText}
                    </pre>
                  </div>

                  {/* Instagram */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-pink-900/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-400"></span>
                        <span className="font-bold text-pink-400">۱۸. متن پست و کپشن اینستاگرام (با Call to Action):</span>
                      </div>
                      <button
                        onClick={() => handleCopy('insta', contentPackage.instagramText)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 transition cursor-pointer text-[11px] font-bold"
                      >
                        {copiedKey === 'insta' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>کپی اینستاگرام</span>
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 bg-slate-900/90 p-3 rounded-lg border border-slate-800 leading-relaxed">
                      {contentPackage.instagramText}
                    </pre>
                  </div>

                  {/* Twitter / X */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                        <span className="font-bold text-slate-200">۲۰. متن شبکه X / توییتر (زیر ۲۸۰ کاراکتر):</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {contentPackage.twitterText.length} کاراکتر
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy('x', contentPackage.twitterText)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer text-[11px] font-bold"
                      >
                        {copiedKey === 'x' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>کپی X</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 bg-slate-900/90 p-3 rounded-lg border border-slate-800 leading-relaxed">
                      {contentPackage.twitterText}
                    </p>
                  </div>

                  {/* LinkedIn */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-blue-900/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                        <span className="font-bold text-blue-400">۱۹. متن لینکدین (لحن تحلیلی و تخصصی انرژی):</span>
                      </div>
                      <button
                        onClick={() => handleCopy('li', contentPackage.linkedinText)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition cursor-pointer text-[11px] font-bold"
                      >
                        {copiedKey === 'li' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>کپی لینکدین</span>
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 bg-slate-900/90 p-3 rounded-lg border border-slate-800 leading-relaxed">
                      {contentPackage.linkedinText}
                    </pre>
                  </div>

                </div>
              )}

              {/* TAB 3: WEBSITE & SEO */}
              {activeTab === 'seo_portal' && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Website text */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-300">۱۶. متن کامل خبر برای پرتال رسمی وبسایت:</span>
                      <button
                        onClick={() => handleCopy('web', contentPackage.websiteFullText)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition cursor-pointer text-[11px] font-bold"
                      >
                        {copiedKey === 'web' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>کپی متن پرتال</span>
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap font-sans text-xs text-slate-200 bg-slate-900/80 p-4 rounded-lg border border-slate-800 leading-relaxed">
                      {contentPackage.websiteFullText}
                    </div>
                  </div>

                  {/* SEO Title & Meta Description */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div>
                      <span className="font-bold text-slate-400 block mb-1">۱۳. تیتر سئو (SEO Title):</span>
                      <p className="text-xs font-semibold text-emerald-400 bg-slate-900 p-2.5 rounded border border-slate-800">
                        {contentPackage.seoTitle}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-400 block mb-1">۱۴. توضیحات متا (Meta Description):</span>
                      <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800 leading-relaxed">
                        {contentPackage.metaDescription}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-400 block mb-1.5">۱۵. ۱۰ کلمه کلیدی سئو:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {contentPackage.seoKeywords.map((kw, i) => (
                          <span key={i} className="text-[11px] font-medium bg-slate-900 text-slate-300 px-2.5 py-1 rounded-md border border-slate-800">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MULTIMEDIA PROPOSALS */}
              {activeTab === 'multimedia' && (
                <div className="space-y-4 animate-in fade-in">
                  
                  {/* Hero Image */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-slate-200">۲۱. ایده و پرامپت تصویر شاخص:</span>
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
                      {contentPackage.suggestedHeroImage}
                    </p>
                  </div>

                  {/* Infographic */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-slate-200">۲۲. سناریوی طراحی اینفوگرافیک آماری:</span>
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
                      {contentPackage.suggestedInfographic}
                    </p>
                  </div>

                  {/* Short Video */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-slate-200">۲۳. سناریوی ویدیوی کوتاه (ریلز / استوری ۶۰ ثانیه‌ای):</span>
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
                      {contentPackage.suggestedShortVideo}
                    </p>
                  </div>

                </div>
              )}

              {/* TAB 5: HASHTAGS & SOURCES */}
              {activeTab === 'tags_sources' && (
                <div className="space-y-4 animate-in fade-in">
                  
                  {/* Persian Hashtags */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-300">۲۴. هشتگ‌های فارسی تخصصی:</span>
                      <button
                        onClick={() => handleCopy('fa_tags', contentPackage.persianHashtags.join(' '))}
                        className="text-amber-400 hover:text-amber-300 transition text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'fa_tags' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>کپی هشتگ‌ها</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {contentPackage.persianHashtags.map((tag, i) => (
                        <span key={i} className="text-xs text-amber-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* English Hashtags */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-300">۲۵. هشتگ‌های انگلیسی بین‌المللی:</span>
                      <button
                        onClick={() => handleCopy('en_tags', contentPackage.englishHashtags.join(' '))}
                        className="text-amber-400 hover:text-amber-300 transition text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'en_tags' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>کپی هشتگ‌ها</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 font-mono">
                      {contentPackage.englishHashtags.map((tag, i) => (
                        <span key={i} className="text-xs text-sky-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sources */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div>
                      <span className="font-bold text-slate-400 block mb-1">۲۶. پیوند منبع اصلی:</span>
                      <a 
                        href={contentPackage.primarySourceLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <span>{contentPackage.primarySourceLink}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div>
                      <span className="font-bold text-slate-400 block mb-1">۲۷. پیوند سایر منابع و مراجع مکمل:</span>
                      <ul className="space-y-1">
                        {contentPackage.otherSourcesLinks.map((link, idx) => (
                          <li key={idx}>
                            <a 
                              href={link} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs text-slate-400 hover:text-slate-200 hover:underline flex items-center gap-1"
                            >
                              <span>{link}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-3">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p>هیچ بسته محتوایی انتخاب نشده است. از منوی بالا یک موضوع وارد کنید یا روی «مشاهده بسته ۲۷گانه» هر خبر کلیک کنید.</p>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            تولیدشده توسط هوش مصنوعی و اتاق خبر روابط عمومی شرکت ملی پخش
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>

      </div>
    </div>
  );
};
