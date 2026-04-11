# SEMrush Site Audit — Fix Plan
> Last Updated: 2026-04-11 (pre-push audit: sameAs override + .env cleanup + tags noindex fix)
> Audit: Sat Apr 11 2026 · 100 pages · Site Health: 78% → Target: 90%+
> Source: SEMrush + SEObility + Ahrefs

---

## 🔴 Errors — Fix First

- [x] **SEMR-1** — 93 روابط داخلية مكسورة — ✅ تم بناء `/tags/[slug]` page كاملة + live test مؤكد: `/tags/seo` و `/tags/ai` يعملان، 0 errors. (modonty v1.29.0)
- [x] **SEMR-2** — 85 structured data item خاطئة — ✅ تم الإصلاح: `jsonld-processor.ts` كان يصلح `@type`→`type` فقط في المستوى الأول. أضفنا `fixAtKeywordsDeep()` recursive تصلح كل الـ nested objects. تم regenerate الـ JSON-LD لـ 23 مقال على production DB. Live test مؤكد: كل `@type` و `@id` صح في جميع المستويات. (admin v0.x.x + modonty v1.x.x)
- [x] **SEMR-4** — 10 صفحات تعطي 4XX — ✅ تم بناء `/tags` index page كاملة (`app/tags/page.tsx` + `loading.tsx`). جميع `/tags` و `/tags/[slug]` تعطي 200. (modonty v1.x.x)
- [x] **SEMR-5** — 10 صفحات خاطئة في sitemap.xml — ✅ أضفنا `/tags` و جميع `/tags/[slug]` إلى `app/sitemap.ts`. السيتماب الآن يشمل كل الوسوم. (modonty v1.x.x)

---

## 🟡 Warnings — Fix Second

- [x] **SEMR-6** — 15 صفحة title tag طويل جداً — ✅ تم الإصلاح جذرياً:
  - **Admin validation**: جميع `seoTitle` schemas أصبحت `max(51)` (articles, categories, tags, industries, clients, authors, pages) — server-side + form-level
  - **Admin UI**: `maxLength={51}` على كل input + `CharacterCounter` يُظهر "51 maximum" + hint واضح يشرح أن " - مودونتي" يُضاف تلقائياً
  - **Modonty fallbacks**: كل صفحة تستخدم `title.slice(0, 51)` قبل تمريره لـ `generateMetadataFromSEO` (articles, categories, tags, authors, clients, client sub-pages, search)
  - live test مؤكد: الـ maxLength يحجب الإدخال عند 51 حرف بالضبط في admin.
- [x] **SEMR-7** — 3 صفحات بدون meta description — ✅ تم الإصلاح جذرياً (Done section): أضفنا fallback description ثابتة لكل صفحة تعتمد على DB settings (`app/page.tsx`، `app/categories/page.tsx`، `app/clients/page.tsx`). الـ fallback يُستخدم فقط إذا لم يضبط الأدمن description في الـ settings — وإذا ضبطها، تُستخدم قيمته تلقائياً (spread override). لا يمكن الآن أن تكون أي من هذه الصفحات بدون description. (modonty)
- [x] **SEMR-8** — 5 صفحات فيها أكثر من H1 واحد — ✅ تم الإصلاح: (1) `/categories/page.tsx` — حذف `<h1 sr-only>` الزائد (categories-hero.tsx عنده visible h1 كافٍ). (2) `/clients/page.tsx` — نفس الإصلاح (clients-hero.tsx عنده h1). (3) `FeedContainer.tsx` — تحويل `<h1>` → `<h2>` لأن AUDIT-1 أضاف h1 على homepage، فصارت الصفحة عندها اثنين. الآن كل صفحة عندها H1 واحد فقط. (modonty)
- [x] **SEMR-9** — 7 روابط خارجية مكسورة — ✅ تم الإصلاح الكامل: (1) `twitter.com` → `x.com` في جميع `sameAs` بالـ DB. (2) حذف `future-academy.sa` (domain معطل). (3) حذف `x.com/future_academy_sa` (403 — profile غير موجود). (4) استبدال كل الروابط الوهمية (LinkedIn/X للـ authors والـ clients الاختباريين) بروابط مودونتي الحقيقية (modonty.com، LinkedIn، Instagram، Facebook، YouTube). (5) تنظيف Settings: LinkedIn URL أزيل `/admin/dashboard/`، YouTube أُضيف `https://`. جميع الروابط الآن تعطي 200. (DB)
- [x] **AUDIT-2** — وقت استجابة الهوم بيج 1.88s — ✅ تم الإصلاح بمنهجية Next.js 15 الرسمية:
  1. `getArticlesCached` → `cacheLife("hours")` (كان "minutes" = 60s → cache miss متكرر على Atlas)
  2. `getRecentArticles` → `cacheLife("hours")` (نفس السبب)
  3. `LeftSidebar`: حذف raw `db.category.findUnique()` المباشر → استبداله بـ `getCategoryIdBySlug()` cached مع `cacheLife("hours")` + `cacheTag("categories")`
  4. **لماذا آمن؟** Admin يستدعي `revalidateTag("articles")` و `revalidateTag("categories")` عند كل publish/update/delete → البيانات تتحدث فوراً عند التغيير. الـ cache لا يُكسر إلا بتغيير حقيقي.
  (modonty)

---

## 🟢 Notices — Fix Last

- [x] **SEMR-10** — 20 رابط بدون anchor text — ✅ تم الإصلاح الجذري: (1) `hero-cta.tsx`: روابط السوشيال ميديا في صفحة كل عميل كانت تضع `aria-label` على `<span>` الداخلي بدلاً من `<a>` — نقلنا `aria-label={link.platform.name}` للـ `CtaTrackedLink` مباشرة وجعلنا الـ span `aria-hidden`. هذا يغطي 4 × 5 صفحات = 20 رابط بالضبط. (2) `UserAvatarButton.tsx`: button للـ avatar بدون `aria-label` — أضفنا `aria-label={user.name || "ملف المستخدم"}`. (modonty)
- [x] **SEMR-11** — 9 صفحات orphan (رابط واحد فقط يشير لها) — ✅ تم تحليل الموقع وتحديد الصفحات الـ orphan وإصلاحها جذرياً:
  - **`/tags`** (index) — لم تكن مرتبطة من أي مكان محوري. أضفنا (1) رابط في Footer "الوسوم" → يظهر في كل صفحة، (2) رابط "عرض كل الوسوم" في `ArticleTags` → يظهر في كل مقال فيه وسوم.
  - **`/terms`** — لم تكن مرتبطة من أي مكان. أضفنا رابط "الشروط والأحكام" في Footer (Legal section) → يظهر في كل صفحة.
  - **`/help`** — لم تكن في nav/footer/sidebar. أضفنا (1) رابط "المساعدة" في Footer Quick links، (2) رابط "مركز المساعدة" في More sidebar. الآن `/help` → `/help/faq` + `/contact` كلها مترابطة.
  - **`/contact`** — كانت تُصل فقط من `/help` الـ orphan. الآن تُصل من خلال سلسلة: Footer/Sidebar → `/help` → `/contact`.
  - **`/help/faq`** — نفس المشكلة. الآن تُصل عبر `/help`.
  - ملاحظة: `/subscribe` و `/clients/[slug]/mentions` كلاهما `noindex` — ليستا مشكلة SEO حقيقية.
  (modonty)
- [x] **SEMR-12** — 12 URL تعيد redirect دائم — ✅ تم تحديد المصدر وإصلاحه:
  - **السبب الجذري**: متغيرات البيئة `NEXT_PUBLIC_SOCIAL_*` في `.env` كانت تحتوي على روابط admin/خاطئة تعيد redirect لـ crawlers مجهولين:
    - Facebook: رابط edit-profile admin (يعيد redirect للـ login/canonical)
    - LinkedIn: `/company/111692906/admin/dashboard/` (يعيد redirect للـ canonical)
    - YouTube: `youtube.com/modonty#test1` (خاطئ — يعيد redirect + hash تجريبي)
    - Pinterest: مضبوط على رابط X/Twitter (خطأ في العنوان)
  - **الإصلاح في `.env`**:
    - Facebook: `https://www.facebook.com/profile.php?id=61585093180638` (نظيف، بدون admin params)
    - LinkedIn: `https://www.linkedin.com/company/111692906/` (حذف `/admin/dashboard/`)
    - YouTube: `https://www.youtube.com/@modontycom` (URL صحيح مع `www.`)
    - Pinterest: معطّل (لا حساب Pinterest — commented out)
  - **إصلاح إضافي — `sitemap.ts`**: حذف `/subscribe` من الـ sitemap (صفحة `noindex,nofollow` — لا يجب أن تكون في الـ sitemap). أضفنا `/terms` للـ sitemap.
  (modonty)
- [x] **AUDIT-4** — backlink spam من linkbooster.agency — ✅ Disavow file جاهز في `documents/02-seo/disavow-linkbooster.txt`. **لا ترفعه الآن** — راقب في GSC أولاً. ارفعه فقط إذا: (1) جاءك Manual Action في GSC، أو (2) انخفض ranking بـ 10%+ خلال أسبوعين، أو (3) ظهر 100+ رابط جديد من linkbooster في Ahrefs. إذا لم يحدث شيء خلال 4 أسابيع → Google تجاهلتهم تلقائياً.
- [ ] **AUDIT-5** — حجم ملف الهوم بيج 401 kB — يحتاج: تشغيل `pnpm build:analyze` ثم تطبيق `dynamic()` imports على المكونات الثقيلة.

---

## 🔵 AI Search Bots — تحتاج تحقيق

- [ ] **AI-BOT-1** — ChatGPT-User (OAI-SearchBot) محجوب من 2 صفحة — يجب أن يكون 0. يحتاج: تحديد الصفحتين في SEMrush → "Blocked from AI Search" panel.
- [ ] **AI-BOT-2** — Googlebot محجوب من 2 صفحة — 🚨 يجب أن يكون 0. يحتاج: تحديد الصفحتين فوراً.
- [ ] **AI-BOT-3** — Perplexity-User محجوب من 2 صفحة — يجب أن يكون 0.

---

## ✅ Done

- [x] **SEMR-1** — 93 روابط داخلية مكسورة — ✅ تم بناء `/tags/[slug]` page كاملة. (modonty v1.29.0)
- [x] **SEMR-2** — 85 structured data item خاطئة — ✅ `fixAtKeywordsDeep()` recursive في `jsonld-processor.ts` + regenerate 23 مقال على production. Live test مؤكد. (admin)

- [x] **SEMR-3** — 1,430 resource محجوب في robots.txt — حذف `/_next/` من قاعدة `*` في `app/robots.ts`. تم التحقق من Google Search Central: Googlebot يحتاج CSS/JS للـ rendering. (modonty v1.29.0)
- [x] **AUDIT-1** — الهوم بيج بدون H1 — أُضيف `<h1 className="sr-only">مودونتي — منصة المحتوى العربي</h1>` في `app/page.tsx:68`. (modonty v1.29.0)
- [x] **SEMR-4** — 10 صفحات تعطي 4XX — ✅ بناء `/tags` page كاملة + live test: `/tags` و `/tags/seo` و `/tags/ai` كلها 200. (modonty v1.x.x)
- [x] **SEMR-5** — 10 صفحات خاطئة في sitemap.xml — ✅ أضفنا `/tags` + كل `/tags/[slug]` لـ `sitemap.ts`. تم التحقق من `sitemap.xml` مباشرة. (modonty v1.x.x)
- [x] **SEMR-6** — 15 صفحة title tag طويل جداً — ✅ max(51) في كل admin schemas + maxLength على كل form inputs + slice(0,51) على كل modonty fallback titles. Live test مؤكد.
- [x] **SEMR-7** — 3 صفحات بدون meta description — ✅ fallback descriptions ثابتة في `app/page.tsx` + `app/categories/page.tsx` + `app/clients/page.tsx`. لا يمكن أن تكون هذه الصفحات بدون description مهما كانت الـ DB settings. (modonty)
- [x] **SEMR-8** — 5 صفحات فيها أكثر من H1 — ✅ (1) `/categories/page.tsx` حذف sr-only h1 الزائد (categories-hero.tsx عنده visible h1). (2) `/clients/page.tsx` نفس الإصلاح. (3) `FeedContainer.tsx` h1→h2 (AUDIT-1 أضاف h1 للهوم بيج فصار اثنين). كل صفحة الآن عندها H1 واحد فقط. (modonty)
- [x] **SEMR-9** — 7 روابط خارجية مكسورة — ✅ استبدال كل الروابط الوهمية (clients + authors) بروابط مودونتي الحقيقية (LinkedIn، Instagram، Facebook، YouTube). twitter.com→x.com في الـ DB. تنظيف Settings: LinkedIn أُزيل `/admin/dashboard/`، YouTube أُضيف `https://`. جميع الروابط الآن 200. (DB + Settings)
- [x] **AUDIT-3** — language attribute — ليست مشكلة حقيقية. `lang="ar" dir="rtl"` موجود في `app/layout.tsx:52`. كان crawler artifact من SEObility (JS rendering disabled).

---

## بعد كل الإصلاحات
1. اضغط "Rerun campaign" في SEMrush
2. الهدف: Site Health ≥ 90%
3. أعد تقديم sitemap في Google Search Console إن تغيّر `sitemap.ts`
4. اختبر 3 مقالات بـ Google Rich Results Test للتأكد من structured data
