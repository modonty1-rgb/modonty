# Article Card UX — مهام التحسين
> آخر تحديث: 2026-04-13
> الملف: `modonty/app/` — article card components
> المرجع: مراجعة UX بتاريخ 2026-04-13 (desktop 1280px + mobile 375px)
> المصادر: Nielsen Norman Group · ALF Design Group · UX Design World · Next.js Docs (Context7)

---

## ما تقوله المصادر الرسمية (الملخص)

### Nielsen Norman Group (NNG) — أعلى مرجع في UX
- الكارد يجب أن يكون **مجموعة بصرية واضحة** (border أو shadow أو background مختلف)
- Drop shadow = مؤشر clickability — المستخدم يتوقع أن الكارد قابل للضغط
- كل الكارد يجب أن يكون clickable (Fitts' Law — target أكبر = أسهل للضغط)
- ليس مناسباً للمقارنة أو البحث — مناسب للـ feed والـ dashboard

### ALF Design Group + UX Design World
**ترتيب المسح البصري الصحيح:**
```
صورة (أكبر عنصر) → عنوان → معلومات ثانوية → CTA
```
- الصورة يجب أن تكون **أول شيء بصرياً** — تجذب العين
- Aspect ratio ثابت على كل الكاردات: **16:9 أو 4:3 أو 1:1**
- الوصف: **40-60 كلمة فقط** — لا أكثر
- Metadata (تاريخ، كاتب، فئة): أقل وزن بصري — صغيرة + لون خافت
- Touch targets: **minimum 44×44px** (Apple + Google standard)
- موبايل 320-375px: **عمود واحد فقط**

### Next.js Docs (Context7)
- `priority` prop فقط على صور الـ above-fold (LCP element)
- `loading="lazy"` للصور تحت الـ fold (default)
- `sizes` prop إلزامي: `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`
- صور WebP/AVIF — Next.js يحولها تلقائياً
- حجم الصورة: **تحت 150KB**

### WCAG Accessibility
- نسبة التباين: **4.5:1 minimum** (WCAG AA)
- Semantic HTML: `<article>` tag للكارد
- `alt` text وصفي على كل صورة
- Full keyboard navigation + logical tab order

---

## 🔴 CRITICAL

- [x] **CARD-1** — نقل الصورة للأعلى ✅ 2026-04-13
  - الصورة الآن أول عنصر في الكارد (قبل المتا والعنوان)
  - Aspect ratio: `aspect-video` (16:9) ثابت
  - `next/image` بـ `sizes` + LCP handling محافَظ عليه

- [x] **CARD-2** — الكارد كاملاً clickable ✅ 2026-04-13
  - Stretched-link: `after:absolute after:inset-0 after:content-['']` على title Link
  - `<article>` يحتوي `relative group overflow-hidden`
  - عناصر التفاعل (share + client link + stats) كلها `relative z-10`
  - "اقرأ المزيد" visual indicator فقط (`aria-hidden`, `pointer-events-none`)

---

## 🟡 HIGH

- [x] **CARD-3** — card border/shadow ✅ (كان موجوداً، محافَظ عليه)
  - `shadow-sm` default + `hover:shadow-md` + `rounded-lg` + `border border-border`

- [ ] **CARD-4** — إضافة Category badge ⏳ DEFERRED
  - **السبب:** `FeedPost` لا يحتوي على `categoryName/categorySlug` بعد
  - **المطلوب:** إضافة الحقلين للـ FeedPost type + DB query + mapping

- [x] **CARD-5** — "اقرأ المزيد" كـ visual CTA ✅ 2026-04-13
  - `aria-hidden + pointer-events-none` (الكارد كاملاً clickable)
  - تنسيق: `text-primary font-semibold` + chevron icon

- [x] **CARD-6** — إصلاح انكسار العنوان ✅ 2026-04-13
  - `break-words hyphens-auto line-clamp-2 min-h-[2.8rem]`

- [x] **CARD-11** — تقليص الـ excerpt ✅ 2026-04-13
  - **الإصلاح الكبير:** كان `post.content` (المقال كاملاً!) يُعرض بدون حد
  - الآن: `post.excerpt ?? post.content` + `line-clamp-2`

- [x] **CARD-12** — Semantic HTML ✅ (كان موجوداً)
  - `<article>` + `itemScope` + `itemType` + `alt` + `itemProp`

---

## 🟢 MEDIUM

- [x] **CARD-7** — Hover effect على desktop ✅ 2026-04-13
  - `hover:-translate-y-0.5 hover:shadow-md transition-all duration-200` على الكارد
  - `group-hover:scale-105 transition-transform duration-300` على الصورة

- [x] **CARD-8** — فصل الإحصائيات عن زر المشاركة ✅ 2026-04-13
  - Stats: div مستقل `relative z-10` (ليست link)
  - Share: CtaTrackedLink `relative z-10 min-h-11 min-w-11`

- [x] **CARD-9** — badge "نسخة صوتية" ✅ 2026-04-13
  - `IconVolume2` من icon registry
  - الآن على الصورة (overlay top-start) — teal `bg-teal-500/90 text-white`
  - **مشروط** `{post.hasAudio && ...}` — لا يظهر إلا للمقالات الصوتية فعلاً

- [ ] **CARD-10** — Tooltip على التاريخ النسبي
  - shadcn Tooltip يعرض التاريخ الكامل عند hover
  - `new Intl.DateTimeFormat('ar-SA', {...}).format(date)`

- [x] **CARD-13** — next/image sizes prop ✅ (كان موجوداً + محافَظ عليه)
  - LCP: `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px`
  - Default: `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`

---

## Done

> CARD-1, 2, 3, 5, 6, 7, 8, 9, 11, 12, 13 — مكتملة في 2026-04-13
> CARD-10 (tooltip) — مرجّأ
> CARD-4 (category badge) — معلّق على إضافة categoryName/Slug للـ FeedPost type + DB query

---

## المصادر
- [Nielsen Norman Group — Cards Component](https://www.nngroup.com/articles/cards-component/)
- [ALF Design Group — UI Card Best Practices 2026](https://www.alfdesigngroup.com/post/best-practices-to-design-ui-cards-for-your-website)
- [Next.js Image Component Docs](https://nextjs.org/docs/app/api-reference/components/image) — via Context7
