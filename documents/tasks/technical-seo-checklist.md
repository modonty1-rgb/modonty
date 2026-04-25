# Technical SEO — Work Plan
**آخر تحديث:** 2026-04-25
**الهدف:** Technical SEO = 100% لـ modonty.com
**المرجع التفصيلي:** `Claude-cowroker/technical-seo-checklist.md`

---

## 🔴 Priority 1 — Critical (يؤثر على الـ ranking الآن)

- [ ] **SEO-T01** — تسجيل `sitemap.xml` في GSC — **فاضي الآن، يؤثر على كل الفهرسة**
- [ ] **SEO-T02** — التحقق من `hreflang` (ar-SA / ar-EG / x-default) يظهر فعلاً في HTML source (OBS-031)
- [ ] **SEO-T03** — إضافة `BreadcrumbList` JSON-LD schema على كل صفحة داخلية (مقالات + فئات + عملاء)
- [ ] **SEO-T04** — GSC Dashboard `/seo` في الأدمن — Performance + Queries + Pages + Sitemaps tabs

---

## 🟠 Priority 2 — Important (هذا الشهر)

### Schema Markup
- [ ] **SEO-T05** — `Organization` schema في الـ homepage (name, logo, url, sameAs)
- [ ] **SEO-T06** — `WebSite` schema مع `SearchAction` (sitelinks search box في Google)
- [ ] **SEO-T07** — `ImageObject` schema على صور المقالات (Google Image Search)

### Sitemaps & Indexing
- [ ] **SEO-T08** — Image Sitemap: إضافة صور المقالات لـ `app/sitemap.ts` + تسجيلها في GSC
- [ ] **SEO-T09** — Indexing API v3: `lib/gsc/indexing.ts` — auto-request عند نشر مقال (no OAuth)
- [ ] **SEO-T10** — زر "Request Indexing" يدوي على كل مقال في الأدمن

### URL Inspection في الأدمن
- [ ] **SEO-T11** — زر "Inspect" على كل مقال: مفهرس / غير مفهرس / السبب / آخر crawl
- [ ] **SEO-T12** — Cache نتيجة الـ inspection في DB (حد 2,000/يوم)

### PageSpeed + CWV
- [ ] **SEO-T13** — `lib/gsc/pagespeed.ts`: Performance score + CWV على كل مقال في الأدمن
- [ ] **SEO-T14** — CrUX data للموقع كله (real users LCP/CLS/INP)

---

## 🟡 Priority 3 — Improvement (تحسين مستمر)

- [ ] **SEO-T15** — Alt text audit على المقالات الموجودة (كل مقال عنده alt على الصورة الرئيسية)
- [ ] **SEO-T16** — `hreflang="x-default"` يُضاف إلى كل صفحة
- [ ] **SEO-T17** — `Person` schema للكتّاب (إذا وُجدت صفحة author)
- [ ] **SEO-T18** — `preconnect` لـ fonts و external APIs في root layout
- [ ] **SEO-T19** — Geo-targeting: ضبط Saudi Arabia في GSC International Targeting
- [ ] **SEO-T20** — LCP fix: إضافة `priority` على أول 2-3 صور في feed الرئيسية (OBS-029)

---

## 🟠 Priority 2 — Automation & Alerts

- [ ] **SEO-T21** — Auto-submit sitemap عند كل Vercel deploy (webhook)
- [ ] **SEO-T22** — تنبيه Telegram لو الـ clicks انخفضت > 20% (cron يومي)
- [ ] **SEO-T23** — تقرير أسبوعي تلقائي (clicks / impressions / top query → Telegram)

---

## 🔵 Monitoring — دورياً (أسبوعياً)

- [ ] **MON-01** — Index Coverage في GSC: كم مفهرس / كم لا + السبب
- [ ] **MON-02** — Mobile Usability errors في GSC: صفر errors
- [ ] **MON-03** — Core Web Vitals report في GSC: كل المقاييس خضراء
- [ ] **MON-04** — Schema errors في GSC: صفر errors
- [ ] **MON-05** — Security Issues + Manual Actions في GSC: صفر
- [ ] **MON-06** — Screaming Frog audit: broken links + redirect chains (شهرياً)

---

## OAuth — لاحقاً (للـ Removals فقط)

- [ ] **OAUTH-01** — إنشاء OAuth2 Client ID في Google Cloud Console
- [ ] **OAUTH-02** — تشغيل setup script للحصول على refresh token
- [ ] **OAUTH-03** — حفظ credentials في Vercel env vars
- [ ] **OAUTH-04** — URL Removals: طلب حذف URL من نتائج Google مؤقتاً (6 أشهر)

---

## ✅ Technical SEO = 100% متى؟

| المقياس | الهدف |
|---------|-------|
| Index Coverage | كل الصفحات مفهرسة — صفر "Not indexed" غير مبرر |
| Core Web Vitals | LCP < 2.5s / INP < 200ms / CLS < 0.1 |
| Mobile Usability | صفر errors في GSC |
| Schema | صفر errors في GSC |
| Security | صفر issues في GSC |
| PageSpeed | > 90 موبايل + ديسك توب |
| Sitemap | محدَّث + مسجَّل + مفهرس |
| Indexing | كل مقال جديد يُفهرَس تلقائياً خلال دقائق |
