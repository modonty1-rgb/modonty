# Crawlability & Indexability

> كل ما يخص قدرة Googlebot على الوصول للصفحة وفهمها: robots, sitemap, canonical, redirects, HTTPS.

---

## 1️⃣ robots.txt

### المصدر الرسمي
- [Google — robots.txt introduction](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google — robots.txt specification](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec)

### الموقع الإلزامي
- `https://modonty.com/robots.txt` (root domain فقط)
- لا يعمل على subdomain أو subdirectory

### قواعد إلزامية

| القاعدة | السبب |
|---------|-------|
| ملف نصي بـ UTF-8 | spec requirement |
| ≤ 500 KiB | Google يقرأ أول 500 KiB فقط |
| `User-agent` أولاً، بعدها `Allow`/`Disallow` | trail order matters |
| `Sitemap:` URL **مطلق** | يجب أن يكون https://modonty.com/sitemap.xml |
| كل directive في سطر منفصل | parser يكره الدمج |

### Next.js — `app/robots.ts`

```typescript
// app/robots.ts
import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://modonty.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/console/',
          '/_next/',
          '/draft/',
          '/preview/',
          '/*?*utm_',     // block UTM-tagged URLs (duplicate content)
        ],
      },
      // Allow specific AI crawlers (للـ AI search visibility)
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      // Block bad bots
      {
        userAgent: 'AhrefsBot',
        crawlDelay: 10,
      },
      {
        userAgent: 'SemrushBot',
        crawlDelay: 10,
      },
    ],
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/ar/sitemap.xml`,
      `${BASE_URL}/en/sitemap.xml`,
    ],
    host: BASE_URL,
  };
}
```

### الأخطاء اللي يطلعها Semrush
- **Format errors in Robots.txt file** (Error) — syntax غلط
- **Robots.txt file has format errors** — تحقق بـ `https://www.google.com/webmasters/tools/robots-testing-tool`

### قاعدة ذهبية
> `robots.txt` للـ crawling، **مش للـ indexing**. لمنع الفهرسة استخدم `noindex` meta tag، **لا** `Disallow` في robots. صفحة `Disallow` تقدر تنفهرس لو فيها روابط واردة.

---

## 2️⃣ sitemap.xml

### المصدر
- [Google — Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Sitemaps protocol](https://www.sitemaps.org/protocol.html)

### قواعد إلزامية

| القاعدة | الحد |
|---------|------|
| حجم ملف واحد | ≤ 50 MB (uncompressed) |
| URLs في ملف واحد | ≤ 50,000 |
| URLs لازم تكون | absolute, https, returning 200 |
| التشفير | UTF-8 |

### Next.js — `app/sitemap.ts`

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://modonty.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await prisma.article.findMany({
    where: {
      publishedAt: { not: null, lte: new Date() },
      seo: { isNot: null },
    },
    include: { seo: { select: { sitemapLastmod: true, sitemapPriority: true, sitemapChangefreq: true } } },
    orderBy: { publishedAt: 'desc' },
  });

  return articles.map(article => ({
    url: `${BASE_URL}/${article.locale}/blog/${article.slug}`,
    lastModified: article.seo!.sitemapLastmod,
    changeFrequency: article.seo!.sitemapChangefreq as MetadataRoute.Sitemap[0]['changeFrequency'],
    priority: article.seo!.sitemapPriority,
    alternates: {
      languages: {
        ar: `${BASE_URL}/ar/blog/${article.slug}`,
        en: `${BASE_URL}/en/blog/${article.slug}`,
      },
    },
  }));
}
```

### Sitemap Index (للمواقع الكبيرة > 50K URL)

عند الـ scale نقسّم لـ multiple sitemaps:

```typescript
// app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/ar/sitemap.xml` },
    { url: `${BASE_URL}/en/sitemap.xml` },
    { url: `${BASE_URL}/sitemap-static.xml` },
  ];
}
```

Next.js 14+ يدعم multiple sitemaps عبر `[id]/sitemap.ts`.

### الأخطاء الشائعة (Semrush Errors)

| الخطأ | الإصلاح |
|------|---------|
| Format errors in sitemap.xml | تحقق بـ Google Search Console Sitemaps report |
| Incorrect pages found in sitemap.xml | حذف URLs ترجع 3xx/4xx/5xx, redirects, non-canonical |
| URLs in sitemap.xml return 4xx/5xx | فلتر `where: { publishedAt: { not: null } }` |

### قاعدة ذهبية
> **في الـ sitemap.xml: URLs canonical فقط، ترجع 200، non-redirected.**
> لو الصفحة فيها `noindex` لا تحطها في sitemap.

---

## 3️⃣ Canonical URLs

### المصدر
- [Google — Canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [Google — Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

### المبدأ
لو الصفحة متاحة عبر عدة URLs، Canonical يقول لـ Google "هذي النسخة الأصلية".

### قواعد إلزامية

| القاعدة | السبب |
|---------|-------|
| URL **مطلق** يبدأ بـ `https://` | relative canonicals يتم تجاهلها (Semrush Error) |
| canonical واحد فقط لكل صفحة | multiple canonicals → confuses Google |
| يشير لصفحة موجودة (200) | broken canonical → Semrush Error |
| لا يشير لصفحة `noindex` | تناقض |
| لا يشير لـ redirect | Google يتبع لكن يفضّل عدم |
| **self-referencing canonical** على كل صفحة | best practice |

### في Next.js

```typescript
// generateMetadata
return {
  alternates: {
    canonical: seo.canonical,  // https://modonty.com/ar/blog/slug
  },
};
```

### حالات خاصة

| الحالة | canonical يشير لـ |
|--------|-------------------|
| الصفحة الأصلية | نفسها (self-referencing) |
| نسخة مطبوعة | الأصلية |
| نسخة AMP | الأصلية (وفي الأصلية: `<link rel="amphtml">`) |
| نسخة موبايل منفصلة | desktop version |
| الترجمة العربية للمقالة | نفسها (self) — وتربط بالـ english عبر hreflang، **لا** canonical |
| paginated pages (?page=2) | نفسها (وليس الـ page 1) — Google ألغى rel=next/prev في 2019 |
| URLs مع UTM parameters | الـ URL الأصلي بدون UTM |

### كيف نتعامل مع UTM في الكود؟

```typescript
// app/[locale]/blog/[slug]/page.tsx
import { headers } from 'next/headers';

export async function generateMetadata({ params, searchParams }) {
  const article = await getArticleWithSEO(params.locale, params.slug);
  if (!article?.seo) return {};

  // canonical يتجاهل أي UTM
  return {
    alternates: {
      canonical: article.seo.canonical,  // الـ URL بدون UTM دائماً
    },
  };
}
```

---

## 4️⃣ HTTP Status Codes & Redirects

### الـ Status codes اللي يهتم بها SEO

| Code | الوصف | عمل crawler |
|------|--------|-------------|
| 200 OK | الصفحة موجودة | يـ index |
| 301 Permanent | redirect دائم | يتبع + ينقل السلطة |
| 302 Temporary | redirect مؤقت | يتبع لكن **لا** ينقل السلطة |
| 304 Not Modified | للـ caching | OK |
| 404 Not Found | صفحة محذوفة | يـ deindex بعد فترة |
| 410 Gone | محذوفة نهائياً | يـ deindex فوراً |
| 500/503 | server error | يحاول لاحقاً، لو استمر يـ deindex |

### القواعد

| القاعدة | السبب |
|---------|-------|
| استخدم **301** للـ redirect الدائم | Semrush "302 redirect" warning للـ 302 |
| لا تتعدى **3 redirects** في chain | Semrush Error "Redirect chains" |
| لا تسوي redirect loops | Semrush Error |
| لا تستخدم meta refresh | Semrush Error — استخدم 301 |
| 3xx pages اللي تستقبل organic traffic = redirect مكسور | Ahrefs Error |

### في Next.js — Redirects

```typescript
// next.config.ts
const nextConfig = {
  async redirects() {
    return [
      // permanent (301)
      {
        source: '/blog/:slug',
        destination: '/ar/blog/:slug',
        permanent: true,  // ← 308 actually (modern permanent redirect)
      },
      // قاعدة: لا تنشئ chains
      // {source: '/old1', destination: '/old2', permanent: true}, ← غلط لو old2 redirect لـ /new
    ];
  },
};
```

> ملاحظة: Next.js `permanent: true` يستخدم **308** (modern permanent redirect, preserves method). Google يعامله مثل 301. لو تبي 301 exactly استخدم middleware.

### الحفاظ على slug history

عند تغيير slug، احفظ النسخة القديمة:

```prisma
model ArticleSlugRedirect {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  oldSlug      String   @unique
  newSlug      String
  articleId    String   @db.ObjectId
  createdAt    DateTime @default(now())
}
```

```typescript
// middleware.ts (Next.js)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function middleware(req) {
  const match = req.nextUrl.pathname.match(/^\/(ar|en)\/blog\/(.+)$/);
  if (!match) return NextResponse.next();

  const [, locale, slug] = match;
  const redirect = await prisma.articleSlugRedirect.findUnique({
    where: { oldSlug: slug },
  });

  if (redirect) {
    return NextResponse.redirect(
      new URL(`/${locale}/blog/${redirect.newSlug}`, req.url),
      301
    );
  }
}
```

---

## 5️⃣ HTTPS & Security

### القواعد

| القاعدة | المصدر |
|---------|--------|
| كل صفحة HTTPS، لا HTTP | Google ranking signal منذ 2014 |
| HTTP → HTTPS 301 redirect | Semrush "No HTTPS encryption from HTTP" |
| لا mixed content (HTTP داخل HTTPS) | Semrush Error + Browser blocks |
| HSTS header مفعّل | Mozilla Observatory ranking |
| TLS 1.2+ فقط (لا SSL، لا TLS 1.0/1.1) | Semrush "Old security protocol" |
| SSL certificate صالح + ما يوشك على الانتهاء | Semrush "Expiring certificate" |

### Next.js — Headers

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

### Mixed Content — اكتشاف

```bash
# في الـ browser console:
# Mixed Content: The page at 'https://...' was loaded over HTTPS,
# but requested an insecure resource 'http://...'.
```

في الكود: تأكد إن كل URL تستخدمه (للصور، الـ APIs، fonts) يبدأ بـ `https://`. استخدم Zod للتحقق:

```typescript
const ImageUrlSchema = z.string().url().startsWith('https://');
```

---

## 6️⃣ Internal Linking

### القواعد

| القاعدة | الأداة اللي تطلع الخطأ |
|---------|------------------------|
| كل صفحة منشورة لازم لها internal link واحد على الأقل | Ahrefs "Orphan page" |
| internal links ما ترجع 4xx | Semrush "Broken internal links" |
| anchor text descriptive (لا "click here") | Lighthouse "Links don't have descriptive text" |
| لا تستخدم `<a href="javascript:...">` | Lighthouse "Links not crawlable" |
| استخدم `<Link>` من Next.js، ليس `<a>` للـ internal | يحافظ على prefetching |

### Next.js Link patterns

```tsx
import Link from 'next/link';

// ✅ صح
<Link href={`/${locale}/blog/${slug}`} prefetch={true}>
  {article.title}
</Link>

// ❌ خطأ
<a href={`/${locale}/blog/${slug}`}>{article.title}</a>  // no prefetch
<button onClick={() => router.push(...)}>Read</button>   // not crawlable
```

### Orphan pages — كيف نكتشفهم

```sql
-- pseudo-query (تكييف لـ Prisma)
SELECT a.id, a.title, a.slug
FROM Article a
WHERE NOT EXISTS (
  SELECT 1 FROM ArticleLink al WHERE al.targetArticleId = a.id
)
AND a.publishedAt IS NOT NULL;
```

في Modonty لازم نضمن:
- كل مقالة منشورة لها رابط من صفحة التصنيف أو من الـ homepage
- صفحة المؤلف تربط بكل مقالاته

---

## 7️⃣ Pagination

### Google's stance (2019+)
- `rel="next"` / `rel="prev"` لم تعد تستخدم
- كل صفحة paginated تكون **self-canonical**
- الـ content على كل صفحة يجب أن يكون فريداً

```typescript
// app/[locale]/blog/page.tsx?page=2
return {
  alternates: {
    canonical: `https://modonty.com/${locale}/blog?page=2`,  // self, ليس page=1
  },
};
```

---

## 8️⃣ HTML Size & Render-Blocking

### القاعدة
- HTML page size ≤ **2 MB** (Semrush Error إذا تجاوز)
- inline `<script>` و `<style>` نقللها للأدنى
- جافاسكربت render-blocking → `defer` أو `async`

### في Next.js
- Server Components بشكل افتراضي = HTML خفيف
- ابعد عن `'use client'` إلا عند الضرورة
- استخدم `next/script` للـ third-party scripts:

```tsx
import Script from 'next/script';

<Script
  src="https://www.googletagmanager.com/gtm.js?id=GTM-XXX"
  strategy="afterInteractive"  // لا يحجب الـ render
/>
```

---

## 9️⃣ WWW vs Non-WWW

### القاعدة
- اختار **واحد** فقط: `modonty.com` أو `www.modonty.com`
- الآخر يعمل 301 redirect للمختار
- خلاف ذلك = Semrush Error "Pages with a WWW resolve issue"

### Modonty
- المختار: **`modonty.com`** (بدون www)
- في Vercel: أضف كلا الـ domains وأشّر الرئيسي = `modonty.com`
- Vercel يعمل redirect تلقائياً

---

## 📚 المصادر الرسمية

- [Google — Crawling and Indexing overview](https://developers.google.com/search/docs/crawling-indexing)
- [Google — robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google — Sitemaps overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google — Canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [Google — Redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Google — Securing your site with HTTPS](https://developers.google.com/search/docs/advanced/security/https)
- [Next.js — robots.ts](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Next.js — sitemap.ts](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js — Redirects in next.config.js](https://nextjs.org/docs/app/api-reference/next-config-js/redirects)
