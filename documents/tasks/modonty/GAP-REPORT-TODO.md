# Modonty Gap Report — Verified TODO

> مصدر: documents/07-design-ui/modonty-gap-report-v2-final.md
> تم مراجعة كل نقطة مقابل الكود الفعلي — 2026-04-04

---

## نتيجة المراجعة

التقرير الأصلي فيه 20 نقطة — بعد الفحص:
- **مؤكد (يحتاج إصلاح)**: 6 نقاط
- **خطأ (الكود سليم)**: 8 نقاط
- **بيانات تجريبية (مو كود)**: 4 نقاط
- **يحتاج فحص يدوي**: 2 نقاط

---

## مهام معلقة — مؤكدة من الكود

### 🔴 حرج

- [x] **A4 — Footer `© 2025` hardcoded** — ✅ تم: `new Date().getFullYear()` بدل `const YEAR = 2025`
- [x] **A4b — Version number ظاهر** — ✅ تم: حذف رقم الإصدار، الفوتر يعرض `© 2026 مودونتي`

### 🟡 متوسط

- [x] **A5 — التواريخ تعرض "..."** — ✅ تم: SSR يعرض تاريخ مقروء (Intl.DateTimeFormat)، بعد mount يتحول لنسبي
- [ ] **B1 — الرئيسية بدون Hero Section** — مؤجل: Hero نظيف + صورة بنفس عرض الكونتينر — يُنفذ لاحقاً
- [x] **B4 — Sidebar يعرض فئات بـ 0 مقالات** — ✅ تم: filter `articleCount > 0`
- [x] **B3.4b — زر "صفحة الكاتب" يحيل لـ /about** — ✅ تم: الزر يحيل لـ `/users/${slug}`، يختفي إذا ما في slug

### 🟢 تحسينات

- [ ] **D1 — "..." بدل "…"** — يحتاج search & replace
- [ ] **D3 — "اقرأ المزيد" generic** — يحتاج تقييم UX

---

## نقاط خطأ في التقرير الأصلي — الكود سليم

| # | ادعاء التقرير | الحقيقة | الدليل |
|---|--------------|---------|--------|
| A1 | title صفحة /about = Lorem Ipsum | ❌ خطأ — الداتا في DB سليمة من الأول، التقرير كان غلط | `seoTitle` في DB = نص عربي صحيح |
| A3 | المحتوى يحمّل client-side | ❌ خطأ — Server component مع `await` | `page.tsx` = `async function` + `Promise.all()` |
| A6 | صور بدون width transform | ❌ خطأ — `optimizeCloudinaryUrl()` يضيف `w_1200` | `OptimizedImage.tsx:43-61` |
| B3.1 | Breadcrumb ناقص مستوى العميل | ❌ خطأ — العميل موجود | `articles/[slug]/page.tsx:228-233` |
| B3.2 | "عمق المحتوى: short" ظاهر | ❌ خطأ — ما موجود في الكود | Grep = 0 results |
| C1 | Avatar alt="" | ❌ خطأ — `alt={user.name}` | `UserAvatarButton.tsx:30` |
| E2 | لا dark mode / لا theme-color | ❌ خطأ — ThemeProvider + themeColor موجودين | `layout.tsx:42,68-72` |
| B3.4 | رابط الكاتب يحيل لـ /about | ❌ جزئي — الاسم صحيح `/users/`، الزر فقط `/about` | `article-author-bio.tsx:69,112` |

---

## بيانات تجريبية — مو مشكلة كود

| # | النقطة | السبب |
|---|--------|-------|
| A2 | عملاء تجريبيون ظاهرون | Seed data في DB — يتحذف يدوي من Admin |
| B2 | نظام فئات مزدوج | قرار محتوى — الفئات من الأدمن |
| D4 | وصف الشركات بقالب موحد | Seed data — العملاء الحقيقيين بيكون لهم وصف مختلف |
| D5 | تناقض لغوي (وصف كاتب إنجليزي) | محتوى DB — يتعدل من الأدمن |

---

## يحتاج فحص يدوي (مو من الكود)

- [ ] C2-C5 — Accessibility: aria-labels على أرقام التفاعل + أزرار — يحتاج فحص يدوي بـ screen reader
- [ ] C6 — Keyboard navigation + focus states + color contrast — يحتاج فحص يدوي

---

## مهام قادمة — SEO Generators

- [ ] **Tags page SEO generator** — build `buildTagsPageJsonLd` + add "tags" to LIST_PAGE_KEYS
- [ ] **Industries page SEO generator** — build `buildIndustriesPageJsonLd` + add "industries" to LIST_PAGE_KEYS
- [ ] **Articles page SEO generator** — build `buildArticlesPageJsonLd` + add "articles" to LIST_PAGE_KEYS

---

## ملخص الأولويات

| الأولوية | العدد | الوقت المقدر |
|---------|-------|-------------|
| 🔴 حرج | 2 | ساعة واحدة |
| 🟡 متوسط | 4 | يوم عمل |
| 🟢 تحسينات | 2 | ساعات |
| فحص يدوي | 2 | نص يوم |
