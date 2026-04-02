# Analytics Model - Event-Based Tracking Guide

## Model Structure

```prisma
model Analytics {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  articleId String  @db.ObjectId
  clientId  String? @db.ObjectId

  // User/Session tracking
  sessionId String?
  userId    String? @db.ObjectId

  // Core Web Vitals (per view)
  lcp, cls, inp, fid, ttfb, tbt

  // Engagement metrics (per view)
  timeOnPage    Float?      // Seconds
  scrollDepth   Float?      // Percentage 0-100
  bounced       Boolean

  // Traffic sources (per view)
  source, searchEngine, referrerDomain
  userAgent, ipAddress

  timestamp DateTime @default(now())
}
```

## How to Track Views

### 1. Track a Page View

```typescript
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function trackArticleView(articleId: string) {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("session_id")?.value;

  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    cookieStore.set("session_id", sessionId, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  }

  await db.analytics.create({
    data: {
      articleId,
      sessionId,
      userId: null,
      source: TrafficSource.DIRECT,
      timestamp: new Date(),
    },
  });
}
```

### 2. Track with Engagement Metrics

```typescript
export async function trackArticleViewWithMetrics(
  articleId: string,
  metrics: {
    timeOnPage?: number;
    scrollDepth?: number;
    lcp?: number;
    cls?: number;
  }
) {
  const sessionId = await getOrCreateSessionId();

  await db.analytics.create({
    data: {
      articleId,
      sessionId,
      timeOnPage: metrics.timeOnPage,
      scrollDepth: metrics.scrollDepth,
      lcp: metrics.lcp,
      cls: metrics.cls,
      bounced: (metrics.timeOnPage || 0) < 10,
      timestamp: new Date(),
    },
  });
}
```

## How to Query Analytics

### 1. Get Total Views for an Article

```typescript
export async function getTotalViews(articleId: string): Promise<number> {
  return await db.analytics.count({
    where: { articleId },
  });
}
```

### 2. Get Unique Visitors

```typescript
export async function getUniqueVisitors(articleId: string): Promise<number> {
  const result = await db.analytics.groupBy({
    by: ["sessionId"],
    where: {
      articleId,
      sessionId: { not: null },
    },
  });

  return result.length;
}
```

### 3. Get Views by Date Range

```typescript
export async function getViewsByDateRange(
  articleId: string,
  startDate: Date,
  endDate: Date
) {
  return await db.analytics.findMany({
    where: {
      articleId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { timestamp: "desc" },
  });
}
```

### 4. Get Average Time on Page

```typescript
export async function getAverageTimeOnPage(articleId: string): Promise<number> {
  const result = await db.analytics.aggregate({
    where: {
      articleId,
      timeOnPage: { not: null },
    },
    _avg: {
      timeOnPage: true,
    },
  });

  return result._avg.timeOnPage || 0;
}
```

### 5. Get Bounce Rate

```typescript
export async function getBounceRate(articleId: string): Promise<number> {
  const [total, bounced] = await Promise.all([
    db.analytics.count({ where: { articleId } }),
    db.analytics.count({ where: { articleId, bounced: true } }),
  ]);

  return total > 0 ? (bounced / total) * 100 : 0;
}
```

### 6. Get Views by Traffic Source

```typescript
export async function getViewsBySource(articleId: string) {
  return await db.analytics.groupBy({
    by: ["source"],
    where: { articleId },
    _count: { id: true },
  });
}
```

## Performance Considerations

### Indexes

- `@@index([articleId, timestamp])` - Fast queries by article + date
- `@@index([clientId, timestamp])` - Fast client-level analytics
- `@@index([timestamp])` - Fast date range queries
- `@@index([sessionId])` - Fast unique visitor queries
- `@@index([userId])` - Fast user-specific queries

### Best Practices

1. Batch inserts for high traffic
2. Don't block page rendering - track in background
3. Consider archiving old analytics (>1 year) to separate collection
4. Pre-calculate common metrics if needed for dashboard performance

## Example: Complete Tracking Flow

```typescript
// app/articles/[slug]/page.tsx
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await db.article.findUnique({
    where: { slug: params.slug },
    include: { author: true },
  });

  // Track view in background
  trackArticleView(article.id).catch(console.error);

  // Get view count
  const viewCount = await getTotalViews(article.id);

  return (
    <div>
      <h1>{article.title}</h1>
      <p>Views: {viewCount}</p>
      {/* Article content */}
    </div>
  );
}
```

## Migration Notes

If you have existing analytics with old structure:
- Old `pageViews` counter → Count records instead
- Old `uniqueVisitors` counter → Count distinct `sessionId`
- Old `avgTimeOnPage` → Calculate average of `timeOnPage` field
- Old `bounceRate` → Calculate percentage of `bounced: true`
