# PRD: Perfect SEO & JSON-LD Implementation for Modonty Articles

## Executive Summary

This PRD outlines a comprehensive strategy to achieve **100% SEO compliance** for Modonty articles, implementing perfect JSON-LD structured data according to **2025 Google standards**, and establishing industry-leading content optimization practices for the Authority Blog system.

## Current State Analysis

### Strengths

- ✅ Database schema has comprehensive SEO fields (30+ fields)
- ✅ Basic JSON-LD generation exists (`admin/lib/seo/structured-data.ts`)
- ✅ Article form includes SEO fields
- ✅ Open Graph and Twitter Cards supported
- ✅ E-E-A-T author fields implemented
- ✅ **Centralized Media System**: Client has logoMediaId, ogImageMediaId, twitterImageMediaId via Media relations (excellent architecture)
- ✅ **Hero Image Support**: Article has featuredImageId relation to Media
- ✅ **Core Relationships**: Client, Author, Category, Tags all properly linked

### Centralized Media Architecture (Current Implementation)

**Client Media Relations** (from schema analysis):

```prisma
// Client has centralized media references
logoMediaId         String? @unique @db.ObjectId
logoMedia           Media?  @relation("ClientLogoMedia")
ogImageMediaId      String? @unique @db.ObjectId
ogImageMedia        Media?  @relation("ClientOGMedia")
twitterImageMediaId String? @unique @db.ObjectId
twitterImageMedia   Media?  @relation("ClientTwitterMedia")
```

**Article Media Relations** (Current):

```prisma
// Article has featured image (hero)
featuredImageId String? @db.ObjectId
featuredImage   Media?  @relation("ArticleFeaturedImage")
```

**Gap Identified**:

- ❌ No `ArticleMedia` relation for image gallery (existed in old schema but missing in current)
- ❌ Multiple images per article not supported in current schema
- ✅ Media belongs to Client (clientId) - good for multi-tenancy

### Critical Gaps Identified

- ❌ **JSON-LD not stored in database** - Generated on-the-fly only
- ❌ **Incomplete Article schema** - Missing critical 2025 requirements
- ❌ **No centralized @graph implementation** - Multiple separate scripts (5 script tags currently)
- ❌ **Missing HowTo, Recipe, VideoObject** - Limited rich result types
- ❌ **No official JSON-LD validation** - No @adobe/structured-data-validator integration
- ❌ **Incomplete FAQPage schema** - Currently nested incorrectly in mainEntity
- ❌ **Missing Speakable schema** - No voice search optimization
- ❌ **No Article body in structured data** - Required for 2025 standards
- ❌ **Publisher logo dimensions not validated** - Must be 600x60px min (from centralized logoMedia)
- ❌ **No ContentRating or accessibility fields**
- ❌ **Image gallery missing** - No ArticleMedia relation for multiple images
- ❌ **Hero image (featuredImage) not fully optimized** - Missing ImageObject schema in gallery
- ❌ **Core relationships not in JSON-LD** - Client, Author, Category, Tags need proper schema links

## 2025 Google SEO Updates (Must Implement)

### 1. JSON-LD Format Requirement

- **CRITICAL**: Google deprecated Microdata and RDFa in October 2025
- **Action**: Ensure all structured data uses JSON-LD exclusively
- **Storage**: Store compiled JSON-LD in database for performance

### 2. Article Schema Enhancements

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Exact H1 match (max 110 chars)",
  "articleBody": "Full article text required",
  "publisher": {
    "@type": "Organization",
    "logo": {
      "@type": "ImageObject",
      "url": "...",
      "width": 600,
      "height": 60
    }
  },
  "author": {
    "@type": "Person",
    "name": "...",
    "sameAs": ["..."]
  },
  "datePublished": "ISO 8601",
  "dateModified": "ISO 8601",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "canonical-url"
  }
}
```

### 3. Centralized @graph Implementation

- Single `<script type="application/ld+json">` tag
- All schemas (Article, Organization, Author, Breadcrumb, FAQPage) in one graph
- Better performance and maintainability

## Understanding Centralized Media & Core Data Structure

### How Centralized Media Works (Current System)

**Client Level** (Centralized):

- `logoMedia` → Used as Publisher logo in Article schema (must be 600x60px)
- `ogImageMedia` → Default OG image for all client articles
- `twitterImageMedia` → Default Twitter card image
- **All media belongs to Client** (clientId) - ensures multi-tenancy and proper access control

**Article Level** (Per Article):

- `featuredImage` → Hero image for article (single image)
- `media[]` → **MISSING** - Need to add ArticleMedia relation for gallery

### Core Data Relationships (Critical for SEO)

**Article is the Hub**:

```
Article
  ├─→ Client (Publisher) → logoMedia (centralized)
  ├─→ Author (Person) → E-E-A-T signals
  ├─→ Category → articleSection + about
  ├─→ Tags[] → keywords + about[]
  ├─→ FeaturedImage (Hero) → ImageObject schema
  ├─→ Media[] (Gallery) → Multiple ImageObject schemas
  └─→ FAQs[] → FAQPage schema
```

**Why This Matters for Client SEO**:

1. **Publisher Logo** from centralized Client.logoMedia validates 600x60px requirement
2. **All relationships** (Client, Author, Category, Tags) create rich, interconnected schema
3. **Image gallery** provides more ImageObject schemas = better image SEO
4. **Centralized media** ensures consistency across all client articles

## Implementation Plan

### Phase 1: Database Schema Enhancement

**File**: `dataLayer/prisma/schema/schema.prisma`

**Add to Article model**:

```prisma
// JSON-LD Storage
jsonLdStructuredData Json? // Store compiled JSON-LD for performance
jsonLdLastGenerated DateTime? // Track when JSON-LD was last generated
jsonLdValidationErrors Json? // Store validation errors from @adobe/structured-data-validator

// 2025 Required Fields
articleBody String? // Full article text for structured data (auto-extracted from content)
speakable Json? // SpeakableSchema for voice search optimization
contentRating String? // ageRating, contentRating
accessibilityFeature String[] // accessibilityFeature array
accessibilityHazard String[] // accessibilityHazard array

// Enhanced Publisher Info (from centralized Client logoMedia)
publisherLogoWidth Int? // Auto-calculated from Client.logoMedia.width (validate 600x60px)
publisherLogoHeight Int? // Auto-calculated from Client.logoMedia.height
publisherLogoUrl String? // Auto-populated from Client.logoMedia.url

// Video Content Support
videoObject Json? // VideoObject schema if article has embedded video
hasVideo Boolean @default(false)

// Recipe/HowTo Support (for relevant articles)
recipeObject Json? // Recipe schema for food/recipe articles
howToObject Json? // HowTo schema for tutorial articles

// Image Gallery Support (NEW - critical for SEO)
media Media[] @relation("ArticleMedia") // Multiple images for article gallery
```

**Update Media model to support Article Gallery** (many-to-many via junction):

**Option 1: Junction Table** (Recommended for flexibility):

```prisma
model ArticleMedia {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  articleId String  @db.ObjectId
  mediaId   String  @db.ObjectId
  position  Int     // Order in gallery (1, 2, 3...)
  isHero    Boolean @default(false) // Mark if this is the hero/featured image

  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  media   Media   @relation(fields: [mediaId], references: [id], onDelete: Cascade)

  @@unique([articleId, mediaId])
  @@index([articleId, position])
  @@index([mediaId])
  @@map("article_media")
}

model Media {
  // ... existing fields ...

  // Image Gallery Relationship (NEW)
  articleMedia ArticleMedia[] // Articles that use this image via junction table
}
```

**Option 2: Direct Relation** (Simpler, if Media can only belong to one article):

```prisma
model Media {
  // ... existing fields ...

  // Image Gallery Relationship
  articleMedia Article[] @relation("ArticleMedia") // Articles that use this image in gallery
  position     Int? // Order in article image gallery (for junction table approach, this moves to ArticleMedia)
}
```

**Recommendation**: Use **Option 1 (Junction Table)** because:

- ✅ Same media can be reused across multiple articles
- ✅ Better position/ordering control per article
- ✅ Flexible relationship (media → multiple articles)
- ✅ Aligns with existing ArticleTag pattern

### Phase 2: Enhanced JSON-LD Generator

**File**: `admin/lib/seo/structured-data.ts`

**New Function**: `generateCompleteArticleStructuredData()`

**Key Improvements**:

1. **Centralized @graph**: All schemas in single script tag
2. **Article body inclusion**: Full text in `articleBody` property
3. **Publisher logo validation**: Check 600x60px requirement
4. **Speakable schema**: Add for voice search optimization
5. **Separate FAQPage**: Move out of `mainEntity`, make standalone
6. **VideoObject support**: If article has embedded video
7. **ContentRating**: Add age/content ratings
8. **Accessibility fields**: Support accessibility features

**Implementation Structure** (with all core relationships and media):

```typescript
export function generateCompleteArticleStructuredData(
  article: ArticleWithRelations & {
    client: Client & { logoMedia?: Media | null };
    author: Author;
    category?: Category | null;
    tags?: Array<{ tag: Tag }>;
    featuredImage?: Media | null;
    media?: Media[]; // Image gallery
  },
): object {
  const graph = [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://modonty.com';
  const articleUrl = article.canonicalUrl || `${siteUrl}/articles/${article.slug}`;

  // 1. Article schema (with all core relationships)
  const articleSchema: any = {
    '@type': 'Article',
    '@id': `${articleUrl}#article`,
    headline: article.title, // Max 110 chars, exact H1 match
    articleBody: article.content, // Full text required for 2025
    description: article.seoDescription || article.excerpt,
    datePublished: article.datePublished?.toISOString(),
    dateModified: article.dateModified.toISOString(),
    inLanguage: article.inLanguage || 'ar',
    isAccessibleForFree: article.isAccessibleForFree ?? true,
  };

  // Hero Image (featuredImage) as primary image
  if (article.featuredImage) {
    articleSchema.image = {
      '@type': 'ImageObject',
      '@id': `${articleUrl}#hero-image`,
      url: article.featuredImage.url,
      width: article.featuredImage.width,
      height: article.featuredImage.height,
      caption: article.featuredImage.caption,
      creditText: article.featuredImage.credit,
      license: article.featuredImage.license
        ? `${siteUrl}/license/${article.featuredImage.license}`
        : undefined,
    };
  }

  // Image Gallery (all images in article) - NEW
  if (article.media && article.media.length > 0) {
    articleSchema.image = articleSchema.image
      ? [articleSchema.image] // Convert hero to array
      : [];

    articleSchema.image.push(
      ...article.media.map((media: Media, index: number) => ({
        '@type': 'ImageObject',
        '@id': `${articleUrl}#image-${index + 1}`,
        url: media.url,
        width: media.width,
        height: media.height,
        caption: media.caption,
        creditText: media.credit,
        alt: media.altText,
        license: media.license ? `${siteUrl}/license/${media.license}` : undefined,
      })),
    );
  }

  // Author relationship (core)
  articleSchema.author = {
    '@type': 'Person',
    '@id': `${siteUrl}/authors/${article.author.slug}#person`,
    name: article.author.name,
  };

  // Publisher relationship (from centralized Client logoMedia)
  articleSchema.publisher = {
    '@type': 'Organization',
    '@id': `${siteUrl}/clients/${article.client.slug}#organization`,
    name: article.client.name,
    legalName: article.client.legalName,
    url: article.client.url,
  };

  // Publisher Logo (from centralized Client.logoMedia - validate 600x60px)
  if (article.client.logoMedia) {
    articleSchema.publisher.logo = {
      '@type': 'ImageObject',
      url: article.client.logoMedia.url,
      width: article.client.logoMedia.width || 600, // Validate >= 600
      height: article.client.logoMedia.height || 60, // Validate >= 60
    };
  }

  // Category relationship (core)
  if (article.category) {
    articleSchema.articleSection = article.category.name;
    articleSchema.about = {
      '@type': 'Thing',
      '@id': `${siteUrl}/categories/${article.category.slug}`,
      name: article.category.name,
    };
  }

  // Tags relationships (core - keywords)
  if (article.tags && article.tags.length > 0) {
    articleSchema.keywords = article.tags.map((at: any) => at.tag.name).join(', ');
    articleSchema.about = articleSchema.about ? [articleSchema.about] : [];
    articleSchema.about.push(
      ...article.tags.map((at: any) => ({
        '@type': 'Thing',
        '@id': `${siteUrl}/tags/${at.tag.slug}`,
        name: at.tag.name,
      })),
    );
  }

  graph.push(articleSchema);

  // 2. Organization schema (Publisher) - standalone with centralized media
  graph.push({
    '@type': 'Organization',
    '@id': `${siteUrl}/clients/${article.client.slug}#organization`,
    name: article.client.name,
    legalName: article.client.legalName,
    url: article.client.url,
    logo: article.client.logoMedia
      ? {
          '@type': 'ImageObject',
          url: article.client.logoMedia.url,
          width: article.client.logoMedia.width,
          height: article.client.logoMedia.height,
        }
      : undefined,
    sameAs: article.client.sameAs || [],
  });

  // 3. Person schema (Author) - complete E-E-A-T
  graph.push({
    '@type': 'Person',
    '@id': `${siteUrl}/authors/${article.author.slug}#person`,
    name: article.author.name,
    jobTitle: article.author.jobTitle,
    description: article.author.bio,
    image: article.author.image,
    url: article.author.url,
    sameAs: [
      ...(article.author.linkedIn ? [article.author.linkedIn] : []),
      ...(article.author.twitter ? [article.author.twitter] : []),
      ...(article.author.facebook ? [article.author.facebook] : []),
      ...(article.author.sameAs || []),
    ],
    knowsAbout: article.author.expertiseAreas || [],
    hasCredential: article.author.credentials || [],
  });

  // 4. BreadcrumbList schema
  graph.push({
    '@type': 'BreadcrumbList',
    '@id': `${articleUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: siteUrl },
      ...(article.category
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: article.category.name,
              item: `${siteUrl}/categories/${article.category.slug}`,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: article.category ? 3 : 2,
        name: article.title,
        item: articleUrl,
      },
    ],
  });

  // 5. FAQPage schema (separate, NOT nested in mainEntity)
  if (article.faqs && article.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${articleUrl}#faqpage`,
      mainEntity: article.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  // 6. ImageObject schemas for gallery (NEW - for better image SEO)
  if (article.media && article.media.length > 0) {
    article.media.forEach((media: Media, index: number) => {
      graph.push({
        '@type': 'ImageObject',
        '@id': `${articleUrl}#image-${index + 1}`,
        url: media.url,
        width: media.width,
        height: media.height,
        caption: media.caption,
        creditText: media.credit,
        alt: media.altText,
        license: media.license,
        creator: media.creator
          ? {
              '@type': 'Person',
              name: media.creator,
            }
          : undefined,
      });
    });
  }

  // 7. Speakable schema (voice search optimization)
  graph.push({
    '@type': 'SpeakableSpecification',
    '@id': `${articleUrl}#speakable`,
    cssSelector: ['h1', '.article-excerpt', '.article-summary'],
    xpath: ['/html/head/title'],
  });

  // Wrap in @graph (single script tag)
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
```

### Phase 3: Database Storage Implementation

**New Helper**: `admin/lib/seo/jsonld-storage.ts`

**Functions**:

1. `saveJsonLdToDatabase()` - Store compiled JSON-LD
2. `getJsonLdFromDatabase()` - Retrieve cached version
3. `invalidateJsonLdCache()` - Regenerate when article updated
4. `validateJsonLdStructure()` - Pre-save validation

**Storage Strategy**:

- Store compiled JSON-LD string in `jsonLdStructuredData` field
- Regenerate on: article update, author change, client change
- Cache for performance (read from DB instead of generating)
- Store validation errors in `jsonLdValidationErrors` for debugging

### Phase 4: Article Form Enhancements

**File**: `admin/app/(dashboard)/articles/components/article-form-enhanced.tsx`

**New Sections**:

1. **JSON-LD Preview & Validation**

   - Live preview of generated JSON-LD
   - Google Rich Results Test integration
   - Validation error display
   - "Regenerate JSON-LD" button

2. **2025 Required Fields**

   - Article Body field (auto-populated from content)
   - Publisher Logo upload/validation (600x60px check)
   - Speakable sections selector
   - Content Rating selector
   - Accessibility features checklist

3. **Image Gallery Management** (NEW - Critical for SEO)

   - **Hero Image Selection**: Choose featuredImage from gallery or upload new
   - **Image Gallery Builder**:
     - Upload/add multiple images to article
     - Reorder images (drag & drop for position)
     - Mark hero image from gallery
     - Edit SEO fields for each image:
       - Alt text (required for SEO)
       - Caption (for ImageObject schema)
       - Credit text (attribution)
       - License type (CC0, CC-BY, etc.)
       - Title and description
   - **Image SEO Score**: Show SEO score for each image
   - **Bulk Image Operations**: Add multiple images at once
   - **Image Gallery Preview**: Visual preview with SEO indicators

4. **Advanced Schema Options**

   - Video content toggle (enables VideoObject)
   - Recipe schema toggle (for food articles)
   - HowTo schema toggle (for tutorial articles)
   - Custom schema fields editor

5. **Real-time SEO Score**

   - Enhanced SEO Doctor with JSON-LD checks
   - Validation status indicator
   - Missing required fields warnings

### Phase 5: Frontend Rendering (Authority Blog)

**File**: `beta/app/articles/[slug]/page.tsx` (Authority Blog - current implementation)

**Current Issue**: Uses 5 separate script tags - must consolidate to single @graph

**Key Changes**:

1. Remove all Microdata (itemScope, itemProp) - deprecated in 2025
2. Use cached JSON-LD from database
3. Single script tag with @graph structure
4. Include all core relationships (Client, Author, Category, Tags)
5. Include image gallery in structured data

**Implementation**:

```tsx
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  const article = await db.article.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: {
      client: {
        include: { logoMedia: true }, // Get centralized logoMedia for Publisher logo
      },
      author: true,
      category: true,
      tags: { include: { tag: true } },
      featuredImage: true, // Hero image
      media: {
        // Image gallery (via ArticleMedia junction - NEW)
        orderBy: { position: 'asc' },
        include: { media: true },
      },
      faqs: { orderBy: { position: 'asc' } },
    },
  });

  if (!article) notFound();

  // Use cached JSON-LD from database OR generate on-the-fly
  const jsonLd = article.jsonLdStructuredData
    ? JSON.parse(article.jsonLdStructuredData as string)
    : generateCompleteArticleStructuredData(article);

  return (
    <>
      {/* SINGLE script tag with @graph (replaces 5 separate tags) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd, null, 2),
        }}
      />

      {/* Article content - NO Microdata (removed itemScope/itemProp - deprecated 2025) */}
      <article>
        <h1>{article.title}</h1>
        {article.featuredImage && (
          <img
            src={article.featuredImage.url}
            alt={article.featuredImage.altText || article.title}
            width={article.featuredImage.width}
            height={article.featuredImage.height}
          />
        )}
        <div dangerouslySetInnerHTML={{ __html: article.content }} />

        {/* Image Gallery - NEW */}
        {article.media && article.media.length > 0 && (
          <section className="image-gallery">
            {article.media.map((am) => (
              <figure key={am.id}>
                <img
                  src={am.media.url}
                  alt={am.media.altText || ''}
                  width={am.media.width}
                  height={am.media.height}
                />
                {am.media.caption && <figcaption>{am.media.caption}</figcaption>}
              </figure>
            ))}
          </section>
        )}
      </article>
    </>
  );
}
```

### Phase 6: Official Validation with @adobe/structured-data-validator

**Installation**:

```bash
npm install @adobe/structured-data-validator
```

**New Utility**: `admin/lib/seo/jsonld-validator.ts`

**Integration with @adobe/structured-data-validator**:

```typescript
import { Validator } from '@adobe/structured-data-validator';

export async function validateJsonLdWithAdobe(jsonLd: object) {
  const validator = new Validator();
  const result = validator.validate(jsonLd);

  return {
    valid: result.valid,
    errors: result.errors || [],
    warnings: result.warnings || [],
  };
}
```

**Features**:

1. **Official Schema.org Validation** (using @adobe/structured-data-validator)

   - Validate against official schema.org definitions
   - Comprehensive error reporting
   - Integration with build process
   - Pre-publish validation required

2. **Pre-publish Validation Checklist**:

   - ✅ Check required fields (headline, datePublished, etc.)
   - ✅ Validate JSON structure (syntax errors)
   - ✅ Check Publisher logo dimensions (600x60px from Client.logoMedia)
   - ✅ Validate all URLs (canonical, images, author profiles)
   - ✅ Check date formats (ISO 8601)
   - ✅ Validate ImageObject schemas for hero image and gallery
   - ✅ Check core relationships (Client, Author, Category, Tags exist)
   - ✅ Verify centralized media references (logoMedia, ogImageMedia)

3. **Google Rich Results Test Integration**

   - API integration for additional validation
   - Store test results in `jsonLdValidationErrors`
   - Display errors in form with actionable fixes

4. **Schema.org Compliance Checks**

   - Validate against latest Schema.org specs (2025)
   - Check for deprecated properties
   - Warn about missing recommended fields
   - Verify @graph structure is valid

### Phase 7: Performance Optimization

**Strategies**:

1. **Database caching**: Store compiled JSON-LD
2. **Lazy generation**: Only regenerate when needed
3. **CDN caching**: Cache rendered pages with JSON-LD
4. **Incremental updates**: Only update changed schemas

### Phase 8: Monitoring & Analytics

**New Features**:

1. **JSON-LD health dashboard**

   - Validation errors across all articles
   - Missing required fields reports
   - Rich result eligibility status

2. **Google Search Console Integration**

   - Monitor structured data errors
   - Track rich result performance
   - Alert on validation failures

## Industry Best Practices (Leading Content Companies)

### What Top Performers Do

1. **The Verge / Vox Media**

   - Single @graph with all schemas
   - Complete article body in structured data
   - VideoObject for video content
   - Real-time validation

2. **Moz / Moz Blog**

   - Comprehensive FAQPage (separate schema)
   - Speakable schema for voice search
   - Publisher logo properly sized
   - Author sameAs with all social profiles

3. **HubSpot Blog**

   - HowTo schema for tutorials
   - BreadcrumbList on every page
   - Organization schema with complete contact info
   - Regular schema audits

4. **Content King / Ahrefs**

   - JSON-LD cached in database
   - Automated validation before publish
   - Monitoring and alerting
   - Regular schema updates

### Implementation Checklist for Modonty

**Core JSON-LD & Schema**:

- [ ] Implement centralized @graph structure (single script tag)
- [ ] Store JSON-LD in database for performance
- [ ] Add articleBody to structured data (required 2025)
- [ ] Integrate @adobe/structured-data-validator for official validation
- [ ] Separate FAQPage schema (not nested)
- [ ] Implement Speakable schema for voice search

**Media & Images**:

- [ ] Add ArticleMedia relation for image gallery
- [ ] Implement ImageObject schemas for hero image (featuredImage)
- [ ] Implement ImageObject schemas for image gallery (all media)
- [ ] Validate Publisher logo from centralized Client.logoMedia (600x60px)
- [ ] Ensure all images have proper SEO fields (altText, caption, license)

**Core Relationships (Critical for Client SEO)**:

- [ ] Link Client (Publisher) with centralized logoMedia in schema
- [ ] Link Author (Person) with complete E-E-A-T signals
- [ ] Link Category (articleSection + about property)
- [ ] Link Tags (keywords + about array)
- [ ] All relationships use @id for proper linking

**Validation & Quality**:

- [ ] Pre-publish validation with @adobe/structured-data-validator
- [ ] Google Rich Results Test integration
- [ ] Real-time JSON-LD preview in form
- [ ] Validation error storage and display
- [ ] Regular schema audits

**Advanced Features**:

- [ ] VideoObject support for video content
- [ ] Recipe schema for food articles
- [ ] HowTo schema for tutorials
- [ ] ContentRating and accessibility fields

## Technical Specifications

### Database Migration

```prisma
// Add to Article model
model Article {
  // ... existing fields

  // JSON-LD Storage
  jsonLdStructuredData Json?
  jsonLdLastGenerated DateTime?
  jsonLdValidationErrors Json?

  // 2025 Required
  articleBody String?
  speakable Json?
  contentRating String?
  accessibilityFeature String[]
  accessibilityHazard String[]

  // Enhanced Publisher
  publisherLogoWidth Int?
  publisherLogoHeight Int?
  publisherLogoUrl String?

  // Extended Content Types
  videoObject Json?
  hasVideo Boolean @default(false)
  recipeObject Json?
  howToObject Json?
}
```

### API Changes

**New Server Actions**:

- `generateAndSaveJsonLd(articleId: string)` - Generate and cache
- `validateJsonLd(articleId: string)` - Validate structure
- `getJsonLdPreview(articleId: string)` - Preview before publish
- `testRichResults(articleId: string)` - Google API test

### Component Changes

**New Components**:

- `JsonLdPreview.tsx` - Live preview with syntax highlighting
- `JsonLdValidator.tsx` - Validation status display
- `RichResultsTester.tsx` - Google API integration
- `SchemaGraphBuilder.tsx` - Visual @graph builder

## Success Metrics

### SEO Performance

- ✅ 100% JSON-LD validation rate
- ✅ Zero structured data errors in Search Console
- ✅ 100% rich result eligibility
- ✅ Improved click-through rates (CTR)
- ✅ Higher search rankings

### Technical Metrics

- ✅ JSON-LD generation < 100ms
- ✅ Page load time maintained (< 2s LCP)
- ✅ Zero validation errors pre-publish
- ✅ 100% schema.org compliance

### Business Metrics

- ✅ Increased Authority Blog traffic
- ✅ Higher domain authority
- ✅ Better client backlink value
- ✅ Improved client renewal rate

## Risk Mitigation

### Potential Issues

1. **Breaking changes**: Maintain backward compatibility
2. **Performance impact**: Use database caching
3. **Validation failures**: Pre-publish checks required
4. **Google policy changes**: Monitor and update regularly

### Rollback Plan

- Keep old JSON-LD generator as fallback
- Database fields are optional (nullable)
- Gradual rollout per article

## Timeline Estimate

- **Phase 1-2**: Database + Generator (1 week)
- **Phase 3-4**: Storage + Form (1 week)
- **Phase 5**: Frontend rendering (3 days)
- **Phase 6-7**: Validation + Performance (1 week)
- **Phase 8**: Monitoring (3 days)

**Total**: ~4-5 weeks for complete implementation

**Breakdown**:

- Phase 1-2: Database + Generator with all relationships (1.5 weeks)
- Phase 3-4: Storage + Form with image gallery (1.5 weeks)
- Phase 5: Frontend rendering (3 days)
- Phase 6: @adobe/structured-data-validator integration (1 week)
- Phase 7: Performance optimization (3 days)
- Phase 8: Monitoring dashboard (3 days)

## Files to Modify/Create

### Modified Files

- `dataLayer/prisma/schema/schema.prisma` - Add JSON-LD fields, ArticleMedia relation for gallery
- `admin/lib/seo/structured-data.ts` - Enhanced generator with @graph, core relationships, image gallery
- `admin/app/(dashboard)/articles/components/article-form-enhanced.tsx` - New fields, image gallery management
- `beta/app/articles/[slug]/page.tsx` - Render JSON-LD from DB (currently generates on-the-fly)
- `admin/package.json` - Add @adobe/structured-data-validator dependency

### New Files

- `admin/lib/seo/jsonld-storage.ts` - Database operations for caching JSON-LD
- `admin/lib/seo/jsonld-validator.ts` - Official validation with @adobe/structured-data-validator
- `admin/lib/seo/rich-results-api.ts` - Google Rich Results Test API integration
- `admin/lib/seo/image-gallery-schema.ts` - Generate ImageObject schemas for gallery
- `admin/components/jsonld/jsonld-preview.tsx` - Live preview with syntax highlighting
- `admin/components/jsonld/jsonld-validator.tsx` - Validation status display with Adobe validator
- `admin/components/jsonld/rich-results-tester.tsx` - Google API tester component
- `admin/components/articles/image-gallery-manager.tsx` - Manage article image gallery with SEO fields
- `admin/components/articles/hero-image-selector.tsx` - Select hero image from gallery or upload

## Next Steps

1. Review and approve this PRD
2. Create detailed technical specifications
3. Set up development environment
4. Begin Phase 1 implementation
5. Regular progress reviews
6. Testing and validation
7. Gradual rollout

---

## Summary: Key Points Addressed

### 1. @adobe/structured-data-validator Integration ✅

- Official Adobe validator for schema.org compliance
- Pre-publish validation required
- Comprehensive error reporting
- Integration in Phase 6 with detailed implementation

### 2. Centralized Media Understanding ✅

- **Client Level**: logoMedia, ogImageMedia, twitterImageMedia (centralized)
- **Publisher Logo**: Uses Client.logoMedia for Article schema (validate 600x60px)
- **All media belongs to Client** (clientId) - proper multi-tenancy
- **Current Gap**: ArticleMedia relation missing for gallery (to be added)

### 3. Hero Image (featuredImage) ✅

- Already exists in schema (featuredImageId)
- Enhanced with ImageObject schema in JSON-LD
- Validated dimensions and SEO fields
- Can be selected from gallery or uploaded separately

### 4. Image Gallery ✅

- **NEW**: ArticleMedia junction table for multiple images
- Each image has position, SEO fields (altText, caption, credit, license)
- Generates ImageObject schemas for all gallery images
- Visual gallery builder in article form

### 5. Core Relationships in Schema ✅

All relationships properly linked in JSON-LD for client SEO:

- **Client (Publisher)**: Linked with centralized logoMedia → validates 600x60px
- **Author (Person)**: Complete E-E-A-T signals (sameAs, credentials, expertiseAreas)
- **Category**: articleSection + about property
- **Tags**: keywords + about array
- **Featured Image**: Primary ImageObject schema
- **Image Gallery**: Multiple ImageObject schemas

### 6. Business Value for Clients ✅

This implementation helps clients improve SEO through Modonty SaaS:

- **Rich Results**: FAQPage, ImageObject, BreadcrumbList schemas
- **Publisher Authority**: Proper Organization schema with validated logo
- **Author E-E-A-T**: Complete Person schema with credentials
- **Image SEO**: Multiple ImageObject schemas from gallery
- **Voice Search**: Speakable schema for voice optimization
- **Content Depth**: articleBody included (required 2025)
- **All relationships linked**: Creates interconnected, rich schema graph

---

**Document Version**: 2.0

**Last Updated**: 2025-01-27

**Status**: Ready for Implementation - All requirements integrated
