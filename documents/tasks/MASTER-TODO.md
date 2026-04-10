# Master TODO — MODONTY

> Last Updated: 2026-04-08
> Versions: admin v0.25.0 | modonty v1.18.0

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
