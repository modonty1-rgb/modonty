# Master TODO — MODONTY Admin + Frontend

> Last Updated: 2026-04-05
> Current versions: admin v0.10.0 | modonty v1.16.0
> This is the single source of truth for all pending tasks

---

## Cross-App Issues

### URGENT: Revert Arabic Labels Back to English in Admin

Admin console UI is ENGLISH. Data content is Arabic. Labels/headings/buttons were incorrectly translated to Arabic in this session. Must revert:

- [ ] **X18: Revert client detail page labels to English** — `client-tabs.tsx` changed "Profile"→"الملف الشخصي", "Subscription"→"الاشتراك", etc. ALL must go back to English
- [ ] **X19: Revert client stats labels to English** — `clients-stats.tsx` changed "SEO Health"→"صحة البحث" etc.
- [ ] **X20: Revert SEO tab labels to English** — `seo-tab.tsx` changed "Regenerate"→"تحديث", "Copied"→"تم النسخ" etc.
- [ ] **X21: Revert client detail page banner to English** — `[id]/page.tsx` changed "Setup SEO"→"إعداد بيانات البحث" etc.
- [ ] **X22: Revert client form hint to English** — `client-form.tsx` changed hint text
- [ ] **X23: Revert filters to English** — `clients-filters.tsx` filter labels added in Arabic
- [ ] **X24: Scan ALL client files for any Arabic UI labels** — full audit to catch anything missed

### Auth Check on ALL Mutation Server Actions

Server actions can be called directly via POST — dashboard layout auth is NOT enough. Every mutation must have `auth()` check.

| Entity | Create | Update | Delete | Status |
|--------|--------|--------|--------|--------|
| Clients | Yes | Yes | Yes | Done |
| Articles | check | check | check | Needs check |
| Categories | check | check | check | Needs check |
| Tags | check | check | check | Needs check |
| Industries | check | check | check | Needs check |
| Authors | N/A | check | N/A | Needs check |
| Media | check | check | check | Needs check |
| Settings | N/A | check | N/A | Needs check |

- [ ] **X9: Add auth check to article mutations**
- [ ] **X10: Add auth check to category mutations**
- [ ] **X11: Add auth check to tag mutations**
- [ ] **X12: Add auth check to industry mutations**
- [ ] **X13: Add auth check to author/media/settings mutations**

### Zod Server-Side Validation on ALL Mutations

Every mutation server action must use `safeParse()` before DB operations. Client-side form validation is UX only.

| Entity | Create | Update | Delete | Status |
|--------|--------|--------|--------|--------|
| Clients | Yes | Yes | N/A (only needs id) | Done |
| Articles | check | check | N/A | Needs check |
| Categories | check | check | N/A | Needs check |
| Tags | check | check | N/A | Needs check |
| Industries | check | check | N/A | Needs check |

- [ ] **X14: Add Zod validation to article mutations**
- [ ] **X15: Add Zod validation to category mutations**
- [ ] **X16: Add Zod validation to tag mutations**
- [ ] **X17: Add Zod validation to industry mutations**

### Remove ALL Bulk Delete Code

Bulk delete is removed by decision — single delete is sufficient. Check all entities.

| Entity | Action File | UI Component | Status |
|--------|-------------|--------------|--------|
| Clients | `bulk-delete-clients.ts` | `bulk-actions-toolbar.tsx` | Done — deleted |
| Media | was removed in v0.9.0 | was removed in v0.9.0 | Done |
| Articles | `bulk-delete-articles.ts` | `bulk-actions-toolbar.tsx` | Needs check |
| Categories | check if exists | check if exists | Needs check |
| Tags | check if exists | check if exists | Needs check |
| Industries | check if exists | check if exists | Needs check |

- [ ] **X5: Audit and remove bulk delete from articles**
- [ ] **X6: Audit and remove bulk delete from categories (if exists)**
- [ ] **X7: Audit and remove bulk delete from tags (if exists)**
- [ ] **X8: Audit and remove bulk delete from industries (if exists)**

### Slug Uniqueness Validation

All entities with `slug` must validate uniqueness before save. Do NOT rely on Prisma DB error.

| Entity | Create | Update | Prisma Constraint | Status |
|--------|--------|--------|--------------------|--------|
| Clients | Yes | Yes | `@unique` (global) | Done |
| Articles | NO | NO | `@@unique([clientId, slug])` (scoped) | Needs fix |
| Categories | NO | NO | `@unique` (global) | Needs fix |
| Tags | NO | NO | `@unique` (global) | Needs fix |
| Industries | NO | NO | `@unique` (global) | Needs fix |
| Authors | N/A | Hardcoded slug | `@unique` (global) | OK by design |

- [ ] **X1: Add slug uniqueness to article create/update** — Scoped: check `@@unique([clientId, slug])`
  - Files: `articles/actions/articles-actions/mutations/create-article.ts`, `update-article.ts`
- [ ] **X2: Add slug uniqueness to category create/update**
  - File: `categories/actions/categories-actions/create-category.ts`, `update-category.ts`
- [ ] **X3: Add slug uniqueness to tag create/update**
  - File: `tags/actions/tags-actions.ts` (functions `createTag`, `updateTag`)
- [ ] **X4: Add slug uniqueness to industry create/update**
  - File: `industries/actions/industries-actions/create-industry.ts`, `update-industry.ts`

### SEO Cache Gaps (from SEO-CACHE-STANDARD.md)

| # | Gap | Priority |
|---|-----|----------|
| 1 | Category/Tag/Industry — missing Organization in JSON-LD | High |
| 2 | Category/Tag/Industry — missing alternates.languages in metadata | High |
| 3 | Client update — missing cascade to regenerate articles | High (in CLIENTS-TODO C7) |
| 4 | Article — missing nextjsMetadata cache verification | High |
| 5 | Category/Tag/Industry — missing cascade to regenerate articles | Medium |
| 6 | About + Legal pages — frontend builds meta live instead of reading cache | Medium |
| 7 | Contact + Help pages — should use Modonty Pages system | Medium |
| 8 | Settings change — no auto-cascade to all entities | Medium |
| 9 | News page — no SEO cache | Low |
| 10 | Search page — document as noindex | Low |
| 11 | User profiles — no SEO cache | Low |

---

## Sections — Detailed TODOs

### Clients (Current Sprint)

**Full TODO:** [CLIENTS-TODO.md](admin/CLIENTS-TODO.md)

| Priority | Count | Status |
|----------|-------|--------|
| CRITICAL | 10 (1 done) | In progress |
| HIGH | 15 | Not started |
| MEDIUM | 17 | Not started |
| LOW | 15 | Not started |

**Completed:**
- [x] C3: Slug uniqueness validation (create + update)

**Next up:**
- [ ] C1: Auth checks on all mutations
- [ ] C2: Zod validation on all mutations
- [ ] C5: Tax ID assignment bug (3 files)
- [ ] C6: JSON-LD `@id`/`@type` generation bug
- [ ] C7: Client update → article JSON-LD cascade

### Articles (Next Sprint)

**Full TODO:** [CLIENTS-ARTICLES-STUDY.md](admin/CLIENTS-ARTICLES-STUDY.md) (study complete, TODO pending)

**Key issues identified:**
- [ ] Author hardcoded to Modonty (can't select different author)
- [ ] View components reference deleted JSON-LD fields (dead code)
- [ ] nextjsMetadata cache — verify frontend reads it correctly
- [ ] No auto-save for drafts
- [ ] No pagination in admin list
- [ ] Missing slug uniqueness validation (X1 above)
- [ ] Full UI/UX review pending

### Media (Completed — Pushed v0.9.0 + v1.15.0)

**Full TODO:** [MEDIA-PAGE-IMPROVEMENTS.md](admin/MEDIA-PAGE-IMPROVEMENTS.md)
- Header redesign: done
- Grid redesign with client grouping: done
- Upload page 3-column grid: done
- EXIF removal: done
- Image SEO (alt text, JSON-LD creditText/copyrightHolder): done
- Image sitemap: done

### Authors (Completed — Pushed v0.10.0 + v1.16.0)

**Full TODO:** [AUTHORS-PAGE-IMPROVEMENTS.md](admin/AUTHORS-PAGE-IMPROVEMENTS.md)
- Single card layout: done
- SEO cache with Person JSON-LD: done
- Frontend `/authors/[slug]` page: done
- Social links from DB: done
- Auto JSON-LD cascade to articles: done

### Categories (Not Started)

- [ ] Full inspection needed (like clients)
- [ ] UI/UX review
- [ ] SEO cache compliance (Gap #1, #2, #5)
- [ ] Slug uniqueness (X2 above)

### Tags (Not Started)

- [ ] Full inspection needed
- [ ] UI/UX review
- [ ] SEO cache compliance (Gap #1, #2, #5)
- [ ] Slug uniqueness (X3 above)

### Industries (Not Started)

- [ ] Full inspection needed
- [ ] UI/UX review
- [ ] SEO cache compliance (Gap #1, #2, #5)
- [ ] Slug uniqueness (X4 above)

---

## Previously Completed

### Session v0.9.0 + v1.15.0 (Pushed)
- Media page complete redesign
- Image SEO audit and fixes
- Image sitemap created
- EXIF removed
- Bulk delete removed
- Replace-in-grid removed

### Session v0.10.0 + v1.16.0 (Pushed)
- Authors page complete overhaul
- SEO cache with Person JSON-LD
- Frontend author page created
- Header/nav redesign (bell notification)
- DeferredImageUpload alt text fix
- SEO-CACHE-STANDARD.md created
- Session handoff protocol established

---

## Work Order

```
Current:  Clients (fixing 57 issues)
    ↓
Next:     Articles (study done, TODO + fixes needed)
    ↓
Then:     Cross-app slug fixes (X1-X4)
    ↓
Then:     Categories + Tags + Industries (inspect + fix + SEO gaps)
    ↓
Finally:  SEO cache gaps (remaining from standard)
```

---

> Reference files:
> - [SESSION-LOG.md](../context/SESSION-LOG.md) — session handoff for next agent
> - [SEO-CACHE-STANDARD.md](../MODONTY-RULE/SEO-CACHE-STANDARD.md) — master SEO caching rules
> - [CLIENTS-ARTICLES-STUDY.md](admin/CLIENTS-ARTICLES-STUDY.md) — deep analysis of both sections
