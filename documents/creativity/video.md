# GTM Integration BRD — Modonty Client Analytics

**Version 1.0 | Final Production Document**

---

## Executive Summary

This document defines the complete technical requirements for integrating Google Tag Manager (GTM) and Google Analytics 4 (GA4) with Modonty to provide clients with a single source of truth for all engagement metrics. Each client will have access to their own filtered analytics data within their console.modonty.com dashboard, pulling from one centralized GTM container with weekly automated data synchronization.

---

## Section 1: Overview and Objectives

### Business Objective

Enable Modonty clients to view their article performance, user engagement, conversions, and all tracked events through their console dashboard, with GTM as the authoritative data source. Clients trust real GTM/GA4 data over estimated dashboard numbers, increasing transparency, retention, and platform credibility.

### Technical Objective

Implement a system where:
- **One GTM container** tracks all Modonty client events
- **Weekly automated data pull** from Google Analytics 4 (GA4) API
- **Per-client data filtering** using custom `clientId` dimension
- **Client-facing console dashboard** displaying only their filtered metrics
- **Live GTM access option** via button linking to their view in Google's interface

### Key Benefits

- **Single Source of Truth** — All data flows through GTM/GA4
- **Transparency** — Clients see real engagement metrics, not calculated estimates
- **Scalability** — Works for unlimited clients, no per-client GTM containers needed
- **Cost-Effective** — Weekly pulls stay within Google's free API tier (25,000 requests/day)
- **Security** — Each client sees only their own data based on authentication
- **No API Rate Limits** — One weekly sync avoids throttling entirely

---

## Section 2: GTM Container Configuration

### Container Setup

**Main GTM Container ID:** `GTM-XXXXXXX` (to be configured in Modonty admin)

**Container Location:** modonty.com (single, centralized container serving all clients)

**Data Destination:** Google Analytics 4 Property (GA4)

**Associated GA4 Property ID:** `G-XXXXXXXXXX`

### GTM Implementation on Modonty

Install GTM container code on modonty.com in two locations:

**In `<head>` tag (as high as possible):**
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

**Immediately after `<body>` tag opens:**
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### Critical: Custom Dimension `clientId`

Every event fired in GTM **must include** a `clientId` dimension to identify which Modonty client the event belongs to.

**Data Layer Implementation:**

On every client article page, push `clientId` to the dataLayer **before** GTM loads:

```html
<script>
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'clientId': '{{ CLIENT_ID_FROM_SERVER }}',
    'articleId': '{{ ARTICLE_ID }}',
    'articleTitle': '{{ ARTICLE_TITLE }}',
    'articleUrl': '{{ ARTICLE_URL }}'
  });
</script>
<!-- GTM container code goes AFTER this -->
```

**Server-Side Rendering:** Modonty's Next.js server must inject `clientId` based on article ownership before HTML is sent to browser.

### Events to Track (Complete List)

All events below must include `clientId` parameter:

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `article_view` | Article page loads | clientId, articleId, articleTitle, articleUrl |
| `signup_start` | Signup form opens/starts | clientId, formId |
| `signup_complete` | Signup form submits successfully | clientId, formId, leadValue |
| `cta_click` | CTA button clicked | clientId, ctaText, ctaType, ctaLocation |
| `internal_link_click` | Internal link clicked | clientId, sourceArticle, targetArticle, linkText |
| `external_link_click` | External link clicked | clientId, externalDomain, linkText |
| `scroll_depth_25` | User scrolls 25% of page | clientId, pageUrl |
| `scroll_depth_50` | User scrolls 50% of page | clientId, pageUrl |
| `scroll_depth_75` | User scrolls 75% of page | clientId, pageUrl |
| `scroll_depth_100` | User scrolls to bottom | clientId, pageUrl |
| `conversion` | Conversion event fires | clientId, conversionType, conversionValue, conversionId |
| `newsletter_signup` | Newsletter subscription | clientId, emailHashed |
| `search_performed` | Site search performed | clientId, searchQuery |
| `share_article` | Article shared via social | clientId, articleId, sharePlatform |

### GTM Tags Configuration

For each event above, create a GTM tag:

**Tag Type:** Google Analytics: GA4 Event
**Event Name:** (from table above)
**Event Parameters:** Map all parameters including `clientId`
**Trigger:** Custom event or DOM interaction as appropriate
**Destination:** GA4 Property `G-XXXXXXXXXX`

### GTM Variables Required

**Built-in Variables (enable these):**
- Page URL
- Page Path
- Page Hostname
- Click Element
- Click Text
- Click URL
- Form Element
- Scroll Depth Threshold

**User-Defined Variables (create these):**
- `DL - clientId` (Data Layer Variable): `clientId`
- `DL - articleId` (Data Layer Variable): `articleId`
- `DL - articleTitle` (Data Layer Variable): `articleTitle`
- `DL - ctaType` (Data Layer Variable): `ctaType`
- `DL - conversionValue` (Data Layer Variable): `conversionValue`

### Triggers Configuration

**Trigger 1: Article View**
- Type: Page View
- Fire on: Page URL contains `/articles/` OR `/blog/`

**Trigger 2: CTA Click**
- Type: Click - All Elements
- Fire on: Click Classes contains `modonty-cta`

**Trigger 3: Signup Complete**
- Type: Custom Event
- Event Name: `signup_complete`

**Trigger 4: Internal Link Click**
- Type: Click - Just Links
- Fire on: Click URL contains `modonty.com/articles/`

**Trigger 5: External Link Click**
- Type: Click - Just Links
- Fire on: Click URL does not contain `modonty.com`

**Trigger 6: Scroll Depth**
- Type: Scroll Depth
- Thresholds: 25, 50, 75, 100 (percentages)
- Fire on: All Pages

---

## Section 3: Google Analytics 4 (GA4) Configuration

### GA4 Property Setup

**Property Name:** Modonty Main Property
**Reporting Time Zone:** UTC
**Currency:** USD (or SAR if applicable)
**Data Retention:** 14 months (maximum free tier)
**Enhanced Measurement:** Enabled

### Custom Dimensions (MUST BE CREATED IN GA4)

Navigate to: **Admin → Custom Definitions → Custom Dimensions → Create**

| Dimension Name | Scope | Event Parameter |
|---|---|---|
| clientId | User | clientId |
| articleId | Event | articleId |
| articleTitle | Event | articleTitle |
| articleUrl | Event | articleUrl |
| ctaType | Event | ctaType |
| ctaLocation | Event | ctaLocation |
| conversionType | Event | conversionType |
| linkText | Event | linkText |
| sourceArticle | Event | sourceArticle |
| targetArticle | Event | targetArticle |
| searchQuery | Event | searchQuery |
| sharePlatform | Event | sharePlatform |

**CRITICAL:** These custom dimensions must be created **before** data is processed, or events will not be queryable by these dimensions.

### Custom Metrics

| Metric Name | Scope | Event Parameter | Unit |
|---|---|---|---|
| leadValue | Event | leadValue | Currency |
| conversionValue | Event | conversionValue | Currency |

### Conversion Events

Mark the following as conversion events in GA4:
- `signup_complete`
- `conversion`
- `newsletter_signup`

Navigate to: **Admin → Events → Mark as conversion**

### Data Stream Configuration

- **Platform:** Web
- **Website URL:** modonty.com
- **Stream Name:** Modonty Production
- **Measurement ID:** `G-XXXXXXXXXX`
- **Enhanced Measurement:** Enable all except Form Interactions (we use custom events)

---

## Section 4: Database Architecture

### Table 1: `client_analytics_weekly`

Stores aggregated weekly metrics per client.

```sql
CREATE TABLE client_analytics_weekly (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  clientId VARCHAR(255) NOT NULL,
  weekStartDate DATE NOT NULL,
  weekEndDate DATE NOT NULL,
  
  -- Traffic Metrics
  totalPageViews INT DEFAULT 0,
  uniqueVisitors INT DEFAULT 0,
  sessions INT DEFAULT 0,
  bounceRate DECIMAL(5,2) DEFAULT 0,
  avgSessionDuration INT DEFAULT 0,
  avgEngagementTime INT DEFAULT 0,
  
  -- Article Performance
  articlesViewed INT DEFAULT 0,
  topArticleId VARCHAR(255),
  topArticleTitle VARCHAR(500),
  topArticleViews INT DEFAULT 0,
  
  -- Engagement Metrics
  internalLinkClicks INT DEFAULT 0,
  externalLinkClicks INT DEFAULT 0,
  scrollDepth25Count INT DEFAULT 0,
  scrollDepth50Count INT DEFAULT 0,
  scrollDepth75Count INT DEFAULT 0,
  scrollDepth100Count INT DEFAULT 0,
  avgScrollDepth DECIMAL(5,2) DEFAULT 0,
  
  -- Conversions and CTAs
  ctaClicks INT DEFAULT 0,
  signupStarts INT DEFAULT 0,
  signupCompletes INT DEFAULT 0,
  signupConversionRate DECIMAL(5,2) DEFAULT 0,
  conversions INT DEFAULT 0,
  totalConversionValue DECIMAL(10,2) DEFAULT 0,
  newsletterSignups INT DEFAULT 0,
  shareEvents INT DEFAULT 0,
  
  -- Metadata
  syncedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  syncStatus VARCHAR(50) DEFAULT 'success',
  dataQualityScore DECIMAL(3,2) DEFAULT 1.00,
  
  UNIQUE KEY unique_client_week (clientId, weekEndDate),
  INDEX idx_clientId (clientId),
  INDEX idx_weekEndDate (weekEndDate),
  INDEX idx_syncedAt (syncedAt)
);
```

### Table 2: `client_analytics_article_detail`

Per-article weekly performance metrics.

```sql
CREATE TABLE client_analytics_article_detail (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  clientId VARCHAR(255) NOT NULL,
  articleId VARCHAR(255) NOT NULL,
  articleTitle VARCHAR(500),
  articleUrl VARCHAR(1000),
  weekEndDate DATE NOT NULL,
  
  -- Performance
  pageViews INT DEFAULT 0,
  uniqueVisitors INT DEFAULT 0,
  avgTimeOnPage INT DEFAULT 0,
  bounceRate DECIMAL(5,2) DEFAULT 0,
  scrollDepthAvg DECIMAL(5,2) DEFAULT 0,
  
  -- Engagement
  internalLinkClicks INT DEFAULT 0,
  externalLinkClicks INT DEFAULT 0,
  ctaClicks INT DEFAULT 0,
  shareCount INT DEFAULT 0,
  
  -- Conversions
  conversionCount INT DEFAULT 0,
  conversionValue DECIMAL(10,2) DEFAULT 0,
  conversionRate DECIMAL(5,2) DEFAULT 0,
  
  syncedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_client_article_week (clientId, articleId, weekEndDate),
  INDEX idx_clientId (clientId),
  INDEX idx_articleId (articleId),
  INDEX idx_weekEndDate (weekEndDate)
);
```

### Table 3: `gtm_sync_log`

Logs every sync operation for monitoring and debugging.

```sql
CREATE TABLE gtm_sync_log (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  syncStartTime TIMESTAMP NOT NULL,
  syncEndTime TIMESTAMP,
  syncStatus VARCHAR(50), -- 'running', 'success', 'partial', 'failed'
  clientsProcessed INT DEFAULT 0,
  clientsSucceeded INT DEFAULT 0,
  clientsFailed INT DEFAULT 0,
  recordsInserted INT DEFAULT 0,
  totalEventsProcessed INT DEFAULT 0,
  errorMessage TEXT,
  errorDetails JSON,
  apiCallsMade INT DEFAULT 0,
  syncDurationSeconds INT DEFAULT 0,
  
  INDEX idx_syncStartTime (syncStartTime),
  INDEX idx_syncStatus (syncStatus)
);
```

### Table 4: `analytics_access_log` (Security Audit)

```sql
CREATE TABLE analytics_access_log (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  clientId VARCHAR(255) NOT NULL,
  userId VARCHAR(255) NOT NULL,
  endpoint VARCHAR(500),
  ipAddress VARCHAR(45),
  userAgent TEXT,
  accessedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_clientId (clientId),
  INDEX idx_userId (userId),
  INDEX idx_accessedAt (accessedAt)
);
```

---

## Section 5: Weekly Data Synchronization Pipeline

### Cron Schedule

**Frequency:** Every Sunday at 2:00 AM UTC
**Environment:** Vercel Cron or dedicated server cron job
**Expected Duration:** 5-15 minutes depending on client count

### Vercel Cron Configuration

In `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/gtm-weekly-sync",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

### Google Analytics Data API v1

**API Endpoint:** `https://analyticsdata.googleapis.com/v1beta/properties/{propertyId}:runReport`

**Authentication:** Service Account with JSON key file
- Create service account in Google Cloud Console
- Grant "Viewer" access to GA4 property
- Store JSON key in environment variable `GA4_SERVICE_ACCOUNT_KEY`

**Required OAuth Scope:** `https://www.googleapis.com/auth/analytics.readonly`

### Sync Algorithm (Step by Step)

**Step 1: Initialize**
```typescript
// /api/cron/gtm-weekly-sync.ts
async function syncWeeklyAnalytics() {
  const syncLog = await createSyncLog({
    syncStartTime: new Date(),
    syncStatus: 'running'
  });
  
  try {
    const clients = await getActiveClients();
    const weekDates = getLastWeekDates();
    
    for (const client of clients) {
      await syncClientData(client, weekDates, syncLog.id);
    }
    
    await updateSyncLog(syncLog.id, { syncStatus: 'success' });
  } catch (error) {
    await updateSyncLog(syncLog.id, { 
      syncStatus: 'failed',
      errorMessage: error.message 
    });
  }
}
```

**Step 2: Query GA4 for Each Client**

```typescript
async function queryGA4ForClient(clientId: string, startDate: string, endDate: string) {
  const response = await analyticsDataClient.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'customUser:clientId' },
      { name: 'eventName' }
    ],
    metrics: [
      { name: 'eventCount' },
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
      { name: 'screenPageViews' },
      { name: 'conversions' }
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'customUser:clientId',
        stringFilter: {
          matchType: 'EXACT',
          value: clientId
        }
      }
    }
  });
  
  return response;
}
```

**Step 3: Query Per-Article Data**

```typescript
async function queryArticleDataForClient(clientId: string, startDate: string, endDate: string) {
  const response = await analyticsDataClient.runReport({
    property: `properties/${GA4_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'customUser:clientId' },
      { name: 'customEvent:articleId' },
      { name: 'customEvent:articleTitle' },
      { name: 'customEvent:articleUrl' }
    ],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'activeUsers' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' }
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'customUser:clientId',
        stringFilter: {
          matchType: 'EXACT',
          value: clientId
        }
      }
    }
  });
  
  return response;
}
```

**Step 4: Aggregate and Store**

```typescript
async function syncClientData(client, weekDates, syncLogId) {
  const summaryData = await queryGA4ForClient(client.clientId, weekDates.start, weekDates.end);
  const articleData = await queryArticleDataForClient(client.clientId, weekDates.start, weekDates.end);
  
  // Aggregate summary metrics
  const aggregated = aggregateMetrics(summaryData);
  
  // Insert weekly summary
  await db.insert('client_analytics_weekly', {
    clientId: client.clientId,
    weekStartDate: weekDates.start,
    weekEndDate: weekDates.end,
    ...aggregated,
    syncedAt: new Date()
  });
  
  // Insert per-article details
  for (const article of articleData) {
    await db.insert('client_analytics_article_detail', {
      clientId: client.clientId,
      articleId: article.articleId,
      articleTitle: article.articleTitle,
      articleUrl: article.articleUrl,
      weekEndDate: weekDates.end,
      pageViews: article.pageViews,
      uniqueVisitors: article.uniqueVisitors,
      // ... other metrics
    });
  }
}
```

**Step 5: Error Handling and Retry**

```typescript
async function syncClientDataWithRetry(client, weekDates, syncLogId, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await syncClientData(client, weekDates, syncLogId);
      return { success: true, attempts: attempt };
    } catch (error) {
      if (attempt === maxRetries) {
        await logClientSyncError(client.clientId, error, syncLogId);
        return { success: false, attempts: attempt, error };
      }
      // Exponential backoff: 1s, 2s, 4s
      await sleep(Math.pow(2, attempt - 1) * 1000);
    }
  }
}
```

---

## Section 6: Console API Endpoints

### Endpoint 1: Get Client Analytics Summary

**Route:** `GET /api/v1/analytics/summary`

**Authentication:** JWT Bearer token (validate clientId matches authenticated user)

**Query Parameters:**
- `weekEndDate` (optional, ISO date, defaults to last completed week)

**Response:**

```json
{
  "success": true,
  "clientId": "client_123456",
  "weekStartDate": "2024-01-08",
  "weekEndDate": "2024-01-14",
  "lastSyncedAt": "2024-01-15T02:30:00Z",
  "metrics": {
    "totalPageViews": 1250,
    "uniqueVisitors": 850,
    "sessions": 950,
    "bounceRate": 35.2,
    "avgSessionDuration": 245,
    "avgEngagementTime": 125,
    "articlesViewed": 8,
    "signupStarts": 42,
    "signupCompletes": 15,
    "signupConversionRate": 35.7,
    "conversions": 3,
    "totalConversionValue": 450.00,
    "ctaClicks": 87,
    "internalLinkClicks": 120,
    "externalLinkClicks": 45,
    "avgScrollDepth": 68.5,
    "newsletterSignups": 12,
    "shareEvents": 18
  },
  "topArticle": {
    "articleId": "art_001",
    "title": "Best Arabic SEO Practices",
    "url": "/articles/best-arabic-seo-practices",
    "pageViews": 325
  }
}
```

### Endpoint 2: Get Article-Level Analytics

**Route:** `GET /api/v1/analytics/articles`

**Query Parameters:**
- `weekEndDate` (optional)
- `limit` (default 10, max 100)
- `sortBy` (pageViews | conversions | engagement, default: pageViews)

**Response:**

```json
{
  "success": true,
  "clientId": "client_123456",
  "weekEndDate": "2024-01-14",
  "articles": [
    {
      "articleId": "art_001",
      "articleTitle": "Best Arabic SEO Practices",
      "articleUrl": "/articles/best-arabic-seo-practices",
      "pageViews": 325,
      "uniqueVisitors": 280,
      "avgTimeOnPage": 285,
      "bounceRate": 32.1,
      "scrollDepthAvg": 72.5,
      "internalLinkClicks": 45,
      "externalLinkClicks": 12,
      "ctaClicks": 18,
      "shareCount": 8,
      "conversionCount": 2,
      "conversionValue": 150.00,
      "conversionRate": 0.71
    }
  ]
}
```

### Endpoint 3: Get Week-over-Week Comparison

**Route:** `GET /api/v1/analytics/comparison`

**Query Parameters:**
- `currentWeekEndDate`
- `previousWeekEndDate`

**Response:**

```json
{
  "success": true,
  "clientId": "client_123456",
  "currentWeek": {
    "weekEndDate": "2024-01-14",
    "pageViews": 1250,
    "conversions": 15,
    "users": 850
  },
  "previousWeek": {
    "weekEndDate": "2024-01-07",
    "pageViews": 980,
    "conversions": 11,
    "users": 720
  },
  "comparison": {
    "pageViewsChange": 27.55,
    "conversionsChange": 36.36,
    "usersChange": 18.06,
    "trend": "up"
  }
}
```

### Endpoint 4: Get Conversion Funnel

**Route:** `GET /api/v1/analytics/funnel`

**Response:**

```json
{
  "success": true,
  "clientId": "client_123456",
  "weekEndDate": "2024-01-14",
  "funnel": {
    "pageViews": 1250,
    "signupStarts": 125,
    "signupCompletes": 15,
    "conversions": 3,
    "pageViewToSignupStart": 10.00,
    "signupStartToComplete": 12.00,
    "completeToConversion": 20.00,
    "overallConversionRate": 0.24
  }
}
```

### Endpoint 5: Get Live GTM Access Link

**Route:** `GET /api/v1/analytics/live-gtm`

**Response:**

```json
{
  "success": true,
  "clientId": "client_123456",
  "gtmContainerId": "GTM-XXXXXXX",
  "gtmViewUrl": "https://analytics.google.com/analytics/web/#/p123456789/reports/dashboard",
  "filterHint": "Filter by custom dimension 'clientId' equals 'client_123456'",
  "instructions": "Click to open Google Analytics in a new tab. Apply the clientId filter to see your data in real-time."
}
```

### Security Middleware (MUST IMPLEMENT)

```typescript
// middleware/verifyClientAccess.ts
export async function verifyClientAccess(req: NextApiRequest, res: NextApiResponse, next: Function) {
  try {
    // Extract JWT from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Missing authentication token' });
    }
    
    // Verify JWT and get user info
    const decoded = await verifyJWT(token);
    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Get clientId from query or body
    const requestedClientId = req.query.clientId || req.body.clientId;
    
    // Verify clientId matches user's clientId
    if (user.clientId !== requestedClientId) {
      // Log unauthorized access attempt
      await logSecurityEvent({
        userId: user.id,
        attemptedClientId: requestedClientId,
        actualClientId: user.clientId,
        endpoint: req.url,
        ipAddress: req.ip
      });
      
      return res.status(403).json({ error: 'Unauthorized access to this client data' });
    }
    
    // Attach user and clientId to request
    req.user = user;
    req.clientId = user.clientId;
    
    // Log access for audit trail
    await logAnalyticsAccess({
      clientId: user.clientId,
      userId: user.id,
      endpoint: req.url,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
```

---

## Section 7: Frontend Implementation (Console Dashboard)

### Dashboard Route

**URL:** `console.modonty.com/dashboard/analytics`

**Framework:** Next.js 15 App Router + React 19

### Component Structure

```
app/dashboard/analytics/
├── page.tsx                    # Main analytics page
├── loading.tsx                 # Skeleton loader
├── error.tsx                   # Error boundary
├── components/
│   ├── SummaryCards.tsx       # Top-level metric cards
│   ├── TrafficChart.tsx       # Traffic over time chart
│   ├── ArticlesTable.tsx      # Top articles table
│   ├── FunnelVisualization.tsx # Conversion funnel
│   ├── ComparisonWidget.tsx   # Week-over-week comparison
│   ├── LiveGTMButton.tsx      # Live GTM access button
│   └── LastSyncedTimestamp.tsx # Sync status indicator
├── hooks/
│   ├── useAnalytics.ts        # Custom hook for analytics data
│   └── useClientId.ts         # Get current user's clientId
└── helpers/
    ├── formatMetrics.ts       # Format numbers, percentages
    └── calculateTrends.ts     # Calculate week-over-week
```

### Main Page Component

```tsx
// app/dashboard/analytics/page.tsx
import { Suspense } from 'react';
import { SummaryCards } from './components/SummaryCards';
import { TrafficChart } from './components/TrafficChart';
import { ArticlesTable } from './components/ArticlesTable';
import { FunnelVisualization } from './components/FunnelVisualization';
import { LiveGTMButton } from './components/LiveGTMButton';
import { LastSyncedTimestamp } from './components/LastSyncedTimestamp';
import AnalyticsSkeleton from './loading';

export default async function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <LastSyncedTimestamp />
          <LiveGTMButton />
        </div>
      </div>
      
      <Suspense fallback={<AnalyticsSkeleton />}>
        <SummaryCards />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrafficChart />
          <FunnelVisualization />
        </div>
        <ArticlesTable />
      </Suspense>
    </div>
  );
}
```

### Custom Hook for Fetching Analytics

```tsx
// app/dashboard/analytics/hooks/useAnalytics.ts
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface AnalyticsData {
  clientId: string;
  weekEndDate: string;
  lastSyncedAt: string;
  metrics: {
    totalPageViews: number;
    uniqueVisitors: number;
    conversions: number;
    totalConversionValue: number;
    ctaClicks: number;
    signupCompletes: number;
    signupConversionRate: number;
  };
  topArticle: {
    articleId: string;
    title: string;
    pageViews: number;
  };
}

export function useAnalytics(weekEndDate?: string) {
  const { token } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const url = weekEndDate 
          ? `/api/v1/analytics/summary?weekEndDate=${weekEndDate}`
          : '/api/v1/analytics/summary';
          
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [token, weekEndDate]);
  
  return { data, loading, error };
}
```

### Summary Cards Component

```tsx
// app/dashboard/analytics/components/SummaryCards.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatNumber, formatPercent, formatCurrency } from '../helpers/formatMetrics';

export function SummaryCards() {
  const { data, loading, error } = useAnalytics();
  
  if (loading) return null; // Handled by Suspense
  if (error || !data) return <div>Error loading metrics</div>;
  
  const cards = [
    {
      title: 'Total Page Views',
      value: formatNumber(data.metrics.totalPageViews),
      subtitle: 'This week'
    },
    {
      title: 'Unique Visitors',
      value: formatNumber(data.metrics.uniqueVisitors),
      subtitle: 'This week'
    },
    {
      title: 'Conversions',
      value: formatNumber(data.metrics.conversions),
      subtitle: formatCurrency(data.metrics.totalConversionValue)
    },
    {
      title: 'Conversion Rate',
      value: formatPercent(data.metrics.signupConversionRate),
      subtitle: `${data.metrics.signupCompletes} signups`
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Live GTM Button Component

```tsx
// app/dashboard/analytics/components/LiveGTMButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function LiveGTMButton() {
  const { token } = useAuth();
  
  const handleClick = async () => {
    try {
      const response = await fetch('/api/v1/analytics/live-gtm', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.gtmViewUrl) {
        window.open(data.gtmViewUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to open live GTM:', error);
    }
  };
  
  return (
    <Button onClick={handleClick} variant="outline" className="gap-2">
      <ExternalLink className="h-4 w-4" />
      View Live in GTM
    </Button>
  );
}
```

### Last Synced Timestamp

```tsx
// app/dashboard/analytics/components/LastSyncedTimestamp.tsx
'use client';

import { useAnalytics } from '../hooks/useAnalytics';
import { formatDistanceToNow } from 'date-fns';

export function LastSyncedTimestamp() {
  const { data } = useAnalytics();
  
  if (!data) return null;
  
  return (
    <div className="text-sm text-muted-foreground">
      Last synced: {formatDistanceToNow(new Date(data.lastSyncedAt), { addSuffix: true })}
    </div>
  );
}
```

---

## Section 8: Security Requirements

### Authentication

- All API endpoints require JWT Bearer token
- Token must be issued at user login
- Token must include `userId` and `clientId` claims
- Token expiration: 24 hours
- Refresh token flow for longer sessions

### Authorization

- Every endpoint must verify `clientId` from token matches requested data
- Database queries must filter by authenticated `clientId`
- Never return data for a different client, even by accident

### Data Isolation

```typescript
// Every query MUST filter by authenticated clientId
const data = await db.query(
  `SELECT * FROM client_analytics_weekly 
   WHERE clientId = ? AND weekEndDate = ?`,
  [authenticatedClientId, weekEndDate]
);
```

### Audit Logging

- Log all analytics data access to `analytics_access_log` table
- Include: userId, clientId, endpoint, IP address, user agent, timestamp
- Retain logs for minimum 90 days for compliance

### API Security

- Rate limiting: 100 requests per minute per user
- CORS: Only allow requests from `console.modonty.com`
- HTTPS only (enforce in production)
- CSRF protection on state-changing endpoints

### Service Account Security

- GA4 Service Account JSON key stored in environment variable
- Never commit to git
- Rotate service account key every 90 days
- Use Vercel secrets management

---

## Section 9: Error Handling and Monitoring

### Error Scenarios

| Error | Handling | User Message |
|---|---|---|
| GA4 API timeout | Retry 3x with backoff, then fail gracefully | "Analytics temporarily unavailable" |
| GA4 API quota exceeded | Log alert, wait until reset | "Data will refresh shortly" |
| Database connection failure | Retry, alert admin | "Service unavailable, try again" |
| Missing clientId dimension | Skip that client, log error | N/A (admin-only) |
| Invalid date range | Validate, return 400 error | "Invalid date range" |
| Unauthorized access attempt | 403 error, log security event | "Access denied" |

### Monitoring Dashboard (Admin)

Track:
- Weekly sync success/failure rate
- Number of clients processed each sync
- Average sync duration
- API quota usage (GA4 Data API)
- Database query performance
- Failed authentication attempts
- Unusual access patterns

### Alerts

Set up alerts for:
- Sync failure (email + Slack notification)
- GA4 API quota at 80% usage
- Authentication failures spike
- Database query timeout
- Missing data for active client

---

## Section 10: Testing Strategy

### Unit Tests

- Test aggregation functions with sample GA4 data
- Test date range calculations (weekly boundaries)
- Test access control middleware
- Test metric formatting helpers
- Test API response structures

### Integration Tests

- Full sync flow with mock GA4 API
- API endpoints with authenticated requests
- Database transactions and rollbacks
- Error handling scenarios

### End-to-End Tests

- Client logs in, sees their own analytics
- Client tries to access another client's data (must fail)
- Live GTM button opens correct URL
- Weekly sync cron job runs successfully

### Load Testing

- Simulate 1000 concurrent clients accessing dashboard
- Verify API response times under 500ms
- Verify database query performance
- Verify GA4 API doesn't throttle

---

## Section 11: Implementation Checklist

### Phase 1: GTM and GA4 Setup (Week 1)

- [ ] Create GTM container for modonty.com
- [ ] Install GTM container code on all modonty.com pages
- [ ] Create GA4 property
- [ ] Link GTM to GA4
- [ ] Create all custom dimensions in GA4
- [ ] Create service account with GA4 read access
- [ ] Configure data layer pushes on all article pages
- [ ] Create all GTM tags for tracked events
- [ ] Create all GTM triggers
- [ ] Test GTM container in preview mode
- [ ] Verify events appearing in GA4 real-time reports

### Phase 2: Database and Backend (Week 2)

- [ ] Create database tables (weekly, article_detail, sync_log, access_log)
- [ ] Build GA4 API integration module
- [ ] Build weekly sync cron job
- [ ] Build aggregation logic
- [ ] Build API endpoints (summary, articles, comparison, funnel, live-gtm)
- [ ] Implement security middleware
- [ ] Add audit logging
- [ ] Write unit tests for all backend logic

### Phase 3: Frontend Console (Week 3)

- [ ] Build analytics dashboard page
- [ ] Build summary cards component
- [ ] Build traffic chart component
- [ ] Build articles table component
- [ ] Build funnel visualization
- [ ] Build comparison widget
- [ ] Build live GTM button
- [ ] Build last synced timestamp
- [ ] Build loading skeletons
- [ ] Build error boundaries
- [ ] Mobile responsive design
- [ ] RTL support for Arabic

### Phase 4: Testing and Launch (Week 4)

- [ ] Run full test suite
- [ ] Run pilot sync with 2-3 test clients
- [ ] Verify data accuracy
- [ ] Security audit
- [ ] Load testing
- [ ] Admin dashboard for monitoring syncs
- [ ] Documentation for admin team
- [ ] Client onboarding guide
- [ ] Launch to all clients

---

## Section 12: Environment Variables Required

```env
# Google Analytics 4
GA4_PROPERTY_ID=123456789
GA4_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# GTM
GTM_CONTAINER_ID=GTM-XXXXXXX

# Cron Secret (for Vercel cron authentication)
CRON_SECRET=your-random-secret-here

# Database
DATABASE_URL=mongodb+srv://...

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=24h

# App
NEXT_PUBLIC_APP_URL=https://console.modonty.com
```

---

## Section 13: Cost Analysis

### Google Analytics Data API

- **Free Tier:** 25,000 requests per day
- **Estimated Usage:** 1 request per client per sync × weekly sync
- **At 100 clients:** ~100 requests/week = well within free tier
- **At 1,000 clients:** ~1,000 requests/week = still free
- **At 10,000 clients:** Still within free daily quota
- **Cost:** $0

### GTM

- **Cost:** Free (included with Google Analytics)

### Infrastructure

- **Vercel Cron:** Included in Pro plan ($20/month)
- **Database Storage:** Negligible (aggregated data)

**Total Additional Monthly Cost:** $0 (within existing infrastructure)

---

## Section 14: Success Metrics

Track these KPIs after launch:

- **Client Engagement with Dashboard:** % of clients checking analytics weekly
- **Sync Reliability:** Weekly sync success rate (target: 99%+)
- **Data Accuracy:** Comparison with GTM direct view (target: 100% match)
- **API Response Time:** Dashboard load time (target: <2 seconds)
- **Client Satisfaction:** Feedback score on analytics feature (target: 4.5+/5)
- **Live GTM Button Usage:** % of clients using live view feature

---

## Document Version

**Version:** 1.0 Final
**Status:** Production-Ready for Implementation
**Last Updated:** Current Date
**Next Review:** Post-Launch (30 days after deployment)

---

*End of BRD Document*

---

Copy everything above (from the title down to "End of BRD Document") and paste it into a Google Doc or save as `modonty-gtm-integration-brd.md` on your desktop. This is production-ready and you can hand it directly to Claude Code or your development team for implementation.