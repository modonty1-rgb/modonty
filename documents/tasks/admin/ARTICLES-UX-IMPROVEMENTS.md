# Articles UX Improvements — Priority Tasks

> Based on full system audit (Sessions 3-4, Apr 6 2026)
> Score: 7/10 → 8.5/10 after P1+P2 fixes

---

## P1 — Critical ✅ (Fixed in Session 4)

- [x] **Unify SEO score** — normalizer now uses stored wordCount + twitterCard default
- [x] **Block publish below 60% SEO** — gate added to all 4 publish paths
- [x] **Reduce form from 12 to 5 steps** — Basic, Content, SEO, FAQs & Related, Publish

## P2 — Important ✅ (Fixed in Session 4)

- [x] **Auto-save every 30s** — edit mode only, shows "Auto-saved HH:MM" indicator
- [x] **Live word count** — editor footer shows words, chars, reading time (English)
- [x] **Improved seed data** — rich Arabic content, proper SEO descriptions, FAQs
- [x] **Unsaved changes warning** — beforeunload event when form is dirty
- [x] **TipTap editor upgrade** — 6 new tools: Undo/Redo, Highlight, Superscript, Subscript, YouTube, Clear Formatting
- [x] **Beta testing banner** — amber notice on all admin pages

---

## P2.5 — Bugs (Must fix before removing beta banner)

### 1. Redirect after Update not working
- **Problem**: Admin clicks Update, save succeeds but stays on edit page instead of redirecting to article view
- **Root cause**: `handleSave` in `article-form-navigation.tsx` redirects via `router.push` but the redirect may race with the beforeunload handler or the toast
- **Fix**: Debug the save callback flow — ensure `result.article?.id` is returned correctly from `updateArticle`, and that `router.push` fires after toast
- **Files**: `article-form-navigation.tsx`, `article-form-context.tsx`
- **Effort**: Small

### 2. beforeunload too aggressive
- **Problem**: Warning dialog appears even during Hot Module Reload in development, and fires when navigating away after auto-save (form shows dirty from auto-fill effects)
- **Root cause**: Auto-fill effects (slug, seoTitle, canonical, etc.) set `isDirty: true` even when user hasn't touched anything
- **Fix**: Differentiate between user-initiated changes and auto-fill changes. Only set `isDirty` for user actions, not auto-fill. Consider adding `isUserDirty` flag separate from `isDirty`
- **Files**: `article-form-context.tsx`
- **Effort**: Medium

### 3. No automated tests
- **Problem**: All testing is manual. Any future change could break create/edit/publish flow without anyone knowing
- **Fix**: Add Playwright E2E tests for critical paths: create article, edit article, publish article, SEO score check
- **Where**: `admin/tests/e2e/articles.spec.ts`
- **Effort**: Medium

### 4. SEO title truncation cuts words
- **Problem**: `generateSEOTitle` truncates at exactly 60 chars with `title.slice(0, maxTitleLen)`, which can cut Arabic words mid-character
- **Fix**: Truncate at last space before the limit, then append `...` if truncated
- **Files**: `articles/helpers/seo-generation.ts`
- **Effort**: Small

---

## P3 — Nice to have (Post-launch)

### 5. Split view preview in editor
- **Problem**: Admin can't see how content looks while editing
- **Fix**: Optional side-by-side preview panel showing rendered HTML
- **Effort**: Large

### 6. Drag & drop image upload in editor
- **Problem**: Adding images requires clicking toolbar → media picker → select
- **Fix**: Allow dragging images directly into editor content area
- **Effort**: Large

### 7. Article templates
- **Problem**: Every new article starts blank
- **Fix**: Pre-built templates (news, how-to, listicle, review) with placeholder content
- **Effort**: Medium

### 8. Content AI suggestions
- **Problem**: Admin doesn't know what to improve
- **Fix**: Show inline suggestions (e.g. "This paragraph is too long", "Add a subheading here")
- **Effort**: Large

### 9. Bulk SEO fix
- **Problem**: If 50 articles have low SEO, fixing one by one is painful
- **Fix**: Bulk action to auto-generate missing SEO titles/descriptions from content
- **Effort**: Medium

---

## Done ✅ (Fixed in Session 3)

- [x] Unified SEO analyzer (was 2 systems, now 1)
- [x] Removed filler SEO checks (content depth, sitemap hints, mandatory FAQs)
- [x] Fixed normalizer type guard (FormData vs Article confusion)
- [x] Fixed media update revalidation (articles weren't refreshing)
- [x] Fixed JSON-LD validator (EducationalOrganization + @id/id)
- [x] Removed preview page (merged into main page)
- [x] Added TOC + Author Bio to main page
- [x] Created Technical page with grid layout
- [x] Redesigned article list page (status tabs, compact stats, clean table)
- [x] Redesigned article detail page (live preview, clean header, no FieldLabels)
- [x] Arabic → English UI labels (14 files)
- [x] Removed bulk selection (not needed this phase)
- [x] Deleted 30+ dead code files
