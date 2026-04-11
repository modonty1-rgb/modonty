# Master TODO — MODONTY

> Last Updated: 2026-04-11
> Versions: admin v0.29.0 | modonty v1.22.0

---

## All Critical/High Tasks ✅ DONE

- [x] Security: auth + Zod + slug on ALL entities (articles, clients, categories, tags, industries, authors, media, settings)
- [x] Security: auth on user management (create/update/delete admin)
- [x] Error boundaries: all sections have error.tsx
- [x] Arabic labels → English: clients (80+ labels), categories, tags, industries
- [x] SEO: Organization + WebSite in JSON-LD, alternates.languages, breadcrumbs English
- [x] Industry cascade to clients
- [x] Toast UI: Arabic messages, icons, colors, auto-dismiss
- [x] Articles: 5-step form, auto-save, publish gate, editor upgrade, optimistic lock fix
- [x] Changelog + team notes system
- [x] Feedback banner (Send Note → DB + email)
- [x] Progress counter fix (56% → 60%)
- [x] Arabic tooltips + SEO analyzer messages
- [x] About + Legal pages — cached metadata (terms page)
- [x] Settings change — auto-cascade to all entities (v0.17.0)
- [x] Bulk SEO fix for low-score articles (in SEO Overview page)
- [x] Slug box visible on all entity forms (categories, tags, industries, authors)

---

## Post-Deploy — Admin Auth Fix (13 remaining actions)

- [ ] contact-messages-actions.ts — add auth to delete, updateStatus, markAsRead, markAsReplied
- [ ] faq-actions.ts — add auth to create, update, delete, reorder, toggleStatus
- [ ] upload-image.ts — add auth to uploadImage
- [ ] upload-avatar.ts — add auth to uploadAvatar
- [ ] send-feedback.ts — add auth to sendFeedback
- [ ] cascade-all-seo.ts — add auth to cascadeSettingsToAllEntities

---

## ⚠️ Vercel — Pending Manual Actions

- [ ] **AUTH_SECRET** — copy the new local secret to Vercel: Dashboard → Project → Settings → Environment Variables → `AUTH_SECRET`
  Value: `rGtnuhR8EeViMTAbFAF9bhL3sH38iRdxsovdyXRnoJI=`
  ⚠️ After updating: Redeploy the project so Vercel picks up the new value. All logged-in users will be signed out (expected).
- [ ] **NEXTAUTH_URL** — confirm Vercel has `NEXTAUTH_URL=https://modonty.com` (not localhost)

---

## Post-Deploy — Modonty Public Site

### HIGH — User Account (⏸ pending Resend)
⚠️ جميع البنود التالية تحتاج Resend API key.
- [ ] **USR-R1** — Password Reset (نسيت كلمة المرور) — صفحة + action + إيميل بـ reset link
- [ ] **USR-R2** — Email Verification عند التسجيل — إرسال confirmation link للإيميل الجديد
- [ ] **USR-R3** — Notification Settings (تفضيلات الإشعارات بالإيميل)
- [ ] **USR-L1** — إشعارات الرد على التعليق بالإيميل

### MEDIUM — User Account
- [ ] **USR-L2** — Session management: logout من أجهزة أخرى (إدارة الجلسات النشطة)
- [ ] **USR-N1** — FAQ reply notification detail view — صفحة الإشعارات تعرض "اختر رسالة لعرض التفاصيل" عند الضغط على إشعار `faq_reply` لأنها مبنية لـ `ContactMessage` فقط. يحتاج: إضافة case في `notifications/page.tsx` يجيب بيانات الـ FAQ من الـ DB ويعرض السؤال والرد في الجانب الأيمن.

### HIGH — Email & Subscriptions
⚠️ Requires Resend account + API key before implementation.
- [ ] Subscribe to Resend (resend.com) and get API key
- [ ] Add `RESEND_API_KEY` to `.env.local` + Vercel environment variables
- [ ] Send welcome email on newsletter subscription (`/api/subscribers` → trigger email after DB insert)
- [ ] Fix `/api/news/subscribe` — same, connect to Resend
- [ ] Verify email delivery end-to-end

### MEDIUM — Loading & Error Pages
- [ ] Add loading.tsx to: author page, login, contact, about, legal pages
- [ ] Add loading.tsx to: user profile sub-pages (favorites, liked, comments, following, notifications)
- [ ] Add error.tsx to critical public pages (article, client, categories)

### LOW — Nice to Have
- [ ] Add loading.tsx to help/faq, subscribe pages
- [ ] Add sitemap entries for tag archive pages (/tags/[slug])

### SEO — Infinite Scroll Crawlability (Phase 2 — أسبوع 1-2 بعد الإطلاق)
> الـ sitemap يكفي للـ indexing الآن. هذه تحسينات للـ internal links و link juice.
- [ ] **SEO-INF1** — دعم `/?page=N` في `page.tsx`: السيرفر يرسل HTML مختلف لكل صفحة بناءً على `searchParams.page`
- [ ] **SEO-INF2** — إضافة `<a>` links لـ "الصفحة التالية / السابقة" في نهاية الـ feed (مرئية لجوجل، اختيارية لـ UX)
- [ ] **SEO-INF3** — `pushState` في `InfiniteArticleList`: يحدّث الـ URL عند تحميل كل batch جديد (`/?page=2`, `/?page=3`)
- [ ] **SEO-INF4** — canonical tag لكل `/?page=N` يشير لنفسه (لا للـ homepage)

### SEO — Image Sitemap (Phase 3 — مستقبلي)
- [ ] **SEO-IMG1** — إنشاء `app/image-sitemap.xml/route.ts` يشمل كل الصور المنشورة للمقالات (يحسّن Google Image Search)

---

## Modonty — Semantic HTML & Page Structure

> تفاصيل كاملة: [SEMANTIC-HTML-TODO.md](modonty/SEMANTIC-HTML-TODO.md)
> تفاصيل SEO article: [SEO-ARTICLE-TODO.md](modonty/SEO-ARTICLE-TODO.md)

### ✅ Nested `<main>` — مكتمل
- [x] **SEM-1a→g** — 7 صفحات: `articles/[slug]`, `clients`, `categories`, `categories/[slug]`, `trending`, `search`, `news`

### ✅ Missing `<h1>` — مكتمل
- [x] **SEM-2a** — `clients/page.tsx` — `<h1 className="sr-only">العملاء</h1>`
- [x] **SEM-2b** — `categories/page.tsx` — `<h1 className="sr-only">الفئات</h1>`
- [x] **SEM-2c** — `users/profile/page.tsx` — `<h1 className="sr-only">الملف الشخصي</h1>`
- [x] **SEM-2d→i** — 6 profile sub-pages: favorites, liked, comments, following, disliked, settings — sr-only h1 مضاف لكل صفحة

### ✅ `<section>` accessible name — مكتمل
- [x] **SEM-3a** — `authors/[slug]/page.tsx` — `aria-labelledby="author-articles-heading"`
- [x] **SEM-3b** — `news/page.tsx` — `aria-labelledby="news-articles-heading"`

### ✅ `<nav>` aria-label — مكتمل
- [x] **SEM-4** — `MobileFooter.tsx` — `aria-label="التنقل السفلي"`

### ✅ `<aside>` aria-label — مكتمل
- [x] **SEM-6a** — `LeftSidebar.tsx` — `aria-label="الشريط الجانبي الأيسر"`
- [x] **SEM-6b** — `RightSidebar.tsx` — `aria-label="الشريط الجانبي الأيمن"`
- [x] **SEM-6c** — `SidebarSkeletons.tsx` — `aria-hidden="true"` on both skeleton asides

### ✅ Missing `error.tsx` — مكتمل (9 routes)
- [x] `clients`, `categories`, `authors/[slug]`, `trending`, `subscribe`, `users/profile`, `users/login`, `help`, `help/faq`

### 🔴 HIGH — SEO Article Structured Data (تفاصيل في SEO-ARTICLE-TODO.md)
- [ ] **SEO-A1** — Breadcrumb JSON-LD مفقود من صفحة المقال (الدالة موجودة — غير مستدعاة)
- [ ] **SEO-A2** — JSON-LD fallback غائب للمقالات بدون DB cache
- [ ] **SEO-A3** — `og:site_name` = اسم العميل بدل "مودونتي" ← يحتاج قرار
- [ ] **SEO-A4** — صورة المقال في JSON-LD بدون width/height

### FUTURE — Listing Pages (modonty)
> ⚠️ Admin already generates + caches OG metadata for these pages (DB ready).
> Pages need to be built in modonty to use the cache.
- [ ] Build `/tags` listing page in modonty (cache exists in `tagsPageMetaTags`)
- [ ] Build `/industries` listing page in modonty (cache exists in `industriesPageMetaTags`)
- [ ] Build `/articles` listing page in modonty (cache exists in `articlesPageMetaTags`)

---

## Next Version — Admin (HIGH — UX)

- [ ] **Inline Media Picker in Article Editor** — when adding an image inside the article, open a Dialog (upload new OR pick from existing library) without leaving the editor page. Currently forces user to leave article → go to Media → upload → come back. Kills workflow.
- [ ] **Media Gallery — images cropped in preview** — `media-grid.tsx:337` uses `object-cover` inside `aspect-[4/3]` container. Wide images (e.g. 4200×700 banners) get severely cropped. Fix: change to `object-contain` + keep `bg-muted` background so full image is always visible.
- [ ] **Article Editor — Image Gallery preview cropped** — same `object-cover` issue inside the article editor Image Gallery section. Wide images show heavily cropped. Fix: `object-contain` + `bg-muted`.
- [x] **Article Editor — Featured Image preview cropped** — `thumbnail-image-view.tsx:161` fixed: `object-cover` → `object-contain`. Deployed in admin v0.28.0.
- [ ] **"Featured" label unclear in articles** — two problems: (1) The "Featured Image" field label is ambiguous — better label: **"Cover Image"** or **"Hero Image"**. (2) The "Featured" checkbox in Publish step is vague — better label: **"Highlight on Homepage"** with clear description.
- [ ] **Publish error message misleading** — when SEO score < 60%, toast shows "حدث خطأ في الخادم. جرب لاحقًا" — client thinks the system is broken. Real reason is their own SEO score. Fix: show specific message e.g. "لا يمكن النشر — نقاط SEO 51% (الحد الأدنى 60%). حسّن حقول SEO أولاً." Never show "server error" for a business rule validation.
- [ ] **Media picker search not filtering** (OBS-001) — in the article editor "Select Featured Image" dialog, typing in the search box does not filter results. Search input is not triggering React state update.
- [ ] **Media edit: no Client reassignment field** (OBS-002) — once uploaded, an image cannot be moved to a different client. The media edit form has no Client field. If uploaded to wrong client → inaccessible from article editors of other clients. Fix: add Client dropdown in `/media/[id]/edit`.
- [ ] **Media upload: client assignment unclear** (OBS-004) — uploading from the global Media page auto-assigns to a client unpredictably. Should either require a client selection, or images without client should appear in all pickers as a "General" pool.

## Next Version — Admin (LOW)

- [ ] Centralize all toast messages in one JSON file
- [ ] Split view preview for articles
- [ ] Article templates (news, how-to, listicle)

---

## jbr SEO Integration — modonty Sales Funnel

> تفاصيل كاملة: [JBRSEO-INTEGRATION-TODO.md](modonty/JBRSEO-INTEGRATION-TODO.md)

### ✅ منجز (modonty v1.24.0)
- [x] **JBRSEO-1** — Header CTA "عملاء بلا إعلانات ↗" ديسكتوب + موبايل
- [x] **JBRSEO-2** — `/clients` CTA panel gradient في نهاية الصفحة
- [x] **JBRSEO-3** — ClientsHero إعادة تصميم بعمودين B2C + B2B + نصوص SEO قوية
- [x] **JBRSEO-4** — Footer CTA "هل تريد عملاء من جوجل بلا إعلانات؟ جبر SEO ↗"
- [x] **JBRSEO-5** — Client page CTA "أعجبك ما رأيت؟" في نهاية كل صفحة عميل
- [x] **JBRSEO-6** — Article footer CTA "تريد محتوى مثل هذا يجذب عملاء؟"

### 🔴 HIGH — Admin: نصوص الهيرو من لوحة التحكم
- [ ] **JBRSEO-ADMIN-1** — نصوص ClientsHero B2B يجب أن تأتي من الأدمن (DB) لا hardcoded
  - الحقول المطلوبة: `heroHeadline`, `heroSubheadline`, `heroBullets[]`, `heroCtaText`, `heroCtaUrl`
  - السبب: تحسين SEO مستمر — النصوص تحتاج A/B testing وتحديث دوري بكلمات مفتاحية متوافقة مع رانكينج مودونتي
  - يُضاف لإعدادات الأدمن في قسم "إعدادات الصفحات العامة" أو Client Settings

### 🟢 LOW — تحسينات مستقبلية
- [ ] **JBRSEO-7** — صفحة `/about`: إضافة قسم "للشركات والأعمال" يشرح أن modonty منصة مفتوحة للنشر عبر jbrseo.com
- [ ] **JBRSEO-8** — Analytics: تتبع النقرات على جميع CTAs الموجهة لـ jbrseo.com (data-track أو GA event) لقياس معدل التحويل

---

## Modonty — Mobile Phase 2 (Mockup Ready ✅)

> Mockup is in `design-preview/page.tsx`. These tasks transfer it to production.

- [ ] **MOB1** — Move bottom bar from `fixed bottom-16` to `sticky top-14`
- [ ] **MOB2** — Add client avatar + "اسأل العميل" button in Zone 1
- [ ] **MOB3** — Add Newsletter trigger (🔔) in the bar
- [ ] **MOB4** — Add views (👁) + questions (❓) in the meta row
- [ ] **MOB5** — Newsletter overlay on the featured image
- [ ] **MOB6** — Update the Sheet with full content
- [ ] **MOB7** — Unify CTA text: "اسأل العميل" everywhere

---

## ✅ Chatbot — المرحلة 1 (modonty v1.22.0) — مكتملة 2026-04-11

> تفاصيل كاملة: [CHATBOT-TODO.md](modonty/CHATBOT-TODO.md)

- [x] **CHAT-1** — "اسأل العميل" بعد جواب الويب — بطاقة gradient + "اقرأ المقال" + AskClientDialog
- [x] **CHAT-2** — اقتراح ذكي للفئة من أول رسالة (Cohere embed cosine similarity)
- [x] **CHAT-3** — جواب من الويب → بطاقة أقرب مقال في الفئة (أعلى مشاهدات)
- [x] **CHAT-4** — Trusted sources filter + UNTRUSTED_DOMAINS blacklist
- [x] **CHAT-5** — Hard test 8 cases ✅ — scope threshold 0.52، empty msg fix، trusted domains fix

## Chatbot — المرحلة 2 (Admin FAQ generation — بعد المرحلة 1)

- [ ] **CHAT-FAQ1** — Admin: صفحة أسئلة المستخدمين مجمّعة حسب التكرار
- [ ] **CHAT-FAQ2** — Admin: زر "حوّل لـ FAQ" → ArticleFAQ جديد
- [ ] **CHAT-FAQ3** — Admin: filter حسب الفئة / العميل / المصدر
- [ ] **CHAT-FAQ4** — modonty: FAQ المحوَّلة تظهر على صفحة المقال

---

## Future

- [ ] DESIGNER role (Media-only access for designer)
- [ ] Role-based route protection per role
- [ ] User action logging (who did what)
- [ ] Add clientId to Media table (each image → one client)
- [ ] AI content suggestions

---

## Done — Version History

| Version | What |
|---------|------|
| admin v0.25.0 | Listing pages OG image — clients, categories, trending (tags/industries/articles cache ready) |
| admin v0.24.0 | REVALIDATE_SECRET fix, SEO Description textarea, listing cache revalidation |
| admin v0.21.0 | Client form UX overhaul, slug bug fix, Arabic hints, real pricing |
| admin v0.20.0 | Bulk SEO fix, terms cache, slug box all forms, users auth |
| admin v0.19.0 | Arabic media upload fix — safe ASCII filenames |
| admin v0.18.0 | Open status transitions, error toast 10s |
| admin v0.17.0 | Settings cascade to all entities SEO |
| admin v0.16.0 | Changelog page, team notes with replies, time emojis |
| admin v0.15.0 | Toast Arabic + icons, optimistic lock fix, progress fix, Arabic SEO |
| admin v0.14.0 | Auth on authors/media/settings, industry cascade |
| admin v0.13.0 | Security categories/tags/industries, feedback system, client labels |
| admin v0.12.0 | Articles: 5-step form, auto-save, editor, SEO gate |
| admin v0.11.0 | Clients: security, SEO, JSON-LD, UI overhaul |
| admin v0.10.0 | Authors: overhaul, Person JSON-LD, cascade |
| admin v0.9.0 | Media: redesign, image SEO, EXIF, sitemap |

---

> Section details: [ARTICLES.md](admin/ARTICLES.md) | [CLIENTS.md](admin/CLIENTS.md) | [CATEGORIES.md](admin/CATEGORIES.md) | [TAGS.md](admin/TAGS.md) | [INDUSTRIES.md](admin/INDUSTRIES.md) | [MEDIA.md](admin/MEDIA.md)
