# MASTER TODO — MODONTY
> **آخر تحديث:** 2026-04-13 — QAUDIT-M1 تشخيص + PostCard redesign + Client page review added
> **الإصدار الحالي:** admin v0.34.0 | modonty v1.31.0 | console v0.1.2
> المهام المنجزة في → [MASTER-DONE.md](MASTER-DONE.md)

---

## 🔴 HIGH — Modonty: صفحة العميل — مراجعة UI/UX شاملة

> **فحص مباشر:** 2026-04-13 | Desktop 1280px + Mobile 375px
> **الملف الرئيسي:** `modonty/app/clients/[slug]/page.tsx` + مكوناته

### 🔴 Critical

- [ ] **CP-1** — **Hero banner: نص ثابت Hardcoded**
  - النص الحالي: "الدليل الشامل لـ SEO..." و"رحلتك لتصدر الصفحة الأولى..." — مكتوب مباشرة في الكود
  - المطلوب: يأتي من DB (مرتبط بـ JBRSEO-ADMIN-1 الموجود في الـ backlog)
  - كل عميل يحتاج hero text خاص به — حالياً كل العملاء يعرضون نفس النص

- [ ] **CP-2** — **وصف العميل بالإنجليزية**
  - "Jabr SEO is a digital marketing agency specialized in Search Engine Optimization..." — إنجليزي في منصة عربية
  - يتكرر مرتين: في profile section + في sidebar "ملخص الأعمال" — تكرار غير ضروري
  - المطلوب: الوصف العربي أولاً (من DB `description` field) أو على الأقل RTL-aware layout

- [ ] **CP-3** — **Mobile hero: مضغوط وغير مقروء**
  - على 375px الـ hero banner مضغوط جداً — النص يكاد لا يُقرأ
  - المطلوب: تقليل ارتفاع الـ hero على موبايل + زيادة حجم الخط + تحسين contrast

### 🟡 Medium — UX

- [ ] **CP-4** — **Tabs navigation: تسميات مقطوعة على موبايل**
  - "المتاب" بدلاً من "المتابعون" — النص ينقطع داخل الـ tab button
  - المطلوب: horizontal scroll ناعم + عدم قطع التسميات

- [ ] **CP-5** — **Sidebar "ملخص الأعمال": تكرار + قيمة منخفضة**
  - يعرض نفس نص الوصف الموجود في الـ profile section مباشرة فوقه
  - المقترح: إزالة التكرار — اعرض بدله: إحصائيات العميل (مقالات / مشاهدات / تفاعل) بشكل visual

- [ ] **CP-6** — **Sidebar "الصور": صغير جداً ومحدود**
  - 4 thumbnails صغيرة جداً — لا تعطي قيمة بصرية حقيقية
  - المقترح: gallery بـ hover preview أو إزالته من الـ sidebar وإضافته في تاب "الصور" فقط

- [ ] **CP-7** — **Stats row: تصميم ضعيف**
  - "متابع: ١٠٠ مقال: ١٠ مشاهدة: ١٠٠٠" — كل شيء على سطر واحد inline بدون فصل بصري
  - المقترح: grid صغيرة (3 خانات) مع أيقونة + رقم كبير + تسمية صغيرة تحته

- [ ] **CP-8** — **لا يوجد تحديد للـ feed المعروض**
  - المستخدم يدخل الصفحة ولا يعرف إذا كان يرى "الأحدث" أو "الأكثر مشاهدة" أو "المختارة"
  - المطلوب: heading فوق الـ feed "أحدث المقالات" + عدد النتائج

- [ ] **CP-9** — **زر "متابعة": بدون feedback واضح**
  - بعد الضغط على متابعة لا يتغير شيء بصري واضح (لا animation، لا تغيير في النص)
  - المطلوب: toggle state واضح "متابعة ← إلغاء المتابعة" + optimistic update

- [ ] **CP-10** — **Mobile: Bottom nav يعرض "العملاء" كـ active**
  - على صفحة تفاصيل العميل، الـ bottom nav يضيء تاب "العملاء" — صحيح
  - لكن لا يوجد back button للرجوع لقائمة العملاء من الـ bottom nav
  - المقترح: breadcrumb مرئي على موبايل فوق الـ hero أو back arrow

### 🟢 Low

- [ ] **CP-11** — **تاب "الريلز" و"الإعجابات": غير ملائمة لعملاء B2B**
  - Reels وLikes كتبويبات رئيسية في صفحة عميل B2B تبدو غريبة
  - المقترح: تقييم الحذف أو إخفاء التابات الفارغة تلقائياً (`articleCount === 0 → hidden`)

- [ ] **CP-12** — **شارة التوثق ✓ غير بارزة بما يكفي**
  - الشارة الخضراء صغيرة ومدمجة مع الاسم
  - المقترح: pill بارز أكثر "موثق ✓" بجانب الاسم

- [ ] **CP-13** — **زر "مشاركة" بدون تسمية**
  - أيقونة share بدون نص — على mobile المستخدم لا يعرف وظيفته
  - المطلوب: `aria-label` + tooltip عند hover أو إضافة نص "مشاركة" على desktop

---

## 🟡 MEDIUM — Admin: Archive toast notification

- [ ] **ARCH-1** — بعد الضغط على Archive أو Unarchive، يطلع toast رسالة تأكيد:
  - Archive → `"تم أرشفة المقال — لن يظهر في المدونة"`
  - Unarchive → `"تم إلغاء الأرشفة — المقال عاد للحالة السابقة"`
  - File: `admin/app/(dashboard)/articles/[id]/components/archive-article-button.tsx`
  - ✅ Dialog تأكيد تم عمله (admin v0.33.0) — الـ toast لسه باقي

---

## 🔴 CRITICAL — Admin: Push pending (article editor fixes)

> هذه الإصلاحات جاهزة وتم اختبارها — تحتاج push واحد.

- [x] **PUSH-1** — shadcn AlertDialog بالعربي بدل native "Leave site?" dialog ✅
- [x] **PUSH-2** — unlock seoTitle — `max(200)` في `article-server-schema.ts` ✅ (كان محلولاً مسبقاً)
- [x] **PUSH-3** — `maxLength={60}` على SEO Title + `maxLength={160}` على SEO Description ✅
- [ ] **PUSH-4** — رسائل خطأ عربية واضحة بدل رسائل تقنية مخيفة (`update-article.ts`)
- [ ] **PUSH-5** — toast يستخدم `save_failed` بدل `server_error` (`article-form-navigation.tsx`)
- [x] **PUSH-6** — Title (H1) counter: `max={80}` + inline hint عند التجاوز (`basic-section.tsx`) ✅
- [x] **PUSH-7** — Slug: يتابع التايتل في `mode=new`، مقفل في `mode=edit` (`article-form-context.tsx`) ✅
- [x] **PUSH-8** — Slug section: badge full-width + URL preview `https://www.modonty.com/articles/[slug]` + تحذير > 50 حرف مع أنيميشن ✅

---

## 🔴 HIGH — Admin: SEO Copy Fields — جرد كامل

> **الهدف:** التأكد أن كل الحقول النصية لـ SEO في الأدمن (title + description) متوافقة مع البيست براكتس.
> **المعيار المتفق عليه:** SEO Title = 50–60 حرف | SEO Description = 120–160 حرف

- [ ] **SCOPY-1** — جرد كل الصفحات التي تحتوي على `seoTitle` / `seoDescription` input في الأدمن
  - مقالات (meta-tags-step) ✅ تم إصلاحه
  - فئات (categories)
  - وسوم (tags)
  - عملاء (clients)
  - صفحة الـ Settings (site-wide SEO)
  - أي entity تانية عندها SEO fields
- [ ] **SCOPY-2** — كل حقل `seoTitle` في الأدمن: `maxLength={60}` + `CharacterCounter max={60}` + placeholder عربي موحّد
- [ ] **SCOPY-3** — كل حقل `seoDescription` في الأدمن: `maxLength={160}` + `CharacterCounter max={160}` + placeholder عربي موحّد
- [ ] **SCOPY-4** — كل analyzer/validator يستخدم range 50–60 للعنوان و120–160 للوصف (لا قيم مختلفة في أماكن مختلفة)
- [ ] **SCOPY-5** — server schemas: تأكد أن `max()` في Zod لا يحجب الحفظ (soft limit في الـ UI فقط، server يقبل الحفظ دائماً)

---

## 🔴 CRITICAL — Admin: Auth على Server Actions ناقص

> يجب إصلاحه قبل أي إطلاق للعملاء.

- [ ] `contact-messages-actions.ts` — إضافة auth على: delete, updateStatus, markAsRead, markAsReplied
- [ ] `faq-actions.ts` — إضافة auth على: create, update, delete, reorder, toggleStatus
- [ ] `upload-image.ts` — إضافة auth على: uploadImage
- [ ] `upload-avatar.ts` — إضافة auth على: uploadAvatar
- [ ] `send-feedback.ts` — إضافة auth على: sendFeedback
- [ ] `cascade-all-seo.ts` — إضافة auth على: cascadeSettingsToAllEntities

---

## 🔴 CRITICAL — DB Query Audit (الثلاثة تطبيقات)

> **السبب:** اكتشفنا أن صفحة المقالات كانت تستغرق 20 ثانية بسبب جلب حقل `content` الكامل لكل مقال في القائمة.
> **القاعدة:** كل `findMany` يجب أن يجلب فقط الحقول التي تُعرض فعلاً في الـ UI.
> **ما تم إصلاحه:** articles، categories، tags، contact-messages في الـ admin.
> **ما تبقى:**

### Admin — queries لم تُراجع بعد
- [ ] **QAUDIT-A1** — `faq-actions.ts` → `getFAQs()` — يجلب `question` + `answer` الكامل، الجدول يعرض فقط question مقطوعاً
- [ ] **QAUDIT-A2** — `authors/actions` → `getAuthors()` — مراجعة الحقول المجلوبة مقابل الجدول
- [ ] **QAUDIT-A3** — `industries/actions` → `getIndustries()` — مراجعة الحقول
- [ ] **QAUDIT-A4** — `media/actions` → `getMedia()` — تأكيد أنه محسّن (الـ audit أشار لذلك)
- [ ] **QAUDIT-A5** — `dashboard` queries — analytics + stats queries بدون حد `take`

### Modonty — queries لم تُراجع

#### 🔴 CRITICAL — QAUDIT-M1: `getArticles` في الـ feed — تشخيص مكتمل

> **التاريخ:** 2026-04-13 | **الملف:** `modonty/app/api/helpers/article-queries.ts`
> **الحالة:** ✅ مشخَّص — ينتظر الإصلاح

**المشكلة الجذرية:**
`getArticlesCached` يستخدم `include` على الـ Article بدون `select` على المستوى الأعلى، مما يجعل Prisma يجلب **كل حقول الـ MongoDB Document** لكل مقال في الـ feed.

**الحقول التي تُجلب ولا تُستخدم في الـ feed:**

| الحقل | الحجم | الاستخدام في Feed |
|---|---|---|
| `content` | ~5-20KB/مقال | ❌ لا — `mapArticleToResponse` يمررها، الـ feed يتجاهلها |
| `jsonLdStructuredData` | ~2-5KB/مقال | ❌ لا |
| `articleBodyText` | ~3-10KB/مقال | ❌ لا |
| `nextjsMetadata` | ~1-2KB/مقال | ❌ لا |
| `jsonLdValidationReport` | ~1KB/مقال | ❌ لا |
| `breadcrumbPath` | JSON array | ❌ لا |
| `semanticKeywords` | JSON array | ❌ لا |
| `seoTitle, seoDescription, canonicalUrl` | ~300 chars | ❌ لا |
| `ogArticle*` (3 fields) | قليل | ❌ لا |
| `citations, seoKeywords` | String arrays | ❌ لا |
| `author.bio` | نص | ❌ لا — الـ Feed يستخدم الاسم والصورة فقط |
| `author.slug` | string | ❌ لا — غير موجود في FeedPost |
| `featuredImage.altText` | string | ❌ لا — الـ Feed يستخدم URL فقط |
| `wordCount` | int | ❌ لا |

**الهدر التقديري:**
- ~15-40KB لكل مقال × 20 مقال لكل صفحة = **300KB - 800KB** تُجلب من MongoDB وتُرمى فوراً
- هذا يحدث في: feed الرئيسية + loadMore + كل صفحة تستخدم `getArticles`

**ملاحظة مهمة:** `getArticleBySlug` (صفحة المقال الكاملة) **يبقى بدون تغيير** — يحتاج `content` وحقول SEO كاملة.

**الإصلاح المطلوب:**
- الملف الوحيد: `modonty/app/api/helpers/article-queries.ts`
- استبدال `include` بـ `select` في 4 functions: `getArticlesCached`, `getFeaturedArticles`, `getRecentArticles`, `getTrendingArticles`
- إضافة: `feedArticleSelect` const + `FeedArticlePayload` type + `mapFeedArticleToResponse`
- **لا يحتاج تغيير في أي component** — فقط الـ query layer

- [ ] **QAUDIT-M1-FIX** — تطبيق الإصلاح: `select` بدل `include` في الـ 4 feed functions
  - File: `modonty/app/api/helpers/article-queries.ts`
  - الحقول المطلوبة: `id, title, slug, excerpt, datePublished, createdAt, featured, readingTimeMinutes` + relations

- [ ] **QAUDIT-M2** — `getComments` — هل يجلب حقول غير ضرورية؟
- [ ] **QAUDIT-M3** — `getFaqs` في صفحة المقال — هل يجلب أكثر من المطلوب؟
- [ ] **QAUDIT-M4** — `getRelatedArticles` — مراجعة الـ select

### Console — queries لم تُراجع
- [ ] **QAUDIT-C1** — كل الـ queries في console — مراجعة شاملة قبل أول عميل حقيقي

### المعيار للمراجعة
لكل query:
1. ما الحقول التي تظهر في الـ UI؟
2. هل يوجد `take` لتحديد الحد الأقصى؟
3. هل queries مستقلة تعمل بالتوازي (`Promise.all`)؟
4. هل يُجلب `content`/`answer`/`body` في list views؟ (ممنوع)

---

## ⚠️ Vercel — إجراءات يدوية مطلوبة

- [ ] **AUTH_SECRET** — انسخ القيمة الجديدة لـ Vercel → Settings → Environment Variables
  `rGtnuhR8EeViMTAbFAF9bhL3sH38iRdxsovdyXRnoJI=`
  ⚠️ بعد التحديث: أعد deploy → كل الجلسات ستنتهي (متوقع)
- [ ] **NEXTAUTH_URL** — تأكد أن Vercel عنده `NEXTAUTH_URL=https://www.modonty.com`
- [ ] **SEMrush** — اضغط "Rerun Campaign" بعد اكتمال آخر deploy → الهدف: Site Health ≥ 90%

---

## 🔴 HIGH — Admin: UX Fixes

- [ ] **Inline Media Picker** — عند إضافة صورة داخل محتوى المقال، Dialog يفتح (رفع جديد أو اختيار من المكتبة) بدون مغادرة الصفحة. الحالي: يضطر لمغادرة المقال → Media → رفع → رجوع.
- [ ] **Media Gallery — صور مقطوعة** — `media-grid.tsx:337` يستخدم `object-cover` داخل `aspect-[4/3]` → صور عريضة تُقطع. الإصلاح: `object-contain` + `bg-muted`.
- [ ] **Article Editor — Image Gallery مقطوعة** — نفس مشكلة `object-cover` داخل editor Image Gallery. الإصلاح: `object-contain` + `bg-muted`.
- [ ] **"Featured" label غامض** — حقل "Featured Image" أفضل تسميته "Cover Image" أو "Hero Image". الـ checkbox "Featured" في Publish step أفضل تسميته "Highlight on Homepage" مع وصف واضح.
- [ ] **رسالة خطأ النشر مضللة** — عندما نقاط SEO أقل من 60%، تظهر رسالة "حدث خطأ في الخادم" — العميل يظن النظام معطوب. الإصلاح: رسالة محددة مثل "لا يمكن النشر — نقاط SEO 51% (الحد الأدنى 60%). حسّن حقول SEO أولاً."
- [ ] **SEO Publish Gate — حظر النشر بدون seoDescription** — إضافة validation في `publish-article-action.ts`: إذا `seoDescription` فارغ أو < 50 حرف → حظر النشر + رسالة واضحة.
- [ ] **Media picker search لا تفلتر** (OBS-001) — في Article Editor "Select Featured Image"، الكتابة في search box لا تفلتر النتائج.
- [ ] **Media edit: لا يوجد حقل Client** (OBS-002) — بعد الرفع، لا يمكن نقل الصورة لعميل آخر. الإصلاح: إضافة Client dropdown في `/media/[id]/edit`.
- [ ] **Media upload: client assignment غير واضح** (OBS-004) — الرفع من Global Media يُعيّن العميل عشوائياً. يجب: selector إلزامي عند الرفع، أو pool "General" مرئي لكل العملاء.

---

## 🔴 HIGH — Admin: JBRSEO نصوص من DB

- [ ] **JBRSEO-ADMIN-1** — نصوص ClientsHero B2B تأتي من الأدمن (DB) لا hardcoded
  الحقول: `heroHeadline`, `heroSubheadline`, `heroBullets[]`, `heroCtaText`, `heroCtaUrl`
- [ ] **JBRSEO-ADMIN-2** — نص "مرحباً بك في مودونتي" في FeedContainer يأتي من الأدمن
  الحقول: `platformTagline` + `platformDescription`
  الملف الحالي: `modonty/components/feed/FeedContainer.tsx:27-28`

---

## 🔴 HIGH — Modonty: حسابات المستخدمين (يتطلب Resend)

> ✅ Resend جاهز — `modonty.com` verified على eu-west-1، `resend` مثبّت في modonty، `RESEND_FROM` محدّث في admin وmodonty.

- [x] اشترك في Resend (resend.com) واحصل على API key
- [x] أضف `RESEND_API_KEY` لـ `.env` + domain موثّق (`modonty.com`)
- [x] **USR-R1** — Password Reset (نسيت كلمة المرور) — صفحة + action + إيميل ✅ live tested
- [ ] **USR-R2** — Email Verification عند التسجيل — confirmation link
- [ ] **USR-R3** — Notification Settings (تفضيلات الإشعارات بالإيميل)
- [ ] **USR-L1** — إشعارات الرد على التعليق بالإيميل
- [ ] **USR-L2** — Session management: logout من أجهزة أخرى
- [ ] **USR-N1** — FAQ reply notification: صفحة الإشعارات تعرض "اختر رسالة" عند الضغط على `faq_reply` — تحتاج case خاص يجيب بيانات FAQ ويعرض السؤال والرد في الجانب الأيمن

---

## 🔴 HIGH — Modonty: Subscriptions & Email

- [ ] Welcome email عند الاشتراك في النشرة (`/api/subscribers`)
- [ ] إصلاح `/api/news/subscribe` — ربط بـ Resend
- [ ] اختبار Email delivery end-to-end قبل الإطلاق

---

## 🟡 MEDIUM — SEO

- [ ] **AUDIT-5** — bundle size 401kB → `pnpm build:analyze` + dynamic imports على المكونات الثقيلة *(مؤجل بقرار سابق)*
- [ ] **SEMR-7b** — fallback descriptions من الأدمن بدلاً من hardcoded: إضافة حقل `defaultDescription` في Settings + تحديث `getHomePageSeo`/`getCategoriesPageSeo`/`getClientsPageSeo`
- [ ] **SEO-A3** — `og:site_name` = اسم العميل أم "مودونتي"؟ ← يحتاج قرار
- [ ] **SEO-A4** — صورة المقال في JSON-LD بدون width/height — التحقق من Prisma Media model + إضافة الحقول
- [ ] **SEO-FC1** — Admin JSON-LD re-check: كل entity (Article, Category, Tag, Client, Author, Industry) عبر Google Rich Results Test
- [ ] **SEO-FC2** — Create flow: إنشاء article/tag/category → تحقق JSON-LD + sitemap + 200
- [ ] **SEO-FC3** — Update flow: تعديل title/description → تحقق revalidatePath + metadata محدّث + DB JSON-LD
- [ ] **SEO-FC4** — Delete flow: حذف → 404 + ليس في sitemap + لا broken links
- [ ] **SEO-FC5** — Metadata propagation: تغيير Site Name → cascade وصل لكل الكيانات
- [ ] **SEO-FC6** — `/robots.txt` + `/sitemap.xml` live test بعد كل push كبير

---

## 🟡 MEDIUM — Modonty: صفحات ناقصة

- [ ] بناء `/industries` listing page (cache موجود في `industriesPageMetaTags`)
- [ ] بناء `/articles` listing page (cache موجود في `articlesPageMetaTags`)

---

## 🟡 MEDIUM — Console: اختبار الـ Dashboard

> اختبار يدوي شامل للـ Console — مطلوب مرة واحدة قبل أول عميل حقيقي.

**Dashboard Overview:**
- [ ] **C1** عدد المشتركين صحيح
- [ ] **C2** عدد المقالات (منشورة + قيد الانتظار)
- [ ] **C3** المشاهدات (7 أيام) — رسم بياني يومي
- [ ] **C4** أفضل المقالات بالمشاهدات
- [ ] **C5** النشاط الأخير (تحويلات، تعليقات، مشتركون)

**Analytics:**
- [ ] **C7** المشاهدات (7 أيام + 30 يوم)
- [ ] **C10** متوسط وقت القراءة + عمق التمرير + معدل الارتداد
- [ ] **C11** أفضل المقالات (مشاهدات، تفاعل، تحويلات)
- [ ] **C12** نقرات CTA مفصّلة
- [ ] **C14** Core Web Vitals (LCP, CLS, INP)

**Leads:**
- [ ] **C15** قائمة العملاء مع شارة HOT/WARM/COLD
- [ ] **C16** النقاط 0-100 تظهر بشكل صحيح
- [ ] **C17** زر "Refresh Scores" يعمل

**Moderation:**
- [ ] **C22** التعليقات قيد الانتظار تظهر
- [ ] **C23** زرا الموافقة والرفض يعملان
- [ ] **C25** الأسئلة قيد الانتظار تظهر
- [ ] **C26-C28** نموذج الإجابة + الحفظ + الظهور في الموقع العام
- [ ] **C29-C30** رسائل نموذج التواصل + خيار "تم الرد"

---

## 🟡 MEDIUM — Modonty: Article Page UX (ناقص)

- [ ] **A7** — Badge "نسخة صوتية" بدون مشغل — إذا `article.audioUrl` موجود → audio player تحت العنوان مباشرة
- [ ] **A8** — TOC لا يُبرز القسم الحالي — Intersection Observer → active class على الـ TOC item
- [ ] **A9** — زر "اقرأ المزيد" بدون aria-label — `aria-label={\`اقرأ المزيد: ${article.title}\`}`
- [ ] **MB1** — نص النشرة ثابت — إضافة حقل `newsletterCtaText` في إعدادات العميل (admin) بقيمة افتراضية "اشترك الآن"

---

## 🟡 MEDIUM — Mobile Phase 2

> Mockup جاهز في `design-preview/page.tsx` — ينقل للـ production.

- [ ] **MOB1** — انقل bottom bar من `fixed bottom-16` إلى `sticky top-14`
- [ ] **MOB2** — أضف client avatar + "اسأل العميل" في Zone 1
- [ ] **MOB3** — أضف Newsletter trigger (🔔) في الشريط
- [ ] **MOB4** — أضف views (👁) + questions (❓) في meta row
- [ ] **MOB5** — Newsletter overlay على الصورة الرئيسية
- [ ] **MOB6** — حدّث الـ Sheet بالمحتوى الكامل
- [ ] **MOB7** — وحّد نص CTA: "اسأل العميل" في كل مكان

---

## 🟡 MEDIUM — Chatbot Phase 2

- [ ] **CHAT-FAQ1** — Admin: صفحة أسئلة المستخدمين مجمّعة حسب التكرار
- [ ] **CHAT-FAQ2** — Admin: زر "حوّل لـ FAQ" → ينشئ ArticleFAQ بضغطة زر
- [ ] **CHAT-FAQ3** — Admin: filter حسب الفئة / العميل / المصدر (DB / web)
- [ ] **CHAT-FAQ4** — Modonty: FAQ المحوَّلة تظهر على صفحة المقال للزوار

---

## 🟡 MEDIUM — SEO Infinite Scroll (بعد الإطلاق)

- [ ] **SEO-INF1** — دعم `/?page=N` في `page.tsx` — HTML مختلف لكل صفحة
- [ ] **SEO-INF2** — إضافة `<a>` links لـ "الصفحة التالية / السابقة" في نهاية الـ feed
- [ ] **SEO-INF3** — `pushState` في `InfiniteArticleList` يحدّث الـ URL عند كل batch
- [ ] **SEO-INF4** — canonical tag لكل `/?page=N` يشير لنفسه

---

## 🟢 LOW — JBRSEO تحسينات مستقبلية

- [ ] **JBRSEO-7** — صفحة `/about`: إضافة قسم "للشركات والأعمال"
- [ ] **JBRSEO-8** — Analytics: تتبع النقرات على جميع CTAs الموجهة لـ jbrseo.com

---

## 🟢 LOW — Admin: Nice to Have

- [ ] Centralize all toast messages in one JSON file
- [ ] Split view preview for articles
- [ ] Article templates (news, how-to, listicle)

---

## 🟢 LOW — Production Readiness (للإطلاق الرسمي)

- [ ] Rate limiting (Upstash Redis) — 100 req/min لـ subscribe، 10/min لـ contact
- [ ] Sentry error monitoring — free tier 5K events/month
- [ ] MongoDB Atlas automatic backups (7-day retention)
- [ ] Cloudinary auto-compression (`q_auto, f_auto, WebP`)
- [ ] Validate image file size عند الرفع (max 5MB, warn if >2MB)

---

## 🟢 LOW — Future Features

- [ ] DESIGNER role (Media-only access)
- [ ] Role-based route protection per role
- [ ] User action logging (who did what)
- [ ] AI content suggestions في الأدمن
