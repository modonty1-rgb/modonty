# New Article Creation - Complete Flow Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Complete Flow from Start to Database](#complete-flow-from-start-to-database)
3. [SEO Validation Logic](#seo-validation-logic)
4. [Database Schema](#database-schema)
5. [Related Tables](#related-tables)

---

## Overview

This document provides a **deep, detailed explanation** of the entire article creation process from the moment a user navigates to `/articles/new` until the article is saved to the database. It covers:

- **Server-side data fetching** (clients, categories, authors, tags)
- **Client-side form initialization** (React Context + Zustand store)
- **Real-time auto-fill logic** (slug, SEO fields, OG fields, Twitter fields)
- **Form state management** (synchronization between Context and Store)
- **Save operation** (validation, data transformation, database insertion)
- **SEO validation** (client-side preview + server-side full validation)
- **Database schema** (Article model and all related tables)

---

## Complete Flow from Start to Database

### Phase 1: Page Load (Server Component)

**File**: `admin/app/(dashboard)/articles/new/page.tsx`

#### Step 1.1: Parallel Data Fetching

When the user navigates to `/articles/new`, Next.js renders the server component:

```typescript
export default async function NewArticlePage() {
  // All 4 queries execute in PARALLEL (Promise.all)
  const [clients, categories, authors, tags] = await Promise.all([
    getClients(),      // Fetch all clients from DB
    getCategories(),  // Fetch all categories from DB
    getAuthors(),     // Fetch Modonty author (singleton)
    getTags(),        // Fetch all tags from DB
  ]);
```

**What happens:**

1. **`getClients()`**: Queries `Client` table, returns `{ id, name, slug }[]`
2. **`getCategories()`**: Queries `Category` table, returns `{ id, name, slug }[]`
3. **`getAuthors()`**: Fetches Modonty author (singleton pattern), returns `[{ id, name }]`
4. **`getTags()`**: Queries `Tag` table, returns `{ id, name, slug }[]`

**Database Queries:**

```sql
-- getClients()
SELECT id, name, slug FROM clients ORDER BY name ASC

-- getCategories()
SELECT id, name, slug FROM categories ORDER BY name ASC

-- getAuthors()
SELECT id, name FROM authors WHERE name = 'Modonty' LIMIT 1

-- getTags()
SELECT id, name, slug FROM tags ORDER BY name ASC
```

#### Step 1.2: Provider Initialization

The server component wraps the page with `ArticleFormProvider`:

```typescript
<ArticleFormProvider
  mode="new"
  initialData={undefined} // No initial data for new articles
  onSubmit={createArticle} // Server action reference
  clients={clients}
  categories={categories}
  authors={authors}
  tags={tags}
>
  {/* Form UI */}
</ArticleFormProvider>
```

**Props passed:**

- `mode="new"`: Indicates this is a new article (not edit)
- `initialData={undefined}`: No existing article data
- `onSubmit={createArticle}`: Reference to server action (passed to client)
- Dropdown data: clients, categories, authors, tags

---

### Phase 2: Client-Side Form Initialization

**File**: `admin/app/(dashboard)/articles/components/article-form-context.tsx`

#### Step 2.1: Initial Form State

When `ArticleFormProvider` mounts, it initializes form state:

```typescript
const initialFormData: ArticleFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  contentFormat: 'rich_text',
  clientId: '',
  categoryId: '',
  authorId: '',
  status: 'WRITING', // Always WRITING for new articles
  featured: false,
  scheduledAt: null,
  seoTitle: '',
  seoDescription: '',
  metaRobots: 'index, follow',
  ogTitle: '',
  ogDescription: '',
  ogUrl: '',
  ogSiteName: 'مودونتي',
  ogLocale: 'ar_SA',
  ogArticleAuthor: '',
  ogArticleSection: '',
  ogArticleTag: [],
  twitterCard: 'summary_large_image',
  twitterTitle: '',
  twitterDescription: '',
  twitterSite: '',
  twitterCreator: '',
  twitterLabel1: '',
  twitterData1: '',
  canonicalUrl: '',
  sitemapPriority: 0.5,
  sitemapChangeFreq: 'weekly',
  alternateLanguages: [],
  license: '',
  lastReviewed: null,
  featuredImageId: null,
  tags: [],
  faqs: [],
};

const [formData, setFormData] = useState<ArticleFormData>(() => ({
  ...initialFormData,
  ...initialData, // Empty for new articles
}));
```

**Key Defaults:**

- `status: 'WRITING'`: Always starts as WRITING (workflow state)
- `contentFormat: 'rich_text'`: Default content format
- `metaRobots: 'index, follow'`: Default robots directive
- `ogSiteName: 'مودونتي'`: Default site name (Arabic)
- `ogLocale: 'ar_SA'`: Default locale (Saudi Arabia)
- `twitterCard: 'summary_large_image'`: Default Twitter card type
- `sitemapPriority: 0.5`: Default sitemap priority
- `sitemapChangeFreq: 'weekly'`: Default change frequency

#### Step 2.2: Zustand Store Initialization

The provider syncs initial data to Zustand store (for persistence):

```typescript
useEffect(() => {
  const store = useArticleFormStore.getState();

  // Initialize store with empty data (new article)
  store.initializeForm({}, mode, articleId);

  // Set dropdown data
  store.setData({ clients, categories, authors });

  // Set submit handler
  store.setOnSubmit(onSubmit);
}, []); // Run once on mount
```

**Why Zustand? (Dual State Management Architecture)**

The article form uses **both React Context AND Zustand** for different purposes:

1. **React Context (`ArticleFormProvider`)**:
   - **Immediate UI updates**: Provides instant reactivity for form fields
   - **Component communication**: Allows nested components to access form state
   - **Auto-fill logic**: Handles real-time field dependencies (title → slug → SEO fields)
   - **Re-renders on every change**: Ensures UI stays in sync

2. **Zustand Store (`useArticleFormStore`)**:
   - **Persistence**: Can persist state across page refreshes/navigation (localStorage integration possible)
   - **Performance**: Avoids unnecessary re-renders (Context causes all consumers to re-render)
   - **Selective subscriptions**: Components can subscribe to only specific fields they need
   - **DevTools support**: Built-in Redux DevTools integration for debugging
   - **Cross-component access**: Can be accessed outside React component tree
   - **Simpler API**: Less boilerplate than Redux, more flexible than Context

**The Sync Pattern:**

```
User Input → React Context (immediate) → Debounced Sync → Zustand Store (persistence)
                ↓
         UI Updates (instant)
```

**Benefits of This Architecture:**

- **Best of Both Worlds**: Immediate UI updates (Context) + Performance & Persistence (Zustand)
- **Reduced Re-renders**: Zustand only re-renders components that subscribe to changed fields
- **Data Recovery**: If user refreshes page, Zustand can restore form state (if localStorage enabled)
- **Debugging**: Redux DevTools can track all state changes in Zustand store
- **Flexibility**: Components can use either Context (for form fields) or Zustand (for global state)

**Store State:**

- `formData`: Empty initial form data
- `mode: 'new'`: Creation mode
- `articleId: undefined`: No article ID yet
- `isDirty: false`: No changes yet
- `isSaving: false`: Not saving
- `errors: {}`: No errors

#### Step 2.3: Section Configuration

The provider creates section navigation:

```typescript
const sections: SectionConfig[] = [
  { id: 'basic', label: 'Basic Info', icon: FileText, href: '/articles/new/basic' },
  { id: 'content', label: 'Content', icon: Edit, href: '/articles/new/content' },
  { id: 'seo', label: 'SEO', icon: Search, href: '/articles/new/seo' },
  { id: 'media', label: 'Media', icon: Image, href: '/articles/new/media' },
  { id: 'tags', label: 'Tags & FAQs', icon: Tag, href: '/articles/new/tags' },
  {
    id: 'seo-validation',
    label: 'SEO & Validation',
    icon: CheckCircle,
    href: '/articles/new/seo-validation',
  },
];
```

**Note**: JSON-LD section is **only** added in edit mode (requires saved article).

---

### Phase 3: User Input & Auto-Fill Logic

#### Step 3.1: User Types Title

When user types in the title field:

```typescript
// In BasicSection component
<FormInput value={formData.title} onChange={(e) => updateField('title', e.target.value)} />;

// In ArticleFormProvider
const updateField = useCallback((field: keyof ArticleFormData, value: any) => {
  setFormData((prev) => {
    const updated = { ...prev, [field]: value };

    // AUTO-GENERATE SLUG from title (if slug is empty)
    if (field === 'title' && !prev.slug) {
      const newSlug = slugify(value);
      if (newSlug) {
        updated.slug = newSlug;
      }
    }
    return updated;
  });
  setIsDirty(true); // Mark form as dirty
  setErrors((prev) => {
    const next = { ...prev };
    delete next[field]; // Clear error for this field
    return next;
  });
}, []);
```

**Slug Generation Logic** (`admin/lib/utils.ts`):

```typescript
export function slugify(text: string): string {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/[^\u0600-\u06FF\w-]+/g, '') // Remove non-Arabic/non-word chars
    .replace(/-+/g, '-') // Multiple hyphens to single
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, ''); // Remove trailing hyphens
}
```

**Example:**

- Input: `"دليل شامل لتحسين محركات البحث"`
- Output: `"دليل-شامل-لتحسين-محركات-البحث"`

#### Step 3.2: Auto-Fill SEO Title

When title changes, SEO title auto-fills:

```typescript
useEffect(() => {
  if (formData.title && !formData.seoTitle) {
    const selectedClient = clients.find((c) => c.id === formData.clientId);
    const clientName = selectedClient?.name;
    const seoTitle = generateSEOTitle(formData.title, clientName);
    if (seoTitle) {
      setFormData((prev) => ({ ...prev, seoTitle }));
      setIsDirty(true);
    }
  }
}, [formData.title, formData.seoTitle, formData.clientId, clients]);
```

**SEO Title Generation** (`admin/app/(dashboard)/articles/helpers/seo-helpers.ts`):

```typescript
export function generateSEOTitle(title: string, clientName?: string): string {
  if (!title) return '';
  if (clientName) {
    return `${title} | ${clientName}`; // "Title | Client Name"
  }
  return title; // Just title if no client
}
```

**Example:**

- Title: `"دليل SEO شامل"`
- Client: `"مودونتي"`
- SEO Title: `"دليل SEO شامل | مودونتي"`

#### Step 3.3: Auto-Fill SEO Description

When excerpt changes, SEO description auto-fills:

```typescript
useEffect(() => {
  if (formData.excerpt && !formData.seoDescription) {
    const seoDescription = generateSEODescription(formData.excerpt);
    if (seoDescription) {
      setFormData((prev) => ({ ...prev, seoDescription }));
      setIsDirty(true);
    }
  }
}, [formData.excerpt, formData.seoDescription]);
```

**SEO Description Generation**:

```typescript
export function generateSEODescription(excerpt: string, maxLength: number = 155): string {
  if (!excerpt) return '';
  const stripped = excerpt.replace(/<[^>]*>/g, '').trim(); // Remove HTML
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength - 3) + '...'; // Truncate with ellipsis
}
```

**Example:**

- Excerpt: `"هذا دليل شامل لتحسين محركات البحث يحتوي على نصائح عملية وأمثلة واقعية"`
- SEO Description: `"هذا دليل شامل لتحسين محركات البحث يحتوي على نصائح عملية وأمثلة واقعية"` (if ≤155 chars)
- If longer: Truncated to 155 chars + `"..."`

#### Step 3.4: Auto-Fill Canonical URL

When slug changes, canonical URL auto-fills:

```typescript
useEffect(() => {
  if (formData.slug && !formData.canonicalUrl) {
    const selectedClient = clients.find((c) => c.id === formData.clientId);
    const clientSlug = selectedClient?.slug;
    const canonicalUrl = generateCanonicalUrl(formData.slug, undefined, clientSlug);
    if (canonicalUrl) {
      setFormData((prev) => ({ ...prev, canonicalUrl }));
      setIsDirty(true);
    }
  }
}, [formData.slug, formData.canonicalUrl, formData.clientId, clients]);
```

**Canonical URL Generation**:

```typescript
export function generateCanonicalUrl(slug: string, baseUrl?: string, clientSlug?: string): string {
  const siteUrl = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://modonty.com';
  if (clientSlug) {
    return `${siteUrl}/clients/${clientSlug}/articles/${slug}`;
  }
  return `${siteUrl}/articles/${slug}`;
}
```

**Example:**

- Slug: `"دليل-seo-شامل"`
- Client Slug: `"modonty"`
- Canonical URL: `"https://modonty.com/clients/modonty/articles/دليل-seo-شامل"`

#### Step 3.5: Auto-Fill OG Fields

OG fields auto-fill from SEO fields:

```typescript
// OG Title from SEO Title
useEffect(() => {
  if (formData.seoTitle && !formData.ogTitle) {
    setFormData((prev) => ({ ...prev, ogTitle: formData.seoTitle }));
    setIsDirty(true);
  }
}, [formData.seoTitle, formData.ogTitle]);

// OG Description from SEO Description
useEffect(() => {
  if (formData.seoDescription && !formData.ogDescription) {
    setFormData((prev) => ({ ...prev, ogDescription: formData.seoDescription }));
    setIsDirty(true);
  }
}, [formData.seoDescription, formData.ogDescription]);
```

#### Step 3.6: Auto-Fill Twitter Fields

Twitter fields auto-fill from OG fields:

```typescript
// Twitter Title from OG Title
useEffect(() => {
  if (formData.ogTitle && !formData.twitterTitle) {
    setFormData((prev) => ({ ...prev, twitterTitle: formData.ogTitle }));
    setIsDirty(true);
  }
}, [formData.ogTitle, formData.twitterTitle]);

// Twitter Description from OG Description
useEffect(() => {
  if (formData.ogDescription && !formData.twitterDescription) {
    setFormData((prev) => ({ ...prev, twitterDescription: formData.ogDescription }));
    setIsDirty(true);
  }
}, [formData.ogDescription, formData.twitterDescription]);
```

**Auto-Fill Chain:**

```
Title → Slug → SEO Title → OG Title → Twitter Title
Excerpt → SEO Description → OG Description → Twitter Description
Slug + Client → Canonical URL
```

#### Step 3.7: Form Data Synchronization

Form data syncs to Zustand store (debounced):

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    const store = useArticleFormStore.getState();
    const currentStore = store.formData;

    // Check if formData changed
    const hasChanges =
      currentStore.title !== formData.title ||
      currentStore.slug !== formData.slug ||
      currentStore.content !== formData.content ||
      // ... other fields

    if (hasChanges || store.isDirty !== isDirty) {
      store.syncFormData(formData, isDirty);  // Sync to store
    }
  }, 100); // Debounce 100ms

  return () => clearTimeout(timer);
}, [formData, isDirty]);
```

**Why Debounce?**

- Prevents excessive store updates during rapid typing
- Batches multiple field changes together
- Reduces re-renders and improves performance

---

### Phase 4: Save Operation

**File**: `admin/app/(dashboard)/articles/components/sticky-save-button.tsx`

#### Step 4.1: User Clicks Save

When user clicks the save button:

```typescript
const handleSave = async () => {
  setSaving(true);
  setSaved(false);
  try {
    const result = await save(); // Calls context.save()

    if (result.success) {
      setSaved(true);
      toast({
        title: 'تم الحفظ بنجاح',
        description: 'تم حفظ المقال بنجاح وهو في انتظار معاينة المدير',
      });

      if (mode === 'new') {
        router.push('/articles'); // Redirect to articles list
        router.refresh();
      }
    } else {
      toast({
        title: 'فشل الحفظ',
        description: result.error || 'حدث خطأ أثناء حفظ المقال',
        variant: 'destructive',
      });
    }
  } catch (error) {
    toast({
      title: 'فشل الحفظ',
      description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      variant: 'destructive',
    });
  } finally {
    setSaving(false);
  }
};
```

#### Step 4.2: Context Save Method

The context `save()` method calls the server action:

```typescript
const save = useCallback(async () => {
  setIsSaving(true);
  try {
    const result = await onSubmit(formData); // Calls createArticle(formData)

    if (result.success) {
      setIsDirty(false); // Mark as clean
      setErrors({}); // Clear errors
    } else {
      const errorObj: Record<string, string[]> = result.error ? { _general: [result.error] } : {};
      setErrors(errorObj);
    }
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save article';
    setErrors({ _general: [errorMessage] });
    return { success: false, error: errorMessage };
  } finally {
    setIsSaving(false);
  }
}, [formData, onSubmit]);
```

---

### Phase 5: Server Action - Database Insertion

**File**: `admin/app/(dashboard)/articles/actions/articles-actions.ts`

#### Step 5.1: Server Action Entry

```typescript
export async function createArticle(data: ArticleFormData) {
  try {
    // Step 1: Get Modonty author (singleton)
    const { getModontyAuthor } = await import("@/app/(dashboard)/authors/actions/authors-actions");
    const modontyAuthor = await getModontyAuthor();
    if (!modontyAuthor) {
      return {
        success: false,
        error: "Modonty author not found. Please ensure the author is set up.",
      };
    }
```

**Database Query:**

```sql
SELECT id, name FROM authors WHERE name = 'Modonty' LIMIT 1
```

#### Step 5.2: Fetch Related Data

```typescript
// Step 2: Fetch client data
const client = await db.client.findUnique({
  where: { id: data.clientId },
  select: { name: true, slug: true },
});

// Step 3: Fetch category data (if provided)
const category = data.categoryId
  ? await db.category.findUnique({
      where: { id: data.categoryId },
      select: { name: true, slug: true },
    })
  : null;
```

**Database Queries:**

```sql
-- Get client
SELECT name, slug FROM clients WHERE id = ?

-- Get category (if provided)
SELECT name, slug FROM categories WHERE id = ?
```

#### Step 5.3: Calculate Computed Fields

```typescript
// Step 4: Calculate word count, reading time, content depth
const wordCount = data.wordCount || calculateWordCount(data.content);
const readingTimeMinutes = data.readingTimeMinutes || calculateReadingTime(wordCount);
const contentDepth = data.contentDepth || determineContentDepth(wordCount);
```

**Calculation Functions:**

**Word Count**:

```typescript
export function calculateWordCount(content: string): number {
  if (!content) return 0;
  const stripped = content.replace(/<[^>]*>/g, ''); // Remove HTML
  const words = stripped.trim().split(/\s+/).filter(Boolean);
  return words.length;
}
```

**Reading Time**:

```typescript
export function calculateReadingTime(wordCount: number, wordsPerMinute: number = 200): number {
  return Math.ceil(wordCount / wordsPerMinute); // Round up
}
```

**Content Depth**:

```typescript
export function determineContentDepth(wordCount: number): 'short' | 'medium' | 'long' {
  if (wordCount < 500) return 'short';
  if (wordCount < 1500) return 'medium';
  return 'long';
}
```

**Example:**

- Content: 1200 words
- Word Count: `1200`
- Reading Time: `Math.ceil(1200 / 200) = 6` minutes
- Content Depth: `"medium"` (500 ≤ 1200 < 1500)

#### Step 5.4: Generate SEO Fields (Fallbacks)

```typescript
// Step 5: Generate SEO fields if not provided
const seoTitle = data.seoTitle || generateSEOTitle(data.title, client?.name);
const seoDescription = data.seoDescription || generateSEODescription(data.excerpt || '');
const canonicalUrl = data.canonicalUrl || generateCanonicalUrl(data.slug, undefined, client?.slug);
```

**Fallback Logic:**

- If `seoTitle` is empty → Generate from title + client name
- If `seoDescription` is empty → Generate from excerpt (truncated to 155 chars)
- If `canonicalUrl` is empty → Generate from slug + client slug

#### Step 5.5: Generate Breadcrumb Path

```typescript
// Step 6: Generate breadcrumb path
const breadcrumbPath = generateBreadcrumbPath(
  category?.name,
  category?.slug,
  data.title,
  data.slug,
);
```

**Breadcrumb Generation**:

```typescript
export function generateBreadcrumbPath(
  categoryName?: string,
  categorySlug?: string,
  articleTitle?: string,
  articleSlug?: string,
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ name: 'الرئيسية', url: '/' }];

  if (categoryName && categorySlug) {
    items.push({
      name: categoryName,
      url: `/categories/${categorySlug}`,
    });
  }

  if (articleTitle && articleSlug) {
    items.push({
      name: articleTitle,
      url: `/articles/${articleSlug}`,
    });
  }

  return items;
}
```

**Example:**

```json
[
  { "name": "الرئيسية", "url": "/" },
  { "name": "التسويق", "url": "/categories/التسويق" },
  { "name": "دليل SEO شامل", "url": "/articles/دليل-seo-شامل" }
]
```

#### Step 5.6: Set Status & Meta Robots

```typescript
// Step 7: Set date published (null for WRITING status)
const datePublished =
  data.datePublished || (data.status === ArticleStatus.PUBLISHED ? new Date() : null);

// Step 8: Set creative work status
const creativeWorkStatus =
  data.status === ArticleStatus.PUBLISHED
    ? 'published'
    : (data.status as string) === 'SCHEDULED'
    ? 'scheduled'
    : 'draft';

// Step 9: Set meta robots
const metaRobots =
  data.metaRobots ||
  (data.status === ArticleStatus.PUBLISHED ? 'index, follow' : 'noindex, follow');

// Step 10: Set sitemap priority
const sitemapPriority = data.sitemapPriority || (data.featured ? 0.8 : 0.5);

// Step 11: Validate status enum, then force WRITING for new articles
if (data.status && !Object.values(ArticleStatus).includes(data.status as ArticleStatus)) {
  return {
    success: false,
    error: 'Invalid status value. Status must be a valid ArticleStatus enum value.',
  };
}
const finalStatus = ArticleStatus.WRITING; // Always WRITING for new articles
```

**Status Logic:**

- **New articles**: Always `WRITING` (regardless of form data)
- **Date Published**: `null` for WRITING status
- **Creative Work Status**: `"draft"` for WRITING
- **Meta Robots**: `"noindex, follow"` for WRITING (not published yet)
- **Sitemap Priority**: `0.5` (default) or `0.8` if featured

#### Step 5.7: Insert Article into Database

```typescript
// Step 12: Create article in database
const article = await db.article.create({
  data: {
    // Basic content
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || null,
    content: data.content,
    contentFormat: data.contentFormat || 'rich_text',

    // Relationships
    clientId: data.clientId,
    categoryId: data.categoryId || null,
    authorId: modontyAuthor.id, // Always Modonty author

    // Status & workflow
    status: finalStatus, // WRITING
    scheduledAt: data.scheduledAt || null,
    featured: data.featured || false,
    featuredImageId: data.featuredImageId || null,
    datePublished, // null for WRITING

    // Computed fields
    wordCount,
    readingTimeMinutes,
    contentDepth,
    inLanguage: 'ar',
    isAccessibleForFree: true,
    license: data.license || null,
    lastReviewed: data.lastReviewed || null,
    creativeWorkStatus,
    mainEntityOfPage: canonicalUrl,

    // SEO Meta
    seoTitle: seoTitle || null,
    seoDescription: seoDescription || null,
    metaRobots,

    // Open Graph
    ogTitle: data.ogTitle || seoTitle || data.title,
    ogDescription: data.ogDescription || seoDescription || data.excerpt || null,
    ogUrl: data.ogUrl || canonicalUrl,
    ogSiteName: data.ogSiteName || 'مودونتي',
    ogLocale: data.ogLocale || 'ar_SA',
    ogType: data.ogType || 'article',
    ogArticleAuthor: data.ogArticleAuthor || null,
    ogArticlePublishedTime: datePublished,
    ogArticleModifiedTime: new Date(),
    ogUpdatedTime: null,
    ogArticleSection: data.ogArticleSection || category?.name || null,
    ogArticleTag: data.ogArticleTag || data.tags || [],

    // Twitter Cards
    twitterCard: data.twitterCard || 'summary_large_image',
    twitterTitle: data.twitterTitle || data.ogTitle || seoTitle || data.title,
    twitterDescription:
      data.twitterDescription || data.ogDescription || seoDescription || data.excerpt || null,
    twitterSite: data.twitterSite || null,
    twitterCreator: data.twitterCreator || null,
    twitterLabel1: data.twitterLabel1 || null,
    twitterData1: data.twitterData1 || null,

    // Technical SEO
    canonicalUrl,
    robotsMeta: metaRobots,
    sitemapPriority,
    sitemapChangeFreq: data.sitemapChangeFreq || 'weekly',
    alternateLanguages: data.alternateLanguages || [],
    breadcrumbPath: JSON.parse(JSON.stringify(breadcrumbPath)) as Prisma.InputJsonValue,
  },
});
```

**Database Insert:**

```sql
INSERT INTO articles (
  title, slug, excerpt, content, contentFormat,
  clientId, categoryId, authorId,
  status, scheduledAt, featured, featuredImageId, datePublished,
  wordCount, readingTimeMinutes, contentDepth, inLanguage, isAccessibleForFree, license, lastReviewed, creativeWorkStatus, mainEntityOfPage,
  seoTitle, seoDescription, metaRobots,
  ogTitle, ogDescription, ogUrl, ogSiteName, ogLocale, ogType, ogArticleAuthor, ogArticlePublishedTime, ogArticleModifiedTime, ogUpdatedTime, ogArticleSection, ogArticleTag,
  twitterCard, twitterTitle, twitterDescription, twitterSite, twitterCreator, twitterLabel1, twitterData1,
  canonicalUrl, robotsMeta, sitemapPriority, sitemapChangeFreq, alternateLanguages, breadcrumbPath,
  createdAt, updatedAt
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
```

#### Step 5.8: Insert Tags (Many-to-Many)

```typescript
// Step 13: Create article-tag relationships
if (data.tags && data.tags.length > 0) {
  for (const tagId of data.tags) {
    await db.articleTag.create({
      data: {
        articleId: article.id,
        tagId: tagId,
      },
    });
  }
}
```

**Database Inserts:**

```sql
-- For each tag
INSERT INTO article_tags (articleId, tagId) VALUES (?, ?)
```

**Example:**

- Article ID: `"507f1f77bcf86cd799439011"`
- Tags: `["tag1", "tag2", "tag3"]`
- Creates 3 `ArticleTag` records

#### Step 5.9: Insert FAQs

```typescript
// Step 14: Create FAQs
if (data.faqs && data.faqs.length > 0) {
  await db.fAQ.createMany({
    data: data.faqs.map((faq: FAQItem, index: number) => ({
      articleId: article.id,
      question: faq.question,
      answer: faq.answer,
      position: faq.position ?? index,
    })),
  });
}
```

**Database Insert:**

```sql
INSERT INTO faqs (articleId, question, answer, position, createdAt, updatedAt)
VALUES (?, ?, ?, ?, NOW(), NOW()), (?, ?, ?, ?, NOW(), NOW()), ...
```

**Example:**

- Article ID: `"507f1f77bcf86cd799439011"`
- FAQs: `[{ question: "ما هو SEO?", answer: "SEO هو...", position: 0 }]`
- Creates 1 `FAQ` record

#### Step 5.10: Revalidate Cache & Return

```typescript
    // Step 15: Revalidate Next.js cache
    revalidatePath("/articles");

    // Step 16: Return success
    return { success: true, article };
  } catch (error) {
    console.error("Error creating article:", error);
    const message = error instanceof Error ? error.message : "فشل في إنشاء المقال";
    return {
      success: false,
      error: message,
    };
  }
}
```

**Revalidation:**

- `revalidatePath("/articles")`: Invalidates Next.js cache for articles list
- Forces Next.js to regenerate `/articles` page on next request
- Ensures new article appears in list immediately

**Return Value:**

```typescript
{
  success: true,
  article: {
    id: "507f1f77bcf86cd799439011",
    title: "دليل SEO شامل",
    slug: "دليل-seo-شامل",
    // ... all article fields
  }
}
```

---

## SEO Validation Logic

### Overview

SEO validation happens in **two places**:

1. **Client-Side Preview** (real-time, in form)
2. **Server-Side Full Validation** (after save, complete page validation)

---

### Client-Side SEO Validation

**File**: `admin/app/(dashboard)/articles/components/sections/seo-validation-section.tsx`

#### Step 1: Generate Preview JSON-LD

When form data changes, a preview JSON-LD is generated:

```typescript
useEffect(() => {
  const loadJsonLd = async () => {
    // If editing existing article, fetch stored JSON-LD
    if (mode === 'edit' && articleId) {
      try {
        const { jsonLd: fetchedJsonLd } = await getArticleJsonLd(articleId);
        if (fetchedJsonLd) {
          setJsonLd(fetchedJsonLd);
          return;
        }
      } catch (error) {
        console.error('Failed to fetch JSON-LD:', error);
      }
    }

    // Generate preview JSON-LD from form data (client-side)
    if (formData.title && formData.content) {
      const previewJsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Article',
            '@id': `#article`,
            headline: formData.seoTitle || formData.title,
            description: formData.seoDescription || formData.excerpt,
            datePublished: formData.scheduledAt
              ? new Date(formData.scheduledAt).toISOString()
              : new Date().toISOString(),
            author: {
              '@type': 'Person',
              name: 'Modonty',
            },
            publisher: {
              '@type': 'Organization',
              name: formData.ogSiteName || 'مودونتي',
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': formData.canonicalUrl || '#webpage',
            },
          },
        ],
      };
      setJsonLd(previewJsonLd);
    }
  };

  loadJsonLd();
}, [formData, mode, articleId]);
```

**Preview JSON-LD Structure:**

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "#article",
      "headline": "دليل SEO شامل | مودونتي",
      "description": "هذا دليل شامل...",
      "datePublished": "2025-01-27T10:00:00.000Z",
      "author": {
        "@type": "Person",
        "name": "Modonty"
      },
      "publisher": {
        "@type": "Organization",
        "name": "مودونتي"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://modonty.com/articles/دليل-seo-شامل"
      }
    }
  ]
}
```

#### Step 2: Validate JSON-LD

When JSON-LD is generated, it's automatically validated:

```typescript
const handleValidate = async () => {
  if (!jsonLd) return;

  setIsValidating(true);
  try {
    const report = await validateJsonLdComplete(jsonLd, {
      requirePublisherLogo: true,
      requireHeroImage: true,
      requireAuthorBio: false,
      minHeadlineLength: 30,
      maxHeadlineLength: 110,
    });
    setValidationReport(report);
  } catch (error) {
    console.error('Validation failed:', error);
  } finally {
    setIsValidating(false);
  }
};

// Auto-validate when JSON-LD changes
useEffect(() => {
  if (jsonLd) {
    handleValidate();
  }
}, [jsonLd]);
```

**Validation Options:**

- `requirePublisherLogo: true`: Publisher logo required
- `requireHeroImage: true`: Hero/featured image required
- `requireAuthorBio: false`: Author bio optional
- `minHeadlineLength: 30`: Minimum headline length
- `maxHeadlineLength: 110`: Maximum headline length

#### Step 3: Validation Report Structure

**File**: `admin/lib/seo/jsonld-validator.ts`

```typescript
export interface ValidationReport {
  adobe: ValidationResult; // Adobe validator results
  custom?: {
    errors: string[]; // Business rule errors
    warnings: string[]; // Business rule warnings
    info: string[]; // Info messages
  };
  richResults?: {
    eligible: boolean; // Eligible for rich results
    types: string[]; // Rich result types
    lastChecked?: string; // Last check timestamp
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  timestamp: string;
}
```

**Validation Process:**

1. **Adobe Validator** (Schema.org validation):

   ```typescript
   export async function validateJsonLd(jsonLd: object): Promise<ValidationResult> {
     const schemaOrg = await getSchemaOrgDefinition(); // Fetch schema.org definition
     const validator = new Validator(schemaOrg);
     const result = await validator.validate(jsonLd);

     // Process errors and warnings
     return {
       valid: errors.length === 0,
       errors,
       warnings,
       timestamp: new Date().toISOString(),
     };
   }
   ```

2. **Business Rules Validation** (Custom rules):

   ```typescript
   export async function validateBusinessRules(
     jsonLd: object,
     options?: {
       requirePublisherLogo?: boolean;
       requireHeroImage?: boolean;
       requireAuthorBio?: boolean;
       minHeadlineLength?: number;
       maxHeadlineLength?: number;
     },
   ): Promise<BusinessValidationResult> {
     const errors: string[] = [];
     const warnings: string[] = [];
     const info: string[] = [];

     // Check headline length
     const headline = articleNode.headline as string | undefined;
     if (headline) {
       if (headline.length < opts.minHeadlineLength) {
         errors.push(`Headline too short (${headline.length} < ${opts.minHeadlineLength})`);
       }
       if (headline.length > opts.maxHeadlineLength) {
         warnings.push(`Headline too long (${headline.length} > ${opts.maxHeadlineLength})`);
       }
     }

     // Check publisher logo
     if (opts.requirePublisherLogo) {
       // Validate publisher has logo
     }

     // Check hero image
     if (opts.requireHeroImage) {
       // Validate article has featured image
     }

     return { errors, warnings, info };
   }
   ```

3. **Complete Validation**:
   ```typescript
   export async function validateJsonLdComplete(
     jsonLd: object,
     options?: ValidationOptions,
   ): Promise<ValidationReport> {
     // Run Adobe validator
     const adobeResult = await validateJsonLd(jsonLd);

     // Run business rules
     const customResult = await validateBusinessRules(jsonLd, options);

     return {
       adobe: adobeResult,
       custom: customResult,
     };
   }
   ```

---

### Server-Side Full Page Validation

**File**: `admin/lib/seo/page-validator.ts`

After article is saved, full page validation can be run:

```typescript
export async function validateFullPage(
  pageType: PageType,
  identifier: string,
  options?: ValidationOptions,
): Promise<FullPageValidationResult> {
  // Step 1: Render page to HTML
  const html = await renderPageToHTML(pageType, identifier, { baseUrl });

  // Step 2: Extract structured data from HTML
  const extracted = await extractStructuredData(html);

  // Step 3: Validate structured data
  const structuredDataValidation = await validateExtractedData(extracted);

  // Step 4: Analyze SEO elements
  const seoAnalysis = await analyzePageSEO(html, url);

  // Step 5: Generate validation issues
  const issues = generateValidationIssues(
    structuredDataValidation,
    seoAnalysis,
    extracted,
    options,
  );

  // Step 6: Calculate overall score
  const overallScore = Math.round(schemaScore * 0.6 + seoAnalysis.score * 0.4);

  // Step 7: Determine if publishable
  const canPublish =
    structuredDataValidation.adobe.errors.length === 0 &&
    structuredDataValidation.custom?.errors.length === 0 &&
    issues.critical.length === 0;

  return {
    url,
    pageType,
    rendered: true,
    structuredData: {
      extracted,
      validation: structuredDataValidation,
      schemaErrors: structuredDataValidation.adobe.errors.length,
      schemaWarnings: structuredDataValidation.adobe.warnings.length,
    },
    seo: seoAnalysis,
    timestamp: new Date().toISOString(),
    overallScore,
    canPublish,
    issues,
  };
}
```

**Validation Steps:**

1. **Render Page**: Generate HTML from Next.js page
2. **Extract Structured Data**: Find JSON-LD, Microdata, RDFa in HTML
3. **Validate Structured Data**: Run Adobe validator + business rules
4. **Analyze SEO**: Check meta tags, headings, images, links
5. **Generate Issues**: Combine all errors/warnings/suggestions
6. **Calculate Score**: Weighted score (60% schema, 40% SEO)
7. **Publish Decision**: `canPublish = true` if no critical errors

---

## Database Schema

### Article Model

**File**: `dataLayer/prisma/schema/schema.prisma`

```prisma
model Article {
  id String @id @default(auto()) @map("_id") @db.ObjectId

  // ============================================
  // BASIC CONTENT
  // ============================================
  title         String // Schema.org Article headline
  slug          String
  excerpt       String?
  content       String // Article body (markdown/HTML)
  contentFormat String  @default("markdown") // markdown, html, rich_text

  // ============================================
  // RELATIONSHIPS
  // ============================================
  clientId   String    @db.ObjectId
  client     Client    @relation(fields: [clientId], references: [id])
  categoryId String?   @db.ObjectId
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  authorId   String    @db.ObjectId
  author     Author    @relation(fields: [authorId], references: [id])

  // ============================================
  // STATUS & WORKFLOW
  // ============================================
  status      ArticleStatus @default(WRITING)
  scheduledAt DateTime?
  featured    Boolean       @default(false)

  // ============================================
  // SCHEMA.ORG ARTICLE - REQUIRED FIELDS
  // ============================================
  datePublished    DateTime? // ISO 8601
  dateModified     DateTime  @updatedAt
  lastReviewed     DateTime? // Content freshness signal
  mainEntityOfPage String? // Canonical URL

  // ============================================
  // SCHEMA.ORG ARTICLE - EXTENDED FIELDS
  // ============================================
  wordCount           Int? // Auto-calculated content depth
  readingTimeMinutes  Int? // Auto-calculated (~200-250 words/min)
  contentDepth        String? // short, medium, long
  inLanguage          String  @default("ar") // For hreflang
  isAccessibleForFree Boolean @default(true)
  license             String?
  creativeWorkStatus  String? // published, draft, etc.

  // ============================================
  // META TAGS
  // ============================================
  seoTitle       String?
  seoDescription String? // 155-160 chars optimal
  metaRobots     String? // index, noindex, follow, nofollow

  // ============================================
  // OPEN GRAPH (COMPLETE)
  // ============================================
  ogTitle                String?
  ogDescription          String?
  ogType                 String?   @default("article")
  ogUrl                  String?
  ogSiteName             String?
  ogLocale               String?
  ogUpdatedTime          DateTime?
  ogArticleAuthor        String?
  ogArticlePublishedTime DateTime?
  ogArticleModifiedTime  DateTime?
  ogArticleSection       String?
  ogArticleTag           String[]

  // ============================================
  // TWITTER CARDS (COMPLETE)
  // ============================================
  twitterCard        String? // summary_large_image, summary
  twitterTitle       String?
  twitterDescription String?
  twitterSite        String?
  twitterCreator     String? // Author handle
  twitterLabel1      String?
  twitterData1       String?

  // ============================================
  // TECHNICAL SEO
  // ============================================
  canonicalUrl       String?
  alternateLanguages Json? // Array of {hreflang, url} objects
  robotsMeta         String? // Combined robots directive
  sitemapPriority    Float?  @default(0.5) // 0.0 to 1.0
  sitemapChangeFreq  String? @default("weekly") // always, hourly, daily, weekly, monthly, yearly, never

  // ============================================
  // BREADCRUMB SUPPORT
  // ============================================
  breadcrumbPath Json? // Array for BreadcrumbList schema

  // ============================================
  // FEATURED MEDIA
  // ============================================
  featuredImageId String? @db.ObjectId
  featuredImage   Media?  @relation("ArticleFeaturedImage", fields: [featuredImageId], references: [id], onDelete: NoAction, onUpdate: NoAction)

  // ============================================
  // JSON-LD KNOWLEDGE GRAPH (PHASE 1)
  // ============================================
  jsonLdStructuredData   String?   @db.String // Cached @graph JSON string (source of truth)
  jsonLdLastGenerated    DateTime? // When JSON-LD was last generated
  jsonLdValidationReport Json? // {adobe: {valid, errors, warnings}, custom: {...}, richResults: {...}}

  // Content for structured data
  articleBodyText String? // Plain text extracted from content (for schema.org articleBody)

  // Optional semantic enhancement (for AI crawlers)
  semanticKeywords Json? // Array of {name, wikidataId?, url?} for entity disambiguation

  // E-E-A-T enhancement
  citations String[] // External authoritative source URLs (isBasedOn/citation)

  // Schema versioning (safe rollback)
  jsonLdVersion     Int      @default(1) // Increment on major changes
  jsonLdHistory     Json? // Array of previous versions [{version, data, timestamp}]
  jsonLdDiffSummary String? // Human-readable change log

  // Performance tracking
  jsonLdGenerationTimeMs Int? // Time to generate JSON-LD in milliseconds
  performanceBudgetMet   Boolean @default(true) // Performance budget compliance

  // ============================================
  // TIMESTAMPS
  // ============================================
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // ============================================
  // RELATIONSHIPS
  // ============================================
  tags        ArticleTag[]
  versions    ArticleVersion[]
  analytics   Analytics[]
  relatedFrom RelatedArticle[] @relation("ArticleRelatedFrom")
  relatedTo   RelatedArticle[] @relation("ArticleRelatedTo")
  faqs        FAQ[]
  gallery     ArticleMedia[] // Image gallery for article

  // ============================================
  // INDEXES
  // ============================================
  @@unique([clientId, slug]) // Slug unique per client
  @@index([clientId, status, datePublished])
  @@index([status, datePublished])
  @@index([categoryId, status, datePublished])
  @@index([authorId, status, datePublished])
  @@index([dateModified])
  @@index([datePublished])
  @@map("articles")
}
```

**Key Constraints:**

- `@@unique([clientId, slug])`: Slug must be unique per client (not globally)
- Multiple indexes for efficient queries by status, date, category, author

---

## Related Tables

### ArticleTag (Many-to-Many)

```prisma
model ArticleTag {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  articleId String  @db.ObjectId
  tagId     String  @db.ObjectId
  article   Article @relation(fields: [articleId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: NoAction, onUpdate: NoAction)

  @@unique([articleId, tagId])  // Prevent duplicate tag assignments
  @@index([articleId])
  @@index([tagId])
  @@map("article_tags")
}
```

**Purpose**: Links articles to tags (many-to-many relationship)

**Example Data:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "articleId": "507f1f77bcf86cd799439012",
  "tagId": "507f1f77bcf86cd799439013"
}
```

---

### FAQ

```prisma
model FAQ {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  articleId String  @db.ObjectId
  article   Article @relation(fields: [articleId], references: [id], onDelete: NoAction, onUpdate: NoAction)

  question String // Schema.org Question
  answer   String // Schema.org Answer
  position Int // Order in FAQ list

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([articleId, position])
  @@map("faqs")
}
```

**Purpose**: Stores FAQ items for articles (Schema.org FAQPage support)

**Example Data:**

```json
{
  "id": "507f1f77bcf86cd799439014",
  "articleId": "507f1f77bcf86cd799439012",
  "question": "ما هو SEO?",
  "answer": "SEO هو تحسين محركات البحث...",
  "position": 0
}
```

---

### ArticleMedia (Gallery)

```prisma
model ArticleMedia {
  id        String @id @default(auto()) @map("_id") @db.ObjectId
  articleId String @db.ObjectId
  mediaId   String @db.ObjectId

  // Gallery metadata
  position Int     @default(0) // Display order in gallery (drag & drop)
  caption  String? // Per-article caption override (differs from Media.caption)
  altText  String? // Per-article alt text override (for SEO customization)

  // Relationships
  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  media   Media   @relation(fields: [mediaId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([articleId, mediaId])  // Prevent duplicate media in gallery
  @@index([articleId, position])
  @@index([mediaId])
  @@map("article_media")
}
```

**Purpose**: Links articles to media files (image gallery)

**Example Data:**

```json
{
  "id": "507f1f77bcf86cd799439015",
  "articleId": "507f1f77bcf86cd799439012",
  "mediaId": "507f1f77bcf86cd799439016",
  "position": 0,
  "caption": "صورة توضيحية للSEO",
  "altText": "دليل SEO شامل"
}
```

---

### ArticleVersion (Audit Trail)

```prisma
model ArticleVersion {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  articleId String  @db.ObjectId
  article   Article @relation(fields: [articleId], references: [id], onDelete: NoAction, onUpdate: NoAction)

  // Snapshot of article data
  title          String
  content        String
  excerpt        String?
  seoTitle       String?
  seoDescription String?

  // Audit trail
  createdBy String?  @db.ObjectId // User ID
  createdAt DateTime @default(now())

  @@index([articleId, createdAt])
  @@map("article_versions")
}
```

**Purpose**: Stores version history of articles (audit trail)

**Example Data:**

```json
{
  "id": "507f1f77bcf86cd799439017",
  "articleId": "507f1f77bcf86cd799439012",
  "title": "دليل SEO شامل (نسخة قديمة)",
  "content": "المحتوى القديم...",
  "createdBy": "507f1f77bcf86cd799439018",
  "createdAt": "2025-01-27T09:00:00.000Z"
}
```

---

### RelatedArticle

```prisma
model RelatedArticle {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  articleId String  @db.ObjectId
  relatedId String  @db.ObjectId
  article   Article @relation("ArticleRelatedFrom", fields: [articleId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  related   Article @relation("ArticleRelatedTo", fields: [relatedId], references: [id], onDelete: NoAction, onUpdate: NoAction)

  relationshipType String? @default("related") // related, similar, recommended
  weight           Float?  @default(1.0) // Relationship strength

  createdAt DateTime @default(now())

  @@unique([articleId, relatedId])  // Prevent duplicate relationships
  @@index([articleId])
  @@index([relatedId])
  @@map("related_articles")
}
```

**Purpose**: Links related articles (internal linking for SEO)

**Example Data:**

```json
{
  "id": "507f1f77bcf86cd799439019",
  "articleId": "507f1f77bcf86cd799439012",
  "relatedId": "507f1f77bcf86cd799439020",
  "relationshipType": "related",
  "weight": 1.0
}
```

---

### Analytics

```prisma
model Analytics {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  articleId String  @db.ObjectId
  article   Article @relation(fields: [articleId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  clientId  String? @db.ObjectId

  // User/Session tracking
  sessionId String? // Browser session ID (cookie-based)
  userId    String? @db.ObjectId // User ID if logged in

  // Core Web Vitals (2025 Standard) - per view
  lcp  Float? // Largest Contentful Paint (target < 2.5s)
  cls  Float? // Cumulative Layout Shift (target < 0.1)
  inp  Float? // Interaction to Next Paint (target < 200ms)
  fid  Float? // First Input Delay (legacy, target < 100ms)
  ttfb Float? // Time to First Byte (target < 800ms)
  tbt  Float? // Total Blocking Time (target < 200ms)

  // Engagement metrics - per view
  timeOnPage       Float? // Seconds spent on page
  scrollDepth      Float? // Percentage scrolled (0-100)
  bounced          Boolean @default(false)
  clickThroughRate Float?

  // Traffic sources - per view
  source         TrafficSource @default(ORGANIC)
  searchEngine   String?
  referrerDomain String?
  userAgent      String?
  ipAddress      String?

  timestamp DateTime @default(now())

  @@index([articleId, timestamp])
  @@index([clientId, timestamp])
  @@index([timestamp])
  @@index([sessionId])
  @@index([userId])
  @@map("analytics")
}
```

**Purpose**: Tracks article performance metrics (Core Web Vitals, engagement, traffic sources)

**Example Data:**

```json
{
  "id": "507f1f77bcf86cd799439021",
  "articleId": "507f1f77bcf86cd799439012",
  "clientId": "507f1f77bcf86cd799439022",
  "sessionId": "session-123",
  "lcp": 1.8,
  "cls": 0.05,
  "inp": 150,
  "timeOnPage": 120,
  "scrollDepth": 85,
  "bounced": false,
  "source": "ORGANIC",
  "searchEngine": "Google",
  "timestamp": "2025-01-27T10:00:00.000Z"
}
```

---

## Summary

### Complete Flow Summary

1. **Page Load**: Server fetches clients, categories, authors, tags in parallel
2. **Form Init**: Client initializes form state with defaults (`WRITING` status)
3. **User Input**: User fills form fields
4. **Auto-Fill**: Slug, SEO fields, OG fields, Twitter fields auto-generate
5. **State Sync**: Form data syncs to Zustand store (debounced)
6. **Save Click**: User clicks save button
7. **Server Action**: `createArticle()` validates, transforms, and inserts data
8. **Database**: Article, tags, FAQs inserted into MongoDB
9. **Cache**: Next.js cache revalidated
10. **Redirect**: User redirected to articles list

### Key Points

- **Status**: Always `WRITING` for new articles (workflow state)
- **Author**: Always Modonty author (singleton pattern)
- **Slug**: Auto-generated from title, unique per client
- **SEO Fields**: Auto-generated with fallbacks
- **Computed Fields**: Word count, reading time, content depth calculated
- **Relations**: Tags and FAQs inserted separately (many-to-many)
- **Validation**: Client-side preview + server-side full validation

---

**Last Updated**: 2025-01-27
**Status**: Complete Documentation
