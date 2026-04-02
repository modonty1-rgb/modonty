# SEO-First Article System with Structured Data Validation - PRD

**Project**: Modonty (مدونتي)
**Framework**: Next.js (App Router)
**Primary Goal**: Maximum SEO accuracy before publishing

## Product Overview

Modonty is a large-scale article/blog platform. SEO is the core product value.

System guarantees:
- **HTML output** of every article page is correct
- All **Structured Data (Schema.org / JSON-LD)** is valid
- Validation happens **before publishing**

## Problem Statement

Current SEO workflows:
- Validate structured data **after publishing**
- Rely on external tools manually
- Don't guarantee preview HTML = production HTML

Results:
- SEO errors reach production
- Re-indexing delays
- Inconsistent previews

## Product Objectives

1. Ensure **Preview HTML === Production HTML**
2. Validate structured data **before publish**
3. Provide clear validation feedback to editors
4. Prevent publishing if critical SEO errors exist

## Key Principles (Non-Negotiable)

- SEO-first architecture
- Server Components by default
- JSON-LD via `<script type="application/ld+json">`
- No mock SEO data in preview
- Preview must be crawl-ready

## User Roles

### Admin / Editor
- Writes articles
- Reviews SEO status
- Publishes content

### System
- Generates structured data
- Validates HTML output
- Blocks invalid publishing

## Functional Requirements

### Article Authoring

Each article must include:
- Title
- Slug
- Description
- Author
- Publish date
- Categories / tags
- Canonical URL
- Featured image
- Language (ar / en)

### Structured Data Generation

System automatically generates:
- `Article`
- `BlogPosting`
- `BreadcrumbList`
- `Organization`
- `WebSite`

All schemas: JSON-LD, injected server-side, match schema.org definitions

### Preview Mode (Critical)

Preview must:
- Use **same route & layout** as production
- Use same metadata logic
- Use same structured data generator
- Differ ONLY by:
  - `noindex, nofollow`
  - preview token

✅ No duplicate preview components
❌ No mocked schema

### SEO Validation Flow

**Trigger**: Manual button or automatic on save

**Scope**: Read final rendered HTML, extract JSON-LD scripts, validate against rules

**Output**: Errors (blocking), warnings (non-blocking), passed schemas list

### Publishing Rules

- ❌ Cannot publish if **blocking errors exist**
- ⚠️ Can publish with warnings (configurable)
- ✅ Publish only after successful validation

## Validation Sources

- Internal schema validation logic (primary)
- **Adobe Structured Data Validator** (best practice)
- Optional: Google Rich Results Test (manual)

## Technical Architecture

### Data Layer

- Prisma + MongoDB
- SEO fields stored per article

### Schema Generator

- Single shared function: `generateArticleSchema(article)`
- Used in Preview and Production

### Rendering Strategy

- Use Server Components by default
- Use `generateMetadata()` for consistent metadata
- Inject `<script type="application/ld+json">` server-side

### Preview Implementation

- Preview uses exact same route and layout as production
- Differences only:
  - `noindex, nofollow` meta tags
  - Preview token or cookie
- **No separate preview components allowed**

## Non-Functional Requirements

- Maintain high PageSpeed scores
- Zero client-side schema generation
- HTML fully crawlable in both preview and production
- Multi-language support (next-intl for Arabic/English)

## Success Metrics (KPIs)

- Zero structured data errors in Google Search Console
- Faster indexing and rich results eligibility
- No SEO regressions after publishing

## Out of Scope

- Automatic indexing submission
- AI content generation
- Backlink analysis or rank tracking

## Implementation Notes

- Integrate Adobe Structured Data Validator as best practice
- Do NOT create separate preview components
- Treat preview as production-grade HTML
- SEO correctness is top priority
