# Modonty — Image Size Guidelines
**Version:** 1.0  
**Date:** 2026-04-10  
**Scope:** All 3 apps — modonty (public), admin (dashboard), console (client)  
**Source:** Live code audit — all sizes derived from actual component containers

---

## 1. صورة المقال المميزة — Article Featured Image

| Property | Value |
|----------|-------|
| **Aspect Ratio** | **16:9** |
| **Minimum** | 1280 × 720 px |
| **Recommended** | **1920 × 1080 px** |
| **Maximum** | 3840 × 2160 px |
| **Object Fit** | `object-contain` (no cropping — black fills empty space) |
| **Component** | `modonty/app/articles/[slug]/components/article-featured-image.tsx` |
| **Sizes** | Mobile: 100vw · Tablet: 80vw · Desktop: max 900px |

> ⚠️ `object-contain` means the image is never cropped. If dimensions are wrong (e.g. 6:1 banner), it will appear as a thin strip with empty space above and below. Always use 16:9.

---

## 2. ثمبنيل بطاقة المقال — Post Card Thumbnail

| Property | Value |
|----------|-------|
| **Aspect Ratio** | **16:9** |
| **Recommended** | **1200 × 675 px** |
| **Object Fit** | `object-cover` (crops from sides) |
| **Component** | `modonty/components/feed/postcard/PostCardHeroImage.tsx` |
| **Sizes** | Mobile: 100vw · Tablet: 50vw · Desktop: 600px (LCP) / 33vw (others) |

> Keep important content centered — edges may be cropped on smaller screens.

---

## 3. لوجو العميل — Client Logo

| Property | Value |
|----------|-------|
| **Aspect Ratio** | **1:1 (Square)** |
| **Recommended** | **500 × 500 px** |
| **Minimum** | 256 × 256 px |
| **Object Fit** | `object-contain` (no cropping) |
| **Component** | `modonty/app/clients/components/client-card.tsx` |
| **Display Size** | 80 × 80 px on client card |
| **Format** | PNG with transparent background preferred |

> Use PNG with transparency. The container has a ring/border — no need to add a border in the design.

---

## 4. هيرو غلاف صفحة العميل — Client Hero Cover

| Property | Value |
|----------|-------|
| **Aspect Ratio** | **6:1 (Ultra-wide banner)** |
| **Recommended** | **2400 × 400 px** |
| **Minimum** | 1920 × 320 px |
| **Object Fit** | `object-cover` (crops top/bottom) |
| **Component** | `modonty/app/clients/[slug]/components/hero/hero-cover.tsx` |
| **Sizes** | Full viewport width (100vw) |

> A dark gradient overlay is applied automatically on top of the image. Keep text-free — the logo/name overlay appears on it programmatically.

---

## 5. أفاتار العميل فوق الهيرو — Client Hero Avatar

| Property | Value |
|----------|-------|
| **Aspect Ratio** | **1:1 (Square)** |
| **Recommended** | **500 × 500 px** |
| **Object Fit** | `object-contain` |
| **Component** | `modonty/app/clients/[slug]/components/hero/hero-avatar.tsx` |
| **Display Size** | Mobile: 80 × 80 px · Desktop: 112 × 112 px |
| **Format** | PNG with transparent background preferred |

---

## 6. صورة العميل في الـ Sidebar — Article Client Card (Sidebar)

| Property | Value |
|----------|-------|
| **Hero Section Ratio** | **16:9** |
| **Logo Overlay Size** | 56 × 56 px (with hero) / 80 × 80 px (without hero) |
| **Object Fit Hero** | `object-cover` |
| **Object Fit Logo** | `object-contain` |
| **Component** | `modonty/app/articles/[slug]/components/sidebar/article-client-card.tsx` |
| **Sidebar Width** | ~240px |

---

## 7. صورة الـ OG / Social Sharing

| Property | Value |
|----------|-------|
| **Aspect Ratio** | **1.91:1** |
| **Dimensions** | **1200 × 630 px** (fixed — no other size accepted) |
| **Format** | JPEG |
| **Component** | `modonty/lib/seo/index.ts` (auto-generated) |

> Generated automatically from article data. Only relevant if manually overriding the OG image.

---

## 8. أفاتار المؤلف — Author Avatar

| Property | Value |
|----------|-------|
| **Aspect Ratio** | **1:1 (Square)** |
| **Recommended** | **256 × 256 px** minimum |
| **Display Size** | 80 × 80 px |
| **Object Fit** | `object-cover` |
| **Component** | `modonty/app/articles/[slug]/components/sidebar/article-author-bio.tsx` |

---

## 9. صورة الفئة — Category Image

| Property | Value |
|----------|-------|
| **Aspect Ratio** | **1:1 (Square)** — works for both mobile (16:9) and desktop (192×192) |
| **Recommended** | **600 × 600 px** |
| **Object Fit** | `object-cover` |
| **Component** | `modonty/app/categories/[slug]/components/category-detail-hero.tsx` |
| **Note** | Displayed as 16:9 on mobile, cropped to 192×192 square on desktop |

---

## 10. صور معرض المقال — Article Image Gallery

| Property | Value |
|----------|-------|
| **Aspect Ratio** | **16:9** |
| **Recommended** | **1200 × 675 px** |
| **Object Fit** | `object-cover` |
| **Component** | `modonty/app/articles/[slug]/components/article-image-gallery.tsx` |
| **Grid** | Mobile: 1 col · Tablet: 2 cols · Desktop: 3 cols |

---

## Quick Reference Table

| Image | Ratio | Recommended Size | Object Fit |
|-------|-------|-----------------|------------|
| صورة المقال المميزة | **16:9** | 1920 × 1080 | contain |
| ثمبنيل البطاقة | **16:9** | 1200 × 675 | cover |
| لوجو العميل | **1:1** | 500 × 500 | contain |
| هيرو غلاف العميل | **6:1** | 2400 × 400 | cover |
| أفاتار العميل (هيرو) | **1:1** | 500 × 500 | contain |
| صورة الـ OG | **1.91:1** | 1200 × 630 | — |
| أفاتار المؤلف | **1:1** | 256 × 256 | cover |
| صورة الفئة | **1:1** | 600 × 600 | cover |
| صور المعرض | **16:9** | 1200 × 675 | cover |

---

## Design Rules

1. **16:9 for all article content** — Featured image, card thumbnail, gallery images, sidebar hero.
2. **1:1 for all avatars/logos** — Client logo, hero avatar, author avatar, category.
3. **6:1 for client hero banner only** — This is the only place a wide banner is correct.
4. **PNG + transparent background** for logos and avatars — never JPG for logos.
5. **Keep subject centered** — Edges may be cropped on responsive layouts.
6. **No text in images** (except OG) — Text is rendered by the UI on top of images.
7. **Minimum 72 DPI, recommended 150+ DPI** for all raster images.

---

## Common Mistakes to Avoid

| ❌ Wrong | ✅ Right |
|---------|---------|
| Uploading a 6:1 banner as article featured image | Use 16:9 (1920×1080) |
| Uploading a rectangular logo (e.g. 422×70) as client logo | Use 1:1 square (500×500) |
| Using JPG for logos with white backgrounds | Use PNG with transparency |
| Uploading images smaller than 600px wide | Always upload high-res originals |
| Adding text to featured images | Let the UI handle text overlay |

---

*Generated from live code audit — `modonty` v1.19.0 — 2026-04-10*
