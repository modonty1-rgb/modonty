# External Audit Tools → Code-Level Fixes (Master Mapping)

> **هذا أهم مرجع في المهارة.** كل خطأ يطلع من Semrush أو Ahrefs أو Lighthouse، هنا تلقى الإصلاح المباشر في الكود.

---

## كيف تستخدم هذا المرجع

1. خذ اسم الخطأ كما يطلعه الأداة الخارجية (مثلاً "Pages don't have title tags")
2. ابحث عنه في الجدول
3. اقرأ السبب الجذري + ملف الكود + الإصلاح
4. طبّق وأعد الفحص

---

## 1️⃣ Semrush Site Audit — Errors

### Crawlability

| Semrush Error | السبب الجذري | الإصلاح في الكود |
|--------------|--------------|------------------|
| Pages returning 5XX status code | server error | راجع logs Vercel + تأكد إن الـ MongoDB connection ما تنقطع |
| Pages returning 4XX status code | broken links | احذف/استبدل الـ links في الـ DB أو في الـ navigation config |
| Pages couldn't be crawled | server response > 5s | فعّل ISR + cache + ارفع revalidate window |
| Pages couldn't be crawled (DNS) | DNS misconfig | اطلب من admin يراجع DNS records |
| Pages couldn't be crawled (URL format) | URL غريب فيه أحرف خاصة | normalize slugs بـ `slugify`: only `[a-z0-9-]` |
| Format errors in robots.txt | syntax غلط في `robots.txt` | راجع `app/robots.ts` + اختبره بـ Google's robots Tester |
| Format errors in sitemap.xml | XML غلط | راجع `app/sitemap.ts` — تأكد كل URL string صحيح |
| Incorrect pages found in sitemap.xml | URLs ترجع 3xx/4xx/5xx | فلتر في الـ query: `where: { publishedAt: { not: null }, seo: { isNot: null } }` |
| Pages with WWW resolve issue | كل من `www` و non-www يعمل | حدد واحدة في Vercel domains + redirect الآخر |
| Pages with no viewport tag | mobile-unfriendly | أضف في `app/layout.tsx`: `export const viewport: Viewport = { width: 'device-width', initialScale: 1 }` |
| Size of HTML on a page is too large | > 2MB HTML | قلل inline scripts/styles، استخدم Server Components |

### On-Page

| Semrush Error | السبب | الإصلاح |
|--------------|------|---------|
| Pages don't have title tags | metadata.title فاضي | تأكد إن `seo.metaTitle` موجود في الـ DB، وإن `generateMetadata` يستخدمه |
| Issues with duplicate title tags | مقالتين بنفس الـ title | unique constraint في الـ DB + recompute لو تكرر |
| Pages with duplicate content issues | محتوى متطابق ≥ 85% | تأكد إن كل مقالة محتواها فريد، استخدم canonical للنسخ |
| Pages with duplicate meta descriptions | metaDescription متكرر | لكل مقالة meta description فريد محسوب من المحتوى |
| Broken internal links | links لصفحات 404 | اكتشف via `tests/seo/links.test.ts` يفحص كل الـ `<Link href>` |
| Broken internal images | `<img src>` لصورة محذوفة | استخدم `<Image>` من Next.js + تحقق من وجود الـ CDN URL |

### Canonical & Redirects

| Semrush Error | السبب | الإصلاح |
|--------------|------|---------|
| Pages with broken canonical link | canonical يشير لـ 404 | تحقق من `seo.canonical` في الـ DB، assert إنه يرجع 200 |
| Pages with multiple canonical URLs | `<link rel="canonical">` متعدد | تأكد إن `generateMetadata` يحط canonical واحد فقط |
| Redirect chains and loops | > 3 redirects | راجع `next.config.ts` redirects + تأكد إن كل واحد يشير للـ destination النهائي |
| Pages with meta refresh tag | `<meta http-equiv="refresh">` | استبدل بـ `redirect()` من Next.js |

### HTTPS

| Semrush Error | السبب | الإصلاح |
|--------------|------|---------|
| Non-secure pages | input type="password" على HTTP | كل الصفحات لازم HTTPS — Vercel يفعّلها افتراضياً |
| Issues with expiring certificate | SSL expired | جدد Vercel/Cloudflare auto-renew |
| Issues with old security protocol | TLS 1.0/1.1 | تأكد من Vercel/Cloudflare يستخدمون TLS 1.2+ |
| Issues with mixed content | HTTP داخل HTTPS | تأكد كل URL في الكود يبدأ بـ `https://` — استخدم Zod: `z.string().url().startsWith('https://')` |
| No redirect or canonical to HTTPS | HTTP version موجود | Vercel يعمل redirect HTTP → HTTPS تلقائياً، تحقق إنه مفعّل |

### Hreflang

| Semrush Error | السبب | الإصلاح |
|--------------|------|---------|
| Hreflang conflicts within page source code | canonical يشير لـ URL، hreflang يشير لـ URL آخر | كل locale canonical = self، وhreflang يربط بكل النسخ |
| Issues with hreflang values | استخدم `arabic` بدل `ar` | استخدم ISO 639-1 (`ar`, `en`) + ISO 3166-1 (`SA`, `EG`) |
| Issues with incorrect hreflang links | relative URL أو redirect | absolute URLs + 200 status — assert في `resolveHreflangVariants` |

---

## 2️⃣ Semrush Site Audit — Warnings

| Semrush Warning | السبب | الإصلاح |
|----------------|------|---------|
| Pages with low text-to-HTML ratio | محتوى قليل، HTML كثير | اكتب محتوى ≥ 300 كلمة + قلل inline scripts |
| Pages with too much text within the title | title > 60 char | اقطع في `computeArticleSEO`: `truncate(title, 60)` |
| Pages with too short title | title < 10 char | assertion في `computeArticleSEO`: `if (title.length < 10) throw` |
| Pages without an h1 heading | لا يوجد `<h1>` | تأكد إن template الـ article فيه `<h1>{article.title}</h1>` |
| Pages with no meta description | فاضي | compute description من المحتوى لو ما حدّدها الكاتب |
| Pages with too long meta description | > 160 char | `truncate(description, 160)` |
| Multiple H1 tags | أكثر من واحد | استخدم `<h1>` للعنوان فقط، الباقي `<h2>`, `<h3>` |
| Pages with low word count | < 300 word | assertion في الـ admin form: لا تنشر مقالة < 300 word |
| Subdomains don't support HSTS | HSTS header مفقود | أضف `Strict-Transport-Security` في `next.config.ts` headers |

---

## 3️⃣ Semrush Site Audit — Notices

| Semrush Notice | السبب | الإصلاح |
|---------------|------|---------|
| URL too long | > 200 char | تأكد إن slugs محصورة في طول معقول |
| Pages with only one internal link | صفحات معزولة | أضف internal links من الـ home/category/author pages |
| Sitemap.xml not found | sitemap مفقود | تأكد إن `app/sitemap.ts` موجود + يطلع 200 |
| robots.txt not found | robots مفقود | تأكد إن `app/robots.ts` موجود |
| Links on HTTPS pages leading to HTTP | external links HTTP | راجع كل external links وحدّثها لـ HTTPS |
| Page has no character encoding declared | charset مفقود | Next.js يضيفها افتراضياً |
| Multiple H1 tags found | تعدد H1 | (نفس الـ warning) |

---

## 4️⃣ Ahrefs Site Audit

### Crawl & Status

| Ahrefs Issue | السبب | الإصلاح |
|-------------|------|---------|
| 500 page | server 500 error | راجع logs + DB connection |
| 404 page | broken link | احذف الـ link أو redirect |
| 3xx page receives organic traffic | صفحة قديمة تستلم traffic | تأكد إن الـ 301 redirect يسلسلها لـ destination صحيح |
| 302 redirect | temporary redirect | استبدل بـ 301 إذا كان دائم |
| Canonical points to 4XX | canonical broken | راجع `seo.canonical` يرجع 200 |
| Canonical points to redirect | canonical chain | canonical يجب أن يشير للـ final destination |
| Orphan page | لا inbound links | أضف link من category/home |
| HTTPS page has internal links to HTTP | mixed protocol links | تأكد كل internal link يبدأ بـ `/` (relative) أو HTTPS مطلق |

### Structured Data

| Ahrefs Issue | السبب | الإصلاح |
|-------------|------|---------|
| JSON parsing error | JSON-LD غير صحيح | استخدم builder، اختبر `JSON.parse(JSON.stringify(jsonLd))` |
| Missing @type property | object بدون `@type` | كل nested object لازم `@type` |
| Invalid schema type | نوع غير معروف | استخدم Schema.org types فقط (BlogPosting, BreadcrumbList, etc) |
| Invalid schema property | property name غلط | تحقق من spelling vs Schema.org docs |
| Unexpected type for a property | string بدل URL | تأكد من type matching (مثلاً `image` لازم URL أو ImageObject) |

### Content

| Ahrefs Issue | السبب | الإصلاح |
|-------------|------|---------|
| Multiple meta description tags | description متعدد | في `generateMetadata`، description واحد فقط |
| Image file size too large | صورة ضخمة | استخدم Cloudinary `q_auto` + WebP |
| Broken images | `<img>` 404 | استخدم `<Image>` من Next.js + assertions على CDN URL |
| Redirect chain too long | > 3 redirects | راجع redirect rules |

---

## 5️⃣ Google Lighthouse — SEO Audits (الـ 8)

| Lighthouse Audit | السبب | الإصلاح |
|-----------------|------|---------|
| Document doesn't have a `<title>` element | title فاضي | `generateMetadata` يرجع title |
| Document does not have a meta description | description فاضي | `generateMetadata` يرجع description |
| Document doesn't have a valid `<meta name="viewport">` | viewport مفقود/غلط | `viewport` export في `app/layout.tsx` |
| Page is blocked from indexing | `noindex` في robots meta | تحقق إن `seo.robots` = "index,follow" للمقالات المنشورة |
| robots.txt is not valid | syntax غلط في `robots.txt` | راجع `app/robots.ts` |
| Document doesn't have a `<html lang>` | lang attribute مفقود | في `<html lang={locale}>` |
| Document does not use legible font sizes | fonts < 12px على الموبايل | تأكد responsive typography ≥ 14px على الموبايل |
| Tap targets are not sized appropriately | buttons < 48×48px | كل interactive element ≥ 48×48 |
| Links are not crawlable | `<a>` بدون `href` أو `href=""` | استخدم `<Link href="...">` من Next.js |
| Links do not have descriptive text | "click here", "read more" | استخدم نص descriptive: "اقرأ مقالة 'XYZ'" |
| Image elements do not have `[alt]` attributes | alt مفقود | `<Image alt="..."` مطلوب |
| `[user-scalable="no"]` is used | viewport يمنع zoom | لا تحط `user-scalable=no` في viewport |
| `hreflang` links not valid | ISO codes غلط | استخدم ISO codes |

---

## 6️⃣ Google Rich Results Test

| Rich Results Error | السبب | الإصلاح |
|-------------------|------|---------|
| Missing field "headline" | لا يوجد headline في Article schema | تأكد builder يحط headline ≤ 110 char |
| Missing field "image" | لا يوجد image | image array ≥ 1 URL |
| Missing field "author" | author مفقود | author { @type: Person, name, url } |
| Missing field "publisher" | publisher مفقود | publisher { @type: Organization, name, logo: { @type: ImageObject, url } } |
| Missing field "datePublished" | تاريخ النشر مفقود | ISO 8601 + timezone |
| Invalid value for "datePublished" | غير ISO 8601 | استخدم `toISOString()` |
| Field "author" not of type "Person" | author { name } بدون @type | كل object داخل JSON-LD لازم `@type` |
| Image too small | image dimensions < 300px على أي بعد | استخدم images ≥ 1200×630 |
| Logo not an ImageObject | publisher.logo string بدل ImageObject | logo: { @type: 'ImageObject', url, width: 600, height: 60 } |

---

## 7️⃣ Schema Validator (schema.org)

| Validator Error | السبب | الإصلاح |
|----------------|------|---------|
| The "X" property is not recognized by Google for an object of type Y | property اخترعتها | شيل الـ property أو غيّر الـ @type |
| Date string should follow ISO 8601 | تاريخ خاطئ | `new Date().toISOString()` |
| Expected URL but got "string" | string بدل URL | تأكد إن قيمة كل field تطابق Schema.org type |

---

## 8️⃣ PageSpeed Insights — Core Web Vitals

| CWV Failure | السبب | الإصلاح |
|------------|------|---------|
| LCP > 2.5s | hero image بطيء | `priority={true}` + WebP/AVIF + preload |
| LCP > 2.5s | TTFB بطيء | ISR + Edge runtime + DB query optimization |
| INP > 200ms | long JS tasks | Server Components + code splitting + lazy loading |
| INP > 200ms | third-party scripts ثقيلة | `<Script strategy="afterInteractive">` |
| CLS > 0.1 | images بدون dimensions | `<Image width={X} height={Y}>` دائماً |
| CLS > 0.1 | fonts swap | `next/font` + `display: swap` + `adjustFontFallback: true` |
| CLS > 0.1 | embeds بدون reserved space | container مع `aspect-ratio` |
| TTFB > 800ms | SSR كل request | ISR (`export const revalidate = 3600`) |

---

## 9️⃣ Mozilla Observatory (Security Headers)

Modonty تستهدف score ≥ A+. الـ headers المطلوبة:

| Header | القيمة |
|--------|--------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy` | حسب الـ assets (ابدأ مرن، شدد لاحقاً) |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` (أو `DENY` لمحتوى لا يحتاج embedding) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

كلها تتكون في `next.config.ts` → `headers()` (راجع `crawlability-indexability.md`).

---

## 🔟 الفلسفة العامة

> كل خطأ يطلع من أداة خارجية = **gap في الـ build pipeline**.
> الحل ليس "نصلحه يدوياً"، الحل "نمنع وقوعه في الكود".

كل صف في هذا الجدول يعطيك:
- **التشخيص:** ليش الأداة طلعت هذا الخطأ
- **الإصلاح المباشر:** السطر في الكود اللي لازم نعدله
- **الوقاية:** ضمان إن الخطأ ما يرجع (assertion، test، schema validation)

---

## 📚 المصادر الرسمية

- [Semrush — Site Audit Issues List](https://www.semrush.com/kb/542-site-audit-issues-list)
- [Ahrefs — Site Audit Help](https://help.ahrefs.com/en/collections/87920-site-audit)
- [Google — Lighthouse SEO audits](https://developer.chrome.com/docs/lighthouse/seo)
- [Google — Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Validator](https://validator.schema.org/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
