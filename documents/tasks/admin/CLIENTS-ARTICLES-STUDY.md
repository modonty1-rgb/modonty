# Clients & Articles — Comprehensive Study Report

> Last Updated: 2026-04-05
> Purpose: Full analysis before starting UI/UX and logic improvements

---

## 1. Clients Section

### 1.1 Current State: Advanced — Near Complete

The Clients section has **50+ database fields** covering:

| Area | Fields |
|------|--------|
| Basic Info | name, slug, email, phone, password, legalName, url, foundingDate |
| Saudi Compliance | commercialRegistrationNumber, vatID, taxID, legalForm |
| National Address | street, city, region, neighborhood, buildingNumber, additionalNumber, latitude, longitude |
| Subscription | tier (BASIC/STANDARD/PRO/PREMIUM), status, dates, articlesPerMonth, paymentStatus |
| Media | logoMediaId, ogImageMediaId, twitterImageMediaId (3 Media relations) |
| SEO Cache | jsonLdStructuredData, nextjsMetadata, jsonLdValidationReport + timestamps |
| Google Business | gbpProfileUrl, gbpPlaceId, gbpAccountId, gbpLocationId, gbpCategory |
| Organization | organizationType, slogan, industry, parentOrganization, subOrganizations |
| Analytics | gtmId, ga4PropertyId, ga4MeasurementId |
| Social | sameAs[] (LinkedIn, Twitter, Facebook, etc.) |
| Content Strategy | targetAudience, contentPriorities, forbiddenKeywords, forbiddenClaims |

### 1.2 Admin Dashboard

**Pages:**
- `/clients` — List with filters (date range, article count, hasArticles, search)
- `/clients/new` — Create form
- `/clients/[id]` — Detail view with tabs (overview, analytics, articles, delivery)
- `/clients/[id]/edit` — Edit form

**Form Structure (10+ tabs):**
1. Required — name, slug, email, industry, URL, phone
2. Subscription — tier, dates, status, articles/month
3. Business — audience, priorities
4. Contact — email, phone, contact type
5. Address — full national address format
6. Legal — CR number, VAT, tax, legal form
7. SEO — title, description, keywords, GTM, organization type
8. Media/Social — logo, OG, Twitter images, social profiles
9. Security — password
10. Additional — languages, business codes
11. Settings — notifications, compliance

**Server Actions (15+):**
- CRUD: create, update (grouped into 10 sub-updates for MongoDB pipeline limit), delete, bulk-delete
- Queries: get-clients, get-client-by-id, get-clients-stats (50+ stats), get-client-articles, get-client-analytics, get-client-media, get-clients-for-select
- SEO: generate-client-seo, jsonld-actions (get, regenerate)

**Stats Dashboard (50+ metrics):**
- Subscription: active, expired, cancelled, pending, expiringSoon
- Revenue by tier, payment status
- Delivery: totalPromised, totalDelivered, deliveryRate, behindSchedule
- Articles: total, thisMonth, averageViewsPerArticle
- Engagement: avgTimeOnPage, avgScrollDepth, bounceRate
- Traffic: organic, direct, referral, social

### 1.3 Frontend (Modonty)

**Pages:**
- `/clients` — List with featured clients (PRO/PREMIUM), industry filters, grid/list toggle
- `/clients/[slug]` — Detail with JSON-LD + cached metadata, 3-column layout
- `/clients/[slug]/about` — About page

**API Routes:**
- GET `/api/clients` — List
- GET `/api/clients/[slug]` — Detail
- POST `/api/clients/[slug]/follow` — Follow/unfollow
- GET `/api/clients/[slug]/followers` — Followers list
- POST `/api/clients/[slug]/view` — Track view
- POST `/api/clients/[slug]/share` — Track share

**Components (20+):**
- Cards: client-card, featured-client-card, client-list-item
- Detail: client-about, client-contact, client-official-data, client-follow-button
- Page Layout: client-page-left (sidebar), client-page-feed (articles), client-page-right (related)
- Filtering: filter-panel, industry-chips, sort-dropdown, view-toggle

### 1.4 SEO Architecture

**JSON-LD (Organization schema):**
- Complete Organization @graph with:
  - Basic: name, legalName, alternateName, url, slogan
  - Logo: ImageObject with dimensions
  - Saudi identifiers: vatID, taxID, commercialRegistrationNumber
  - Address: PostalAddress with national format + GeoCoordinates
  - ContactPoints with available languages
  - numberOfEmployees (QuantitativeValue)
  - parentOrganization reference
  - sameAs social profiles
- Validated with: Adobe + Ajv + business rules (logo 112x112, name 2-100 chars)

**Metadata Caching:**
- title (max 60 chars), description (max 160 chars)
- openGraph: title, description, type, url, siteName, locale, images
- twitter: card (summary vs summary_large_image), title, description, image
- canonical URL (absolute HTTPS)
- Locale alternates from knowsLanguage

**Listing Page SEO:**
- CollectionPage + ItemList schema cached in Settings table
- Regenerated on client create/update/delete

**Sitemap:** Included with priority 0.6, weekly change frequency

### 1.5 Known Issues

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| 1 | Frontend `sanitizeJsonLd()` fixes `id`/`type` → `@id`/`@type` | Admin generates invalid JSON-LD keys | modonty/app/clients/[slug]/page.tsx |
| 2 | No cascade: client update → article JSON-LD regeneration | SEO Gap #3 from standard | update-client.ts |
| 3 | hreflang not generated from knowsLanguage | Missing alternates.languages | generate-client-seo.ts |
| 4 | Canonical URL field exists but not always prioritized | Potential duplication | Frontend metadata generation |

---

## 2. Articles Section

### 2.1 Current State: Enterprise-Grade CMS — Has Some Gaps

**Database fields cover:**

| Area | Fields |
|------|--------|
| Content | title, slug, excerpt, content, articleBodyText (plain text) |
| Relations | clientId (required), categoryId, authorId (required), tags[], gallery[], FAQs[], relatedArticles[] |
| Workflow | status (WRITING/DRAFT/SCHEDULED/PUBLISHED/ARCHIVED), scheduledAt, featured |
| Dates | datePublished, dateModified, lastReviewed |
| Content Metrics | wordCount, readingTimeMinutes, contentDepth (short/medium/long) |
| SEO | seoTitle, seoDescription, canonicalUrl, breadcrumbPath, seoKeywords[] |
| Open Graph | ogArticleAuthor, ogArticlePublishedTime, ogArticleModifiedTime |
| E-E-A-T | citations[] (authoritative sources), semanticKeywords (Wikidata IDs) |
| Media | featuredImageId → Media, gallery via ArticleMedia (position + alt override) |
| SEO Cache | jsonLdStructuredData, nextjsMetadata, jsonLdValidationReport + timestamps |

### 2.2 Admin Dashboard

**Pages:**
- `/articles` — List with filters (status, client, category, author, date ranges)
- `/articles/new` — 12-step creation wizard
- `/articles/[id]` — Detail view with 20+ section components
- `/articles/[id]/edit` — Edit with same 12-step form
- `/articles/preview/[id]` — Admin preview

**12-Step Form:**
1. **Basic** — title, slug, client, author, category, excerpt, status, featured, tags
2. **Content** — TipTap rich text editor (30+ extensions)
3. **Media** — featured image, gallery (drag-drop with alt/caption overrides)
4. **FAQs** — question/answer pairs with position ordering
5. **SEO Keywords** — target keywords for reference
6. **Meta Tags** — SEO title, description, robots
7. **Semantic Keywords** — entity disambiguation (Wikidata IDs)
8. **Citations** — external authoritative source URLs
9. **Related Articles** — bidirectional article links
10. **Publication Settings** — scheduled date, canonical URL, twitter handles
11. **Technical SEO** — sitemap priority, change frequency, license
12. **Preview** — metadata and JSON-LD preview

**Rich Text Editor (TipTap):**
- Extensions: StarterKit, Link, Image, Underline, TextStyle, Color, TextAlign, Heading (1-6), CharacterCount, Table (with resize), LongParagraphHighlight (custom: highlights >500 chars)
- Toolbar: formatting, headers, lists, blockquote, link dialog (rel options), image via MediaPicker, table operations
- Stats: word count, character count
- Content stored as HTML, plain text extracted for JSON-LD

**Server Actions (30+):**
- Mutations: create-article, update-article, delete-article, bulk-delete, bulk-update-status
- Publish: publish-article, publish-article-by-id (validates + publishes)
- Queries: get-articles, get-article-by-id, get-article-by-slug, get-articles-stats, get-articles-for-selection, get-articles-authors/categories/clients
- JSON-LD: regenerate-article-jsonld, batch-regenerate, get-article-jsonld, get-jsonld-statistics
- Other: generate-article-ai, export-actions, gallery-actions, request-changes-action

**Status Flow:**
```
WRITING → DRAFT → SCHEDULED → PUBLISHED → ARCHIVED
                                    ↓
                              (unarchive) → DRAFT
```

**Compliance Check:**
- On publish: checks article content against client.forbiddenKeywords and client.forbiddenClaims
- Blocks publication if violation found
- Checks: title, content, seoTitle, seoDescription, excerpt

### 2.3 Frontend (Modonty)

**Article Page (`/articles/[slug]`):**
- `generateStaticParams()` — builds all published article slugs at build time
- `generateMetadata()` — reads cached nextjsMetadata, falls back to generation
- JSON-LD injected from cached jsonLdStructuredData
- GTM tracking per client
- Layout: reading progress bar, header, content, gallery, FAQs, citations, related, author bio, client card, comments, newsletter CTA

**Components (40+):**
- Header: ArticleHeader (title, author, date, reading time)
- Content: ArticleFeaturedImage, ArticleContent (HTML), ArticleImageGallery, ArticleFaq
- Sidebar: ArticleTableOfContents, ArticleAuthorBio, ArticleClientCard, ArticleEngagementMetrics, ArticleCitations
- Interaction: ArticleInteractionButtons (like/dislike/favorite), ArticleShareButtons, Comments (moderated, nested replies)
- Tracking: ArticleViewTracker (Core Web Vitals), ArticleBodyLinkTracker
- Related: RelatedArticles, MoreFromAuthor, MoreFromClient

**Data Fetching:**
- `getArticleBySlugMinimal()` — full article with all relations
- `getArticleForMetadata()` — article with media for metadata
- `getArticleSlugsForStaticParams()` — all published slugs
- Comments filtered by status === APPROVED

### 2.4 SEO Architecture

**JSON-LD (Article schema):**
- Generated via `generateArticleKnowledgeGraph()`
- Merges with Settings defaults (12 source-of-truth fields)
- Extracts plain text from HTML via html-to-text
- Validated: Adobe + Ajv + business rules (require publisher logo, hero image)
- Stored as stringified JSON in database

**Metadata Caching:**
- title, description, robots
- openGraph: image, url, type, publishedTime, modifiedTime, author, section, tags
- twitter: card, creator, site, title, description, image
- alternateLanguages (hreflang)
- canonical URL

**SEO Analyzer (6 categories):**
1. Meta Tags — title, description, robots, canonical
2. Content — word count, readability, keyword density
3. Images — alt text, dimensions, compression
4. Structured Data — JSON-LD completeness
5. Social — OG tags, Twitter cards
6. Technical — mobile, Core Web Vitals

**Scoring:** Max 200 points across all categories

### 2.5 Known Issues

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| 1 | **Author hardcoded to Modonty** | All articles go to one author, breaks multi-author E-E-A-T | create-article.ts line 53-61 |
| 2 | View components reference deleted JSON-LD fields | Dead code references (jsonLdVersion, jsonLdHistory, etc.) | article-view-structured-data.tsx |
| 3 | nextjsMetadata cache exists but unclear if frontend reads it correctly | SEO Gap #4 from standard | Frontend metadata generation |
| 4 | No auto-save for drafts | Risk of data loss | Article form |
| 5 | No pagination in admin list | Performance issue with many articles | articles/page.tsx |
| 6 | generateStaticParams placeholder for empty results | May cause build-time 404s | modonty articles page |

---

## 3. Client-Article Relationship

```
Client (1) ──────── (many) Article
  │                          │
  │ clientId (required)      │ @@unique([clientId, slug])
  │                          │
  ├── forbiddenKeywords ────→ compliance check on publish
  ├── forbiddenClaims ──────→ compliance check on publish
  ├── articlesPerMonth ─────→ delivery tracking
  └── subscriptionTier ────→ determines article quota
```

**Key Points:**
- Every article belongs to exactly one client (required)
- Slug is unique **per client**, not globally
- Client's forbidden keywords/claims block article publication
- Subscription tier determines articles/month quota
- **Missing cascade:** Updating client does NOT regenerate article JSON-LD

---

## 4. Database Models Summary

### Core Models
| Model | SEO Cache | JSON-LD | Metadata | Sitemap |
|-------|-----------|---------|----------|---------|
| Client | Yes | Yes (Organization) | Yes | Yes (0.6) |
| Article | Yes | Yes (Article) | Yes | Yes (0.5-0.8) |
| Author | Yes | Yes (Person) | Yes | Yes |
| Category | Yes | Yes | Yes | Yes (0.7) |
| Tag | Yes | Yes | Yes | Yes |
| Industry | Yes | Yes | Yes | Yes |

### Supporting Models
| Model | Purpose |
|-------|---------|
| ArticleTag | Article ↔ Tag join (many-to-many) |
| ArticleMedia | Gallery with position + alt/caption override |
| ArticleFAQ | Question/answer pairs with position |
| RelatedArticle | Bidirectional article links with type |
| ArticleVersion | Content versioning/audit trail |
| Media | Images with Cloudinary, SEO fields, license |
| SeoIntake | Client SEO questionnaire answers |
| ClientCompetitor | Competitor tracking |
| ClientKeyword | Target keywords per client |
| SubscriptionTierConfig | Tier → articlesPerMonth + price |

### Interaction Models (Both Client & Article)
| Model | Tracks |
|-------|--------|
| Views | Page views (session/user/IP) |
| Likes/Dislikes | User reactions |
| Favorites | Saved items (requires login) |
| Shares | Share events by platform |
| Comments | Discussion (moderated, nested) |
| Conversions | Goal completions |
| CTAClicks | Button/link clicks |
| Analytics | Core Web Vitals per view |

---

## 5. Settings Model (Source of Truth)

The Settings table provides defaults used by ALL entities:

| Category | Fields |
|----------|--------|
| SEO Limits | seoTitleMin/Max, seoDescriptionMin/Max, ogTitleMax, twitterTitleMax |
| Defaults | defaultMetaRobots, defaultOgType, defaultOgLocale, defaultTwitterCard |
| Site Info | siteUrl, siteName, brandDescription, siteAuthor, inLanguage |
| Organization | orgContactType/Email/Telephone, orgStreetAddress, orgGeoLatitude |
| Social | facebookUrl, twitterUrl, linkedInUrl, instagramUrl, youtubeUrl |
| Analytics | gtmContainerId, hotjarSiteId |
| Content | defaultLicense, defaultContentFormat, defaultAlternateLanguages |
| Sitemap | defaultSitemapPriority, defaultSitemapChangeFreq |

---

## 6. Identified Tasks

### Clients — Priority Tasks
| # | Task | Type | Priority |
|---|------|------|----------|
| C1 | Review & redesign list page UI/UX | UI/UX | High |
| C2 | Review & redesign client detail page | UI/UX | High |
| C3 | Review & redesign form (10+ tabs) | UI/UX | High |
| C4 | Fix JSON-LD generation (`id`/`type` → `@id`/`@type`) | Bug | High |
| C5 | Add cascade: client update → regenerate article JSON-LD | SEO Gap #3 | High |
| C6 | Add alternates.languages from knowsLanguage | SEO Gap | Medium |
| C7 | Review stats page accuracy | Logic | Medium |
| C8 | Clean dead code in components | Cleanup | Low |

### Articles — Priority Tasks
| # | Task | Type | Priority |
|---|------|------|----------|
| A1 | Review & redesign list page UI/UX | UI/UX | High |
| A2 | Review & redesign 12-step form | UI/UX | High |
| A3 | Review article detail/view page | UI/UX | High |
| A4 | Verify nextjsMetadata cache works in frontend | SEO Gap #4 | High |
| A5 | Clean dead JSON-LD field references | Cleanup | Medium |
| A6 | Review compliance check flow | Logic | Medium |
| A7 | Review TipTap editor extensions | UX | Medium |
| A8 | Add pagination to admin list | Performance | Medium |

### Cross-Section Tasks
| # | Task | Type | Priority |
|---|------|------|----------|
| X1 | Client update → cascade to article JSON-LD | SEO Gap #3 | High |
| X2 | Verify all entities follow SEO-CACHE-STANDARD | Compliance | High |
| X3 | Settings change → auto-cascade all entities | SEO Gap #8 | Medium |

---

## 7. File Inventory

### Admin — Clients
```
admin/app/(dashboard)/clients/
├── page.tsx, loading.tsx, new/page.tsx
├── [id]/page.tsx, [id]/edit/page.tsx, [id]/seo/page.tsx
├── actions/ (15+ files)
│   ├── create-client.ts, update-client.ts, delete-client.ts
│   ├── generate-client-seo.ts, jsonld-actions.ts
│   ├── get-clients.ts, get-clients-stats.ts, get-client-by-id.ts
│   └── update-client-grouped.ts (10 group functions)
├── components/ (50+ files)
│   ├── Page: clients-page-client, clients-header, clients-stats, client-table
│   ├── Detail: client-header, client-tabs, client-view, client-analytics
│   ├── Form: client-form, client-seo-form, 15+ tab sections
│   └── Actions: bulk-actions-toolbar, export-button, delete-client-button
└── helpers/ (20+ files)
    ├── client-form-schema.ts, client-form-config.ts
    ├── client-seo-config/ (8 files: JSON-LD, validators, generation)
    ├── client-field-mapper.ts, map-initial-data-to-form-data.ts
    └── hooks/use-client-form.ts
```

### Admin — Articles
```
admin/app/(dashboard)/articles/
├── page.tsx, loading.tsx, new/page.tsx
├── [id]/page.tsx, [id]/edit/page.tsx, [id]/loading.tsx
├── [id]/components/ (20+ view components)
├── [id]/helpers/ (8 helper files)
├── preview/[id]/page.tsx + components/
├── actions/ (30+ files)
│   ├── mutations/ (create, update, delete)
│   ├── queries/ (get-articles, stats, by-id, by-slug, etc.)
│   ├── bulk/ (bulk-delete, bulk-update-status)
│   ├── publish-action/ (publish-article, publish-article-by-id)
│   ├── jsonld-actions/ (regenerate, batch, get, statistics)
│   └── generate-article-ai.ts, gallery-actions.ts, export-actions.ts
├── components/ (100+ files)
│   ├── rich-text-editor.tsx (TipTap with 30+ extensions)
│   ├── article-form-*.tsx (context, layout, stepper, tabs)
│   ├── article-table.tsx, articles-filters.tsx
│   ├── faq-builder.tsx, related-articles-builder.tsx, image-gallery-manager.tsx
│   ├── sections/ (15+ form sections)
│   ├── steps/ (12 step components)
│   └── extensions/long-paragraph-highlight.ts
├── helpers/ (50+ files)
│   ├── article-seo-config/ (12 validator files)
│   ├── step-validation-helpers/ (6 files)
│   └── seo-helpers.ts, seo-validation.ts, seo-generation.ts
└── analyzer/ (10+ files)
    └── article-seo-analyzer/ (analyze-meta, content, images, structured-data, social, technical)
```

### Frontend — Clients
```
modonty/app/clients/
├── page.tsx, loading.tsx
├── [slug]/page.tsx, [slug]/about/page.tsx
├── components/ (20+ files)
└── helpers/ (client-queries.ts in /api/helpers/)
```

### Frontend — Articles
```
modonty/app/articles/
├── [slug]/page.tsx
├── [slug]/components/ (40+ files)
├── [slug]/actions/ (article-data.ts)
└── Related: /api/helpers/article-queries.ts
```

### Shared SEO Library
```
admin/lib/seo/
├── jsonld-storage.ts (article JSON-LD generation + storage)
├── metadata-storage.ts (article metadata generation + storage)
├── knowledge-graph-generator.ts (Person, Organization, Article schemas)
├── jsonld-validator.ts (Adobe + Ajv validation)
├── jsonld-processor.ts (normalization)
├── listing-page-seo-generator.ts (clients/articles listing cache)
└── pre-publish-audit.ts (compliance check)
```
