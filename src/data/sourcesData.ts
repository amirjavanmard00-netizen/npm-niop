export interface SourceEntry {
  id: string;
  name: string;
  category: 'official' | 'domestic_agency' | 'international' | 'energy_specialized';
  domain: string;
  status: 'active' | 'warning' | 'standby';
  lastPing: string;
  reliability: number; // 1-100
  topics: string[];
}

export const monitoredSourcesData: SourceEntry[] = [
  // Official
  {
    id: 'niopdc',
    name: 'شرکت ملی پخش فرآورده‌های نفتی ایران',
    category: 'official',
    domain: 'niopdc.ir',
    status: 'active',
    lastPing: 'هم‌اکنون (لحظه‌ای)',
    reliability: 100,
    topics: ['اطلاعیه‌های رسمی', 'مناطق ۳۷گانه', 'سامانه هوشمند سوخت', 'بنزین سوپر', 'LPG']
  },
  {
    id: 'shana',
    name: 'شبکه اطلاع‌رسانی نفت و انرژی (شانا)',
    category: 'official',
    domain: 'shana.ir',
    status: 'active',
    lastPing: '۵ دقیقه پیش',
    reliability: 99,
    topics: ['سیاست‌های کلان نفت', 'مصاحبه وزیر', 'صادرات و تراز انرژی', 'پالایش و پخش']
  },
  {
    id: 'mop',
    name: 'پایگاه رسمی وزارت نفت',
    category: 'official',
    domain: 'mop.ir',
    status: 'active',
    lastPing: '۸ دقیقه پیش',
    reliability: 99,
    topics: ['ابلاغیه‌های وزراتی', 'بودجه انرژی', 'توسعه زنجیره ارزش']
  },
  {
    id: 'niordc',
    name: 'شرکت ملی پالایش و پخش فرآورده‌های نفتی',
    category: 'official',
    domain: 'niordc.ir',
    status: 'active',
    lastPing: '۱۲ دقیقه پیش',
    reliability: 98,
    topics: ['پالایشگاه‌ها', 'خطوط لوله و مخابرات نفت', 'کیفیت فرآورده']
  },
  {
    id: 'dolat',
    name: 'پایگاه اطلاع‌رسانی دولت (پاد)',
    category: 'official',
    domain: 'dolat.ir',
    status: 'active',
    lastPing: '۱۵ دقیقه پیش',
    reliability: 98,
    topics: ['مصوبات هیئت دولت', 'نرخ‌گذاری فرآورده‌ها', 'تصمیمات ستاد تنظیم بازار']
  },
  {
    id: 'anti_smuggling_hq',
    name: 'ستاد مرکزی مبارزه با قاچاق کالا و ارز',
    category: 'official',
    domain: 'epe.ir',
    status: 'active',
    lastPing: '۲۰ دقیقه پیش',
    reliability: 95,
    topics: ['قاچاق فرآورده‌های نفتی', 'طرح باک پر', 'انسداد مرزها']
  },
  // Domestic Agencies
  {
    id: 'irna',
    name: 'خبرگزاری جمهوری اسلامی (ایرنا)',
    category: 'domestic_agency',
    domain: 'irna.ir',
    status: 'active',
    lastPing: '۳ دقیقه پیش',
    reliability: 94,
    topics: ['اخبار سراسری انرژی', 'گزارش‌های استانی', 'پوشش تصمیمات دولت']
  },
  {
    id: 'isna',
    name: 'خبرگزاری دانشجویان ایران (ایسنا)',
    category: 'domestic_agency',
    domain: 'isna.ir',
    status: 'active',
    lastPing: '۶ دقیقه پیش',
    reliability: 93,
    topics: ['تحلیل ناترازی بنزین', 'مصاحبه کارشناسان انرژی', 'وضعیت جایگاه‌ها']
  },
  {
    id: 'tasnim',
    name: 'خبرگزاری تسنیم',
    category: 'domestic_agency',
    domain: 'tasnimnews.com',
    status: 'active',
    lastPing: '۲ دقیقه پیش',
    reliability: 93,
    topics: ['گزارش‌های میدانی قاچاق سوخت', 'پرونده‌های سوخت زمستانه', 'سامانه کارت سوخت']
  },
  {
    id: 'fars',
    name: 'خبرگزاری فارس',
    category: 'domestic_agency',
    domain: 'farsnews.ir',
    status: 'active',
    lastPing: '۴ دقیقه پیش',
    reliability: 92,
    topics: ['پایش قیمت‌های فوب', 'مجلس و کمیسیون انرژی', 'مردم و سهمیه']
  },
  {
    id: 'mehr',
    name: 'خبرگزاری مهر',
    category: 'domestic_agency',
    domain: 'mehrnews.com',
    status: 'active',
    lastPing: '۷ دقیقه پیش',
    reliability: 92,
    topics: ['اقتصاد انرژی', 'صنایع گاز مایع', 'آلودگی هوا و بنزین']
  },
  {
    id: 'donya_eqtesad',
    name: 'روزنامه و پایگاه دنیای اقتصاد',
    category: 'energy_specialized',
    domain: 'donya-e-eqtesad.com',
    status: 'active',
    lastPing: '۱۱ دقیقه پیش',
    reliability: 95,
    topics: ['اقتصاد سیاسی بنزین', 'تورم انرژی', 'بازار ارز و واردات بنزین سوپر']
  },
  {
    id: 'naftonline',
    name: 'نفت آنلاین (پایگاه تخصصی نفت و گاز)',
    category: 'energy_specialized',
    domain: 'naftonline.ir',
    status: 'active',
    lastPing: '۹ دقیقه پیش',
    reliability: 94,
    topics: ['اخبار پرسنلی و استخدامی نفت', 'مناطق عملیاتی', 'اخبار پالایشگاه‌ها']
  },
  // International Sources
  {
    id: 'reuters_energy',
    name: 'رویترز انرژی (Reuters Energy)',
    category: 'international',
    domain: 'reuters.com/business/energy',
    status: 'active',
    lastPing: '۱۴ دقیقه پیش',
    reliability: 95,
    topics: ['OPEC+ quotas', 'Middle East fuel trade', 'Global crude benchmarks']
  },
  {
    id: 'bloomberg_energy',
    name: 'بلومبرگ انرژی (Bloomberg Energy)',
    category: 'international',
    domain: 'bloomberg.com/energy',
    status: 'active',
    lastPing: '۱۶ دقیقه پیش',
    reliability: 96,
    topics: ['Fuel tanker flows', 'Refinery margins', 'Sanctions monitoring']
  },
  {
    id: 'sp_platts',
    name: 'اس‌اندپی گلوبال پلتس (S&P Global Platts)',
    category: 'international',
    domain: 'spglobal.com/commodityinsights',
    status: 'active',
    lastPing: '۱۸ دقیقه پیش',
    reliability: 97,
    topics: ['FOB Persian Gulf gasoline quotes', 'Bunkering rates', 'LPG spot prices']
  },
  {
    id: 'argus_media',
    name: 'آرگوس مدیا (Argus Media)',
    category: 'international',
    domain: 'argusmedia.com',
    status: 'active',
    lastPing: '۲۲ دقیقه پیش',
    reliability: 96,
    topics: ['Oil products freight rates', 'Naphtha and middle distillates index']
  },
  {
    id: 'oilprice',
    name: 'اویل پرایس (OilPrice.com)',
    category: 'international',
    domain: 'oilprice.com',
    status: 'active',
    lastPing: '۲۵ دقیقه پیش',
    reliability: 91,
    topics: ['Geopolitics of oil', 'Refining bottlenecks', 'Demand forecasting']
  }
];
