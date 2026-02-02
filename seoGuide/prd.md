بكل تأكيد، دعني أدرج ذكر أداة Adobe Structured Data Validator كجزء من أفضل الممارسات.

---

# PRD — SEO-First Article System with Structured Data Validation

**Project Name:** Modonty (مدونتي)
**Framework:** Next.js (App Router)
**Primary Goal:** Maximum SEO accuracy before publishing any article

---

## 1. Product Overview

Modonty is a large-scale article/blog platform built with Next.js.
SEO is the **core product value**, not an afterthought.

The system must guarantee that:

- The **HTML output** of every article page is correct
- All **Structured Data (Schema.org / JSON-LD)** is valid
- Validation happens **before publishing**, not after

---

## 2. Problem Statement

Current SEO workflows usually:

- Validate structured data **after publishing**
- Rely on external tools manually
- Do not guarantee preview HTML = production HTML

This leads to:

- SEO errors reaching production
- Re-indexing delays
- Inconsistent previews

---

## 3. Product Objectives

1. Ensure **Preview HTML === Production HTML**
2. Validate structured data **before publish**
3. Provide clear validation feedback to editors
4. Prevent publishing if critical SEO errors exist

---

## 4. Key Principles (Non-Negotiable)

- SEO-first architecture
- Server Components by default
- JSON-LD via `<script type="application/ld+json">`
- No mock SEO data in preview
- Preview must be crawl-ready

---

## 5. User Roles

### 5.1 Admin / Editor

- Writes articles
- Reviews SEO status
- Publishes content

### 5.2 System

- Generates structured data
- Validates HTML output
- Blocks invalid publishing

---

## 6. Functional Requirements

### 6.1 Article Authoring

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

---

### 6.2 Structured Data Generation

System must automatically generate:

- `Article`
- `BlogPosting`
- `BreadcrumbList`
- `Organization`
- `WebSite`

All schemas must:

- Be JSON-LD
- Be injected server-side
- Match schema.org definitions

---

### 6.3 Preview Mode (Critical)

Preview must:

- Use **same route & layout** as production
- Use same metadata logic
- Use same structured data generator
- Differ ONLY by:

  - `noindex, nofollow`
  - preview token

✅ No duplicate preview components
❌ No mocked schema

---

### 6.4 SEO Validation Flow

#### Validation Trigger

- Manual button: **“Validate SEO”**
- Automatic on save (optional)

#### Validation Scope

- Read final rendered HTML
- Extract JSON-LD scripts
- Validate against schema rules

#### Validation Output

- Errors (blocking)
- Warnings (non-blocking)
- Passed schemas list

---

### 6.5 Publishing Rules

- ❌ Cannot publish if **blocking errors exist**
- ⚠️ Can publish with warnings (configurable)
- ✅ Publish only after successful validation

---

## 7. Validation Sources

Validation must support:

- Internal schema validation logic
- **Adobe Structured Data Validator** as a best practice external tool
- Optional: Google Rich Results Test (manual)

> While we include Adobe Structured Data Validator as a recommended best practice, the system should primarily rely on internal validation logic to ensure consistent results.

---

## 8. Technical Architecture

### 8.1 Data Layer

- Prisma + MongoDB
- SEO fields stored per article

### 8.2 Schema Generator

- Single shared function:

  - `generateArticleSchema(article)`

- Used in:

  - Preview
  - Production

---

### 8.

### 8.3 Rendering Strategy

- Use Server Components by default
- Utilize `generateMetadata()` for consistent metadata and SEO tags
- Inject `<script type="application/ld+json">` server-side for JSON-LD structured data

### 8.4 Preview Implementation

- The preview uses the exact same route and layout as the production page (`/articles/[slug]`)

- The only differences are:

  - `noindex, nofollow` meta tags for preview mode
  - A preview token or cookie to differentiate preview requests

- **No separate preview components are allowed**; the preview must be a true simulation of the production HTML.

---

## 9. Non-Functional Requirements

- Must maintain high PageSpeed scores
- Zero client-side schema generation to avoid hydration issues
- HTML must be fully crawlable in both preview and production
- Multi-language support (using `next-intl` for Arabic/English)

---

## 10. Success Metrics (KPIs)

- Zero structured data errors reported in Google Search Console (GSC)
- Faster indexing and eligibility for rich results
- No SEO regressions after publishing

---

## 11. Out of Scope (Explicit)

- Automatic indexing submission
- AI content generation
- Backlink analysis or rank tracking

---

## 12. Final Notes for Cursor AI

- Integrate Adobe Structured Data Validator as a best practice tool to run validations and highlight issues
- Do NOT create separate preview components or mock schema data
- Treat the preview as production-grade HTML for full accuracy
- SEO correctness is the top priority over any other feature consideration

---

بهذا الشكل، الـ PRD صار يوضح كيفية دمج Adobe Structured Data Validator كجزء من أفضل الممارسات، مع تأكيد أن النظام يعتمد أساساً على منطق التحقق الداخلي لضمان النتائج المتسقة. يمكنك الآن استخدام هذا الملف مباشرة مع Cursor AI.
