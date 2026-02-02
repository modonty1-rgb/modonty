# Arabic News APIs Integration Guide

## Overview

This document outlines how Arabic news APIs can enhance the MODONTY app's article seeding process and future content management features.

## 🏆 Recommended API: NewsAPI.org

**After reviewing official documentation, NewsAPI.org is the recommended primary choice** for the following reasons:

- ✅ **Best Documentation**: Clear, comprehensive official docs (https://newsapi.org/docs)
- ✅ **Proven Reliability**: Most popular news API with active community
- ✅ **Strong Arabic Support**: Dedicated `language=ar` parameter with good coverage
- ✅ **Flexible & Scalable**: Handles both seeding (100 req/day free) and live features
- ✅ **Rich Metadata**: Images, authors, dates, sources all included

**Quick Start**: Get free API key at https://newsapi.org/register

**Secondary Recommendation**: Mediastack for MENA region-specific content (backup/complement)

See detailed comparison below for all APIs.

---

## Current Seeding Flow

### Current Approach:
- **Primary**: OpenAI API for generating article titles and content (Arabic SEO-focused)
- **Fallback**: Hardcoded Arabic article title templates
- **Content**: AI-generated or template-based content for SEO articles

### Limitations:
1. Limited real-world context in generated content
2. No actual citations from reputable Arabic sources
3. Content may lack authenticity and real-world relevance
4. No connection to trending topics or current events

---

## How News APIs Can Enhance Seeding

### 1. **Real-World Article Titles** (Phase 1 Enhancement)

**Current**: `generateArticleTitlesWithOpenAI()` or hardcoded templates

**Enhancement with News APIs**:
```typescript
// Fetch trending Arabic SEO/news titles
const newsArticles = await fetchFromNewsAPI({
  language: "ar",
  category: "technology",
  sortBy: "popularity",
  pageSize: articleCount
});

// Extract and adapt titles for SEO articles
const adaptedTitles = newsArticles.map(article => 
  adaptTitleToSEO(article.title)
);
```

**Benefits**:
- Real, trending article titles
- Natural Arabic language patterns
- Current topics that readers actually search for
- More authentic content base

**Implementation Location**: 
- `admin/app/(dashboard)/settings/seed/actions/seed-core.ts`
- Function: `seedArticles()` (line ~1255)

---

### 2. **Authentic Article Content** (Phase 2 Enhancement)

**Current**: `generateArticleWithOpenAI()` or template-based content

**Enhancement with News APIs**:
```typescript
// Use real articles as reference/content base
const referenceArticle = await fetchFromNewsAPI({
  query: title,
  language: "ar"
});

// Adapt and enrich for SEO purposes
const seoContent = adaptNewsArticleToSEO(referenceArticle);
```

**Benefits**:
- Real-world article structure
- Authentic writing style
- Current information and statistics
- Better readability

**Implementation Location**:
- `admin/app/(dashboard)/settings/seed/actions/seed-core.ts`
- Function: `seedArticles()` (line ~1415-1440)

---

### 3. **Real Citations & Sources** (Phase 3 Enhancement)

**Current**: Hardcoded citations like `"https://developers.google.com/search/docs"`

**Enhancement with News APIs**:
```typescript
// Extract actual source URLs from news articles
const citations = article.sources.map(source => source.url);

// Store in article.citations array
article.citations = [
  ...citations,
  "https://developers.google.com/search/docs" // Keep existing
];
```

**Benefits**:
- Real authoritative sources (Al Jazeera, BBC Arabic, etc.)
- Better E-E-A-T signals (Trustworthiness)
- Actual citations that readers can verify
- Improved credibility for SEO

**Implementation Location**:
- `admin/app/(dashboard)/settings/seed/actions/seed-core.ts`
- Function: `seedArticles()` (line ~1505-1509)

---

### 4. **Rich Article Excerpts** (Phase 4 Enhancement)

**Current**: AI-generated or template-based excerpts

**Enhancement with News APIs**:
```typescript
// Use actual article descriptions/descriptions
const excerpt = newsArticle.description || 
  extractFirstParagraph(newsArticle.content);
```

**Benefits**:
- More compelling excerpts
- Better meta descriptions for SEO
- Higher click-through rates
- Natural language summaries

---

## Future Features Beyond Seeding

### 1. **Real-Time Content Curation**

**Use Case**: Automatically fetch and curate trending Arabic SEO/news articles

**Implementation**:
```typescript
// Scheduled job: Fetch trending articles daily
async function fetchTrendingArticles() {
  const trending = await newsAPI.getEverything({
    language: "ar",
    sortBy: "popularity",
    from: getYesterday(),
    to: getToday()
  });
  
  // Analyze and suggest articles for clients
  await suggestArticlesToClients(trending);
}
```

**Benefits**:
- Keep content library fresh
- Help clients stay on top of trends
- Automatic content suggestions

---

### 2. **Content Enrichment** (Post-Seed)

**Use Case**: Enrich existing articles with real-world context

**Implementation**:
```typescript
async function enrichArticle(articleId: string) {
  const article = await getArticle(articleId);
  
  // Find related news articles
  const relatedNews = await searchNewsAPI({
    query: article.title,
    language: "ar"
  });
  
  // Add related articles as citations
  await updateArticleCitations(articleId, relatedNews);
  
  // Update articleBodyText with real examples
  await enhanceArticleContent(articleId, relatedNews);
}
```

**Benefits**:
- Improve existing articles
- Add real-world examples
- Update citations with current sources
- Maintain content freshness

---

### 3. **Trend Analysis Dashboard**

**Use Case**: Analyze trending topics to inform content strategy

**Implementation**:
```typescript
async function analyzeTrendingTopics() {
  // Fetch articles from multiple sources
  const newsAPI = await fetchNewsAPI({ language: "ar" });
  const gNews = await fetchGNews({ language: "ar" });
  const mediastack = await fetchMediastack({ language: "ar" });
  
  // Aggregate and analyze
  const trendingTopics = aggregateTopics([newsAPI, gNews, mediastack]);
  
  // Generate insights
  return {
    topTopics: trendingTopics.top(10),
    emergingKeywords: extractKeywords(trendingTopics),
    suggestedArticles: generateSuggestions(trendingTopics)
  };
}
```

**Benefits**:
- Identify content gaps
- Discover trending keywords
- Inform SEO strategy
- Competitive intelligence

---

### 4. **Automated Content Updates**

**Use Case**: Keep articles up-to-date with latest information

**Implementation**:
```typescript
async function updateStaleArticles() {
  // Find articles that need updating (lastReviewed > 90 days)
  const staleArticles = await findStaleArticles();
  
  for (const article of staleArticles) {
    // Check for new information
    const latestNews = await searchNewsAPI({
      query: article.title,
      language: "ar",
      from: article.lastReviewed
    });
    
    if (latestNews.length > 0) {
      // Suggest updates to admin
      await suggestArticleUpdate(article.id, latestNews);
    }
  }
}
```

**Benefits**:
- Maintain content freshness
- Improve SEO rankings
- Better user experience
- Automated maintenance

---

## API Comparison & Recommendations

Based on official documentation review and feature comparison:

### 🏆 1. **NewsAPI.org** (⭐ PRIMARY RECOMMENDATION)

**Official Documentation**: https://newsapi.org/docs

**Features**:
- ✅ **Excellent Arabic Support**: `language=ar` parameter with comprehensive filtering
- ✅ **Well-Documented**: Clear API docs with examples
- ✅ **Global Coverage**: Aggregates from 80,000+ news sources including Arabic media
- ✅ **Flexible Filtering**: By language, country, category, date, source
- ✅ **Rich Metadata**: Title, description, content, image URLs, author, publish date
- ✅ **Free Tier**: 100 requests/day (Developer plan)
- ✅ **Reliable & Mature**: Most popular news API, actively maintained

**Pricing**:
- **Free/Developer**: 100 requests/day, limited sources
- **Business**: $449/month for unlimited requests

**Best For**: 
- ✅ Primary seeding source (title generation, content fetching)
- ✅ Bulk article data collection
- ✅ Live content features post-seeding

**API Endpoint Example**:
```
GET https://newsapi.org/v2/everything?language=ar&q=SEO&pageSize=10&apiKey=YOUR_KEY
```

**Why This is Preferred**:
- Best balance of features, documentation, and reliability
- Strong Arabic language support with proven track record
- Most widely used, so more community support and examples
- Official docs are comprehensive and easy to follow

---

### 2. **Mediastack** (Secondary - Regional Focus)

**Official Documentation**: https://mediastack.com/documentation

**Features**:
- ✅ **MENA Region Focus**: Strong coverage of Middle East & North Africa
- ✅ **Arabic Support**: Filter by language and country codes (`countries=sa,ae,eg`)
- ✅ **Simple REST API**: Easy to integrate
- ✅ **Categories**: General, business, tech, sports, health, etc.
- ✅ **Free Tier**: 1,000 requests/month (Basic plan)

**Pricing**:
- **Free/Basic**: 1,000 requests/month
- **Standard**: $49.99/month for 50,000 requests
- **Professional**: $199.99/month for 250,000 requests

**Best For**:
- ✅ Complementary source for regional content
- ✅ Country-specific seeding (Saudi Arabia, UAE, Egypt)
- ✅ Fallback when NewsAPI limits are reached

**API Endpoint Example**:
```
GET http://api.mediastack.com/v1/news?access_key=YOUR_KEY&countries=sa&languages=ar
```

**Limitations**:
- Less comprehensive than NewsAPI
- Smaller source pool
- Images/metadata may be less complete

---

### 3. **WorldNewsAPI** (Tertiary - Country-Specific)

**Official Documentation**: https://worldnewsapi.com/docs

**Features**:
- ✅ **Country-Specific APIs**: UAE, Saudi Arabia, Egypt endpoints
- ✅ **Front Page Support**: Can fetch front page content
- ✅ **Category Filtering**: Politics, business, sports, etc.
- ✅ **Historical Data**: Date range filtering

**Pricing**: Free tier available (check current limits)

**Best For**:
- ✅ Region-specific content (if targeting specific countries)
- ✅ Front page content for design/layout testing
- ✅ Historical content backfill

**API Endpoint Example**:
```
GET https://api.worldnewsapi.com/news?source-country=ae&number=10&api-key=YOUR_KEY
```

**Limitations**:
- Less flexible than NewsAPI
- Country-specific approach may be limiting
- Smaller overall coverage

---

### 4. **GNews** (Alternative - Aggregation)

**Official Documentation**: https://gnews.io/docs/v4

**Features**:
- ✅ **Arabic Support**: Language filtering available
- ✅ **Aggregation**: Pulls from multiple sources
- ✅ **Free Tier**: Limited requests available

**Best For**:
- ✅ Diverse source coverage
- ✅ Content curation features

**Limitations**:
- Less comprehensive documentation
- May have rate limits/stability issues
- Not as widely adopted

---

### 5. **The Guardian API** (Limited Arabic Use)

**Official Documentation**: https://open-platform.theguardian.com/documentation/

**Features**:
- ⚠️ **Mostly English**: Limited Arabic content
- ✅ Free tier available
- ✅ High-quality journalism

**Best For**:
- ⚠️ International perspective only
- ⚠️ English citations (not primary for Arabic app)

**Recommendation**: Skip for Arabic-focused seeding

---

### 6. **Al Jazeera** (Not Recommended - No Public API)

**Status**: ❌ No official public API available

**Alternative**: RSS feeds may be available but not suitable for programmatic integration

**Recommendation**: Skip or use only for manual citations

---

## 🎯 Final Recommendation: NewsAPI.org

**Primary Choice: NewsAPI.org**

**Reasons**:
1. ✅ **Best Documentation**: Official docs are clear, comprehensive, with examples
2. ✅ **Proven Reliability**: Most popular news API with active community
3. ✅ **Strong Arabic Support**: Dedicated `language=ar` parameter with good coverage
4. ✅ **Flexible & Scalable**: Can handle both seeding and live features
5. ✅ **Good Free Tier**: 100 requests/day sufficient for initial seeding
6. ✅ **Rich Metadata**: Images, authors, dates all included

**Secondary Choice: Mediastack**
- Use as backup/complement for regional content
- Good for country-specific filtering

**Skip**: The Guardian (limited Arabic), Al Jazeera (no API), GNews (less reliable)

---

## Implementation Priority

### Phase 1: Seeding Enhancement (High Priority)
1. Integrate NewsAPI for title generation
2. Use real excerpts from news articles
3. Extract actual citations from sources

**Estimated Impact**: Higher quality seed data, more realistic articles

### Phase 2: Content Enrichment (Medium Priority)
1. Post-seed article enrichment
2. Citation updates
3. Content freshness checks

**Estimated Impact**: Better existing content, improved SEO

### Phase 3: Real-Time Features (Lower Priority)
1. Trend analysis dashboard
2. Content curation automation
3. Scheduled content updates

**Estimated Impact**: Long-term content strategy, competitive advantage

---

## Code Integration Points

### Seeding Integration
```
admin/app/(dashboard)/settings/seed/actions/seed-core.ts
├── seedArticles() (line ~1242)
│   ├── Title generation (line ~1255) → Use NewsAPI
│   ├── Content generation (line ~1415) → Use NewsAPI for reference
│   └── Citations (line ~1505) → Extract from NewsAPI sources
```

### Future Feature Integration
```
admin/lib/news-api/
├── news-api-client.ts (NewsAPI client)
├── mediastack-client.ts (Mediastack client)
├── gnews-client.ts (GNews client)
└── news-aggregator.ts (Unified interface)

admin/app/(dashboard)/articles/
├── actions/
│   ├── enrich-article-action.ts (Content enrichment)
│   └── update-article-action.ts (Auto-updates)

admin/app/(dashboard)/analytics/
└── trending-topics-page.tsx (Trend analysis dashboard)
```

---

## Environment Variables

Add to `.env`:
```bash
# News APIs
NEWS_API_KEY=your_newsapi_key
MEDIASTACK_API_KEY=your_mediastack_key
GNEWS_API_KEY=your_gnews_key
GUARDIAN_API_KEY=your_guardian_key
AL_JAZEERA_API_KEY=your_aljazeera_key (if available)
```

---

## Example Integration Code

### Helper Function: Fetch Arabic Articles
```typescript
// admin/lib/news-api/news-api-client.ts
export async function fetchArabicArticles(options: {
  query?: string;
  category?: string;
  pageSize?: number;
  language: "ar";
}): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  
  const response = await fetch(
    `https://newsapi.org/v2/everything?` +
    `language=${options.language}&` +
    `pageSize=${options.pageSize || 10}&` +
    `q=${encodeURIComponent(options.query || "SEO")}&` +
    `apiKey=${apiKey}`
  );
  
  const data = await response.json();
  return data.articles.map(adaptToNewsArticle);
}
```

### Integration in Seed Function
```typescript
// In seedArticles() function
if (useNewsAPI) {
  const newsArticles = await fetchArabicArticles({
    query: "تحسين محركات البحث",
    pageSize: articleCount,
    language: "ar"
  });
  
  // Use real titles
  seoArticleTitles = newsArticles.map(article => article.title);
  
  // Use real excerpts
  excerpts = newsArticles.map(article => article.description);
  
  // Extract citations
  citations = newsArticles
    .map(article => article.source.url)
    .filter(Boolean);
}
```

---

## Benefits Summary

### For Seeding:
1. ✅ **More Authentic Content**: Real article titles, excerpts, and structure
2. ✅ **Better Citations**: Actual authoritative sources
3. ✅ **Current Topics**: Trending subjects that readers search for
4. ✅ **Natural Language**: Authentic Arabic writing patterns

### For Future Features:
1. ✅ **Content Freshness**: Keep articles updated with latest information
2. ✅ **Trend Analysis**: Identify trending topics and keywords
3. ✅ **Content Curation**: Automatically suggest relevant articles
4. ✅ **Competitive Intelligence**: Monitor what competitors are publishing

---

## Next Steps

1. **Research API Keys**: Sign up for free tiers of NewsAPI, Mediastack, GNews
2. **Create Client Library**: Build unified news API client in `admin/lib/news-api/`
3. **Integrate with Seeding**: Add optional NewsAPI integration to `seedArticles()`
4. **Test & Validate**: Compare seed data quality with/without NewsAPI
5. **Rollout**: Enable NewsAPI as optional enhancement in seed settings

---

**Last Updated**: 2025-01-XX
**Status**: Planning Phase
**Priority**: High (for seeding enhancement)
