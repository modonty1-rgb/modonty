# دليل منع مشاكل SEO — مودونتي
> **الغرض:** مرجعية دائمة لكل مشاكل SEMrush التي واجهناها + قواعد صارمة لمنع تكرارها.
> آخر تحديث: 2026-04-11 (بعد إتمام Audit الأول الكامل)
> المصادر: [SEMrush Site Audit](https://www.semrush.com/siteaudit/) · [Google Search Central](https://developers.google.com/search/docs) · [schema.org](https://schema.org) · [Next.js Docs](https://nextjs.org/docs)

---

## ⚡ القاعدة الذهبية قبل كل push

```
1. هل أضفت صفحة جديدة؟         → اتبع Checklist-A (صفحات جديدة)
2. هل عدّلت JSON-LD؟            → اتبع Checklist-B (Structured Data)
3. هل عدّلت robots.txt/sitemap?  → اتبع Checklist-C (Crawlability)
4. هل أضفت روابط خارجية؟       → اتبع Checklist-D (External Links)
5. هل عدّلت Layout أو Navigation? → اتبع Checklist-E (Navigation)
```

---

## 🔴 المشاكل الحرجة (Errors)

---

### SEMR-1 + SEMR-4 — روابط داخلية مكسورة / صفحات 4XX

**المشكلة التي وقعنا فيها:**
أضفنا وسومًا (tags) على المقالات في الـ DB وربطنا روابط `/tags/[slug]` عليها — لكننا لم نبنِ الصفحة نفسها. النتيجة: 93 رابط داخلي يشير لصفحات تعطي 404.

**القاعدة:**
> **لا تُضف رابطًا لصفحة لم تبنِها بعد.**
> أي entity تُضاف في الـ DB (tag, category, author, client) لازم يكون لها page مبنية ومُختبرة قبل الـ push.

**الفحص الإجباري:**
- [ ] كل رابط `<Link href="...">` جديد تضيفه → افتح الصفحة في المتصفح وتأكد من 200
- [ ] كل entity جديدة في الـ DB → تأكد أن الـ dynamic route موجود في `app/`
- [ ] بعد كل push: شغّل SEMrush Site Audit → **Internal Links** → تأكد 0 broken

**المصدر:** [Google: Fix crawl errors](https://developers.google.com/search/docs/crawling-indexing/fix-crawl-errors)

---

### SEMR-2 — JSON-LD Structured Data خاطئة

**المشكلة التي وقعنا فيها:**
`jsonld-processor.ts` كان يصلح `@type` فقط في المستوى الأول من الـ JSON-LD object، لكن الـ nested objects (مثل `author`, `publisher`, `mainEntity`) ظلّت بـ `type` بدون `@`. نتيجة: 85 structured data item مرفوضة من Google.

**القاعدة:**
> **أي دالة تعالج JSON-LD لازم تكون recursive.**
> الـ JSON-LD يحتوي objects متداخلة. أي fix على المستوى الأول فقط → سيفشل في الـ nested objects.

**الفحص الإجباري:**
- [ ] بعد كل تغيير في JSON-LD → اختبر في [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] تأكد أن كل `@type` و `@id` و `@context` بـ `@` في جميع المستويات
- [ ] لا تستخدم `type` بدون `@` في أي JSON-LD object

**مثال خاطئ:**
```json
{
  "@type": "Article",
  "author": { "type": "Person" }  ← خطأ: يجب @type
}
```

**مثال صحيح:**
```json
{
  "@type": "Article",
  "author": { "@type": "Person" }  ← صحيح
}
```

**المصدر:** [Google: Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) · [schema.org JSON-LD](https://json-ld.org/)

---

### SEMR-3 — robots.txt يحجب ملفات CSS/JS

**المشكلة التي وقعنا فيها:**
`app/robots.ts` كان يحجب `/_next/` بـ `Disallow: /_next/`. هذا يمنع Googlebot من تحميل CSS وJS اللازمة لـ rendering الصفحة، فلا يرى المحتوى كما يظهر للمستخدم.

**القاعدة:**
> **لا تحجب أبدًا `/_next/` أو `/_next/static/` أو `/_next/image/` في robots.txt.**
> Googlebot يحتاج هذه الملفات ليُصيّر (render) الصفحة. حجبها = Google يرى صفحة فارغة.

**robots.ts الصحيح لـ Next.js:**
```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/'],
        // ❌ لا تضف: disallow: ['/_next/']
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
```

**المصدر:** [Google Search Central: Block crawling](https://developers.google.com/search/docs/crawling-indexing/block-indexing) · [Vercel: robots.txt](https://vercel.com/guides/robots-txt)

---

## 🟡 التحذيرات (Warnings)

---

### SEMR-6 — Title Tag طويل (أكثر من 60 حرف)

**المشكلة التي وقعنا فيها:**
`generateMetadataFromSEO()` يُضيف ` - مودونتي` تلقائيًا بعد الـ title. لكن الـ admin لم يكن يعرف هذا، فكان يكتب عنوانًا من 60 حرف → النتيجة 70+ حرف. Google يقطع العنوان في نتائج البحث.

**القاعدة:**
> **title موقعك = ما يكتبه الأدمن (max 51 حرف) + " - مودونتي" (9 أحرف) = 60 حرف إجمالي.**
> 51 هو الحد الأقصى الذي يجب أن يُحدَّد في كل schema + form input + fallback.

**التطبيق الإجباري في كل entity:**
```typescript
// Zod Schema (admin validation):
seoTitle: z.string().max(51, "الحد الأقصى 51 حرفًا (+ ' - مودونتي' = 60 إجمالاً)").optional()

// Form Input (admin UI):
<Input maxLength={51} />
<CharacterCounter max={51} hint="' - مودونتي' تُضاف تلقائياً" />

// Modonty fallback (كل page.tsx):
title: (dbTitle || fallbackTitle).slice(0, 51)
```

**المصدر:** [Google: Title tags best practices](https://developers.google.com/search/docs/appearance/title-link) · [Moz: Title tag length](https://moz.com/learn/seo/title-tag)

---

### SEMR-7 — صفحات بدون Meta Description

**المشكلة التي وقعنا فيها:**
صفحات مثل Homepage و Categories و Clients تعتمد على `metadata` من الـ DB. إذا لم يضبط الأدمن description في الـ Settings → الصفحة تُنشر بدون أي description.

**القاعدة:**
> **كل `page.tsx` لازم يكون فيه fallback description ثابت.**
> البيانات من الـ DB هي الأولوية، لكن إذا لم تكن موجودة، الـ fallback ينقذ الموقف.

**النمط الصحيح:**
```typescript
export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = await getPageSeo();
  return {
    // ✅ Fallback أولًا — DB value يتغلّب عليه (spread override)
    description: "وصف افتراضي واضح لا يتجاوز 160 حرفًا",
    ...(metadata ?? {}),
  };
}
```

**فحص إجباري:**
- [ ] كل `page.tsx` جديد → تأكد أن `description` موجود حتى بدون DB data
- [ ] بعد push: افتح `view-source:https://modonty.com/[page]` وابحث عن `meta name="description"`

**المصدر:** [Google: Meta description](https://developers.google.com/search/docs/appearance/snippet#meta-descriptions)

---

### SEMR-8 — أكثر من H1 واحد في الصفحة

**المشكلة التي وقعنا فيها:**
- صفحات categories/clients كانت تحتوي `<h1 className="sr-only">` + `<h1>` visible في الـ Hero component.
- بعد إضافة `<h1 sr-only>` للـ Homepage (AUDIT-1)، أصبح `FeedContainer` يحتوي h1 ثانيًا.

**القاعدة:**
> **صفحة واحدة = H1 واحد فقط، ظاهر أو مخفي بـ sr-only.**
> الـ `sr-only` لا يعني "invisible to SEO" — Google يقرأه.

**عند إضافة أي H1 جديد:**
- [ ] ابحث في الصفحة كلها (بما فيها الـ components) عن أي `<h1` موجود
- [ ] الـ Hero component عنده h1؟ → لا تضف h1 ثانيًا في الـ page.tsx
- [ ] الـ Layout يحتوي h1 مشترك؟ → كل sub-pages تبدأ بـ h2

**فحص سريع:**
```bash
# تأكد أن صفحة معينة ليس فيها أكثر من h1 واحد:
curl -s https://modonty.com/[page] | grep -i "<h1"
```

**المصدر:** [Google: Heading elements](https://developers.google.com/search/docs/appearance/visual-elements-gallery#heading) · [MDN: H1](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements)

---

### SEMR-9 — روابط خارجية مكسورة

**المشكلة التي وقعنا فيها:**
- بيانات تجريبية في الـ DB (clients, authors) بروابط وهمية أو منتهية
- `twitter.com` في `sameAs` → يجب `x.com`
- URLs لـ domains معطّلة (future-academy.sa)
- LinkedIn/YouTube URLs في الـ Settings بها `/admin/dashboard/` و بدون `https://`

**القواعد:**
> 1. **لا تدفع بيانات تجريبية إلى production.**
> 2. **Twitter انتهى — استخدم `x.com` دائمًا.**
> 3. **Social URLs في `.env` والـ DB لازم تكون الـ public page URL، ليس admin URL.**

**فحص إجباري لكل Social URL:**
```
✅ https://x.com/[handle]                      — صحيح
✅ https://www.linkedin.com/company/[id]/       — صحيح (بدون /admin/)
✅ https://www.youtube.com/@[handle]            — صحيح (مع @ ومع www.)
✅ https://www.instagram.com/[handle]           — صحيح
❌ https://twitter.com/...                      — خطأ (أصبح x.com)
❌ https://www.linkedin.com/.../admin/dashboard/ — خطأ (admin URL)
❌ https://youtube.com/[channel]#test           — خطأ (بدون www. وبه hash تجريبي)
❌ http:// (بدون s)                            — خطأ (يعيد redirect)
```

**المصدر:** [Google: Links best practices](https://developers.google.com/search/docs/essentials/links) · [SEMrush: Broken links](https://www.semrush.com/kb/1001-broken-links)

---

## 🟢 الملاحظات (Notices)

---

### SEMR-10 — روابط Icon-Only بدون Anchor Text

**المشكلة التي وقعنا فيها:**
في `hero-cta.tsx`، روابط السوشيال ميديا كانت:
```tsx
<a href="...">
  <span aria-label="Twitter"><!-- icon --></span>  ← الـ aria-label على الـ span، ليس على الـ <a>
</a>
```
SEMrush (وGoogle) يقرآن الـ anchor text من الـ `<a>` مباشرة، ليس من child elements.

**القاعدة:**
> **الـ `aria-label` للـ accessible anchor text لازم يكون على عنصر `<a>` أو `<Link>` نفسه.**

**النمط الصحيح:**
```tsx
// ✅ صحيح — aria-label على الـ Link
<Link href="..." aria-label="تويتر / X">
  <IconTwitter aria-hidden="true" />
</Link>

// ❌ خطأ — aria-label على child
<Link href="...">
  <span aria-label="تويتر">
    <IconTwitter />
  </span>
</Link>
```

**حالات تحتاج aria-label:**
| العنصر | متى تضيف aria-label |
|--------|---------------------|
| `<Link>` يحتوي فقط icon | دائمًا |
| `<Link>` يحتوي فقط `<Image>` | إذا كانت الصورة بدون alt text معبّر |
| `<button>` يحتوي فقط icon | دائمًا |
| `<Link>` يحتوي نص ظاهر | لا تحتاج |

**المصدر:** [WCAG 2.1: Link Purpose](https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context) · [Google: Anchor text](https://developers.google.com/search/docs/essentials/links#anchor-text)

---

### SEMR-11 — Orphan Pages (صفحات معزولة)

**المشكلة التي وقعنا فيها:**
صفحات مثل `/tags` (index) و `/terms` و `/help` لم تكن مرتبطة من أي مكان محوري (footer, nav, sidebar). Google يصعب عليه اكتشافها ولا تحصل على PageRank كافٍ.

**التعريف:**
> **Orphan Page = صفحة لا يشير إليها أي رابط داخلي مهم** (أو رابط واحد فقط من صفحة هي نفسها orphan).

**القاعدة:**
> **كل صفحة تبنيها لازم تكون مرتبطة من مكان محوري واحد على الأقل (footer, nav, sidebar, أو landing page مقصودة).**

**خريطة الـ Internal Linking في مودونتي:**

```
Homepage (/)
  └── TopNav: /trending, /categories, /clients
  └── Footer: /, /trending, /clients, /tags, /help, /about, /terms, /legal/*
  └── More Sidebar: /news, /about, /help, /news/subscribe, /help/feedback

صفحة المقال (/articles/[slug])
  └── ArticleTags: /tags/[slug], /tags (عرض الكل)
  └── ArticleHeader: /categories/[slug], /clients/[slug]

صفحة العميل (/clients/[slug])
  └── ClientTabsNav: /about, /contact, /photos, /followers, /reviews, /reels, /likes

/help
  └── /help/faq, /help/feedback, /contact
```

**Checklist عند إضافة صفحة جديدة:**
- [ ] هل الصفحة مرتبطة من Footer؟
- [ ] هل الصفحة في Main Nav أو More Sidebar؟
- [ ] هل الصفحة مُضافة في `sitemap.ts`؟
- [ ] هل يوجد breadcrumb يربطها بالـ hierarchy الصحيح؟

**المصدر:** [SEMrush: Orphan pages](https://www.semrush.com/kb/857-orphaned-pages) · [Google: Site structure](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)

---

### SEMR-12 — Permanent Redirects في الروابط

**المشكلة التي وقعنا فيها:**
متغيرات `.env` للسوشيال ميديا كانت تحتوي على:
- **Admin URLs** (`/admin/dashboard/`) → تعيد redirect للـ canonical لـ المستخدم غير المسجّل
- **Test URLs** (`#test1`) → هاشات تجريبية
- **نسخ خاطئة من URLs** (`youtube.com/modonty` بدلًا من `youtube.com/@modontycom`)

**القاعدة:**
> **كل رابط خارجي تضيفه لازم يكون الـ canonical final URL — لا admin URLs، لا URLs بـ query params غير ضرورية، لا hashes تجريبية.**

**قواعد للـ `.env` Social URLs:**

```bash
# ✅ صحيح
NEXT_PUBLIC_SOCIAL_LINKEDIN_URL=https://www.linkedin.com/company/[id]/
NEXT_PUBLIC_SOCIAL_YOUTUBE_URL=https://www.youtube.com/@[handle]
NEXT_PUBLIC_SOCIAL_TWITTER_X_URL=https://x.com/[handle]
NEXT_PUBLIC_SOCIAL_FACEBOOK_URL=https://www.facebook.com/[page-name]
# أو إذا ما في username: https://www.facebook.com/profile.php?id=[id]

# ❌ خاطئ
NEXT_PUBLIC_SOCIAL_LINKEDIN_URL=https://www.linkedin.com/.../admin/dashboard/
NEXT_PUBLIC_SOCIAL_YOUTUBE_URL=https://youtube.com/modonty#test1
NEXT_PUBLIC_SOCIAL_FACEBOOK_URL=https://www.facebook.com/profile.php?fb_profile_edit_entry_point=...&sk=about
```

**قاعدة الـ Sitemap:**
> **لا تضع صفحة `noindex` في `sitemap.xml`.** تناقض: تقول لـ Google "لا تفهرس" وفي نفس الوقت "اكتشفها من الـ sitemap".

```typescript
// sitemap.ts — الصفحات التي يجب إقصاؤها:
// ❌ /subscribe (robots: noindex,nofollow)
// ❌ /clients/[slug]/mentions (robots: noindex)
// ❌ /users/register, /users/login (private pages)
// ❌ /admin/* (محجوبة في robots.txt)
```

**المصدر:** [Google: Redirects & SEO](https://developers.google.com/search/docs/crawling-indexing/301-redirects) · [Google: Sitemaps guidelines](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

---

## 🔵 الأداء (Performance)

---

### AUDIT-1 — Homepage بدون H1

**المشكلة:**
صفحة الـ Homepage كانت تعتمد على الـ Hero image فقط بدون أي H1 — Google لا يعرف عن ماذا تتحدث الصفحة.

**القاعدة:**
> **كل صفحة لازم يكون فيها H1 واحد يصف محتواها بوضوح.**
> إذا كانت الصفحة visual-only، أضف H1 بـ `sr-only` (مرئي للـ screen readers والـ crawlers، مخفي بصريًا).

```tsx
// ✅ في app/page.tsx
<h1 className="sr-only">مودونتي — منصة المحتوى العربي</h1>
```

---

### AUDIT-2 — وقت استجابة بطيء (> 1.5s)

**المشكلة:**
`cacheLife("minutes")` = 60 ثانية فقط → cache ينتهي باستمرار → كل request يضرب MongoDB Atlas مباشرة → latency عالية.

**القاعدة:**
> **البيانات الثابتة (articles, categories, clients) تستخدم `cacheLife("hours")`، وليس `"minutes"`.**
> هذا آمن لأن الـ admin يستدعي `revalidateTag()` عند كل تغيير — فالـ cache يتحدث فورًا عند الحاجة فقط.

```typescript
// ✅ صحيح — للبيانات التي يُدارها الأدمن
async function getArticlesCached() {
  "use cache";
  cacheTag("articles");
  cacheLife("hours"); // آمن: admin revalidateTag() عند كل publish
  // ...
}

// ❌ خاطئ — يضرب DB كل دقيقة بدون سبب
async function getArticlesCached() {
  "use cache";
  cacheLife("minutes"); // cache miss كل 60s = بطء مستمر
}
```

**متى تستخدم أي cacheLife:**

| نوع البيانات | cacheLife | لماذا |
|-------------|-----------|-------|
| مقالات منشورة | `"hours"` | يتغير فقط عند publish/update |
| تصنيفات | `"hours"` | نادرًا ما تتغير |
| بيانات المستخدم الحالي | لا تُكيّش | تتغير في كل session |
| نتائج البحث | لا تُكيّش | تعتمد على query المستخدم |
| إحصائيات Dashboard | `"minutes"` أو لا | تتغير باستمرار |

**المصدر:** [Next.js: cacheLife](https://nextjs.org/docs/app/api-reference/functions/cacheLife) · [Next.js: Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching)

---

## 📋 Checklists مرجعية

---

### Checklist-A: إضافة صفحة جديدة

```
□ الصفحة تعطي 200 (ليست stub أو TODO)
□ generateMetadata() موجود مع title + description fallback
□ H1 موجود (ظاهر أو sr-only) — H1 واحد فقط في الصفحة كلها
□ breadcrumb موجود يربطها بالـ hierarchy الصحيح
□ مُضافة في sitemap.ts (إذا كانت indexable)
□ مرتبطة من مكان محوري (Footer / Nav / Sidebar) — لا orphan
□ loading.tsx موجود
□ إذا كانت noindex → لا تضعها في sitemap.ts
```

### Checklist-B: إضافة أو تعديل JSON-LD

```
□ كل @type, @id, @context بـ @ في جميع المستويات (recursive)
□ اختبار في Google Rich Results Test
□ اختبار في Schema Markup Validator (validator.schema.org)
□ لا تستخدم "type" بدون @ في أي level
```

### Checklist-C: تعديل robots.txt أو sitemap.ts

```
□ /_next/ ليست محجوبة في robots.txt
□ /api/ و /admin/ و /dashboard/ محجوبة
□ كل صفحة في sitemap → تعطي 200 وليست noindex
□ الـ sitemap URL موجود في robots.txt
□ بعد push: تحقق من sitemap.xml في المتصفح مباشرة
```

### Checklist-D: إضافة روابط خارجية

```
□ الرابط هو الـ canonical final URL (ليس admin URL)
□ لا trailing /admin/dashboard/ على LinkedIn
□ لا #hash تجريبية
□ Twitter → x.com (ليس twitter.com)
□ YouTube → www.youtube.com/@handle (مع www. ومع @)
□ HTTP → HTTPS
□ الرابط يعطي 200 (ليس 301/302/403/404)
```

### Checklist-E: تعديل Layout أو Navigation

```
□ كل H1 جديد في Layout → تحقق من كل sub-page
□ كل Component فيه H1 جديد → تحقق من الصفحات التي تستخدمه
□ رابط icon-only جديد → aria-label على <Link> مباشرة
□ Social links جديدة → canonical URLs، ليست admin URLs
□ قاعدة الـ aria-label: على <a> أو <Link>، ليس على child <span>
```

---

## 🔗 المصادر الرسمية

| المصدر | الرابط | يُستخدم لـ |
|--------|--------|-----------|
| Google Search Central | https://developers.google.com/search | القواعد الرسمية لـ Google |
| Google Rich Results Test | https://search.google.com/test/rich-results | اختبار JSON-LD |
| Schema.org Validator | https://validator.schema.org | التحقق من Structured Data |
| SEMrush Site Audit | https://www.semrush.com/siteaudit/ | Audit شامل |
| Google Search Console | https://search.google.com/search-console | مراقبة الأداء الحقيقي |
| PageSpeed Insights | https://pagespeed.web.dev | Core Web Vitals |
| WCAG 2.1 Guidelines | https://www.w3.org/WAI/WCAG21/quickref/ | Accessibility |
| Next.js Docs: Metadata | https://nextjs.org/docs/app/building-your-application/optimizing/metadata | metadata API |
| Next.js Docs: robots.ts | https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots | robots.txt |
| Next.js Docs: sitemap.ts | https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap | sitemap.xml |
| Next.js Docs: cacheLife | https://nextjs.org/docs/app/api-reference/functions/cacheLife | Caching |

---

## 📊 سجل Audits

| التاريخ | عدد الصفحات | Site Health | الحالة |
|--------|-------------|------------|--------|
| 2026-04-11 | 100 صفحة | 78% | ✅ كل المشاكل مُصلّحة — في انتظار Rerun |
| القادم | — | الهدف: 90%+ | 🔄 Rerun Campaign في SEMrush |

**بعد كل Rerun:**
1. اضغط "Rerun campaign" في SEMrush
2. راجع أي مشاكل جديدة
3. أضف المشاكل الجديدة لـ `SEMRUSH-AUDIT-TODO.md`
4. أضف القواعد المستخلصة لهذا الملف
