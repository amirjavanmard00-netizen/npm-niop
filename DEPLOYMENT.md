# راهنمای جامع استقرار سامانه مانیتورینگ رسانه روی لینوکس اوبونتو (DEPLOYMENT GUIDE)

این راهنما مراحل دقیق، گام‌به‌گام و استاندارد استقرار سامانه جامع رصد رسانه‌ای و تحلیل هوشمند روابط عمومی شرکت ملی پخش فرآورده‌های نفتی ایران را روی سرور مجازی (Linux Ubuntu 22.04 / 24.04 LTS) تشریح می‌کند.

---

## فهرست مطالب
1. [پیش‌نیازهای سرور (Hardware & OS)](#۱-پیش‌نیازهای-سرور)
2. [روش اول: استقرار با Docker و Docker Compose (پیشنهاد رسمی)](#روش-اول-استقرار-با-docker-و-docker-compose)
3. [روش دوم: استقرار مستقیم روی اوبونتو (Native Setup)](#روش-دوم-استقرار-مستقیم-روی-اوبونتو-native-setup)
   - [گام ۱: نصب پیش‌نیازها و Node.js 22](#گام-۱-نصب-پیش‌نیازها-و-nodejs-22)
   - [گام ۲: نصب و پیکربندی پایگاه داده PostgreSQL](#گام-۲-نصب-و-پیکربندی-پایگاه-داده-postgresql)
   - [گام ۳: انتقال پروژه و تنظیم متغیرهای محیطی](#گام-۳-انتقال-پروژه-و-تنظیم-متغیرهای-محیطی)
   - [گام ۴: نصب وابستگی‌ها، مایگریشن و بیلد](#گام-۴-نصب-وابستگی‌ها-مایگریشن-و-بیلد)
   - [گام ۵: اجرای همیشگی با PM2 یا Systemd](#گام-۵-اجرای-همیشگی-با-pm2-یا-systemd)
   - [گام ۶: پیکربندی وب‌سرور معکوس Nginx](#گام-۶-پیکربندی-وب‌سرور-معکوس-nginx)
   - [گام ۷: فعال‌سازی گواهی امنیتی SSL با Let's Encrypt](#گام-۷-فعال‌سازی-گواهی-امنیتی-ssl)
4. [راستی‌آزمایی و بررسی سلامت سرویس (Health Check)](#۴-راستی‌آزمایی-و-بررسی-سلامت-سرویس)
5. [پایش پایگاه داده، زمان‌بند خودکار و پشتیبان‌گیری](#۵-پایش-زمان‌بند-خودکار-و-پشتیبان‌گیری)

---

## ۱. پیش‌نیازهای سرور

| مؤلفه | حداقل سیستم | مشخصات پیشنهادی عملیاتی |
| :--- | :--- | :--- |
| **سیستم‌عامل** | Ubuntu 22.04 LTS / 24.04 LTS | Ubuntu 24.04 LTS x64 |
| **پردازنده (CPU)** | ۲ هسته | ۴ هسته |
| **حافظه رم (RAM)** | ۲ گیگابایت | ۴ تا ۸ گیگابایت |
| **دیسک (SSD/NVMe)** | ۲۰ گیگابایت | ۵۰ گیگابایت |
| **دسترسی شبکه** | دسترسی به اینترنت جهت خزش RSS و API | اینترنت پایدار با IP ثابت |

---

## روش اول: استقرار با Docker و Docker Compose

این روش سریع‌ترین و تمیزترین حالت استقرار است؛ زیرا تمام سرویس‌ها (PostgreSQL، Express API، Background Scheduler و Nginx) در محیط ایزوله اجرا می‌شوند.

### ۱. نصب Docker و Docker Compose روی اوبونتو
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git

# نصب خودکار داکر رسمی
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# اعطای دسترسی به کاربر جاری
sudo usermod -aG docker $USER
newgrp docker
```

### ۲. کلون یا کپی سورس کد
```bash
mkdir -p /var/www/niopdc-media
cd /var/www/niopdc-media
# انتقال کدهای پروژه به این دایرکتوری
```

### ۳. ایجاد فایل `.env` بر اساس نمونه
```bash
cp .env.example .env
nano .env
```
مقادیر `POSTGRES_PASSWORD`، `GEMINI_API_KEY` و `CORS_ORIGIN` را متناسب با دامنه خود تنظیم نمایید.

### ۴. راه‌اندازی با یک دستور
```bash
docker compose up -d --build
```

### ۵. اعمال جدول‌ها و مقداردهی اولیه داده‌ها (Seed)
```bash
docker compose exec app npx prisma db push
docker compose exec app npm run db:seed
```

### ۶. بررسی وضعیت کانتینرها
```bash
docker compose ps
docker compose logs -f app
```

---

## روش دوم: استقرار مستقیم روی اوبونتو (Native Setup)

### گام ۱: نصب پیش‌نیازها و Node.js 22

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential nginx

# نصب Node.js 22 LTS از مخزن NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# بررسی نسخه
node -v   # خروجی باید v22.x باشد
npm -v    # خروجی باید 10.x یا بالاتر باشد
```

---

### گام ۲: نصب و پیکربندی پایگاه داده PostgreSQL

```bash
# نصب PostgreSQL و ابزارهای مرتبط
sudo apt install -y postgresql postgresql-contrib

# راه‌اندازی و فعال‌سازی سرویس در بوت
sudo systemctl enable postgresql
sudo systemctl start postgresql

# ایجاد کاربر و پایگاه داده
sudo -u postgres psql <<EOF
CREATE DATABASE niopdc_media;
CREATE USER niopdc_user WITH ENCRYPTED PASSWORD 'StrongNiopdcPassword2026!';
GRANT ALL PRIVILEGES ON DATABASE niopdc_media TO niopdc_user;
ALTER DATABASE niopdc_media OWNER TO niopdc_user;
\q
EOF
```

---

### گام ۳: انتقال پروژه و تنظیم متغیرهای محیطی

```bash
sudo mkdir -p /var/www/niopdc-media
sudo chown -R $USER:$USER /var/www/niopdc-media
cd /var/www/niopdc-media

# (فایل‌های پروژه را در این پوشه قرار دهید)

# کپی فایل محیطی
cp .env.example .env
nano .env
```

مقادیر زیر را در فایل `.env` وارد کنید:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://niopdc_user:StrongNiopdcPassword2026!@localhost:5432/niopdc_media?schema=public"
GEMINI_API_KEY="AIzaSy..."
AI_ANALYSIS_ENABLED=true
NEWS_POLL_INTERVAL_MINUTES=10
CORS_ORIGIN="*"
```

---

### گام ۴: نصب وابستگی‌ها، مایگریشن و بیلد

سه دستور اصلی اجرایی:

```bash
# ۱. نصب کلیه پکیج‌ها
npm install

# ۲. ایجاد جداول در پایگاه داده PostgreSQL
npx prisma db push --schema=prisma/schema.postgresql.prisma

# ۳. وارد کردن اطلاعات ۳۷ منطقه و ۱۸ منبع خبری اولیه (Seed)
npm run db:seed

# ۴. کامپایل رابط کاربری و سرور برای حالت پروداکشن
npm run build
```

---

### گام ۵: اجرای همیشگی با PM2 یا Systemd

#### گزینه الف: استفاده از PM2 (ساده و پرکاربرد)
```bash
sudo npm install -g pm2

# شروع سرویس در بک‌گراند
pm2 start dist/server.cjs --name "niopdc-media"

# ذخیره و فعال‌سازی استارت‌آپ بعد از ریبوت سرور
pm2 save
pm2 startup
```

#### گزینه ب: استفاده از سرویس سیستمی Systemd
فایل سرویس از قبل در `deployment/niopdc-media.service` آماده شده است:
```bash
sudo cp deployment/niopdc-media.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable niopdc-media
sudo systemctl start niopdc-media
sudo systemctl status niopdc-media
```

> **توجه حیاتی:** زمان‌بند پس‌زمینه (Background Scheduler) مستقیماً روی فرایند Node.js اجرا می‌شود و با بسته شدن مرورگر کاربران، هر ۱۰ دقیقه یک‌بار به خزش خودکار منابع، تحلیل هوش مصنوعی و به‌روزرسانی بانک اطلاعاتی ادامه می‌دهد.

---

### گام ۶: پیکربندی وب‌سرور معکوس Nginx

```bash
# ویرایش تنظیمات Nginx
sudo nano /etc/nginx/sites-available/niopdc-media
```

محتوای زیر را قرار دهید (یا محتوای `nginx/nginx.conf` را کپی نمایید):
```nginx
server {
    listen 80;
    server_name your-domain.ir www.your-domain.ir;

    client_max_body_size 20M;

    # پایش سلامت
    location /api/health {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # API و سوکت‌ها
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # فرانت‌اند و فایل‌های وب
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

فعال‌سازی کانفیگ در Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/niopdc-media /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### گام ۷: فعال‌سازی گواهی امنیتی SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.ir -d www.your-domain.ir
```
پس از چند ثانیه، پروتکل امن HTTPS با تمدید خودکار ۹۰ روزه فعال خواهد شد.

---

## ۴. راستی‌آزمایی و بررسی سلامت سرویس

برای اطمینان از عملکرد صحیح سامانه و ارتباط با پایگاه داده، دستور زیر را در سرور اجرا نمایید:

```bash
curl -s http://localhost:3000/api/health
```

نمونه خروجی استاندارد:
```json
{
  "status": "ok",
  "database": "connected",
  "environment": "production",
  "uptimeSeconds": 1450,
  "stats": {
    "articleCount": 157,
    "sourceCount": 18,
    "regionCount": 37
  },
  "scheduler": {
    "isActive": true,
    "isRunning": false,
    "intervalMinutes": 10
  },
  "hasGeminiKey": true,
  "timestamp": "2026-09-13T06:20:00.000Z"
}
```

همچنین می‌توانید از مرورگر آدرس `https://your-domain.ir/api/health` را باز کنید.

---

## ۵. پایش زمان‌بند خودکار و پشتیبان‌گیری

### مشاهده لاگ‌های زنده سیستم:
```bash
# با PM2:
pm2 logs niopdc-media

# با Systemd:
sudo journalctl -u niopdc-media -f

# با Docker:
docker compose logs -f --tail=100 app
```

### پشتیبان‌گیری خودکار از پایگاه داده (Backup):
یک اسکریپت روزانه در Cron ایجاد کنید:
```bash
sudo crontab -e
```
خط زیر را اضافه نمایید تا هر شب ساعت ۳ بامداد از داده‌های رصد رسانه‌ای فایل پشتیبان تهیه شود:
```cron
0 3 * * * pg_dump -U niopdc_user -h localhost niopdc_media | gzip > /var/backups/niopdc_backup_\$(date +\%Y\%m\%d).sql.gz
```
