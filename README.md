# سامانه جامع رصد رسانه‌ای و تحلیل هوشمند روابط عمومی
## شرکت ملی پخش فرآورده‌های نفتی ایران (NIOPDC Smart Media Monitoring System)

سامانه جامع رصد رسانه‌ای، پایش خودکار اخبار، اعتبارسنجی و کشف شایعات حوزه توزیع فرآورده‌های نفتی با اتصال به پایگاه داده رابطه‌ای (PostgreSQL / SQLite)، خزشگرهای زنده RSS/HTML و هوش مصنوعی مولد (Gemini API).

---

## 🚀 ویژگی‌های کلیدی سامانه
- **پایش پیوسته ۳۷ منطقه عملیاتی پخش**: رصد اخبار و تحولات توزیع سوخت در تمامی ۳۷ منطقه استانی و عملیاتی کشور.
- **خزش خودکار ۱۸ مرجع رسانه‌ای**: شامل پایگاه‌های رسمی وزارت نفت، خبرگزاری‌های رسمی، نشریات تخصصی انرژی و مراجع بین‌المللی.
- **تفکیک کامل فرانت‌اند و بک‌اند**: کلیه خزش‌ها و ارتباطات وب در بک‌گراند سرور با Node.js انجام شده و مرورگر کاربر هیچ‌گونه Fetch مستقیمی به سایت‌های خبری ندارد.
- **زمان‌بند خودکار مستقل (Background Scheduler)**: پایش و استخراج اطلاعات هر ۱۰ دقیقه یک‌بار در سطح سیستم‌عامل اجرا شده و با بسته شدن مرورگر کاربران متوقف نمی‌شود.
- **تحلیل هوشمند چندلایه‌ای با هوش مصنوعی**: تحلیل احساسات، ارزیابی ارزش رسانه‌ای، محاسبه ریسک بحران، خوشه‌بندی رویدادها و تولید بسته بازنویسی خبر بر اساس متد هرم وارونه.
- **کشف و راستی‌آزمایی شایعات**: واحد هوشمند سنجش صحت اخبار و صدور تکذیبیه یا توضیحات رسمی.
- **پشتیبانی کامل از PostgreSQL و SQLite**: با خواندن `DATABASE_URL` از فایل `.env`.
- **آماده استقرار با Docker و Nginx**: به همراه Dockerfile چندمرحله‌ای، Docker Compose و کانفیگ Nginx.

---

## 📋 دستورات استاندارد نصب و اجرای پروداکشن

برای اجرای مستقیم سامانه در محیط عملیاتی، سه دستور اصلی به ترتیب زیر اجرا می‌شوند:

```bash
# ۱. نصب کلیه وابستگی‌های سیستمی و کتابخانه‌ها
npm install

# ۲. ساخت نسخه عملیاتی (کامپایل Vite، تولید کلاینت Prisma و باندل سرور Node.js)
npm run build

# ۳. اجرای وب‌سرور عملیاتی Express در محیط Production
npm run start
```

---

## 🛠️ راهنمای سریع نصب روی سرور لینوکس (Ubuntu Linux VPS)

### گام اول: نصب پیش‌نیازها
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential nginx postgresql postgresql-contrib
```

### گام دوم: نصب Node.js نسخه ۲۲
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

### گام سوم: تنظیم پایگاه داده PostgreSQL
```bash
sudo -u postgres psql -c "CREATE DATABASE niopdc_media;"
sudo -u postgres psql -c "CREATE USER niopdc_user WITH ENCRYPTED PASSWORD 'MyStrongPassword2026!';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE niopdc_media TO niopdc_user;"
```

### گام چهارم: انتقال کدها و تنظیم فایل محیطی
```bash
cd /var/www/niopdc-media
cp .env.example .env
nano .env
```
در فایل `.env`:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://niopdc_user:MyStrongPassword2026!@localhost:5432/niopdc_media?schema=public"
GEMINI_API_KEY="کلید_هوش_مصنوعی_جمینای"
NEWS_POLL_INTERVAL_MINUTES=10
CORS_ORIGIN="*"
```

### گام پنجم: بیلد و آماده‌سازی پایگاه داده
```bash
npm install
npx prisma db push --schema=prisma/schema.postgresql.prisma
npm run db:seed
npm run build
```

### گام ششم: اجرای دائمی در پس‌زمینه سرور با PM2
```bash
sudo npm install -g pm2
pm2 start dist/server.cjs --name "niopdc-media"
pm2 save
pm2 startup
```

### گام هفتم: بررسی وضعیت سلامت (Health Check)
```bash
curl -s http://localhost:3000/api/health
```

---

## 🐳 استقرار با داکر (Docker & Docker Compose)

اگر مایل به استفاده از داکر هستید:
```bash
cp .env.example .env
docker compose up -d --build
docker compose exec app npx prisma db push
docker compose exec app npm run db:seed
```

---

## 🌐 مسیرهای اصلی API

| متد | آدرس | توضیحات |
| :--- | :--- | :--- |
| `GET` | `/api/health` | بررسی سلامت سرور، ارتباط دیتابیس و وضعیت زمان‌بند |
| `GET` | `/api/stats` | آمارهای کلی، تراز احساسات و شمارش اخبار |
| `GET` | `/api/articles` | جستجو و دریافت اخبار خزش‌شده با فیلتر منطقه و منبع |
| `GET` | `/api/sources` | دریافت وضعیت و سلامت ۱۸ منبع خبری به همراه زمان پاسخ |
| `POST`| `/api/sources/:id/sync` | خزش فوری و دریافت اخبار جدید یک منبع خاص |
| `POST`| `/api/collector/sync` | اجرای دستی فرآیند خزش برای کلیه منابع فعال |
| `GET` | `/api/regions` | وضعیت آماری و لیست ۳۷ منطقه عملیاتی پخش |
| `POST`| `/api/ai/rewrite` | بازنویسی هوشمند خبر بر اساس مدل هرم وارونه |
| `POST`| `/api/ai/generate-package` | تولید بسته کامل رسانه‌ای (تیتر، لید، شبکه‌های اجتماعی) |

---

## 📖 مستندات جامع استقرار
برای مشاهده جزئیات فنی، امن‌سازی فایروال UFW، پیکربندی SSL و سیستم پشتیبان‌گیری، لطفاً فایل [DEPLOYMENT.md](./DEPLOYMENT.md) را مطالعه فرمایید.
