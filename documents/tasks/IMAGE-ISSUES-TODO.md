# Image Issues — Fix TODO
**Status:** COMPLETE ✅
**Last Updated:** 2026-04-09 (All Scopes Done)
**Verified against:** Next.js official docs via Context7 (2026-04-09)
**Scope:** All 3 apps — modonty (public), admin (dashboard), console (client)

---

## 1. Modonty — Public Site (Highest Priority — affects real users & SEO)

### 🔴 CRITICAL — Plain `<img>` tags (صفحات المستخدم)
- [x] **M1** `modonty/app/users/profile/disliked/page.tsx` — ✅ (2026-04-09)
- [x] **M2** `modonty/app/users/profile/disliked/page.tsx` — ✅ (2026-04-09)
- [x] **M3** `modonty/app/users/profile/disliked/page.tsx` — ✅ (2026-04-09)
- [x] **M4** `modonty/app/users/profile/liked/page.tsx` — ✅ (2026-04-09)
- [x] **M5** `modonty/app/users/profile/liked/page.tsx` — ✅ (2026-04-09)
- [x] **M6** `modonty/app/users/profile/favorites/page.tsx` — ✅ (2026-04-09)
- [x] **M7** `modonty/app/users/profile/following/page.tsx` — ✅ (2026-04-09)

### 🟡 MEDIUM — shadcn Avatar (native img — قيد تصميمي)
- [x] **M8** `modonty/app/clients/components/client-card.tsx` — custom div + `next/image` replaces shadcn Avatar ✅ (2026-04-09)
- [x] **M9** `modonty/app/clients/[slug]/components/hero/hero-avatar.tsx` — custom div + `next/image` fill ✅ (2026-04-09)

### ✅ DONE
- ✅ `modonty/app/articles/[slug]/components/article-featured-image.tsx` — `object-cover` → `object-contain` + `bg-muted` لمنع قص صور البانر (2026-04-09) — **Live tested 3 ratios: 3.85:1 / 1.98:1 / 0.21:1 — all PASS, zero crop**
- ✅ `modonty/components/feed/postcard/PostCardAvatar.tsx` — `object-cover` في الأفاتار الدائري صح (2026-04-09)
- ✅ M1–M7: profile pages (disliked/liked/favorites/following) — 7 plain `<img>` → `next/image`, tsc zero errors (2026-04-09)
- ✅ M8–M9: clients card + hero avatar — replaced shadcn AvatarImage with custom `next/image` div (2026-04-09)

### 📌 CORRECT — No action needed
- `/` الرئيسية ✅
- `/articles` قائمة المقالات ✅
- `/articles/[slug]` صفحة المقال بكل مكوناتها ✅
- `/articles/[slug]/sidebar/article-client-card` — fill + sizes + object-contain للوقو صح ✅
- `/clients/[slug]` hero-cover — OptimizedImage + aspect-[6/1] + sizes ✅
- `/categories`, `/categories/[slug]` ✅
- `/authors/[slug]` — fill + object-cover + sizes + bg-muted ✅
- `/search`, `/contact`, `/about`, `/help`, `/legal` ✅
- `PostCardHeroImage`, `PostCardAvatar` ✅
- `LogoNav`, Chatbot components ✅
- `modonty/components/media/OptimizedImage.tsx` ✅
- `modonty/next.config.ts` — formats + deviceSizes + imageSizes (incl. 16px) + 31-day cache TTL ✅ (v16 compliant)

---

## 2. Admin — Dashboard (Medium Priority — internal, no SEO impact)

### 🔴 CRITICAL — Plain `<img>` tags
- [x] **A1** client-view.tsx — 3 `<img>` → `<Image>` ✅ (2026-04-09)
- [x] **A2** client-header.tsx — 1 `<img>` → `<Image>` ✅ (2026-04-09)
- [x] **A3** media-social-tab.tsx — 3 `<img>` → `<Image>` ✅ (2026-04-09)
- [x] **A4** details-tab.tsx — 2 `<img>` → `<Image>` ✅ (2026-04-09)
- [x] **A5** seo-tab.tsx — 2 `<img>` → `<Image>` ✅ (2026-04-09)
- [x] **A6** seo-preview-card.tsx — 2 `<img>` → `<Image fill>` ✅ (2026-04-09)
- [x] **A7** seo-section.tsx — 1 `<img>` → `<Image fill>` ✅ (2026-04-09)
- [x] **A8** seo-step.tsx — 2 `<img>` → `<Image fill>` ✅ (2026-04-09)
- [x] **A9** article-view-gallery.tsx — 1 `<img>` → `<Image fill>` ✅ (2026-04-09)
- [x] **A10** category-view.tsx — 1 `<img>` → `<Image fill>` ✅ (2026-04-09)
- [x] **A11** industry-view.tsx — 1 `<img>` → `<Image fill>` ✅ (2026-04-09)
- [x] **A12** tag-view.tsx — 1 `<img>` → `<Image fill>` ✅ (2026-04-09)
- [x] **A13** user-form.tsx — 1 `<img>` → `<Image>` ✅ (2026-04-09)
- [x] **A14** file-preview.tsx — 1 `<img>` → `<Image unoptimized>` ✅ (2026-04-09)
- [x] **A15** edit-media-form.tsx — 1 `<img>` → `<Image unoptimized>` ✅ (2026-04-09)
- [x] **A16** page-form.tsx — 2 `<img>` → `<Image fill>` ✅ (2026-04-09)
- [x] **A17** cloudinary-image-input.tsx — 1 `<img>` → `<Image fill>` ✅ (2026-04-09)
- [x] **A18** deferred-image-upload.tsx — 1 `<img>` → `<Image fill>` ✅ (2026-04-09)

### 🟠 HIGH — Object-fit / letterbox on logos
- [x] **A19** `admin/components/shared/media-picker.tsx:148` — `object-contain` → `object-scale-down p-2` ✅ (2026-04-09)
- [x] **A20** `admin/clients/[id]/tabs/media-social-tab.tsx:112,137,162` — 3× added `bg-muted` ✅ (2026-04-09)
- [x] **A21** `admin/clients/[id]/tabs/details-tab.tsx:89` — added `bg-muted` ✅ (2026-04-09)

### 🟠 HIGH — Missing image config (confirmed via Context7 — Next.js v16 breaking change)
- [x] **A22** `admin/next.config.ts` — أضف الثلاثة معًا ✅ (2026-04-09)

### 🟡 MEDIUM
- [x] **A23** `admin/media/components/media-grid.tsx` — added responsive `sizes` prop matching grid columns for both compact/standard modes ✅ (2026-04-09)

### ✅ DONE
- ✅ `admin/next.config.ts` — formats + deviceSizes + imageSizes[16] (v16 breaking change fix) (2026-04-09)
- ✅ A1–A18: 18 plain `<img>` → `next/image` across admin, tsc zero errors (2026-04-09)
- ✅ `admin/clients/actions/update-client-logo.ts` — إضافة `revalidatePath("/articles", "layout")` لإصلاح race condition (2026-04-09)
- ✅ `admin/clients/actions/update-client-hero.ts` — إضافة `revalidatePath("/articles", "layout")` (2026-04-09)

---

## 3. Console — Client Dashboard (Lower Priority — limited users)

### 🔴 CRITICAL — Plain `<img>` tags
- [x] **C1** `console/app/(dashboard)/dashboard/articles/components/article-card.tsx` — `<img>` → `<Image fill sizes>` + added `relative` to container ✅ (2026-04-09)

### 🟠 HIGH — Missing `sizes` prop
- [x] **C2** `console/app/(dashboard)/dashboard/articles/components/article-preview-client.tsx:303` — added `sizes="(max-width: 768px) 100vw, 672px"` ✅ (2026-04-09)
- [x] **C3** `console/app/(dashboard)/dashboard/media/components/media-gallery.tsx` — already had `sizes` prop ✅ (verified 2026-04-09)

### 🟠 HIGH — Missing image config (confirmed via Context7 — Next.js v16 breaking change)
- [x] **C4** `console/next.config.ts` — أضف الثلاثة معًا ✅ (2026-04-09)

### ✅ DONE
- ✅ `console/next.config.ts` — formats + deviceSizes + imageSizes[16] (v16 breaking change fix) (2026-04-09)
- ✅ C1: article-card.tsx — plain `<img>` → `<Image fill sizes>` + relative container (2026-04-09)
- ✅ C2: article-preview-client.tsx — added `sizes` prop to `<Image fill>` (2026-04-09)
- ✅ C3: media-gallery.tsx — already had `sizes` prop, verified (2026-04-09)

### 📌 CORRECT — No action needed
- `console/app/components/modonty-logo.tsx` — aspect-[3/1] + object-cover ✅
