# CURSOR PROMPT — MONOREPO (ADMIN → ARTICLES) + FOLLOW nextjs.yml (STRICT)

You MUST read and follow `nextjs.yml` in this repository as the single source of truth for architecture, rules, and constraints. If any instruction conflicts with your assumptions, `nextjs.yml` wins.

## 0) Operating Mode

- Monorepo context: multiple apps/packages exist.
- Your scope is STRICTLY limited to the Admin site → Articles section.
- Make surgical diffs only. No broad refactors.

## 1) Scope (ABSOLUTE)

You may modify ONLY:

- Admin app files that implement Articles feature, located at:
  - `admin/app/(dashboard)/articles/**` (the actual Articles route folder)
  - This includes:
    - `admin/app/(dashboard)/articles/page.tsx` - Articles list page
    - `admin/app/(dashboard)/articles/new/page.tsx` - New article page
    - `admin/app/(dashboard)/articles/[id]/page.tsx` - Article detail page
    - `admin/app/(dashboard)/articles/[id]/edit/page.tsx` - Edit article page
    - `admin/app/(dashboard)/articles/preview/[slug]/**` - Article preview pages
    - `admin/app/(dashboard)/articles/components/**` - Article components
    - `admin/app/(dashboard)/articles/actions/**` - Article server actions
    - `admin/app/(dashboard)/articles/helpers/**` - Article helper functions
    - `admin/app/(dashboard)/articles/[id]/components/**` - Article detail components
    - `admin/app/(dashboard)/articles/[id]/helpers/**` - Article detail helpers
- You may add new files ONLY under the same Articles feature folders.

## 2) Forbidden (DO NOT TOUCH)

### Other Apps (STRICTLY FORBIDDEN)

- `beta/**` - Public-facing blog platform
- `home/**` - Landing/home pages
- Any other app outside `admin/`

### Non-Articles Admin Modules (STRICTLY FORBIDDEN)

- `admin/app/(dashboard)/analytics/**` - Analytics dashboard
- `admin/app/(dashboard)/authors/**` - Author management
- `admin/app/(dashboard)/categories/**` - Category management
- `admin/app/(dashboard)/clients/**` - Client management
- `admin/app/(dashboard)/industries/**` - Industry management
- `admin/app/(dashboard)/media/**` - Media library
- `admin/app/(dashboard)/seo-health/**` - SEO health checker
- `admin/app/(dashboard)/settings/**` - Settings pages
- `admin/app/(dashboard)/subscribers/**` - Subscriber management
- `admin/app/(dashboard)/tags/**` - Tag management
- `admin/app/(dashboard)/users/**` - User management
- `admin/app/(dashboard)/export-data/**` - Data export
- `admin/app/(dashboard)/guidelines/**` - Guidelines pages
- `admin/app/(dashboard)/doc/**` - Documentation
- `admin/app/(dashboard)/components/**` - Shared dashboard components (outside articles)
- `admin/app/(dashboard)/actions/**` - Shared dashboard actions (outside articles)
- `admin/app/(dashboard)/helpers/**` - Shared dashboard helpers (outside articles)
- `admin/app/(dashboard)/page.tsx` - Dashboard home page

### Shared Packages & Libraries (STRICTLY FORBIDDEN)

- `packages/**` - Any shared packages
- `dataLayer/**` - Database layer (unless `nextjs.yml` explicitly requires)
- `admin/lib/**` - Core libraries (Prisma, auth, utils) - only touch if explicitly required
- `admin/components/ui/**` - shadcn/ui base components (unless adding new component for articles)
- `admin/components/shared/**` - Shared UI components (unless explicitly for articles)

### Public Site Routes (STRICTLY FORBIDDEN)

- Any routes in `beta/app/**` that display articles
- Any routes in `home/app/**` that display articles
- Public-facing article pages/routes

### Files Outside Articles Scope (STRICTLY FORBIDDEN)

- Any file NOT under `admin/app/(dashboard)/articles/**`
- Root-level admin files (`admin/app/layout.tsx`, `admin/app/page.tsx`, etc.)
- Admin middleware, auth config, or proxy files
- Global styles or configurations

### Exception Rule

If a shared package or library change seems necessary for Articles feature, DO NOT do it. Instead:

1. Propose an alternative that stays within `admin/app/(dashboard)/articles/**` scope
2. Ask for explicit permission before touching any forbidden area
3. Document why the change is necessary and what alternatives were considered

## 3) Current Folder Structure

Based on the existing codebase, the Articles section has:

### Main Routes

- `page.tsx` - Articles list with filters, search, pagination
- `new/page.tsx` - Create new article form
- `[id]/page.tsx` - View article details
- `[id]/edit/page.tsx` - Edit existing article
- `preview/[slug]/page.tsx` - Preview article

### Components (`components/`)

- List/Table: `article-table.tsx`, `articles-page-client.tsx`, `articles-filters.tsx`, `articles-stats.tsx`
- Form: `article-form-context.tsx`, `article-form-step.tsx`, `article-form-navigation.tsx`, `article-form-sections.tsx`
- Steps: `steps/basic-step.tsx`, `steps/content-step.tsx`, `steps/seo-step.tsx`, `steps/media-step.tsx`, etc.
- Sections: `sections/basic-section.tsx`, `sections/content-section.tsx`, `sections/seo-section.tsx`, etc.
- Actions: `article-row-actions.tsx`, `bulk-actions-toolbar.tsx`, `review-articles-dialog.tsx`
- Preview: `preview/article-preview-page.tsx`, `preview/preview-action-buttons.tsx`

### Actions (`actions/`)

- `articles-actions.ts` - Main CRUD operations (getArticles, createArticle, updateArticle, etc.)
- `publish-action.ts` - Publish article
- `auto-save-action.ts` - Auto-save functionality
- `gallery-actions.ts` - Image gallery operations
- `export-actions.ts` - Export articles
- `generate-article-ai.ts` - AI article generation
- `request-changes-action.ts` - Request changes workflow

### Helpers (`helpers/`)

- `seo-helpers.ts` - SEO generation utilities
- `article-validation.ts` - Validation logic
- `status-utils.ts` - Status management
- `word-count.ts` - Content analysis
- `article-seo-config.ts` - SEO configuration
