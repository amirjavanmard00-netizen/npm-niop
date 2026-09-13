import React, { useState } from 'react';
import { NewsItem, RegionNews, OfficialAlert } from '../types';
import { 
  Download, 
  Copy, 
  Check, 
  Printer, 
  X, 
  FileText,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  top10News: NewsItem[];
  regions: RegionNews[];
  alerts: OfficialAlert[];
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  top10News,
  regions,
  alerts
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const todayShamsi = new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'full'
  }).format(new Date());

  const generateFullTextReport = () => {
    return `بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
جمهوری اسلامی ایران
وزارت نفت - شرکت ملی پالایش و پخش فرآورده‌های نفتی ایران
شرکت ملی پخش فرآورده‌های نفتی ایران
روابط عمومی و امور بین‌الملل - اتاق خبر هوشمند (AI Newsroom)

=======================================================
بولتن روزانه پایش رسانه، تحلیل راهبردی و مانیتورینگ مناطق ۳۷گانه
تاریخ انتشار: ${todayShamsi}
کد سند: NIOPDC-MONITORING-${new Date().toISOString().slice(0, 10)}
طبقه‌بندی: سازمانی - ویژه مدیران ارشد و روابط عمومی
=======================================================

۱. خلاصه وضعیت راهبردی و آماری ۲۴ ساعت گذشته:
- پوشش کامل ۱۰۰ درصدی مناطق ۳۷گانه عملیاتی کشور
- پایش روزانه بیش از ۲۶۰ میلیون لیتر توزیع انواع سوخت مایع
- پایداری کامل مجاری عرضه سوخت و جایگاه‌های CNG در شرایط ناترازی گاز
- اجرای دقیق سازوکار ورود و توزیع تجاری بنزین سوپر وارداتی بدون تغییر در سهمیه‌های یارانه‌ای

-------------------------------------------------------
۲. ۱۰ خبر مهم و اولویت‌دار روز:
${top10News.map((n, i) => `${i + 1}. ${n.title}
   - منبع: ${n.source} | ضریب اهمیت: ${n.importanceScore}/۱۰ | جذابیت: ${n.appealScore}/۱۰ | احتمال وایرال: ${n.viralProbability}٪
   - اثر بر مردم: ${n.impactOnPeople}
   - خلاصه رویداد: ${n.summary}
`).join('\n')}

-------------------------------------------------------
۳. خلاصه پایش عملکرد رسانه‌ای مناطق ۳۷گانه:
- مناطق با بالاترین کنش رسانه‌ای در ۲۴ ساعت: تهران (۱۴ خبر)، هرمزگان (۱۱ خبر)، خراسان رضوی (۱۰ خبر)، زاهدان (۹ خبر)
- مناطق با اولویت نظارتی و مقابله با قاچاق سوخت: هرمزگان، زاهدان، کرمان، کردستان، ایلام
- مناطق نیازمند ارتقای خروجی پورتال خبری: کهگیلویه و بویراحمد، چهارمحال و بختیاری، میاندوآب، شاهرود

-------------------------------------------------------
۴. هشدارها و بحران‌های احتمالی در دست رصد:
${alerts.map((a, i) => `${i + 1}. [${a.level.toUpperCase()}] ${a.title}
   - شرح: ${a.description}
   - دستور اقدام روابط عمومی: ${a.actionRequired}
`).join('\n')}

=======================================================
سامانه هوشمند مانیتورینگ رسانه شرکت ملی پخش فرآورده‌های نفتی ایران`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateFullTextReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const text = generateFullTextReport();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NIOPDC-Daily-Bulletin-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">
                خروجی رسمی بولتن مانیتورینگ روزانه شرکت ملی پخش
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{todayShamsi}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950">
          <pre className="whitespace-pre-wrap font-sans bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            {generateFullTextReport()}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500">
            فرمت‌شده جهت اتوماسیون اداری و انتشار در بولتن محرمانه ستاد
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'کپی شد' : 'کپی کل متن'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>دانلود فایل متنی (.txt)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
