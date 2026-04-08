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

## Post-Deploy — Modonty Public Site

### HIGH — Email & Subscriptions
- [ ] Integrate email service (Resend/SendGrid) for newsletter delivery
- [ ] Fix /api/subscribe — currently placeholder, doesn't send emails
- [ ] Subscribers get saved to DB but receive nothing — connect email sending

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

## Next Version — Admin (LOW)

- [ ] Centralize all toast messages in one JSON file
- [ ] Split view preview for articles
- [ ] Article templates (news, how-to, listicle)

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
