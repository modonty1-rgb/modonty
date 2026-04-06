# Master TODO — MODONTY Admin + Frontend

> Last Updated: 2026-04-06
> Current versions: admin v0.12.0 | modonty v1.17.0
> This is the single source of truth for all pending tasks

---

## E2E Testing Plan

Full Playwright test suite covering all critical paths. Install with `pnpm add -D @playwright/test` then run with `npx playwright test`.

### Admin — Articles (6 tests ready in `admin/tests/e2e/articles.spec.ts`)
- [ ] Articles list page loads with table and filters
- [ ] Create new article → fill basic + content → save → redirects to list
- [ ] Edit article → content preserved → title matches → SEO score visible
- [ ] SEO score consistency: edit page score = view page score
- [ ] Publish gate: low-SEO article blocked from publishing
- [ ] Editor toolbar: all 20 tools present (Undo, Redo, Bold, Italic, etc.)
- [ ] Word count updates live in editor footer

### Admin — Clients (TODO — not written yet)
- [ ] Clients list page loads
- [ ] Create client → required fields → save → appears in list
- [ ] Edit client → data preserved → update → redirects
- [ ] Delete client with articles → should fail (constraint)
- [ ] Delete client without articles → succeeds
- [ ] Client SEO: JSON-LD + metadata regenerate on update

### Admin — Media (TODO)
- [ ] Media grid loads with images
- [ ] Upload image → appears in grid
- [ ] Edit media (alt text, caption) → save → articles revalidate
- [ ] Delete media → removed from grid

### Admin — Categories / Tags / Industries (TODO)
- [ ] CRUD for each entity
- [ ] Slug uniqueness validation
- [ ] Delete with children → blocked

### Admin — Settings (TODO)
- [ ] Settings page loads all tabs
- [ ] Save per tab works
- [ ] Seed integration test runs without errors

### Modonty (Public Site) (TODO)
- [ ] Homepage loads
- [ ] Articles listing page loads
- [ ] Article detail page renders content, TOC, FAQs
- [ ] Article JSON-LD present in page source
- [ ] Article OG meta tags correct
- [ ] Comments form works
- [ ] Mobile responsive

### Cross-App (TODO)
- [ ] Admin publish → modonty revalidates → article appears on public site
- [ ] Admin update media alt text → article page shows updated alt
- [ ] Admin update author → articles JSON-LD regenerates

---

## Cross-App Issues

### Auth Check on ALL Mutation Server Actions

| Entity | Create | Update | Delete | Status |
|--------|--------|--------|--------|--------|
| Clients | Yes | Yes | Yes | ✅ Done |
| Articles | Yes | Yes | Yes | ✅ Done (Session 2) |
| Categories | check | check | check | Needs check |
| Tags | check | check | check | Needs check |
| Industries | check | check | check | Needs check |
| Authors | N/A | check | N/A | Needs check |
| Media | check | check | check | Needs check |
| Settings | N/A | check | N/A | Needs check |

- [ ] **X10: Add auth check to category mutations**
- [ ] **X11: Add auth check to tag mutations**
- [ ] **X12: Add auth check to industry mutations**
- [ ] **X13: Add auth check to author/media/settings mutations**

### Zod Server-Side Validation on ALL Mutations

| Entity | Create | Update | Status |
|--------|--------|--------|--------|
| Clients | Yes | Yes | ✅ Done |
| Articles | Yes | Yes | ✅ Done (Session 2) |
| Categories | check | check | Needs check |
| Tags | check | check | Needs check |
| Industries | check | check | Needs check |

- [ ] **X15: Add Zod validation to category mutations**
- [ ] **X16: Add Zod validation to tag mutations**
- [ ] **X17: Add Zod validation to industry mutations**

### Slug Uniqueness Validation

| Entity | Create | Update | Status |
|--------|--------|--------|--------|
| Clients | Yes | Yes | ✅ Done |
| Articles | Yes | Yes | ✅ Done (Session 2) |
| Categories | NO | NO | Needs fix |
| Tags | NO | NO | Needs fix |
| Industries | NO | NO | Needs fix |

- [ ] **X2: Add slug uniqueness to category create/update**
- [ ] **X3: Add slug uniqueness to tag create/update**
- [ ] **X4: Add slug uniqueness to industry create/update**

### SEO Cache Gaps

| # | Gap | Priority | Status |
|---|-----|----------|--------|
| 1 | Category/Tag/Industry — missing Organization in JSON-LD | High | Not started |
| 2 | Category/Tag/Industry — missing alternates.languages in metadata | High | Not started |
| 3 | Client update — cascade to regenerate articles | High | ✅ Done |
| 4 | Article — nextjsMetadata cache verification | High | ✅ Done |
| 5 | Category/Tag/Industry — cascade to regenerate articles | Medium | Not started |
| 6 | About + Legal pages — frontend builds meta live | Medium | Not started |
| 7 | Contact + Help pages — should use Pages system | Medium | Not started |
| 8 | Settings change — no auto-cascade | Medium | Not started |

---

## Sections — Status

### Articles ✅ (v0.12.0 — Session 3+4)

**Full TODO:** [ARTICLES-UX-IMPROVEMENTS.md](admin/ARTICLES-UX-IMPROVEMENTS.md)

Done:
- [x] Full redesign: list page, detail page, technical page
- [x] SEO analyzer unified (one system)
- [x] Form reduced from 12 to 5 steps
- [x] SEO publish gate at 60%
- [x] Auto-save, word count, unsaved changes warning
- [x] TipTap editor upgrade (20 tools)
- [x] Beta banner
- [x] Bug fixes: redirect, beforeunload, SEO title truncation

Remaining (P3 — post-launch):
- [ ] Split view preview
- [ ] Drag & drop images
- [ ] Article templates
- [ ] AI content suggestions
- [ ] Bulk SEO fix

### Clients ✅ (v0.11.0 — Session 2)

**Full TODO:** [CLIENTS-TODO.md](admin/CLIENTS-TODO.md)

Done:
- [x] Security (auth + Zod + slug uniqueness)
- [x] SEO cascades (author/category/client/media → articles)
- [x] JSON-LD fixes
- [x] UI overhaul

### Media ✅ (v0.9.0)
- [x] Complete redesign
- [x] Image SEO + sitemap

### Authors ✅ (v0.10.0)
- [x] Complete overhaul
- [x] Person JSON-LD + cascade

### Categories (Not Started)
- [ ] Full inspection + UI/UX review
- [ ] Auth + Zod + slug uniqueness
- [ ] SEO cache compliance

### Tags (Not Started)
- [ ] Full inspection + UI/UX review
- [ ] Auth + Zod + slug uniqueness
- [ ] SEO cache compliance

### Industries (Not Started)
- [ ] Full inspection + UI/UX review
- [ ] Auth + Zod + slug uniqueness
- [ ] SEO cache compliance

---

## Previously Completed

| Version | What |
|---------|------|
| admin v0.12.0 | Articles UX: 5-step form, SEO gate, auto-save, editor upgrade, bug fixes |
| admin v0.11.0 | Clients overhaul: security, SEO, performance, cleanup |
| admin v0.10.0 | Authors overhaul, SEO cache, bell notification |
| admin v0.9.0 | Media redesign, image SEO, EXIF removal |
| modonty v1.17.0 | Clients security + SEO on public site |
| modonty v1.16.0 | Authors page + alt text fix |
| modonty v1.15.0 | Image sitemap + SEO |

---

## Work Order

```
Done:     Media → Authors → Clients → Articles
    ↓
Next:     Categories (inspect + fix + SEO)
    ↓
Then:     Tags (inspect + fix + SEO)
    ↓
Then:     Industries (inspect + fix + SEO)
    ↓
Then:     Cross-app auth/Zod/slug remaining gaps
    ↓
Then:     SEO cache gaps
    ↓
Finally:  E2E tests for all sections + CI/CD setup
```

---

> Reference files:
> - [SESSION-LOG.md](../context/SESSION-LOG.md) — session handoff for next agent
> - [SEO-CACHE-STANDARD.md](../MODONTY-RULE/SEO-CACHE-STANDARD.md) — master SEO caching rules
> - [ARTICLES-UX-IMPROVEMENTS.md](admin/ARTICLES-UX-IMPROVEMENTS.md) — articles task details
