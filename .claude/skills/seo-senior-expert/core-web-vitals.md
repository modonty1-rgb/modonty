# Core Web Vitals — LCP, INP, CLS

> المعايير الرسمية من Google + كيف تطبّقها كلها في الكود.

---

## 🎯 الـ Thresholds الرسمية (Google, web.dev)

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s – 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200ms – 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |

**شرط الـ pass:** 75% من الـ page views (real users في CrUX dataset) يطلعون "Good" على كل المقاييس الثلاثة.

**مهم:** Lighthouse score (lab) ≠ CrUX (field). Google يستخدم **CrUX فقط** كـ ranking signal.

### المراجع
- [web.dev — Core Web Vitals](https://web.dev/articles/vitals)
- [web.dev — Defining CWV thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)
- [Google — Page Experience](https://developers.google.com/search/docs/appearance/page-experience)

---

## 1️⃣ LCP — Largest Contentful Paint

### المعنى
الوقت من بدء التحميل لـ ظهور أكبر عنصر مرئي (hero image, heading, video).

### المسببات الشائعة

| السبب | الإصلاح |
|------|---------|
| الصورة الـ hero ثقيلة | WebP/AVIF + `priority={true}` |
| Fonts تأخذ وقت للتحميل | `font-display: swap` + `next/font` |
| TTFB (server response) بطيء | Cache + Edge functions |
| Render-blocking JS/CSS | `defer` + code splitting |
| الصورة hero loaded via JavaScript | استخدم `<Image>` SSR |

### Patterns في Next.js

#### الصورة الـ Hero (LCP element)

```tsx
import Image from 'next/image';

// ✅ صح — الصورة الـ hero
<Image
  src={article.coverImage}
  alt={article.title}
  width={1200}
  height={630}
  priority={true}             // ← critical! يلغي lazy loading
  fetchPriority="high"        // ← يحجز bandwidth أولاً
  sizes="(max-width: 768px) 100vw, 1200px"
  placeholder="blur"
  blurDataURL={article.blurDataURL}  // محسوب مسبقاً في الـ DB
/>
```

⚠️ **لا تنسى:** `priority={true}` يلغي `loading="lazy"`. هذا مطلوب فقط للـ LCP element.

#### Preload للـ critical resources

```tsx
// app/[locale]/blog/[slug]/page.tsx
export default async function ArticlePage({ params }) {
  const article = await getArticleWithSEO(...);

  return (
    <>
      <head>
        <link
          rel="preload"
          as="image"
          href={article.coverImage}
          fetchPriority="high"
          imageSizes="(max-width: 768px) 100vw, 1200px"
          imageSrcSet={`${article.coverImage}?w=768 768w, ${article.coverImage}?w=1200 1200w`}
        />
      </head>
      <Image src={article.coverImage} priority alt={...} ... />
    </>
  );
}
```

#### Fonts

```typescript
// app/layout.tsx
import { Cairo } from 'next/font/google';

const cairo = Cairo({
  subsets: ['arabic'],
  display: 'swap',          // ← critical: avoids invisible text
  preload: true,
  variable: '--font-cairo',
});

export default function Layout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body>{children}</body>
    </html>
  );
}
```

#### TTFB

| مشكلة | إصلاح |
|------|-------|
| SSR كل request | استخدم ISR: `export const revalidate = 3600` |
| MongoDB query بطيء | indices على slug + locale، use `select` not `include` |
| Vercel cold start | Edge runtime للـ static routes |

```typescript
// app/[locale]/blog/[slug]/page.tsx
export const revalidate = 60 * 60 * 24;  // 24h ISR
// أو
export const dynamic = 'force-static';   // إذا كل البيانات يمكن أن تكون static
```

---

## 2️⃣ INP — Interaction to Next Paint

### المعنى
الوقت من تفاعل المستخدم (click, tap, key) لـ بدء الـ paint اللي يستجيب لهذا التفاعل.
بدّل **FID** في March 2024.

### المسببات

| السبب | الإصلاح |
|------|---------|
| Long tasks في الـ main thread (> 50ms) | break them: `setTimeout`, `requestIdleCallback` |
| كثرة JavaScript على الصفحة | code splitting + lazy components |
| ثقل React rendering | `useMemo`, `useCallback`, virtualization للقوائم |
| third-party scripts | `next/script` بـ `strategy="lazyOnload"` |
| Heavy DOM (> 1500 nodes) | تقليل التعقيد |

### Patterns

#### استخدام Server Components بشكل افتراضي

```tsx
// ✅ صح — Server Component
export default async function ArticleContent({ id }) {
  const article = await prisma.article.findUnique({ where: { id } });
  return <div>{article.body}</div>;
}

// ❌ خطأ — تحويل ما يحتاج لـ Client Component
'use client';  // ← لا تضيفها إلا للضرورة
```

#### Code Splitting

```tsx
import dynamic from 'next/dynamic';

// المكونات الثقيلة تـ load عند الحاجة فقط
const Comments = dynamic(() => import('./Comments'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

#### Third-party Scripts

```tsx
import Script from 'next/script';

// ✅ صح
<Script
  src="https://www.googletagmanager.com/gtm.js?id=GTM-XXX"
  strategy="afterInteractive"  // أو "lazyOnload"
/>

// ❌ خطأ
<script src="https://www.googletagmanager.com/gtm.js?id=GTM-XXX" />
```

---

## 3️⃣ CLS — Cumulative Layout Shift

### المعنى
مجموع الـ layout shifts اللي تحصل في حياة الصفحة. كل shift يحسب بمعادلة `impact fraction × distance fraction`.

### المسببات

| السبب | الإصلاح |
|------|---------|
| Images بدون `width` و `height` | حدّد الـ dimensions دائماً |
| Fonts تـ swap وتغير الـ layout | `next/font` + `font-display: swap` |
| Ads/embeds بدون reserved space | احجز container بـ `min-height` |
| Dynamic content يدخل فوق الـ existing | `transform`, ليس `top`/`left` |
| Animations تحرّك العناصر | استخدم `transform` و `opacity` فقط |

### Patterns

#### الصور

```tsx
// ✅ صح — width + height محددين
<Image
  src={article.coverImage}
  alt={article.title}
  width={1200}
  height={630}
/>

// ✅ صح — fill mode مع container ثابت
<div style={{ position: 'relative', aspectRatio: '16 / 9' }}>
  <Image
    src={article.coverImage}
    alt={article.title}
    fill
    sizes="(max-width: 768px) 100vw, 800px"
  />
</div>

// ❌ خطأ — بدون dimensions
<img src={article.coverImage} alt={article.title} />
```

#### Embeds (YouTube, Twitter, etc.)

```tsx
<div style={{ position: 'relative', aspectRatio: '16 / 9' }}>
  <iframe
    src="https://www.youtube.com/embed/VIDEO_ID"
    style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
    }}
    loading="lazy"
  />
</div>
```

#### Web Fonts

```typescript
// next/font يضمن zero CLS من الـ fonts
import { Cairo } from 'next/font/google';

const cairo = Cairo({
  subsets: ['arabic'],
  display: 'swap',
  adjustFontFallback: true,  // ← يحسب fallback font metrics
});
```

---

## 4️⃣ TTFB — Time to First Byte (مهم بس مش CWV رسمياً)

### الـ Threshold
- Good: ≤ 800ms
- Poor: > 1.8s

### الإصلاحات

```typescript
// app/[locale]/blog/[slug]/page.tsx

// 1. ISR
export const revalidate = 3600;

// 2. أو SSG لو ممكن
export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    select: { slug: true, locale: true },
  });
  return articles.map(a => ({ locale: a.locale, slug: a.slug }));
}

// 3. Vercel Edge Runtime (للـ صفحات الخفيفة)
export const runtime = 'edge';

// 4. Cache headers
import { unstable_cache } from 'next/cache';

const getCachedArticle = unstable_cache(
  async (slug, locale) => {
    return prisma.article.findUnique({
      where: { slug_locale: { slug, locale } },
      include: { seo: true },
    });
  },
  ['article'],
  { revalidate: 3600, tags: ['article'] }
);
```

---

## 5️⃣ Image Optimization

### Modonty تستخدم Cloudinary
- Format: `f_auto` (يختار WebP/AVIF تلقائياً)
- Quality: `q_auto` (يضبط الجودة حسب الصورة)
- Width: `w_1200` للـ OG, `w_768` للموبايل, `w_1200` للديسكتوب

```typescript
// helpers
export function cloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string } = {}
): string {
  const transforms = [
    'f_auto',
    'q_auto',
    options.width && `w_${options.width}`,
    options.height && `h_${options.height}`,
    options.crop && `c_${options.crop}`,
  ].filter(Boolean).join(',');

  return `https://res.cloudinary.com/modonty/image/upload/${transforms}/${publicId}`;
}
```

### Next.js Image with Cloudinary

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/modonty/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};
```

---

## 6️⃣ JavaScript Bundle Size

### الـ Targets

| Metric | Good |
|--------|------|
| Total JS (initial) | < 170KB compressed |
| Total JS (per route) | < 50KB compressed |
| Unused JS | < 10% |

### Diagnose

```bash
# تحليل الـ bundle size
ANALYZE=true pnpm build

# سيفتح bundle analyzer في الـ browser
```

### Fixes

```typescript
// ❌ خطأ — يستورد الـ مكتبة كاملة
import _ from 'lodash';
const result = _.debounce(handler, 300);

// ✅ صح — يستورد الدالة فقط
import debounce from 'lodash/debounce';
const result = debounce(handler, 300);

// ✅ أصح — استخدم native أو مكتبة أخف
function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
```

---

## 7️⃣ Measurement

### في Production — web-vitals library

```typescript
// app/lib/web-vitals.ts
import { onLCP, onINP, onCLS, onTTFB, type Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  // إرسال لـ GA4 / Sentry / DataDog
  window.gtag?.('event', metric.name, {
    value: Math.round(metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_rating: metric.rating,
  });
}

export function initWebVitals() {
  onLCP(sendToAnalytics);
  onINP(sendToAnalytics);
  onCLS(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

```tsx
// app/layout.tsx
import { WebVitalsReporter } from '@/components/WebVitalsReporter';

<WebVitalsReporter />
```

### في Development — Lighthouse

```bash
# CLI
npx lighthouse https://localhost:3000/ar/blog/test \
  --only-categories=performance,seo \
  --output=html \
  --output-path=./lh-report.html \
  --view

# Chrome DevTools → Lighthouse tab
```

### في الـ CI — Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm build
      - run: pnpm start &
      - run: |
          npx lhci autorun \
            --collect.url=http://localhost:3000/ar/blog/sample \
            --assert.preset=lighthouse:recommended
```

---

## 8️⃣ Real-User Monitoring (RUM)

Vercel Analytics و Speed Insights مدمج تلقائياً:

```bash
pnpm add @vercel/analytics @vercel/speed-insights
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

<body>
  {children}
  <Analytics />
  <SpeedInsights />
</body>
```

هذي تجمع real CrUX data لـ Modonty وتعرضها في Vercel dashboard.

---

## 9️⃣ Checklist للـ Performance

```
☐ كل صفحة عندها ISR أو SSG (مش SSR كل request)
☐ الـ hero image عنده priority={true} + fetchPriority="high"
☐ كل <Image> عنده width + height محددين (أو fill مع container)
☐ Cloudinary URLs تستخدم f_auto + q_auto
☐ Fonts via next/font مع display: swap
☐ Third-party scripts via next/script مع strategy مناسب
☐ JS bundle لكل route < 50KB
☐ Server Components افتراضياً، 'use client' عند الضرورة فقط
☐ Embeds (iframe) فيها container بـ aspect-ratio
☐ Vercel Speed Insights مفعّل لمراقبة real CWV
```

---

## 📚 المصادر الرسمية

- [web.dev — Core Web Vitals](https://web.dev/articles/vitals)
- [web.dev — LCP optimization](https://web.dev/articles/optimize-lcp)
- [web.dev — INP optimization](https://web.dev/articles/optimize-inp)
- [web.dev — CLS optimization](https://web.dev/articles/optimize-cls)
- [Next.js — Optimizing Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Next.js — Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Next.js — Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [web-vitals library](https://github.com/GoogleChrome/web-vitals)
