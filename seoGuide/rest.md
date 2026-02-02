تمام. هذا **PRD جاهز ومنظّم** تقدر تسلّمه مباشرة إلى **Cursor AI** بدون أي شرح إضافي. الصياغة تقنية وواضحة ومبنية بعقلية Senior Next.js + SEO-first.

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
- External validators (manual usage):

  - Adobe Structured Data Validator
  - Google Rich Results Test

> System does NOT depend on external APIs at runtime.

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

### 8.3 Rendering Strategy

- Server Components
- `generateMetadata()`
- `<Script type="application/ld+json" />`

---

### 8.4 Preview Implementation

- Preview uses:

  - Same route `/articles/[slug]`
  - Same layout

- Enabled via preview token / cookie
- No HTML differences except robots meta

---

## 9. Non-Functional Requirements

- PageSpeed friendly
- Zero client-side schema generation
- No hydration mismatch
- Fully crawlable HTML
- Multi-language support (next-intl)

---

## 10. Success Metrics (KPIs)

- Zero structured data errors in GSC
- Faster indexing
- Rich results eligibility
- No SEO regressions after publishing

---

## 11. Out of Scope (Explicit)

- Auto-indexing submission
- AI content generation
- Backlink analysis
- Rank tracking

---

## 12. Final Notes for Cursor AI

- Do NOT create separate preview components
- Do NOT duplicate schema logic
- Treat preview as production-grade HTML
- SEO correctness > feature speed

---

إذا تحب، الخطوة التالية أقدر:

- أحوله إلى **Cursor Prompt جاهز**
- أو أطلع لك **Folder Structure + Code Skeleton**
- أو أبني **SEO Validation Logic Design**

قلّي إيش تبغيه بالضبط.
