# 🏷️ Brand / Identity Centralization + OG/Share Fix — Single Source of Truth

**Last Updated:** 2026-06-02
**Origin:** PSI-001 (تهجئة «مودونتي») + شكوى OG على واتساب «أحيانًا يطلع أحيانًا لا». اتّسعت لجرد شامل (4 وكلاء متوازية).
**الهدف:** الـ branding كله (اسم · رابط · شعار · OG · إيميل · كيان) من **مصدر واحد** — فيستحيل تضارب/اختلاف مستقبلًا.

> **التهجئة الرسمية (خالد):** العربي = **«مدونتي»** (مش «مودونتي»). اللاتيني = «Modonty».
> **⚡ الأداء (مؤكّد):** ثابت `lib/brand.ts` (نصوص ثابتة في Server Components) = **صفر JS عميل · صفر bundle · صفر runtime**. الرئيسية 95% server + جلب متوازي + LCP محسّن — لا تُمسّ هذي الخصائص.

> **القاعدة:** كل ملف ننهيه → `[x]` + ملاحظة. ممنوع side effect — TSC + live بعد كل مرحلة. المنجز ينتقل لـ ✅ Done.

---

## 🧭 التصميم — مصدران حسب الطبيعة

1. **هوية ثابتة → `modonty/lib/brand.ts`** (جديد): `BRAND_AR="مدوّنتي"` · `BRAND_EN="Modonty"` · `SITE_URL` · `LOGO_URL` · `OG_IMAGE_URL` · `CONTACT_EMAIL` · `NOREPLY_FROM` · `LEGAL` (CR/capital/DBA/city/country/founded).
2. **محتوى قابل للتعديل → `Settings` DB** (موجود): SEO titles/desc · social URLs · banner. `Settings.siteName` fallback = `brand.ts`.

---

## 🔴 PHASE A — OG / Share fix (واتساب) — ✅ المنطق تمّ + TSC نظيف (الأصل المخصّص = Phase F)

- [x] **إصلاح الـ fallback الميت (404):** `lib/seo/index.ts:73` صار `image || OG_IMAGE_URL` (شعار Cloudinary مطلق — Next.js يتجاهل metadataBase للروابط المطلقة، docs مؤكّدة). هذا يغطّي **كل** صفحات `generateMetadataFromSEO` (مقالات · ملفات عملاء · فئات/[slug] · وسوم · بحث · help · contact · faq · subscribe · users) — أكثر المشاركات على واتساب.
- [x] **الصفحات الـ6 (about · terms · legal×4):** `page.ogImage || page.socialImage || OG_IMAGE_URL` (بدل 404) + `siteUrl=SITE_URL` + `siteName=BRAND_AR` + تصحيح تهجئة. (هذا أصلح بق العنوان الخاطئ في /about على الإنتاج.)
- [x] **Social review (قبل OG كما طلب خالد):** twitter:site/creator يعمل صح (normalize `@handle`). الفجوة الوحيدة كانت og:image الميت.
- [x] **(تمّ — Part B1):** صورة OG = `Settings.ogImageUrl` ديناميكي (الأدمن يرفع 1200×630). أُزيل الثابت `OG_IMAGE_URL`. متحقّق حيًّا.
- [ ] **(Phase H — admin):** صفحات القوائم (home/clients/categories/trending) تقرأ ميتا من DB يولّدها الأدمن → الـ fallback لـ og:image لازم يُضاف في **مولّد الأدمن** (مش modonty). مؤجّل لـ Phase H.
- [ ] **توحيد شعار OG/JSON-LD:** story (SVG) مقابل nav/email (PNG) → مصدر واحد. مؤجّل لـ Phase F (أصول).
- [ ] **(بعد النشر)** Facebook Sharing Debugger + WhatsApp re-scrape للتأكّد.

## 🔤 PSI-001 — تصحيح تهجئة «مدونتي» (مسح كامل) — ✅ تمّ + TSC نظيف
- [x] **modonty نظيف 100%** من «مودونتي» الخطأ (عدا تعليق `brand.ts` المقصود). صُحّح في **37 ملف** هذي الجولة: الصفحات الـ6 (centralized) + 31 ملف (نصوص عرض: عناوين ميتا · JSX · JSON-LD · رسائل تيليجرام · author fallback) — كلها نصوص، صفر أثر وظيفي.

---

## 🟢 PHASE B — `lib/brand.ts` + القراءات الأساسية (الاسم/الرابط) — ✅ تمّ + TSC نظيف + live-verified

- [x] **P0:** `modonty/lib/brand.ts` (المصدر) — BRAND_AR=«مدونتي» · BRAND_EN=«Modonty» · SITE_URL · LOGO_URL · CHARACTER_URL · OG_IMAGE_URL · CONTACT_EMAIL · NOREPLY_FROM · LEGAL.
- [x] `app/layout.tsx` (metadataBase=SITE_URL · title default+template=BRAND_AR).
- [x] `lib/seo/index.ts` (siteName=BRAND_AR · siteUrl×5=SITE_URL · author=BRAND_EN). **OG fallback `/og-image.jpg` لم يُمسّ — للمرحلة F.**
- [x] `lib/seo/get-article-defaults-from-settings.ts` (siteName ×2=BRAND_AR).
- [x] `app/page.tsx` (SITE_URL import · author=BRAND_EN · desc=BRAND_AR).
- [x] `lib/image-utils.ts` (CLOUDINARY_LOGO=LOGO_URL · CHARACTER=CHARACTER_URL).
- [x] `components/navigatore/LogoNav.tsx` (aria + alt = BRAND_AR).
- [x] `components/layout/Footer.tsx` («عن {BRAND_AR}») + `FooterCopyright.tsx` (© {BRAND_AR}).
- [x] `app/robots.ts` + `app/sitemap.ts` (baseUrl=SITE_URL) · `lib/indexnow.ts` (HOST=new URL(SITE_URL).host).
- **live:** فوتر «© 2026 مدونتي» · «عن مدونتي» · شعار alt «مدونتي» · og:site_name «Modonty». ✓

## 📧 PHASE C — قوالب الإيميل (8 ملفات · ~30 موضع) — ✅ تمّ + TSC نظيف

- [x] `lib/email/templates/base.ts` (title=BRAND_AR · logo=LOGO_URL · alt=BRAND_AR · footer href=SITE_URL · host display).
- [x] `lib/email/resend-client.ts` (from=NOREPLY_FROM).
- [x] `welcome.ts` · `email-verification.ts` · `password-reset.ts` · `newsletter-welcome.ts` · `comment-reply.ts` · `faq-reply.ts` — كل «مودونتي»→BRAND_AR · كل modonty.com→SITE_URL.
- **ملاحظة copy (خارج النطاق):** قوالب welcome/newsletter لسه تقول «المحتوى الطبي والصحي» — تموضع قديم خاطئ (مدونتي عامة الآن). يحتاج تحديث نصّي منفصل لاحقًا.

## 🤖 PHASE D — شاتبوت + story + كيان قانوني — ✅ تمّ + TSC نظيف

- [x] `lib/rag/prompts.ts` (كل «مودونتي»→${BRAND_AR} داخل القوالب · ×8 + comment).
- [x] `app/story/_constants.ts` (LEGAL_ENTITY: brand=BRAND_AR · dba/cr/capital/city/country/founded من brand.ts LEGAL).
- [x] `app/story/SalesPitchPage.tsx` (SALES_EMAIL fallback=CONTACT_EMAIL · prefill=${BRAND_AR}).
- [ ] `app/api/.../chat/route.ts` ×2 — تستخدم «مدونتي الذكية» (تهجئة **صحيحة** أصلاً) — تُركت كما هي (مش خطأ؛ centralize لاحقًا لو لزم).
- [ ] `app/story/TestimonialPlayer.tsx` (رابط يوتيوب لفيديو شهادة محدّد — مش قناة العلامة؛ خارج النطاق، يُترك).
- [ ] شعار story SVG (`MODONTY_LOGO_URL` في _constants) — يُوحّد في **المرحلة G (أصول)**.

## 📄 PHASE E — ملفات ثابتة — ✅ تمّ (تصحيح يدوي آمن)

- [x] `public/llms.txt` (تهجئة سطر 3 — الروابط www أصلاً).
- [x] `public/llms-full.txt` (تهجئة سطر 3 + `https://modonty.com`→www سطر 136).
- [x] `public/.well-known/ai-plugin.json` (تهجئة `name_for_human` + 3 روابط www + `logo_url` من `/logo.png` (404) → شعار Cloudinary حقيقي + `info@`→`modonty@modonty.com` موحّد). JSON تحقّقت من صلاحيته.
- **قرار:** التصحيح اليدوي كفى (ملفات نصّية لا تستورد). توليد build-time = تحسين مستقبلي اختياري.

## 🖼️ PHASE F — أصول ناقصة (assets)

- [x] صورة OG = الآن من `Settings.ogImageUrl` (يرفعها الأدمن) — لم تعد ملفًا ثابتًا.
- [x] favicon = `app/icon.svg` الثابت (يشتغل على المتصفحات الحديثة، هوية ثابتة — قرار خالد 2026-06-02). favicon.ico (legacy) متروك عمدًا.
- [ ] (اختياري) `app/manifest.ts` (PWA) + apple-icon.png 180×180.

## 🗂️ PHASE G — admin + console — ⏸️ مؤجّل بعد الـ push (قرار خالد 2026-06-02)
> **لا يؤثر على SEO إطلاقاً** (admin + console كلاهما noindex/خلف auth · الإيميلات مش SEO). مُسجّل في MASTER-TODO. نعالجه بعد push المنجز.
> ⚠️ **console حسّاس:** ملفات الصوت/help تستخدم «مُدَوَّنَتِي» (تشكيل مقصود) — لا مسح أعمى؛ انتقائي فقط.

- [ ] admin: `lib/constants/site-name.ts` موجود **وغير مستخدم** → نفعّله/نوحّده · `lib/email/templates/invoice.ts` (`modonty@modonty.com` ×2) · `app/layout.tsx` title · `lib/indexnow.ts` HOST · `scripts/seed-technical-defaults.ts`.
- [ ] console: telegram webhook strings · `app/help/page.tsx` · `lib/ar.ts`.

---

## 🧭 قرار خالد (2026-06-02): Settings = المصدر الوحيد · لا «default» للأصول الأساسية
الشعار + صورة OG يديرهما الأدمن في Settings (`logoUrl`/`ogImageUrl`). بدل ثابت احتياطي → تنبيه للأدمن لو ناقص.

- **(تمّ) Dialog تنبيه في الأدمن:** لو أي حقل SEO أساسي فاضي → Dialog واضح غير موقِف يسرد الناقص + «Go to Modonty settings». مرّة/جلسة. متحقّق بصريًا + TSC 0.
  - ملفات: `admin/lib/seo/essential-seo-fields.ts` · `admin/components/admin/essential-seo-dialog.tsx` · `admin/app/(dashboard)/layout.tsx`.
  - الحقول الأساسية الـ6: `siteName` · `brandDescription` · `modontySeoTitle` · `modontySeoDescription` · `ogImageUrl` · `logoUrl`. (dev: الستة معبّأة → لا Dialog · prod: لم يُتحقّق.)
- **(تمّ — Part B1) صورة OG ديناميكية:** modonty يقرأ `Settings.ogImageUrl` عبر `getBrandMedia()` المكاش؛ لو فاضي → og:image يُحذف (لا ثابت). حُذف `OG_IMAGE_URL` من brand.ts. TSC 0 + متحقّق حيًّا (/contact = صورة OG المخصّصة من Settings، مش الشعار).
  - ملفات: `lib/settings/get-brand-media.ts` · `lib/seo/index.ts` (async) · 6 صفحات legal/about · 6 مستدعين (const→`generateMetadata` async).
- **(تمّ — Part B2) شعار النافبار ديناميكي:** `LogoNav` صار async يقرأ `Settings.logoUrl` عبر `getBrandMedia()`؛ لو فاضي → يعرض اسم العلامة نصًّا (تدهور رشيق) والأدمن منبّه. TSC 0 + متحقّق حيًّا (شعار النافبار = صورة Settings الأحدث، مش الثابت القديم).
  - ملفات: `components/navigatore/LogoNav.tsx` (async) · `lib/image-utils.ts` (`getOptimizedLogoUrl(logoUrl)` يأخذ param + حذف `CLOUDINARY_LOGO`/import `LOGO_URL`).
  - **استثناء مقصود:** شعار الإيميل (`lib/email/templates/base.ts`) يبقى على `brand.ts` `LOGO_URL` — سياق ترانزاكشنال متزامن لازم يضمن شعار + تمريره عبر سلسلة القوالب مكلف/قليل القيمة. (مثل الرابط القانوني/دومين الإيميل = هوية ثابتة.)
  - JSON-LD Organization logo = يولّده الأدمن (homeMetaTags) → Phase H.
- **(تمّ — شعاران) شعار سطح المكتب + شعار الموبايل:** حقل جديد `Settings.logoIconUrl` (أيقونة الموبايل) **إلزامي** (يدخل Dialog التنبيه). `LogoNav` ياخذ `variant`: ديسكتوب=`logoUrl` (عريض) · موبايل=`logoIconUrl` ‖ fallback لـ `logoUrl`. متحقّق حيًّا: الـ Dialog يسرد «Logo (mobile icon)» · النموذج يعرض 3 حقول صور · الموبايل (375px) يسقط بأمان على العريض. TSC 0 للتطبيقين.
  - ملفات: `schema.prisma` (logoIconUrl) · `getBrandMedia` · `LogoNav`+`TopNav`+`TopNavDesktop` · admin `essential-seo-fields` (7 حقول) + `settings-actions` (load×2/save×2/type/default) + `modonty-form` (حقل رفع ثالث).

## 🎨 أصول مازالت ملفات ثابتة (Phase F)
1. ✅ **favicon** = `app/icon.svg` الثابت (هوية ثابتة، شغّال — قرار خالد). favicon.ico legacy متروك.
2. **قرار توحيد شعار story:** SVG (`final-01_fdnhom.svg`) مقابل PNG (`modontyLogo_ftf4yf.png`) — أيّهما المصدر؟
- ملاحظة: صورة OG المخصّصة لم تعد ملفًا ثابتًا أحتاجه منك — الأدمن يرفعها في Settings (والـ Dialog يضمنها).

## ✅ Social handles: env → Settings — تمّ (قرار خالد 2026-06-02: مصدر واحد)
- الصفحات الـ6 (about/terms/legal) كانت تقرأ `process.env.NEXT_PUBLIC_TWITTER_SITE/CREATOR` → الآن تقرأ من **Settings** عبر `getBrandMedia()` (أضيف `twitterSite`+`twitterCreator`). صفر مراجع env في modonty + TSC 0 + متحقّق حيًّا (/about يقرأ من Settings؛ null حاليًا لأن الحقول فاضية في dev — تُعبّأ من Settings ▸ Social Links).
- ملاحظة: `page.twitterSite` (حقل per-page) باقٍ كـ override اختياري (فاضي عمليًا) ثم Settings = المصدر.
- (admin `seed-settings-from-env.ts` لسه يستخدم env — لكنه **يزرع** القيم في Settings مرة، مش قراءة runtime؛ سليم.)

## 🟢 ملاحظة بسيطة (parked) — تكرار العلامة في عنوان about/legal
- عنوان /about يظهر «… - مدونتي | مدونتي» (الصفحة تبني `${title} - ${siteName}` ثم template اللياوت `%s | مدونتي` يضيف ثانية). pre-existing، مش SEO-حرج. إصلاح بسيط لاحق: الصفحة ترجّع `title` بدون `- ${siteName}` وتترك template اللياوت.

## ✅ قرارات محسومة
1. الصيغة العربية = **«مدونتي»** (خالد حسمها). ✅
2. صورة OG fallback = إعادة توجيه لشعار Cloudinary الموجود (تمّ) + صورة مخصّصة لاحقًا. ✅
3. الملفات الثابتة = تصحيح يدوي (تمّ). ✅
4. الترتيب = B✅→C✅→D✅→E✅→A(OG logic)✅→ ثم F (أصول) → H (admin/console). ✅

---

## ✅ Done
- [x] جرد شامل (4 وكلاء: OG · literals · assets · performance) — 2026-06-02.
- [x] تأكيد الأداء: brand constants = صفر أثر على الرئيسية.
- [x] (PSI-002 منفصل) `data-nosnippet` على PostCard — تمّ في dev، معلّق على push.

_(لم يبدأ تنفيذ التوحيد — بانتظار قرارات النطاق.)_
