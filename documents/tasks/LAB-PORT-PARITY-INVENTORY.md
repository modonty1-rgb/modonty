# Lab → Real Article — Port Parity Checklist (جرد + تشييك)

**Created:** 2026-06-04 · **Method:** قراءة فعلية لـ14 ملف (صفحتان + 12 component) — صفر تخمين.
**Goal:** نكمّل جسم `/articles-lab/[slug]` ليصير superset كامل للحقيقي → نتحقّق → ننقله للرئيسي مع **إبقاء قشرة الفهرسة للرئيسي (لا ننقل noindex)**.
**القاعدة:** كل بند `[ ]` يُشطب `[x]` فور إنجازه + تاريخ. لا نختم بند بلا تنفيذ/تحقّق.

---

## القرارات أولاً (نجاوبها واحد واحد — قبل التنفيذ)
- [x] **Q1 — زرّ «احجز الآن»** → **نُبقيه كما هو** (خالد 2026-06-04: «خليه زي ما هو لأنه هنشتغلها اليوم» — ميزة الحجز ستُبنى اليوم، فيصير صادقاً). ✅
- [x] **Q2 — dislike** → **نسقطه** (خالد 2026-06-04). إعجاب/حفظ فقط (تصميم نظيف). endpoint الـ dislike يبقى بالخلفية بلا واجهة. ✅ → فالتفاعل (A4/A5) يُربط بـ `likeArticle`/`favoriteArticle` فقط (زي الدوك)، لا dislike.
- [x] **Q3 — شارة الفئة** → **نرجّع الفئة** (خالد 2026-06-04): وسوم + شارة فئة (رابط /categories/[slug]). شارة العميل تبقى مُسقَطة (مكرّرة). ✅
- [x] **Q4 — النشرة** → **نهج اللاب** (خالد 2026-06-04): صورة المقال + dialog «اشترك». بلا standalone ثالث. ✅
- [x] **Q5 — caption المعرض** → **نرجّعه تحت المعاينة** (خالد 2026-06-04): caption الصورة النشطة تحت المعاينة الكبيرة. ✅

> **كل القرارات محسومة 2026-06-04.** + ملاحظة: ميزة الحجز (`Client.bookingUrl` + إدخال كونسول + ربط الدوك/الكرت) = مهمة منفصلة قال خالد «نشتغلها اليوم» — لا تعطّل النقل؛ «احجز الآن» يبقى لين تُبنى.

---

## Phase A — 🟦 قشرة الرئيسي (أتولّاها أنا عند النقل · لا تُنقل من اللاب)
- [ ] **S1** — إبقاء `generateStaticParams` (SSG) للرئيسي.
- [ ] **S2** — إبقاء `generateMetadata` الكامل (شغل السيو اليوم: stored-metadata + canonical + og/twitter 1200×630 + ogTimes + hreflang) **حرفيّاً**.
- [ ] **S3** — ⚠️ **حارس حرج:** `robots: index` يبقى — **ممنوع نقل `noindex` تبع اللاب** (وإلا تُلغى فهرسة كل المقالات).
- [ ] **S4** — إبقاء `<Suspense fallback={<ArticleLoading/>}>` + `loading.tsx`.
- [ ] **S5** — إبقاء معالجة أخطاء الرئيسي (`unstable_rethrow` + لا تحويل خطأ عابر لـ 404).
- [x] **S6** — `maxDuration = 60` — متطابق أصلاً (موجود بالصفحتين). ✅

---

## Phase B — 🟥 إضافات إلزامية لجسم اللاب (تحليلات + ربط تفاعل)
- [x] **A1** — `GTMClientTracker` (clientContext + articleId + pageTitle) ✅ (2026-06-04) — مضاف بعد سكربتات JSON-LD، مطابق للحقيقي.
- [x] **A2** — `ArticleViewTracker` (articleSlug) ✅ (2026-06-04).
- [x] **A3** — `ArticleBodyLinkTracker` (بعد المحتوى مباشرةً) ✅ (2026-06-04).
- [x] **A4** — تفاعل الديسكتوب: `ArticleLabEngagementStrip` (إعجاب/حفظ) مربوط بـ `likeArticle`/`favoriteArticle` + `useSession` + optimistic/reconcile + busy/disabled — **بلا dislike** ✅ (2026-06-04). نفس نمط الدوك بالضبط.
- [x] **A5** — شريط نهاية المقال `ArticleLabEngagementBar`: **حُذف نهائياً** (قرار خالد 2026-06-04 «remove» بعد اكتشاف أنه المصدر الوحيد لتعارض حالة التفاعل بصرياً مع الشريط الجانبي/الدوك). الحذف = مطابقة تامة للحقيقي (الحقيقي ما عنده شريط نهاية) + كود أقل. ✅
- [x] **A6** — الدوك السفلي `ArticleLabBottomDock` — مربوط فعلاً ✅ (مرجع، لا تغيير).

---

## Phase C — 🟧 فروقات (تُنفّذ حسب القرارات أعلاه)
- [x] **D1** — شارة الفئة في صف الوسوم (Q3 ✅): رابط `/categories/[slug]` + `IconFolder`، الصف يظهر لو فيه فئة أو وسوم. بلا شارة عميل. ✅ (2026-06-04)
- [x] **D2** — كرت العميل: `pendingFaqs` الحقيقية تُمرَّر لـ AskClientDialog (بدل `[]`) — في الـ aside والدوك. ✅ (2026-06-04)
- [x] **D3** — caption المعرض (Q5 ✅): caption الصورة النشطة (`caption || altText`) تحت المعاينة الكبيرة في `ArticleLabGallery`. ✅ (2026-06-04)
- [x] **D4** — النشرة: نهج اللاب معتمد (Q4 ✅) — لا إجراء. ✅
- [x] **D5** — توحيد الأقسام الأربعة → `ArticleLabReadMore` (deduped, CtaTrackedLink) — تحسين مقصود ومؤكّد. ✅
- [x] **D6** — تأكيد الجوال (390px) ✅ (2026-06-04): هوية العميل تحت العنوان · صورة + نشرة overlay · TOC · TL;DR · الدوك السفلي مربوط · الفوتر يَبِين فوق الدوك (محتوى المقال 524px < قمة الدوك 789px · padding-bottom = 96px) · بلا شريط نهاية · RTL سليم بلا overflow.

---

## Phase D — 🟩 تحسينات اللاب (نُبقيها — تأكيد فقط)
- [x] **L1** TL;DR «أهم النقاط» (من H2) ✅ keep
- [x] **L2** `ArticleLabMobileIdentity` (هوية العميل تحت العنوان — جوال) ✅ keep
- [x] **L3** `ArticleLabBottomDock` (دوك + Sheet) ✅ keep
- [x] **L4** `ArticleLabGallery` (preview + thumbs، بلا lightbox) ✅ keep
- [x] **L5** `ArticleLabEngagementBar` (نهاية المقال) — ❌ **أُسقِط** (قرار خالد 2026-06-04): سبّب تعارض حالة بصري؛ الشريط الجانبي + الدوك يغطّيان التفاعل، والحقيقي ما عنده شريط نهاية.
- [x] **L6** TOC قابل للطي ✅ keep
- [x] **L7** تخطيط عمودين `[300px_1fr]` ✅ keep
- [x] **L8** كرت العميل الأغنى (verified + city + brief + WhatsApp/social rail) ✅ keep

---

## Phase E — بوابة التحقّق + النقل (بعد A/B/C)
- [x] **V1** — checklist diff (3 جولات تحقّق مستقلة · 3 agents · 2026-06-04):
  - **جولة 1 (تطابق):** PARITY ~100% — كل بنود A/D حاضرة وصحيحة. فجوتان LOW: (Gap1) رابط `/tags` «عرض كل الوسوم» كان ساقطاً → **أُصلح** ✅ · (Gap3) «اقرأ أيضاً» كان محدوداً بـ12 → **حُسم: لا حدّ** (خالد «ما في انتهاء») — نعرض كل المرتبط المنزوع التكرار = أقصى روابط داخلية + مطابقة للحقيقي. المجموعة محدودة أصلاً بالـ takes (6+6+3+المنسَّق). ✅
  - **تحسين الصور (whole-article · 2026-06-04):** ✅ المعرض (المعاينة + المصغّرات) + هيرو كرت العميل حُوّلا لـ `OptimizedImage` → `f_auto,q_auto,c_fill,g_auto` مؤكّد حيّاً. الشعارات بقيت `next/image` + `object-contain` **عمداً** (c_fill يقصّها · next/image أصلاً يصغّرها webp). featured + read-more كانا OptimizedImage أصلاً. صفر صور مكسورة (26/26 تحمّل) · جودة 75.
  - **جولة 2 (صحّة الكود):** **صفر أخطاء** · tsc يمر · ربط التفاعل نسخة طبق الأصل من الدوك (optimistic→reconcile→revert صحيح، بلا off-by-one/stale-closure) · الأنواع وnull-safety وpendingFaqs والتتبّع وحدود الكلاينت كلها صحيحة · nit الـ`aria-current` → **أُصلح** ✅. (تصحيح: `Article.clientId` غير nullable في schema.)
  - **جولة 3 (أمان النقل):** SAFE — قائمة «نُبقي القشرة» دقيقة + الخطر الوحيد 🔴 = بلوك `robots:noindex` تبع اللاب (يُحذف، ننقل الجسم لا الـwrapper) + تعديلات مسارات الاستيراد محدّدة. بلا blockers.
  - **#5 (UX · 2026-06-04) — تسجيل دخول عند التفاعل وأنت خارج:** الحقيقي يعطّل الأزرار **لكن** يعرض «سجّل الدخول للإعجاب أو حفظ المقال» (`article-interaction-buttons.tsx:197-207`). اللاب كان يعطّل بصمت = فجوة تطابق + مشكلة UX. **أُصلح:** أُضيف hint «سجّل الدخول» للشريط (ديسكتوب) + الدوك (جوال). مؤكّد حيّاً (رابطا /users/login موجودان). tsc يمر.
- [~] **V2** — تست حيّ (2026-06-04 · جبر سيو `ما-هو-السيو` · modonty_dev): ✅ ديسكتوب+جوال+RTL · ✅ JSON-LD (Article+BreadcrumbList+Organization/WebSite) · ✅ GTM dataLayer موجود (التحليلات مركّبة) · ✅ الشريط مربوط (الأزرار disabled بحالة الخروج = بوّابة isLoggedIn فعّالة) · ✅ شارة الفئة+الوسوم · ✅ caption المعرض · ✅ بلا شريط نهاية · ✅ الفوتر ما ينحجب · ✅ أخطاء console الـ5 كلها `JWTSessionError` سابقة (تظهر بالرئيسية أيضاً) لا علاقة لها بتعديلاتي. **متبقّي:** نقرة التفاعل الموثَّقة (إعجاب/حفظ يُحفظ) + pendingFaqs تحتاج تسجيل دخول زائر modonty (الجلسة الحالية JWT تالف = خارج).
- [x] **V3** — النقل ✅ (2026-06-04): الجسم زُرع في `/articles/[slug]` مع إبقاء القشرة حرفياً (generateMetadata + generateStaticParams + maxDuration + Suspense + try/catch). المكوّنات الستة نُسخت لـ `articles/[slug]/components`. `articleFaqs`→`articleFaqsForJsonLd`. تحقّق حيّ على المسار الحقيقي: **`robots: index, follow`** ✅ (الـnoindex ما انتقل) · canonical إنتاج · عنوان من الـmetadata المخزّن · JSON-LD سليم · كل التصميم يظهر · صفر أخطاء console جديدة.
- [x] **V4** — حذف ✅ (2026-06-04): `app/articles-lab/` كامل + `public/_seo-audit.html` + 3 موكبات public (`_article-bottom-dock-mockup` · `_mobile-mockup` · `_topbar-mockup`). ملاحظة: `comment-form-dialog.tsx` (props `bare`/`trigger`) + `sidebar/article-table-of-contents.tsx` (`collapsible`) معدّلان من جلسات اللاب السابقة — تبعيات شرعية، tsc يمر.
- [x] **V5** — `tsc` ✅ صفر أخطاء + **`next build` ✅ نجح** (2026-06-04): `✓ Compiled in 26s` · **175/175 صفحة ثابتة** · `/articles/[slug]` = ◐ PPR مع slugs حقيقية prerendered · صفر أخطاء/تحذيرات/noindex بالبيلد. (أوقفت سيرفر :3000 dev فقط؛ تخطّيت `prisma generate` لأن لا تغيير schema — admin/console بقيا شغّالين.) **تحقّق على بناء الإنتاج (`next start`):** robots=`index, follow` ✅ · canonical=إنتاج ✅ · og:url ✅ · hreflang ٩ كاملة ✅ · JSON-LD سليم ✅ · التصميم كامل ✅.
- [~] **V6** — عرض للـ push (بإذن خالد) — **آخر مرحلة**. صفر push بلا تأكيد. (نتائج الـ full hard test ↓)

---

## 🧪 FULL HARD TEST (قبل الـ push · 2026-06-04/05) — كله بدليل
1. **بناء إنتاج نهائي** `next build` ✅ EXIT 0 · **176/176** صفحة · صفر أخطاء/تحذيرات (مرّتين: قبل وبعد إصلاحين).
2. **3 agents adversarial على الـ diff الكامل:**
   - تطابق: **100%، صفر فقد** (كل قشرة السيو + JSON-LD + البيانات + بنود الـ9 gaps).
   - صيد أخطاء: **tsc PASS · صفر crash/type/XSS** · 3 nits (واحد أُصلح، اثنان اختياريان).
   - أمان/side-effects: de-index **آمن** · كل الملفات المشتركة backward-compatible (19 مستورد لـ seo/index.ts · comment-dialog/TOC callers سليمة) · route web-vitals آمن.
3. **🐛 وجد + أُصلح:** `ChatFloatingButton` كان يرفع نفسه فوق الشريط على `/articles-lab` (محذوف) → غيّرته لـ `/articles/` → **مؤكّد حيّاً:** الزر `bottom:80px`، حافته 764 < قمة الدوك 789 (يفصلها 25px، صفر تداخل).
4. **تست مستخدم حقيقي (سجّلت حساب + دخلت):** إعجاب 0→1 + **بقي بعد reload (محفوظ بالـ DB)** ✅ · حفظ بقي بعد reload ✅ · مسار إلغاء الإعجاب/الحفظ ✅ · نظّفت البيانات (رجّعت المقال) · صفر أخطاء console. (الجلسة المسجّلة ألغت أخطاء JWT القديمة.)
5. **اختبار events-registry** `validate-events.mjs` → **21/21 PASS** (إضافة web_vitals ما كسرت شي).
6. **CWV:** lab نظيف (CLS=0) + RUM متحقّق GA4 HTTP 204 (route + 2 beacons من الصفحة).
7. **فحص نهائي على البناء الأخير:** robots=index · canonical إنتاج · JSON-LD · التصميم · **صفر أخطاء console**.

**إصلاحات أثناء التست:** ChatFloatingButton path · WebVitals fetch fallback `.catch`.

### ⚠️ المتبقّي الصادق قبل الـ push (مش أخطاء — قرار نطاق):
- **الـ commit مترابط:** `layout.tsx` يستورد WebVitals + ChatFloatingButton + سلسلة الـnavbar (→ notifications → TopNavMobileLinks)، فما ينفصلون. يُضمّون سوا (البناء 176/176 يثبت إنهم يتجمّعون). **لكن** شغل الـnavbar/chatbot/notifications (مش من تأليفي هذي الجلسة) **اتأكد إنه يبني + يَظهر + ما يكسر المقال، بس ما اختُبر feature-feature.**
- **يُحجب من الـ commit:** `documents/**` · `admin/scripts/_*.ts` · `.agents/` · `.claude/skills/` · `skills-lock.json` · `logoModonty.svg`.
- **بوابة أخيرة:** tsc للـ admin (قاعدة push: كلا التطبيقين صفر) قبل الـ commit.

---

## Core Web Vitals (خالد 2026-06-04 · المنهجية من مصادر رسمية: web.dev + Next.js docs)
**القاعدة الرسمية:** الرقم اللي يرتّب به Google = **بيانات الميدان (Field/CrUX)** من مستخدمين حقيقيين عند الـ75th percentile/28 يوم. الـ lab (Lighthouse) = تشخيص فقط، و**INP لا يُقاس في المعمل إطلاقاً**. فما نطارد رقم معمل محلي.

### أ) Lab pass (تشخيص الجسيم · على بناء الإنتاج `next start`)
- ✅ **CLS = 0** (تحميل بارد) — ممتاز، أقل بكثير من 0.1. صفر مشاكل ثبات بصري.
- ✅ TTFB منخفض دافئاً (24–114ms محلي) · 48 طلب · المعمارية محسّنة (Server Components + lazy client + featured image = عنصر LCP أصلاً `priority/eager/fetchPriority=high` + 1200 transform).
- ⚠️ LCP/FCP ما انقاسا محلياً (قيد foreground/headless — وهما field metrics بطبيعتهما). **صفر مشاكل جسيمة بنيوية.**

### ب) RUM — قياس الميدان (عبر مسار GA4 السيرفري المعتمد بالـ repo) ✅ مركّب ومتحقَّق end-to-end
**الاكتشاف (فحص repo كامل 2026-06-04):** كل أحداث Modonty (21 حدث: like/favorite/cta/conversions) تروح GA4 عبر **Measurement Protocol سيرفري** (`events-registry.ts` → `ga4-server.ts` → `mp/collect`)، **مو** عبر تاج GTM. فالـ dataLayer مسار ثانوي فقط. لذا وُصِّل web_vitals بنفس المسار المعتمد:
- **ملف جديد:** `components/gtm/WebVitals.tsx` — `useReportWebVitals` (من `next/web-vitals`) → `navigator.sendBeacon("/api/track/web-vitals", …)`. (أُسقط دفع dataLayer → لا اعتماد على تاج GTM + لا double-count.) حدود الكلاينت محصورة (returns null).
- **ملف جديد:** `app/api/track/web-vitals/route.ts` — POST → `trackWebVitals` → `sendGA4Event` (نفس مسار cta-click تماماً).
- **registry:** أُضيف `web_vitals` + `WebVitalsParams` + `trackWebVitals` في `lib/analytics/events-registry.ts`.
- **مركّب في** `app/layout.tsx` بعد `GTMContainer`. يبلّغ LCP·INP·CLS·FCP·TTFB + `page_path` لكل تحميل حقيقي.
- **متحقّق حيّاً (dev):** `POST /api/track/web-vitals 200` ×3 + `[ga4-server] web_vitals → HTTP 204` ×3 (1 curl + **2 beacons من تحميل الصفحة الفعلي**). **GA4 قبِل الحدث (204).** env GA4 محمّلة. tsc ✅.
- ⏳ بناء إنتاج نهائي لهذي الملفات الثلاثة يجي مع بناء ما-قبل-الـpush.

### ملاحظة: CrUX تلقائي (مسار ثانٍ مستقل)
بيانات الميدان لـ **Search Console (CWV report) + PageSpeed Insights** تجي **تلقائياً** من Chrome للمستخدمين الحقيقيين بعد النشر (صفر إعداد) — الأقرب لما يحسبه جوجل. الـ RUM فوق = مراقبتنا التفصيلية per-page في GA4.

- **الـ push = آخر مرحلة** (خالد) — بعدها نراقب الميدان (Search Console + GA4) ونحسّن حسب الأرقام الحقيقية.

---

## ملاحظة دائمة
الـ index/canonical/robots = **قشرة الرئيسي** (S2/S3). تنتقل «معنا» بمعنى: تبقى كما هي في الرئيسي، والجسم الجديد يُزرع تحتها. **ممنوع** نقل `noindex` تبع اللاب.
