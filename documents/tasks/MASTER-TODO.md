# Master TODO — MODONTY

> Last Updated: 2026-04-06
> Versions: admin v0.12.0 | modonty v1.17.0

---

## 1. Security — Auth + Validation ✅ (DONE)

All mutations have auth + Zod + slug check:
- [x] Articles, Clients, Categories, Tags, Industries
- [ ] **Authors/Media/Settings**: auth check on mutations (remaining)

---

## 2. Error Boundaries ✅ (DONE)

- [x] Categories, Tags, Industries, Articles, Clients — all have `error.tsx`

---

## 3. Arabic Labels → English ✅ (DONE)

- [x] Clients — 65+ labels fixed across 10 files
- [x] Categories — fixed
- [x] Tags — fixed
- [x] Industries — fixed

---

## 4. SEO Cache Gaps (MEDIUM)

- [x] Category/Tag/Industry — Organization + WebSite added to JSON-LD @graph
- [x] Category/Tag/Industry — alternates.languages added (ar-SA)
- [x] Category/Tag/Industry — breadcrumb labels → English
- [ ] Industry update — cascade to regenerate client SEO
- [ ] About + Legal pages — use cached metadata instead of live build
- [ ] Settings change — auto-cascade to all entities

---

## 5. UI/UX Review ✅ (DONE)

- [x] Categories — reviewed, clean, follows standard pattern
- [x] Tags — reviewed, clean, follows standard pattern
- [x] Industries — reviewed, clean, follows standard pattern

---

## 6. Articles — Post-Launch (LOW)

- [ ] Split view preview
- [ ] Article templates
- [ ] AI content suggestions
- [ ] Bulk SEO fix

---

## 7. System & Roles (FUTURE)

- [ ] Add DESIGNER role (Media-only access for designer)
- [ ] Role-based route protection per role
- [ ] User action logging (who did what)
- [ ] Add clientId to Media table (each image → one client)

---

## Done ✅

| Version | What |
|---------|------|
| admin v0.12.0 | Articles: 5-step form, SEO gate, auto-save, editor upgrade, bug fixes |
| admin v0.11.0 | Clients: security, SEO, JSON-LD, UI overhaul |
| admin v0.10.0 | Authors: overhaul, Person JSON-LD, cascade |
| admin v0.9.0 | Media: redesign, image SEO, EXIF, sitemap |
| modonty v1.17.0 | Clients security + SEO |
| modonty v1.16.0 | Authors page + alt text fix |
| modonty v1.15.0 | Image sitemap + SEO |

---

## Work Order

```
Next:     Clients Arabic labels → English (64+ labels)
  ↓
Then:     Industry cascade to clients
  ↓
Then:     Authors/Media/Settings auth check
  ↓
Then:     Remaining SEO cache gaps
  ↓
Future:   Roles system, article templates, AI suggestions
```

---

> Section details: [ARTICLES.md](admin/ARTICLES.md) | [CLIENTS.md](admin/CLIENTS.md) | [CATEGORIES.md](admin/CATEGORIES.md) | [TAGS.md](admin/TAGS.md) | [INDUSTRIES.md](admin/INDUSTRIES.md) | [MEDIA.md](admin/MEDIA.md)
