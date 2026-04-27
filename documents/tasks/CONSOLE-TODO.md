# CONSOLE TODO — بوابة العميل (console.modonty.com)

> **آخر تحديث:** 2026-04-27 (Session 70 — Phase 1 ✅ Copy DONE · Phase 2 ✅ Responsive overhaul DONE: header redesigned, profile 2-col, media filters wrap, top-articles chart rebuilt, dir=ltr URLs, action buttons 40px+aria-labels)
> **التطبيق:** `console/` · v0.2.0 · Next.js 16.1.6 + NextAuth v5 + Prisma 6 (MongoDB)
> **DB حالياً:** `modonty` (production — مؤقتاً حتى نهاية جلسة console، راجع `feedback_never_seed_production.md`)
> **الفهم الكامل:** Console = بوابة موافقات للعميل على ما ينتجه فريق modonty + لوحة تحليلات.
> **Severity:** 🔴 HIGH (security/data integrity) · 🟡 MEDIUM (UX, business logic) · 🟢 LOW (cosmetic) · 🔵 NICE TO HAVE

---

## 🔴 HIGH — أمان وسلامة البيانات

- [ ] **CONS-001 — لا compliance check قبل موافقة العميل على المقال**
  - **Where:** [console/app/(dashboard)/dashboard/articles/actions/article-actions.ts:8-10](console/app/(dashboard)/dashboard/articles/actions/article-actions.ts#L8)
  - **What:** Article approval action لا يتحقق من `forbiddenKeywords` و `forbiddenClaims` المحفوظة في `Client` model. TODO صريح في الكود: "Console app cannot import admin's @/lib/seo/pre-publish-audit".
  - **Why critical:** عميل في قطاع طبي/مالي قد يوافق على مقال يحوي ادعاء ممنوع → مسؤولية قانونية على modonty.
  - **Fix idea:** انقل audit logic إلى shared package أو أنشئ tRPC endpoint مشترك بين admin/console يستدعيه قبل publish.

- [ ] **CONS-002 — لا حماية على مستوى DB (no RLS / no schema-level scoping)**
  - **Where:** [console/dataLayer/prisma/schema/schema.prisma](console/dataLayer/prisma/schema/schema.prisma) — كل query
  - **What:** الحماية تعتمد كلياً على وضع `clientId` يدوياً في كل WHERE. لا middleware يفرضها، لا Prisma extension.
  - **Risk:** نسيان `clientId` في query واحد = leak بيانات عميل لعميل آخر.
  - **Fix idea:** Prisma client extension يحقن `clientId` تلقائياً، أو middleware يفحص responses قبل الإرجاع، أو على الأقل ESLint rule يلزم `clientId` في .findMany/.findFirst/.update/.delete.

- [ ] **CONS-003 — لا notification للـ admin عند موافقة العميل**
  - **Where:** كل approve actions في console (articles/faqs/comments/questions)
  - **What:** العميل يوافق → لا email/webhook/Slack للـ admin team. الـ admin يكتشف يدوياً.
  - **Business impact:** تأخير في أي خطوات تالية (نشر، إشعار العميل، metrics).
  - **Fix idea:** إضافة Resend email للـ admin + (مستقبلاً) webhook لـ Slack/GTM event.

- [ ] **CONS-004 — زر "تعبئة تجريبية (dev)" ظاهر في الإنتاج**
  - **Where:** [console/app/(dashboard)/dashboard/seo/intake](console/app/(dashboard)/dashboard/seo/intake/page.tsx) — أعلى الفورم
  - **What:** زر يعبّئ بيانات وهمية في 70 حقل. لو ضغط عليه عميل = بياناته الحقيقية تُستبدل.
  - **Fix idea:** اشرط ظهور الزر بـ `process.env.NODE_ENV === "development"`.

---

## 🟡 MEDIUM — UX وسير العمل

- [ ] **CONS-005 — Profile صفحة ضخمة (42 input) بزر حفظ واحد**
  - **Where:** [console/app/(dashboard)/dashboard/profile](console/app/(dashboard)/dashboard/profile/page.tsx)
  - **What:** خطأ في حقل واحد يضيع كل الـ form. مخالف لقاعدة الذاكرة `feedback_save_per_tab.md` (one save button per tab).
  - **Fix idea:** قسّم لتبويبات (Tabs): البيانات الأساسية / التواصل / العنوان / السجل التجاري / الأعمال / SEO — مع save لكل تبويب.

- [ ] **CONS-006 — خلط لغات في صفحة Media**
  - **Where:** [console/app/(dashboard)/dashboard/media](console/app/(dashboard)/dashboard/media/page.tsx)
  - **What:** نصوص بالإنجليزي على Console عربي 100%: `Media Gallery`, `5 files`, `All / Logos / Posts / OG Images`, `Used in 0 place(s)`.
  - **Why:** قاعدة المشروع — admin = English UI، console + modonty = Arabic UI 100%.
  - **Fix idea:** ترجم الكل لـ `lib/ar.ts`.

- [ ] **CONS-007 — لا middleware — auth check موزّع**
  - **Where:** كل page تستدعي `auth()` يدوياً + redirect
  - **What:** ممكن تنسى الفحص في صفحة جديدة فتُصبح public بالخطأ.
  - **Fix idea:** أنشئ `console/middleware.ts` يحمي `/dashboard/**` تلقائياً.

- [ ] **CONS-008 — JWTSessionError قد يعود إذا تغيّر AUTH_SECRET**
  - **Where:** [console/auth.config.ts](console/auth.config.ts), [console/lib/auth.ts](console/lib/auth.ts)
  - **What:** ظهر في بداية جلسة 2026-04-27 (OBS-118) ثم اختفى بعد إعادة تشغيل. السبب: كوكي قديم مشفّر بسر مختلف.
  - **Fix idea:** في `callbacks.jwt`، التف على decode failure وارجع null لإجبار signin جديد بدون noise في logs.

- [ ] **CONS-009 — حقل password في admin Edit Client هو `type="text"`**
  - **Where:** [admin/app/(dashboard)/clients/components/form-sections/basic-info-section.tsx:155](admin/app/(dashboard)/clients/components/form-sections/basic-info-section.tsx#L155)
  - **What:** هذا حقل يكتب فيه باسوورد العميل لـ Console. كونه plaintext = leak عبر screen-share/screenshot/recording.
  - **Note:** ليس في console مباشرة، لكن مرتبط بـ console auth flow.
  - **Fix idea:** غيّره إلى `type="password"` مع زر eye toggle.

- [ ] **CONS-010 — admin & console env mismatch silent**
  - **Where:** `admin/.env.local`, `console/.env.local`
  - **What:** كل تطبيق ممكن يشير لـ DB مختلفة بدون تحذير. اكتشفناه فقط بعد فشل login (OBS-124).
  - **Fix idea:** add startup check: log الـ DB name في سطر واضح، أو fail fast لو الـ apps تعمل ضد DBs مختلفة.

---

## 🟢 LOW — تجميل/تحسينات بسيطة

- [ ] **CONS-011 — LCP warning على لوجو صفحة الدخول**
  - **Where:** Login page — `cloudinary.com/.../final-01_fdnhom.svg`
  - **What:** الصورة LCP element بدون `priority` أو `loading="eager"`.
  - **Fix idea:** أضف `priority` على `next/image` في Login.

- [ ] **CONS-012 — Slug العربي في URL يظهر معضّداً (double-encoded) في analytics**
  - **Where:** [console/app/(dashboard)/dashboard/analytics](console/app/(dashboard)/dashboard/analytics/page.tsx) → "أهم المصادر"
  - **Sample:** `https://www.modonty.com/clients/%D9%83%D9%8A%D9%85%D8%A7-%D8%B2%D9%88%D9%86` يظهر بجانب `https://www.modonty.com/clients/kima-zone`
  - **Why:** يدل على bug في canonical generation للعملاء (موجود في تقرير Session 69 كمان).
  - **Fix idea:** unify canonical generator + decode للعرض.

---

## 🔵 NICE TO HAVE — تطوير مستقبلي

- [ ] **CONS-013 — Campaigns ما زالت Beta**
  - تتبع UTM موجود لكن بانتظار dataLayer events حقيقية.
  - **Suggestion:** ربط مع GTM events كاملة لتدفق conversion كامل.

- [ ] Push notifications على الموبايل عند PENDING items جديدة (FAQ/Article/Comment).
- [ ] Dark mode (الـ theme toggle موجود في admin، غير موجود هنا).
- [ ] Bulk actions على المقالات/التعليقات/FAQs (موافقة جماعية).
- [ ] Export Analytics → PDF/Excel.

---

## 🎨 UI/UX & RESPONSIVE — مراجعة Agent (24 ملاحظة)

### Responsive (mobile-first) — 6 بنود

- [ ] **CONS-UX-001** 🔴 — جداول التحويل/Leads/الحملات بأعمدة كثيرة بدون mobile card alternative
  - **Where:** [campaigns-table.tsx:28](console/app/(dashboard)/dashboard/campaigns/components/campaigns-table.tsx#L28), [leads-table.tsx:79](console/app/(dashboard)/dashboard/leads/components/leads-table.tsx#L79)
  - **Fix:** بدّل لـ card layout على `<md` أو sticky first column

- [ ] **CONS-UX-002** 🟡 — Profile form (42 input) شبكة عمودين بدون كسر مناسب لشاشات mobile
  - **Where:** [profile-form.tsx:358-376](console/app/(dashboard)/dashboard/profile/components/profile-form.tsx#L358)
  - **Fix:** أضف `sm:grid-cols-1 lg:grid-cols-2`

- [ ] **CONS-UX-003** 🟡 — Filter buttons في الجداول لا `flex-wrap` فتفيض أفقياً على mobile
  - **Where:** [comments-table.tsx:114-150](console/app/(dashboard)/dashboard/comments/components/comments-table.tsx#L114)

- [ ] **CONS-UX-004** 🟡 — Media gallery بدون fallback لـ <640px (iPhone SE يبدو مكدّساً)
  - **Where:** [media-gallery.tsx:72](console/app/(dashboard)/dashboard/media/components/media-gallery.tsx#L72)
  - **Fix:** `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`

- [ ] **CONS-UX-005** 🔴 — Intake form (70 سؤال) بدون chunking للموبايل + help text كبير
  - **Where:** [intake-tab.tsx](console/app/(dashboard)/dashboard/seo/components/intake-tab.tsx) + [intake-field.tsx:54-59](console/app/(dashboard)/dashboard/seo/components/intake-field.tsx#L54)
  - **Fix:** Collapsible sections مغلقة افتراضياً على mobile

- [ ] **CONS-UX-006** 🟢 — زر طي الـ sidebar مرئي حتى على mobile (يأخذ مساحة بدون وظيفة)
  - **Where:** [sidebar.tsx:72-85](console/app/(dashboard)/components/sidebar.tsx#L72)

### Touch Targets — 4 بنود

- [ ] **CONS-UX-007** 🔴 — أزرار الأيقونات (Approve/Reject/Delete) بحجم 12×12 px (دون 44×44 WCAG)
  - **Where:** [comments-table.tsx:211-233](console/app/(dashboard)/dashboard/comments/components/comments-table.tsx#L211), [faqs-table.tsx:151-173](console/app/(dashboard)/dashboard/faqs/components/faqs-table.tsx#L151)
  - **Fix:** `h-4 w-4` icons + `px-3 py-2` padding (40px height min)

- [ ] **CONS-UX-008** 🟡 — Sidebar badges بدون gap كافٍ من النص
  - **Where:** [sidebar-nav.tsx:46-61](console/app/(dashboard)/components/sidebar-nav.tsx#L46)

- [ ] **CONS-UX-009** 🟡 — Filter button gaps ضيقة (`gap-1` = 4px) → mis-tap على mobile
  - **Where:** [comments-table.tsx:200-233](console/app/(dashboard)/dashboard/comments/components/comments-table.tsx#L200)

- [ ] **CONS-UX-010** 🟡 — لا visible focus states على keyboard navigation للأزرار في الجداول

### RTL — 3 بنود

- [ ] **CONS-UX-011** 🟡 — `ChevronDown` في intake collapsible بدون `rtl:rotate-180` في الحالة الأولى
  - **Where:** [intake-field.tsx:73](console/app/(dashboard)/dashboard/seo/components/intake-field.tsx#L73)

- [ ] **CONS-UX-012** 🟢 — labels في quote blocks (FAQ/comment) ما لها `dir="auto"`
  - **Where:** [comments-table.tsx:270](console/app/(dashboard)/dashboard/comments/components/comments-table.tsx#L270), [faqs-table.tsx:133](console/app/(dashboard)/dashboard/faqs/components/faqs-table.tsx#L133)

- [ ] **CONS-UX-013** 🟡 — Breadcrumb separator `/` يظهر بترتيب خاطئ في RTL
  - **Where:** [dashboard-header.tsx:72-74](console/app/(dashboard)/components/dashboard-header.tsx#L72)

### Accessibility — 7 بنود

- [ ] **CONS-UX-014** 🔴 — أزرار الأيقونات بدون `aria-label` (screen reader ينطق "button" فقط)
  - **Where:** [comments-table.tsx:201-233](console/app/(dashboard)/dashboard/comments/components/comments-table.tsx#L201)
  - **Fix:** أضف `aria-label={c.approveComment}` لكل زر

- [ ] **CONS-UX-015** 🟡 — Native checkboxes بدون `id`/`htmlFor` binding
  - **Where:** [profile-form.tsx:381-388](console/app/(dashboard)/dashboard/profile/components/profile-form.tsx#L381), [settings-form.tsx:69-82](console/app/(dashboard)/dashboard/settings/components/settings-form.tsx#L69)

- [ ] **CONS-UX-016** 🟡 — Form labels بدون `text-xs sm:text-sm` تتقطع على mobile

- [ ] **CONS-UX-017** 🟡 — Media gallery alt text ممكن يكون فارغاً
  - **Where:** [media-gallery.tsx:80](console/app/(dashboard)/dashboard/media/components/media-gallery.tsx#L80)

- [ ] **CONS-UX-018** 🟡 — Heading hierarchy غير صحيح (`CardTitle` بدلاً من `<h2>`)
  - **Where:** [profile-form.tsx:277-391](console/app/(dashboard)/dashboard/profile/components/profile-form.tsx#L277)

- [ ] **CONS-UX-019** 🟡 — Empty states بدون `role="status" aria-live="polite"`

- [ ] **CONS-UX-020** 🟡 — Form errors بدون `aria-describedby` ربط الحقل بالخطأ

### Visual Hierarchy — 4 بنود

- [ ] **CONS-UX-021** 🟡 — Profile form بدون progress indicator على mobile (6 sections بدون عداد)

- [ ] **CONS-UX-022** 🟡 — Intake form help text لا يتطوي افتراضياً على mobile (cognitive load)

- [ ] **CONS-UX-023** 🟡 — `loading.tsx` ناقصة في profile/articles/faqs/comments
  - **Fix:** أضف skeleton loaders

- [ ] **CONS-UX-024** 🟢 — Empty states بصياغة عامة بدون next-step (مرتبطة بـ COPY-021/022 أدناه)

---

## 📝 COPY & PLAIN-LANGUAGE

> ✅ **المرحلة الأولى مكتملة (28/28 بند).** التفاصيل في قسم DONE أسفل الملف.

---

## 📱 PHASE 2 — RESPONSIVE SWEEP (mobile-first audit, 2026-04-27)

> **الفحص:** 17 صفحة عبر 3 viewports — `375px` (iPhone) · `768px` (iPad) · `1366px` (laptop). متابعة بصرية + scan آلي للـ overflow / truncation / touch targets.

### 🟢 صفحات نظيفة (لا overflow ولا truncation حرجة)
- `/dashboard` (375 + 768 + 1366) ✅
- `/dashboard/articles` ✅
- `/dashboard/content` ✅
- `/dashboard/comments` ✅
- `/dashboard/faqs` ✅
- `/dashboard/questions` ✅
- `/dashboard/leads` ✅
- `/dashboard/subscribers` ✅
- `/dashboard/campaigns` ✅ (data فارغ، يحتاج إعادة فحص عند توفر بيانات)
- `/dashboard/support` ✅
- `/dashboard/settings` ✅
- `/dashboard/seo/keywords` ✅
- `/dashboard/seo/competitors` ✅

### 🔴 HIGH — إصلاحات حرجة لـ responsive

- [x] **CONS-RESP-001 — Profile form عمود واحد حتى على Desktop (1366px)** ✅ FIXED
  - **Where:** [profile-form.tsx:358-376](console/app/(dashboard)/dashboard/profile/components/profile-form.tsx#L358) — `grid-cols-1 md:grid-cols-2` لكن لا يطبّق على الشاشات الكبيرة
  - **Problem:** 42 input تظهر في عمود واحد على Desktop = هدر 50%+ من المساحة + scroll طويل جداً
  - **Screenshot:** [d2-profile-1366.png](d2-profile-1366.png)
  - **Fix:** `grid-cols-1 sm:grid-cols-1 lg:grid-cols-2` أو `xl:grid-cols-3` للـ Desktop الكبير
  - **Confirms:** CONS-UX-002 (اللي رصدها agent)

- [x] **CONS-RESP-002 — Media filter buttons تفيض على Mobile 375** ✅ FIXED
  - **Where:** [media-gallery.tsx:33](console/app/(dashboard)/dashboard/media/components/media-gallery.tsx#L33) — `<div className="flex gap-2">`
  - **Problem:** زر "صور المشاركة" مقطوع جزئياً + الفلاتر بعرض 361px لكن الحاوية 278px = overflow
  - **Screenshot:** [m4-media-375.png](m4-media-375.png)
  - **Fix:** `flex flex-wrap gap-2` + إعادة ترتيب العنوان والفلاتر في صفّين على mobile
  - **Confirms:** CONS-UX-003

- [x] **CONS-RESP-003 — شعار "Modonty" يتقاطع مع زر القائمة على Mobile 375 (NEW)** ✅ FIXED
  - **Where:** Top header — wordmark "Modonty" + hamburger button في نفس السطر
  - **Problem:** حرف "M" مقصوص خلف زر الـ ≡ — خلل بصري واضح
  - **Screenshots:** [m1-dashboard-375.png](m1-dashboard-375.png) · [m5-profile-375.png](m5-profile-375.png) · [m3-intake-375.png](m3-intake-375.png)
  - **Fix:** زيادة gap بين الـ wordmark والـ hamburger، أو تصغير الـ wordmark على شاشات `<sm`

### 🟡 MEDIUM — تحسينات

- [x] **CONS-RESP-004 — Top Articles Y-axis labels مقطوعة لحرف واحد على كل viewports (NEW)** ✅ FIXED — استبدلتُ recharts bar chart بقائمة Arabic-friendly مع progress bars
  - **Where:** Dashboard `/dashboard` → "حسب المشاهدات" bar chart
  - **Problem:** عناوين المقالات الطويلة تظهر كـ "ل" / "ل" فقط على المحور — غير مفهومة
  - **Screenshot:** [d1-dashboard-1366.png](d1-dashboard-1366.png) (يظهر حتى على desktop)
  - **Fix:** truncate إلى 30-40 حرف بـ ellipsis بدل clip كامل، أو استخدم tooltip للنص الكامل

- [x] **CONS-RESP-005 — Article titles مقطوعة بشدة على Analytics @ 375 (10 truncated elements)** ✅ FIXED (نتيجة استبدال top-articles chart)
  - **Where:** [analytics/page.tsx](console/app/(dashboard)/dashboard/analytics/page.tsx) — top articles section
  - **Problem:** عنوان "أفضل واكس شعر للرجال..." يقطع عند 201px لكن طوله 462px (نسبة قص >50%)
  - **Fix:** زيادة `min-w` للـ container أو السماح بـ wrap على سطرين

- [x] **CONS-RESP-006 — Intake form: 70 سؤال + help text موسّع افتراضياً على mobile** ✅ verified — Collapsible component is closed by default (`data-state=closed`)
  - **Where:** [intake-field.tsx:62-80](console/app/(dashboard)/dashboard/seo/components/intake-field.tsx#L62)
  - **Problem:** Cognitive load عالي للموبايل — كل الـ help expanded
  - **Fix:** `defaultOpen={false}` على شاشات `<md`
  - **Confirms:** CONS-UX-022

### 🟢 LOW

- [x] **CONS-RESP-007 — URL bidi rendering: `/https://...` يبدأ بـ `/`** ✅ FIXED — أُضيف `dir="ltr"` لكل url/email/tel/number inputs في profile-form
  - **Where:** Profile URL input يظهر "/https://www.kimazone.net" — `/` في البداية
  - **Screenshots:** [m5-profile-375.png](m5-profile-375.png) · [d2-profile-1366.png](d2-profile-1366.png)
  - **Fix:** `dir="ltr"` على inputs تحوي روابط
  - **Confirms:** CONS-VIS-004

### 📊 ملخص Phase 2

| Viewport | الصفحات النظيفة | الصفحات بإصلاحات |
|---|---|---|
| 375px (Mobile) | 13 | 4 (Media, Profile sub-issue, Top header, Top articles chart) |
| 768px (Tablet) | 17 | — (نظيف) |
| 1366px (Desktop) | 16 | 1 (Profile single-column) |

**النتيجة:** الـ responsive جيد جداً بشكل عام (شاركس shadcn + Tailwind responsive يعملان). 7 إصلاحات spotted في Phase 2 — 3 HIGH + 3 MEDIUM + 1 LOW.

---

## 👁️ VISUAL OBSERVATIONS — لقطات حية (المتبقي)

- [ ] **CONS-VIS-003** 🟡 — **خلط أرقام** لاتينية وعربية على نفس الشاشة
  - **أمثلة:** `13`، `0.00%` (لاتيني) بجانب `٢٦ أبريل ٢٠٢٦` (عربي) في `/dashboard/faqs`
  - **Fix:** اختر نظام أرقام واحد للـ console (يفضل لاتيني للأرقام، عربي للتواريخ) + ثبّته

- [ ] **CONS-VIS-004** 🟢 — **`/https://www.kimazone.net/`** يبدأ بـ `/` في بداية حقل URL في `/profile`
  - **Why:** RTL bidi rendering issue للروابط
  - **Fix:** أضف `dir="ltr"` على input حقول الـ URL
  - **Screenshot:** [console-mobile-375-profile.png](console-mobile-375-profile.png)

---

## ✅ DONE (Session 70)

- [x] **CONS-DONE-001 — Console favicon 404 fixed via app/icon.svg** (OBS-119, 2026-04-27)
- [x] **CONS-DONE-002 — Console aligned to PROD DB to match admin** (OBS-125, 2026-04-27, user direction)
- [x] **CONS-DONE-003 — Kimazone client password set + verified via bcrypt + memory saved** (2026-04-27)
- [x] **CONS-DONE-004 — Slug regex in `client-server-schema.ts` accepts Arabic** (admin bug discovered while updating client password, 2026-04-27)

---

### Phase 1 — Plain-language copy overhaul ✅ (28 COPY + 2 visual jargon items, 2026-04-27)

**Files changed:**
- [console/lib/ar.ts](console/lib/ar.ts) — comprehensive rewrite (~700 lines)
- [console/app/(dashboard)/dashboard/media/components/media-gallery.tsx](console/app/(dashboard)/dashboard/media/components/media-gallery.tsx) — replaced hardcoded English with `ar.media.*`
- [console/app/(dashboard)/dashboard/analytics/page.tsx](console/app/(dashboard)/dashboard/analytics/page.tsx) — added `sourceLabel()` mapper
- [console/app/(dashboard)/dashboard/components/traffic-chart.tsx](console/app/(dashboard)/dashboard/components/traffic-chart.tsx) — added `sourceLabel()` mapper
- [console/app/(dashboard)/dashboard/page.tsx](console/app/(dashboard)/dashboard/page.tsx) — replaced `Avg time / Scroll / Return rate / 7d / 30d` English subLines with Arabic from `ar.dashboard.*`

**Items closed:**
- [x] CONS-COPY-001 — JSON-LD → "بيانات البحث المنظمة"
- [x] CONS-COPY-002 — Schema.org → "بيانات منظمة لجوجل"
- [x] CONS-COPY-003 — UTM analysis → "تحليل روابط الحملات"
- [x] CONS-COPY-004 — UTM parameters → "وسوم الروابط / روابطك التسويقية"
- [x] CONS-COPY-005 — GTM container ID → "معرّف Google Tag Manager (اختياري)" + hint
- [x] CONS-COPY-006 — Staging → "الموقع التجريبي"
- [x] CONS-COPY-007 — "نسبة النقر" → "نسبة النقر إلى الظهور"
- [x] CONS-COPY-008 — "العائد" → "العائد على الإنفاق"
- [x] CONS-COPY-009 — "يرجى إضافة" → "أضف ملاحظاتك"
- [x] CONS-COPY-010 — "تعذّر الموافقة" → "ما تمت الموافقة على المقالة. جرّب مرة أخرى."
- [x] CONS-COPY-011 — "إدارة والموافقة" → "المقالات والموافقات"
- [x] CONS-COPY-012 — "سيتم إرسال" → "سنرسل"
- [x] CONS-COPY-013 — "مراجعة تفاصيل المقالة قبل الموافقة" → "تفقد المقالة قبل الموافقة"
- [x] CONS-COPY-014 — "هل أنت متأكد..." → "تأكيد الموافقة على المقالة؟"
- [x] CONS-COPY-015 — تثبيت verbs: نشر (FAQs) / موافقة (articles, comments)
- [x] CONS-COPY-016 — تنويع 20+ "تعذّر..." → "ما تم..." + "جرّب مرة أخرى"
- [x] CONS-COPY-017 — توحيد "بانتظار..." patterns
- [x] CONS-COPY-018 — استخدام "الكل" للفلتر، "الإجمالي" للأرقام
- [x] CONS-COPY-019 — `noFaqs` "لا توجد أسئلة بعد." (يحلّ المشكلة عند count=0)
- [x] CONS-COPY-020 — "أولوية الخريطة" → "أهمية الصفحة في البحث"
- [x] CONS-COPY-021 — Empty states بـ next-step hints (8 صفحات)
- [x] CONS-COPY-022 — `canonicalUrlHint` أضفت شرح "إذا نُسخت مقالتك..."
- [x] CONS-COPY-023 — "مؤشرات الأداء (KPIs)" → "مؤشرات النجاح (مثل: عدد الزوار، المبيعات)"
- [x] CONS-COPY-024 — "جهة الاتصال" → "مَن نتواصل معه؟"
- [x] CONS-COPY-025 — Newsletter CTA placeholder بمثال (موجود مسبقاً في profile-form)
- [x] CONS-COPY-026 — "تقدّم التسليم الشهري" → "تقدم المقالات الشهري"
- [x] CONS-COPY-027 — "مراجعة التعليقات والموافقة عليها" → "مراجعة التعليقات"
- [x] CONS-COPY-028 — "بيانات السجل التجاري والضرائب" → "السجل التجاري والضرائب"
- [x] CONS-VIS-001 — Web Vitals labels: LCP/CLS/INP/TTFB/TBT → سرعة ظهور المحتوى / ثبات الصفحة / سرعة الاستجابة / سرعة الخادم / وقت الانشغال + `coreWebVitals` → "تجربة الزائر على الموقع"
- [x] CONS-VIS-002 — "Organic" → "بحث جوجل" (mapper يغطي direct/referral/social/paid أيضاً)

**Bonus quick wins (not originally tracked):**
- [x] Dashboard subLines: "Avg time / Scroll / Return rate / 7d / 30d" → عربية كاملة (`ar.dashboard.avgTime / scroll / returnRate / days7 / days30`)
- [x] Profile labels SEO domain: "SEO Title/Description/Settings/Goals/Metrics" → "عنوان البحث / وصف البحث / إعدادات البحث / أهداف الظهور في البحث / مقاييس البحث / قوة الموقع في البحث"
- [x] "googleBusinessProfileUrl" → "رابط ملف نشاطك التجاري على جوجل"
- [x] "technicalSeo" → "بيانات تقنية للبحث"
- [x] Settings subscription badges: "ACTIVE · PAID" → "نشط · مدفوع"
- [x] Settings price line: "1,299 SAR/year" → "1,299 ريال سعودي / سنوياً"
- [x] Content page article status: "PUBLISHED" → "منشور" (with all status mappings) + Arabic date format `Intl.DateTimeFormat('ar-SA')` → "٢٢ أبريل ٢٠٢٦"
- [x] Branding section in Media: "Branding Assets / Logo / Open Graph Image / Twitter Card Image" → عربية كاملة عبر `ar.media.*`
- [x] Article stats error: "تعذّر تحميل" → "ما تم تحميل" + "يرجى المحاولة" → "جرّب مرة أخرى"
- [x] SEO sub-pages description: "إدارة بيانات SEO واستمارة الاستقبال..." → "معلومات مشروعك والمنافسين والكلمات لمساعدتنا في كتابة محتوى أقوى لك"
- [x] **Pass 3 — CTA type labels:** Analytics → "أكثر الأزرار نقرة" — `link` / `form` / `button` / `banner` / `popup` → رابط / نموذج / زر / لافتة / نافذة منبثقة (mapping in [analytics/page.tsx](console/app/(dashboard)/dashboard/analytics/page.tsx) + 5 keys في `ar.analytics.ctaType*`)

**Out-of-scope items found in Pass 3 (modonty public site, not console):**
- ⚠️ CTA labels stored in DB من tracking modonty.com (مثل `Feed card – عنوان المقال`, `Tab – حول`, `View reel article`, `Share client (facebook)`) — تأتي من frontend tracking code على الموقع العام. لا يمكن ترجمتها من console وحده. لازم نعدّل الـ tracking labels في كود modonty نفسه.
- ⚠️ زر "تعبئة تجريبية (dev)" في `/seo/intake` — موجود مسبقاً كـ CONS-004 HIGH (security/UX issue, not copy).

**Verified live in browser:**
- ✅ `/dashboard` (subLines + traffic chart Arabic)
- ✅ `/dashboard/media` (gallery + filters + usage labels)
- ✅ `/dashboard/analytics` (Web Vitals + traffic sources + CTA types)
- ✅ `/dashboard/faqs` (verbs + empty states)
- ✅ `/dashboard/campaigns` (UTM jargon gone)
- ✅ TSC clean (`pnpm tsc --noEmit` exit 0)

**Pass 3 final sweep (2026-04-27):**
- 17/17 pages scanned with `userFacingJargon` regex (covers ACTIVE/PAID/PUBLISHED/PENDING/REJECTED/DRAFT/WRITING/SCHEDULED/ARCHIVED/HOT/WARM/COLD/Avg time/Return rate/Scroll/Branding/Open Graph/Twitter Card/Media Gallery/JSON-LD/Schema.org/UTM/Staging/Organic + Arabic noise patterns)
- **Result: ✅ ALL CLEAN** (0 user-facing jargon matches across entire console)

---

### Phase 2 — Responsive overhaul ✅ (2026-04-27)

**Files changed:**
- [console/app/(dashboard)/components/dashboard-header.tsx](console/app/(dashboard)/components/dashboard-header.tsx) — header redesign for mobile (no wordmark cropping + 4 priority icons + nav title shows on `<sm`) + buttons h-10 (40px)
- [console/app/(dashboard)/dashboard/profile/components/profile-form.tsx](console/app/(dashboard)/dashboard/profile/components/profile-form.tsx) — `lg:grid-cols-2` for all CardContent + `dir="ltr"` for url/email/tel/number inputs
- [console/app/(dashboard)/dashboard/media/components/media-gallery.tsx](console/app/(dashboard)/dashboard/media/components/media-gallery.tsx) — `flex-wrap` on filter buttons + stack title vertically on mobile
- [console/app/(dashboard)/dashboard/components/top-articles-chart.tsx](console/app/(dashboard)/dashboard/components/top-articles-chart.tsx) — replaced recharts vertical bar (RTL-broken) with Arabic-friendly progress list
- [console/app/(dashboard)/dashboard/comments/components/comments-table.tsx](console/app/(dashboard)/dashboard/comments/components/comments-table.tsx) — action buttons h-10 w-10 with aria-label + flex-wrap header + flex-wrap action group
- [console/app/(dashboard)/dashboard/questions/components/questions-table.tsx](console/app/(dashboard)/dashboard/questions/components/questions-table.tsx) — flex-wrap filter buttons
- [console/app/(dashboard)/dashboard/leads/components/leads-table.tsx](console/app/(dashboard)/dashboard/leads/components/leads-table.tsx) — flex-col on mobile + flex-wrap filters
- [console/app/(dashboard)/dashboard/subscribers/components/subscribers-table.tsx](console/app/(dashboard)/dashboard/subscribers/components/subscribers-table.tsx) — action buttons h-10 + aria-label + flex-col on mobile
- [console/app/(dashboard)/dashboard/support/components/messages-list.tsx](console/app/(dashboard)/dashboard/support/components/messages-list.tsx) — flex-wrap filter buttons
- Header `getNavTitle()` now resolves parent paths (e.g., `/dashboard/seo/intake` → "معلومات مهمة")

**Verified live in browser:**
- 375px (iPhone): dashboard ✅, profile ✅ (single col + URL fixed), media ✅ (filters wrap to 2 rows), faqs ✅, comments ✅, intake ✅ (proper title), top-articles list ✅
- 768px (iPad): dashboard ✅ (top-articles full titles single-line), all clean
- 1366px (Desktop): dashboard ✅, profile ✅ (now 2-column → no wasted space), all clean
- TSC clean (`pnpm tsc --noEmit` exit 0)
- 0 console errors

**Pass 2 final verification sweep (2026-04-27):**
- Automated scan on **17/17 pages × 375 / 768 / 1366 viewports** with metrics: `overflow / smallBtns / tableOverflow`
- Found 1 issue at 768: 4 HelpCollapsible triggers in intake-field had height 20px (under 32px touch). Fixed: added `py-2 min-h-[40px]`.
- Final result: **17/17 pages × 3 viewports = 0 overflow · 0 small buttons · 0 table overflow** ✅

---

## 📋 ملاحظات معمارية إيجابية (لا تحتاج عمل)

- ✅ كل صفحات الـ sidebar مبنية فعلياً (لا stubs ولا "Coming soon")
- ✅ Approval workflows مكتملة لـ 4 entities: articles, faqs, comments, visitor questions
- ✅ Slug العميل **مقفل** في UI مع رسالة واضحة "تم تحديده عند الإنشاء" — UX جيد
- ✅ Email notifications للزائر عبر Resend عند ردّ على سؤاله
- ✅ Lead scoring مبنيّ مع 4 درجات (ساخن/دافئ/بارد/مؤهل)
- ✅ Web Vitals tracking داخلي (LCP/CLS/INP/TTFB/TBT)
- ✅ i18n منظّم في `lib/ar.ts` واحد + RTL على مستوى الـ root layout
