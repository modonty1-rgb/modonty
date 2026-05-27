# Mariam Audit — Open Items (Backlog)

> **آخر تحديث:** 2026-05-27
> **المصدر:** تقارير Mariam (audits #2 + #3 + PSI verification 19:48)
> **الحالة:** ما تمّ في هذا الـ push = CLS + LCP فقط. الباقي مجدول هنا.

---

## 🔴 Critical (مفِكس في هذا الـ push) ✅

- [x] **CLS regression 0.242 → fix** — AnnouncementBar logic معكوس (`modonty/components/navigatore/AnnouncementBar.tsx`)
- [x] **LCP regression 3.3s → fix** — Suspense skeleton fallback في FeedContainer (`modonty/components/feed/FeedContainer.tsx`)

---

## 🟡 Important (مؤجّل لـ next sprint)

- [ ] **hreflang ar-SA + ar-EG على صفحات المقالات** (Issue #4 من audit #3)
  - **الموقع:** [modonty/app/articles/[slug]/page.tsx](modonty/app/articles/[slug]/page.tsx) — `generateMetadata`
  - **الحالي:** يعرض فقط `hreflang=ar` + `hreflang=x-default`
  - **المطلوب:** يشمل `ar-SA`، `ar-EG`، `ar`، `x-default` (مثل الـ homepage)
  - **التأثير:** Google AI + Bing تستخدم hreflang للـ geo-targeting

- [ ] **og:url trailing slash على الرئيسية** (Issue #5)
  - **الموقع:** [modonty/app/page.tsx](modonty/app/page.tsx) — `generateMetadata.openGraph.url`
  - **الحالي:** `og:url = https://www.modonty.com` (بدون شرطة)
  - **المطلوب:** `og:url = https://www.modonty.com/` (متطابق مع الـ canonical)
  - **التأثير:** OG scrapers (Facebook, LinkedIn, Twitter) قد تربك

- [ ] **التحقّق من sitemap count: 134 → 102 URLs** (Issue #6)
  - **الفعل:** قارن sitemap قبل/بعد التغيير، تأكّد ما اختفى مقال شرعي
  - **الحالي:** نُسبت لحذف test pages — يحتاج تأكيد بصري

- [ ] **TBT 490ms على صفحة المقال** (Issue #10)
  - **الموقع:** يحتاج تحليل أعمق — أي scripts تستهلك Main Thread
  - **الفعل:** تشغيل lighthouse + identify heavy scripts + lazy load أو remove

---

## 🟢 Nice-to-have (مجدول لاحقاً)

- [ ] **FAQPage schema على مقالات SEO** (Issue #8)
  - **الموقع:** `lib/seo/index.ts` — generator + `app/articles/[slug]/page.tsx` للحقن
  - **التأثير:** Google AI Overviews + voice search

- [ ] **author.name حقيقي بدل "Modonty"** (Issue #9)
  - **التأثير:** E-E-A-T signal أقوى للمحتوى YMYL
  - **الحلّ:** نظام author profiles مع credentials

---

## ⚠️ استراتيجي (طويل المدى)

- [ ] **GEO citations — modonty يُذكر في AI engines** (Issue #3)
  - **السبب الجذري:** قلّة backlinks (modonty ما يحتلّ المرتبة 3 الأولى)
  - **الحلّ المقترح:** [documents/seo/GROWTH-STRATEGY-PARTNER-BACKLINKS.md](documents/seo/GROWTH-STRATEGY-PARTNER-BACKLINKS.md)
  - **اللازم:** قرار خالد على 8 أسئلة في الـ doc

---

## 🔄 تنفيذي (جدول زمني)

- [ ] **بكرة بعد منتصف الليل UTC:** Mariam تكمل Request Indexing لـ 20 مقالة المتبقّية (Google quota يرجع)
- [x] **IndexNow curl نُفّذ:** Bing + Yandex + Brave + Seznam بلّغوا للـ20 مقالة (HTTP 200)

---

## 📝 ملاحظات

- ترتيب الأولوية بناءً على Mariam audit #3 + PSI verification (الأحدث)
- بعد كل push، Mariam تعيد فحص (trigger: "Mariam verify")
- ملف "Done" يكون في commit history — هذا ملف Open Items فقط
