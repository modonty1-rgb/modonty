# Articles — Status & Remaining Tasks

> Last Updated: 2026-04-06
> Version: admin v0.12.0

---

## Done ✅

### Session 3 — Full Overhaul
- [x] Unified SEO analyzer (one system, not two)
- [x] Removed filler SEO checks
- [x] Fixed normalizer type guard
- [x] Fixed media update revalidation
- [x] Fixed JSON-LD validator
- [x] Removed preview page
- [x] Added TOC + Author Bio to view page
- [x] Created Technical page
- [x] Redesigned list page (status tabs, compact stats, clean table)
- [x] Redesigned detail page (live preview)
- [x] Arabic → English UI labels (14 files)
- [x] Removed bulk selection
- [x] Deleted 30+ dead code files

### Session 4 — UX Improvements + Bug Fixes
- [x] Unified SEO score (form = view page)
- [x] Publish gate at 60% SEO
- [x] Form reduced from 12 to 5 steps
- [x] Auto-save every 30s in edit mode
- [x] Live word count in editor footer
- [x] Improved seed data (rich Arabic content + FAQs)
- [x] Unsaved changes warning (beforeunload)
- [x] TipTap editor upgrade (20 tools)
- [x] Beta testing banner
- [x] Fixed redirect after update
- [x] Fixed beforeunload too aggressive
- [x] Fixed SEO title truncation at word boundary
- [x] Added Playwright E2E tests (6 tests)

### Session 2 — Security (81 items)
- [x] Auth checks on all mutations
- [x] Zod server-side validation
- [x] Slug uniqueness validation
- [x] XSS sanitization
- [x] Optimistic locking
- [x] Status machine transitions
- [x] SEO cascades (author/category/client/media)

---

## Remaining (P3 — Post-launch)

### Split view preview
- **Problem**: Admin can't see how content looks while editing
- **Fix**: Side-by-side preview panel
- **Effort**: Large

### Article templates
- **Problem**: Every new article starts blank
- **Fix**: Pre-built templates (news, how-to, listicle, review)
- **Effort**: Medium

### AI content suggestions
- **Problem**: Admin doesn't know what to improve
- **Fix**: Inline suggestions ("paragraph too long", "add subheading")
- **Effort**: Large

### Bulk SEO fix
- **Problem**: Fixing 50 low-SEO articles one by one is painful
- **Fix**: Bulk action to auto-generate missing SEO titles/descriptions
- **Effort**: Medium
