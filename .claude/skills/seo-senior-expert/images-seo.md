# Images SEO

> كل ما يخص الصور في Modonty: alt text، الأبعاد، الصيغ، الـ lazy loading، الـ Cloudinary patterns.

---

## 🎯 المبدأ

كل `<img>` أو `<Image>` في Modonty يجب أن يلبّي:
1. **alt** descriptive موجود (إلا للزخارف الـ purely decorative)
2. **width** + **height** محددين (يمنع CLS)
3. صيغة **WebP/AVIF** عبر Cloudinary
4. **lazy loading** افتراضياً، إلا الـ LCP element
5. حجم ملف معقول (≤ 200KB للصور العادية)
6. CDN URL (لا URLs محلية لـ images)

---

## 1️⃣ Alt Text — القواعد

### المصدر
- [Google — Image SEO best practices](https://developers.google.com/search/docs/appearance/google-images)
- [WCAG 2.1 — Non-text Content](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html)

### القواعد الإلزامية

| القاعدة | السبب |
|---------|------|
| كل `<img>` غير decorative له `alt` | Lighthouse + WCAG |
| الـ alt **يصف الصورة فعلياً** | UX + accessibility |
| **لا** keyword stuffing | Google penalty |
| **لا** "image of...", "picture of..." (screen readers يضيفونها تلقائياً) | redundancy |
| ≤ 125 حرف (موصى به للـ screen readers) | best practice |
| للصور الـ decorative: `alt=""` (فاضي، ليس missing) | يخبر screen reader يتجاهلها |

### أمثلة

```tsx
// ❌ سيء
<Image src="seo.jpg" alt="SEO" />
<Image src="seo.jpg" alt="image" />
<Image src="seo.jpg" alt="" />  {/* للصورة الـ informative */}
<Image src="seo.jpg" alt="seo, search engine optimization, marketing, digital" />

// ✅ جيد
<Image
  src="https://cdn.modonty.com/articles/seo-strategy.webp"
  alt="رسم بياني يوضح خطوات بناء استراتيجية SEO عربية في 5 مراحل"
  width={1200}
  height={630}
/>

// ✅ صورة decorative — alt="" فعلاً صحيح هنا
<Image src="/decorative-divider.svg" alt="" width={100} height={20} aria-hidden="true" />
```

---

## 2️⃣ Dimensions — يمنع CLS

### القاعدة
كل `<Image>` لازم له **`width` و `height` صريحين** أو **`fill` مع container ثابت**.

```tsx
// ✅ مع dimensions
<Image
  src={article.coverImage}
  alt={article.coverAlt}
  width={1200}
  height={630}
  sizes="(max-width: 768px) 100vw, 1200px"
/>

// ✅ fill mode — للصور اللي حجمها يعتمد على الـ container
<div style={{ position: 'relative', aspectRatio: '16 / 9', width: '100%' }}>
  <Image
    src={article.coverImage}
    alt={article.coverAlt}
    fill
    sizes="(max-width: 768px) 100vw, 800px"
    style={{ objectFit: 'cover' }}
  />
</div>

// ❌ بدون dimensions
<Image src={article.coverImage} alt={article.coverAlt} />  // يطلع error في next/image
<img src={article.coverImage} alt={article.coverAlt} />     // يسبب CLS
```

---

## 3️⃣ Image Formats — الترتيب الموصى به

### Google's preference (2025)

1. **AVIF** — أفضل ضغط، دعم متزايد (Chrome 85+, Firefox 93+, Safari 16+)
2. **WebP** — دعم واسع (~ 96% الـ browsers), 25-35% أصغر من JPEG
3. **JPEG** — fallback للصور الفوتوغرافية
4. **PNG** — للصور بـ transparency أو screenshots حادة
5. **SVG** — للـ icons والـ logos (vector فقط)

### في Modonty عبر Cloudinary

```typescript
// app/lib/cloudinary.ts
export function modontyImage(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'limit' | 'scale';
    gravity?: 'auto' | 'face';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg';
  } = {}
): string {
  const transforms = [
    `f_${options.format ?? 'auto'}`,
    `q_${options.quality ?? 'auto'}`,
    options.width && `w_${options.width}`,
    options.height && `h_${options.height}`,
    options.crop && `c_${options.crop}`,
    options.gravity && `g_${options.gravity}`,
  ].filter(Boolean).join(',');

  return `https://res.cloudinary.com/modonty/image/upload/${transforms}/${publicId}`;
}

// استخدام
const heroImage = modontyImage('articles/seo-strategy', {
  width: 1200,
  height: 630,
  crop: 'fill',
  format: 'auto',  // ← Cloudinary يختار WebP/AVIF حسب الـ browser
  quality: 'auto',
});
```

### Next.js config

```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],  // الترتيب مهم: AVIF أولاً
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/modonty/**',
      },
    ],
    deviceSizes: [640, 768, 1024, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

### ❌ Image formats ممنوعة في Modonty

| الصيغة | السبب |
|--------|-------|
| **GIF animated** | حجم ضخم — استخدم MP4/WebM video بدلاً |
| **BMP** | غير مضغوط، لا يدعم browsers حديثاً |
| **TIFF** | للطباعة فقط |
| **SVG في og:image** | Facebook + LinkedIn يرفضوها |

---

## 4️⃣ Lazy Loading

### القواعد

| الصورة | الـ loading |
|--------|-------------|
| **LCP element** (hero image في الـ above-the-fold) | `priority={true}` (يتجاوز lazy) |
| **above-the-fold** ما عدا LCP | `loading="eager"` |
| **below-the-fold** | `loading="lazy"` (default في `<Image>`) |

### Next.js Image

```tsx
// Hero (LCP)
<Image
  src={article.coverImage}
  alt={article.coverAlt}
  width={1200}
  height={630}
  priority={true}              // ← critical
  fetchPriority="high"
  sizes="(max-width: 768px) 100vw, 1200px"
/>

// Below-the-fold (default)
<Image
  src={inlineImage}
  alt="..."
  width={800}
  height={450}
  // loading="lazy" تلقائياً
/>
```

---

## 5️⃣ Responsive Images — `sizes`

### المبدأ
`sizes` يخبر الـ browser أي صورة تـ download حسب viewport.

```tsx
<Image
  src={article.coverImage}
  alt={article.coverAlt}
  width={1200}
  height={630}
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 80vw,
         1200px"
/>
```

### Cloudinary srcset (yدوياً)

```tsx
<picture>
  <source
    type="image/avif"
    srcSet={`${modontyImage(id, { width: 768, format: 'avif' })} 768w,
             ${modontyImage(id, { width: 1200, format: 'avif' })} 1200w,
             ${modontyImage(id, { width: 1920, format: 'avif' })} 1920w`}
  />
  <source
    type="image/webp"
    srcSet={`${modontyImage(id, { width: 768, format: 'webp' })} 768w,
             ${modontyImage(id, { width: 1200, format: 'webp' })} 1200w,
             ${modontyImage(id, { width: 1920, format: 'webp' })} 1920w`}
  />
  <img
    src={modontyImage(id, { width: 1200, format: 'jpg' })}
    alt="..."
    width={1200}
    height={630}
    loading="lazy"
  />
</picture>
```

في Next.js `<Image>` هذا يحصل تلقائياً عبر `sizes` و الـ image optimization API.

---

## 6️⃣ Filenames — مهم للـ SEO

### القاعدة
الـ file path في الـ URL يساعد Google يفهم الصورة، خاصة بـ image search.

```
✅ /articles/seo-strategy-arabic-2026.webp
❌ /articles/IMG_8472.jpg
❌ /articles/screenshot-2024-01-15.png
```

في Cloudinary: استخدم descriptive `public_id`:

```typescript
// عند upload
await cloudinary.uploader.upload(file, {
  public_id: `articles/${article.slug}-cover`,
  // ← ينتج URL: /modonty/image/upload/articles/seo-strategy-cover.webp
});
```

---

## 7️⃣ Decorative Images — تجاهل صريح

للصور الزخرفية (dividers, background patterns):

```tsx
<Image
  src="/icons/divider.svg"
  alt=""                    // ← فاضي، ليس missing
  aria-hidden="true"        // ← يخفيها عن screen readers
  width={100}
  height={20}
/>
```

أو استخدمها كـ CSS background:

```css
.divider {
  background-image: url('/icons/divider.svg');
  background-repeat: no-repeat;
  height: 20px;
}
```

---

## 8️⃣ JSON-LD `image` — قواعد

من Article schema: ربط الصورة بمحتوى المقالة بشكل صريح.

```typescript
// 3 aspect ratios كما يوصي Google
const articleImages = [
  modontyImage(article.coverPublicId, { width: 1200, height: 1200, crop: 'fill' }),  // 1:1
  modontyImage(article.coverPublicId, { width: 1200, height: 900, crop: 'fill' }),   // 4:3
  modontyImage(article.coverPublicId, { width: 1200, height: 630, crop: 'fill' }),   // 16:9
];

const jsonLd = {
  '@type': 'BlogPosting',
  image: articleImages,
  // ...
};
```

---

## 9️⃣ Broken Images — كشف ومنع

### Semrush Error: "Broken internal images"

#### السبب الجذري
- صورة محذوفة من الـ CDN
- الـ URL غير صحيح
- typo في public_id

#### الإصلاح الـ Preventive

```typescript
// validation عند create/update المقالة
import { z } from 'zod';

const ArticleImageSchema = z.object({
  publicId: z.string().min(1),
  alt: z.string().min(5).max(125),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

// قبل save
const validated = ArticleImageSchema.parse(article.coverImage);

// تحقق إن الصورة موجودة فعلاً (optional: في background job)
async function verifyImageExists(url: string): Promise<boolean> {
  const res = await fetch(url, { method: 'HEAD' });
  return res.ok;
}
```

#### Health Check job (cron)

```typescript
// app/jobs/check-broken-images.ts
export async function checkBrokenImages() {
  const articles = await prisma.article.findMany({
    select: { id: true, slug: true, coverImage: true },
    where: { publishedAt: { not: null } },
  });

  const broken: { id: string; slug: string; url: string }[] = [];

  for (const a of articles) {
    const exists = await verifyImageExists(a.coverImage);
    if (!exists) broken.push({ id: a.id, slug: a.slug, url: a.coverImage });
  }

  if (broken.length > 0) {
    // alert admin + create dashboard entry
    await sendAlert('Broken images detected', broken);
  }
}
```

---

## 🔟 File Size Targets

| الصورة | الـ target |
|--------|-----------|
| Hero (LCP) | ≤ 200 KB (WebP), ≤ 100 KB (AVIF) |
| Inline body image | ≤ 100 KB |
| Thumbnail (تنبيهات/cards) | ≤ 30 KB |
| Avatar | ≤ 20 KB |
| Icon (SVG) | ≤ 5 KB |

Cloudinary `q_auto` يضمن هذي الأرقام لأغلب الصور.

---

## 1️⃣1️⃣ Checklist للصور

```
☐ كل <img> أو <Image> له alt صالح (أو alt="" للزخرفي)
☐ width + height محددين (أو fill في container ثابت)
☐ صيغة WebP أو AVIF (عبر Cloudinary f_auto)
☐ priority={true} لـ hero image فقط
☐ loading="lazy" للصور تحت الـ fold (default في Next.js)
☐ sizes attribute موجود للـ responsive
☐ public_id descriptive (article-slug-cover)
☐ JSON-LD image array فيه 3 aspect ratios (1:1, 4:3, 16:9)
☐ og:image: 1200×630, WebP أو JPG (لا SVG)
☐ no broken images (cron job يفحص أسبوعياً)
☐ file size معقول حسب الـ targets فوق
```

---

## 📚 المصادر الرسمية

- [Google — Image SEO best practices](https://developers.google.com/search/docs/appearance/google-images)
- [WCAG 2.1 — Non-text Content](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html)
- [web.dev — Optimize images for LCP](https://web.dev/articles/optimize-lcp#optimize_the_image)
- [Next.js — Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Cloudinary — Image optimization](https://cloudinary.com/documentation/image_optimization)
