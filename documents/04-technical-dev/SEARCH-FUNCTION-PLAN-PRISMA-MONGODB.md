# Search Function Plan – Production-Ready

**Approved**: Prisma `contains` (title + excerpt only, no content)
**Status**: ✅ Rechecked with UI/UX standards
**Performance**: Core functionality – Apply button searches on click/Enter

## Compliance Checklist

- ✅ Performance (core)
- ✅ WCAG 2.1 AA compliance
- ✅ RTL & Arabic copy
- ✅ Semantic HTML & ARIA
- ✅ Loading & empty states
- ✅ Error handling
- ✅ Touch targets (44×44px min)
- ✅ Focus management
- ✅ Reduced motion
- ✅ URL as source of truth
- ✅ Progressive enhancement

## Backend Implementation

### 1. ArticleFilters + getArticlesCached

**File**: `modonty/app/api/helpers/types.ts` - add `search?: string` to `ArticleFilters`

**File**: `modonty/app/api/helpers/article-queries.ts` - add search filter:

```ts
...(search?.trim() && {
  AND: [
    {
      OR: [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { excerpt: { contains: search.trim(), mode: "insensitive" } },
      ],
    },
  ],
}),
```

**Notes**:
- Trim and validate: ignore empty/whitespace search
- Search ANDed with status + datePublished
- Only published articles returned
- MongoDB: `mode: "insensitive"` supported

### 2. Performance

- **Cache**: getArticlesCached uses `"use cache"`, `cacheTag("articles")`, `cacheLife("minutes")`
- **Limit**: Enforce `limit: 20` for search (no pagination v1)
- **Select**: Only title + excerpt in `contains` (no full-text on content)
- **Index**: Existing `@@index([status, datePublished])` helps; optional MongoDB text index on title+excerpt for scale

## Search Page Implementation

### Route & Metadata

**Path**: `modonty/app/search/page.tsx`

**generateMetadata**:
```tsx
{
  title: q ? `بحث: ${q} - مودونتي` : 'بحث - مودونتي',
  description: '...'
}
```

**Breadcrumb**:
```
[{ label: "الرئيسية", href: "/", icon: BreadcrumbHome }, { label: "بحث" }]
```

### Layout

- Container: `mx-auto max-w-[1128px] px-4 py-8`
- No sidebars
- Breadcrumb → SearchInput → Results/Empty/NoQuery

### Data Flow

1. Read `searchParams.q` (Server Component)
2. Call `getArticles({ search: q?.trim(), limit: 20 })`
3. Map to `ArticleResponse` shape for cards
4. Pass to results section

### Loading UI

**Path**: `modonty/app/search/loading.tsx`

- Search input placeholder (h-12, rounded)
- 4–6 `PostCardSkeleton` (matches home page mapping)
- Same layout as search page

### Data Mapping (ArticleResponse → Post)

Reuse home page mapping from `modonty/app/page.tsx`:

```ts
const posts = articles.map((article) => ({
  id: article.id,
  title: article.title,
  content: article.excerpt || "",
  excerpt: article.excerpt ?? undefined,
  image: article.image,
  slug: article.slug,
  publishedAt: new Date(article.publishedAt),
  clientName: article.client.name,
  clientSlug: article.client.slug,
  clientLogo: article.client.logo,
  readingTimeMinutes: article.readingTimeMinutes,
  author: {
    id: article.author.id,
    name: article.author.name || "Modonty",
    title: "",
    company: article.client.name,
    avatar: article.author.image || ""
  },
  likes: article.interactions.likes,
  dislikes: article.interactions.dislikes,
  comments: article.interactions.comments,
  favorites: article.interactions.favorites,
  // ... remaining fields
}))
```

## UI Components

### SearchInput

- Controlled input with onChange (no debounce)
- Form with onSubmit trigger
- Clear button
- Submit button (disabled when empty)

### Results Section

**States**:
- `No Query`: Message "ابدأ البحث عن مقالات"
- `Loading`: Skeleton cards
- `Empty`: "لم نجد مقالات تطابق البحث"
- `Results`: Post cards in grid

### No Query State (Initial)

Show message:
```tsx
<div className="text-center py-12">
  <p className="text-gray-600">ابدأ البحث عن مقالات</p>
</div>
```
