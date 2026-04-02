# Arabic News APIs Integration Guide

## Overview

How Arabic news APIs can enhance MODONTY app's article seeding and future content management.

## Recommended API: NewsAPI.org

**Primary Choice:**
- ✅ Best documentation (https://newsapi.org/docs)
- ✅ Most reliable with active community
- ✅ Strong Arabic support (`language=ar`)
- ✅ Flexible & scalable (100 req/day free)
- ✅ Rich metadata (images, authors, dates, sources)

**Get started**: https://newsapi.org/register

**Secondary**: Mediastack for MENA region-specific content

---

## Current Seeding Flow

### Current Approach

- **Primary**: OpenAI API for article generation (Arabic SEO-focused)
- **Fallback**: Hardcoded Arabic article templates
- **Content**: AI-generated or template-based

### Limitations

1. Limited real-world context
2. No citations from Arabic sources
3. Content lacks authenticity
4. No connection to trending topics

---

## How News APIs Enhance Seeding

### 1. Real-World Article Titles (Phase 1)

**Current**: `generateArticleTitlesWithOpenAI()` or hardcoded templates

**Enhancement**:
```typescript
const newsArticles = await fetchFromNewsAPI({
  language: "ar",
  category: "technology",
  sortBy: "popularity",
  pageSize: articleCount
});

const adaptedTitles = newsArticles.map(article =>
  adaptTitleToSEO(article.title)
);
```

**Benefits**:
- Real, trending titles
- Natural Arabic language patterns
- Current topics readers search for
- More authentic content base

**Location**: `admin/app/(dashboard)/settings/seed/actions/seed-core.ts` - `seedArticles()` (~line 1255)

---

### 2. Authentic Article Content (Phase 2)

**Current**: `generateArticleWithOpenAI()` or template-based

**Enhancement**:
```typescript
const referenceArticle = await fetchFromNewsAPI({
  query: title,
  language: "ar"
});

const seoContent = adaptNewsArticleToSEO(referenceArticle);
```

**Benefits**:
- Real-world article structure
- Authentic writing style
- Current information & statistics
- Better readability

**Location**: `admin/app/(dashboard)/settings/seed/actions/seed-core.ts` - `seedArticles()` (~line 1415-1440)

---

### 3. Real Citations & Sources (Phase 3)

**Current**: Hardcoded citations like `"https://developers.google.com/search/docs"`

**Enhancement**:
```typescript
const citations = article.sources.map(source => source.url);

article.citations = [
  ...citations,
  "https://developers.google.com/search/docs"
];
```

**Benefits**:
- Real authoritative sources (Al Jazeera, BBC Arabic, etc.)
- Better E-E-A-T signals (trustworthiness)
- Improved SEO credibility

---

## API Comparison

| Feature | NewsAPI | Mediastack | Newsdata |
|---------|---------|-----------|----------|
| **Arabic Support** | ✅ Good | ✅✅ MENA Focus | ✅ Good |
| **Free Tier** | 100/day | 500/month | 200/day |
| **Documentation** | ✅✅ Excellent | ✅ Good | ✅ Good |
| **Reliability** | ✅✅ High | ✅ High | ✅ High |
| **Metadata** | ✅ Rich | ✅ Rich | ✅ Rich |

---

## Implementation Steps

### Step 1: Get API Key

```bash
# NewsAPI.org
1. Go to https://newsapi.org/register
2. Sign up (free account)
3. Copy API key
4. Add to .env:
NEWSAPI_KEY=your-api-key-here
```

### Step 2: Install HTTP Client

```bash
npm install axios
# or use native Fetch API
```

### Step 3: Create News Fetcher Helper

```typescript
// admin/lib/news-api.ts
import axios from "axios";

export async function fetchArabicNews(query: string, limit = 10) {
  const response = await axios.get("https://newsapi.org/v2/everything", {
    params: {
      q: query,
      language: "ar",
      sortBy: "popularity",
      pageSize: limit,
      apiKey: process.env.NEWSAPI_KEY
    }
  });

  return response.data.articles;
}
```

### Step 4: Integrate into Seeding

**Location**: `admin/app/(dashboard)/settings/seed/actions/seed-core.ts`

```typescript
// Instead of:
const title = generateTitleWithOpenAI(topic);

// Use:
const newsArticles = await fetchArabicNews(topic);
const title = newsArticles[0]?.title || generateTitleWithOpenAI(topic);
```

### Step 5: Store Original Source

```typescript
const article = {
  title: newsTitle,
  content: seoAdaptedContent,
  citations: [newsArticle.url, ...otherSources],
  source: newsArticle.source.name, // Original source
  datePublished: newsArticle.publishedAt
};
```

---

## Best Practices

1. **Fallback to OpenAI**: If no news API results, use existing OpenAI generation
2. **Attribution**: Always credit original source
3. **Rate Limiting**: Respect API quotas; cache results when possible
4. **SEO Adaptation**: Don't copy verbatim; adapt for SEO best practices
5. **Content Freshness**: Use `sortBy=publishedAt` for recent articles
6. **Error Handling**: Gracefully handle API failures

---

## Future Enhancements

1. **Phase 1**: Replace title generation with real trending titles
2. **Phase 2**: Use real articles as content base (adapted for SEO)
3. **Phase 3**: Extract real citations from Arabic news sources
4. **Phase 4**: Add live news feed feature to Modonty app
5. **Phase 5**: Create "Trending Topics" section based on real news

---

## References

- [NewsAPI.org Docs](https://newsapi.org/docs)
- [Mediastack API](https://mediastack.com/)
- [Newsdata.io](https://newsdata.io/)
