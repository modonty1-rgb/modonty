# وأي.

> Last Updated: 2026-04-11
> Scope: كل صفحات `modonty/app/` + shared components
> Based on: HTML Living Standard · WCAG 2.2 · Google Search Central

---

## ✅ مكتمل

- [x] **SEM-1a** — `app/articles/[slug]/page.tsx` — `<main>` → `<div>`
- [x] **SEM-1b** — `app/clients/page.tsx` — `<main>` → `<div>`
- [x] **SEM-1c** — `app/categories/page.tsx` — `<main>` → `<div>`
- [x] **SEM-1d** — `app/categories/[slug]/page.tsx` — `<main>` → `<div>`
- [x] **SEM-1e** — `app/trending/page.tsx` — `<main>` → `<div>`
- [x] **SEM-1f** — `app/search/page.tsx` — `<main dir="rtl">` → `<div dir="rtl">`
- [x] **SEM-1g** — `app/news/page.tsx` — `<main>` → `<div>`
- [x] **SEM-2a** — `app/clients/page.tsx` — `<h1 className="sr-only">العملاء</h1>`
- [x] **SEM-2b** — `app/categories/page.tsx` — `<h1 className="sr-only">التصنيفات</h1>`
- [x] **SEM-2c** — `app/users/profile/page.tsx` — `<h1 className="sr-only">الملف الشخصي</h1>`
- [x] **SEM-2d** — `app/users/profile/favorites/page.tsx` — `<h1 className="sr-only">المحفوظات</h1>`
- [x] **SEM-2e** — `app/users/profile/liked/page.tsx` — `<h1 className="sr-only">الإعجابات</h1>`
- [x] **SEM-2f** — `app/users/profile/comments/page.tsx` — `<h1 className="sr-only">تعليقاتي</h1>`
- [x] **SEM-2g** — `app/users/profile/following/page.tsx` — `<h1 className="sr-only">المتابعون</h1>`
- [x] **SEM-2h** — `app/users/profile/disliked/page.tsx` — `<h1 className="sr-only">غير المعجبة</h1>`
- [x] **SEM-2i** — `app/users/profile/settings/page.tsx` — `<h1 className="sr-only">الإعدادات</h1>`
- [x] **SEM-3a** — `app/authors/[slug]/page.tsx` — `<section aria-labelledby="author-articles-heading">`
- [x] **SEM-3b** — `app/news/page.tsx` — `<section aria-labelledby="news-articles-heading">`
- [x] **SEM-4** — `MobileFooter.tsx` — `aria-label="التنقل السفلي"`
- [x] **SEM-5a** — `app/clients/error.tsx`
- [x] **SEM-5b** — `app/categories/error.tsx`
- [x] **SEM-5c** — `app/authors/[slug]/error.tsx`
- [x] **SEM-5d** — `app/trending/error.tsx`
- [x] **SEM-5e** — `app/subscribe/error.tsx`
- [x] **SEM-5f** — `app/users/profile/error.tsx`
- [x] **SEM-5g** — `app/users/login/error.tsx`
- [x] **SEM-5h** — `app/help/error.tsx`
- [x] **SEM-5i** — `app/help/faq/error.tsx`
- [x] **SEM-6a** — `components/layout/LeftSidebar/LeftSidebar.tsx` — `<aside aria-label="الشريط الجانبي الأيسر">`
- [x] **SEM-6b** — `components/layout/RightSidebar/RightSidebar.tsx` — `<aside aria-label="الشريط الجانبي الأيمن">`
- [x] **SEM-6c** — `components/layout/SidebarSkeletons.tsx` — `aria-hidden="true"` on both skeleton asides

---

## جرد كامل — حالة كل صفحة (2026-04-11)

| الصفحة                     | `<main>` مفردة | `<h1>` موجود          | `<section>` مسماة  | `<nav>` مسماة    | `<aside>` مسمى |
| -------------------------- | -------------- | --------------------- | ------------------ | ---------------- | -------------- |
| `/` (homepage)             | ✅ في layout   | ✅ sr-only            | ✅                 | ✅               | ✅             |
| `/articles/[slug]`         | ✅             | ✅ (في ArticleHeader) | ✅                 | ✅               | ✅ aria-label  |
| `/clients`                 | ✅             | ✅ sr-only            | ✅                 | ✅               | ✅             |
| `/clients/[slug]`          | ✅             | ✅ (في hero)          | ✅                 | ✅               | ✅             |
| `/categories`              | ✅             | ✅ sr-only            | ✅                 | ✅               | ✅             |
| `/categories/[slug]`       | ✅             | ✅ (في hero)          | ✅                 | ✅               | ✅             |
| `/authors/[slug]`          | ✅             | ✅                    | ✅ aria-labelledby | ✅               | ✅             |
| `/trending`                | ✅             | ✅ (في component)     | ✅                 | ✅               | ✅             |
| `/search`                  | ✅             | ✅ (في component)     | ✅                 | ✅               | ✅             |
| `/news`                    | ✅             | ✅ (في component)     | ✅ aria-labelledby | ✅               | ✅             |
| `/about`                   | ✅             | ✅ visible            | ✅                 | ✅               | ✅             |
| `/contact`                 | ✅             | ✅ visible            | ✅                 | ✅               | ✅             |
| `/subscribe`               | ✅             | ✅ visible            | ✅                 | ✅               | ✅             |
| `/help`                    | ✅             | ✅ visible            | ✅                 | ✅               | ✅             |
| `/help/faq`                | ✅             | ✅ visible            | ✅                 | ✅               | ✅             |
| `/help/feedback`           | ✅             | ✅ visible            | ✅                 | ✅               | ✅             |
| `/legal/*`                 | ✅             | ✅ visible            | ✅                 | ✅               | ✅             |
| `/terms`                   | ✅             | ✅ visible            | ✅                 | ✅               | ✅             |
| `/users/login`             | ✅             | ✅ visible            | ✅                 | ✅               | ✅             |
| `/users/register`          | ✅             | ✅ (في RegisterForm)  | ✅                 | ✅               | ✅             |
| `/users/[id]`              | ✅             | ✅ visible            | ✅                 | ✅               | ✅             |
| `/users/notifications`     | ✅             | ✅ visible            | ✅                 | ✅               | ✅             |
| `/users/profile`           | ✅             | ✅ sr-only            | ✅                 | ✅               | ✅             |
| `/users/profile/favorites` | ✅             | ✅ sr-only            | ✅                 | ✅               | ✅             |
| `/users/profile/liked`     | ✅             | ✅ sr-only            | ✅                 | ✅               | ✅             |
| `/users/profile/comments`  | ✅             | ✅ sr-only            | ✅                 | ✅               | ✅             |
| `/users/profile/following` | ✅             | ✅ sr-only            | ✅                 | ✅               | ✅             |
| `/users/profile/disliked`  | ✅             | ✅ sr-only            | ✅                 | ✅               | ✅             |
| `/users/profile/settings`  | ✅             | ✅ sr-only            | ✅                 | ✅               | ✅             |
| `MobileFooter` (nav)       | —              | —                     | —                  | ✅ aria-label    | —              |
| `Footer` (navs)            | —              | —                     | —                  | ✅ aria-label x2 | —              |
| `LeftSidebar`              | —              | —                     | —                  | —                | ✅ aria-label  |
| `RightSidebar`             | —              | —                     | —                  | —                | ✅ aria-label  |
| `SidebarSkeletons`         | —              | —                     | —                  | —                | ✅ aria-hidden |

---

## مراجع رسمية

- https://html.spec.whatwg.org/multipage/grouping-content.html#the-main-element
- https://html.spec.whatwg.org/multipage/sections.html#the-section-element
- https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA11
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
