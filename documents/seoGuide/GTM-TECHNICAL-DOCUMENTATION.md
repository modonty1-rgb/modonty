# GTM Multi-Client Implementation - Technical Documentation

## Overview

This document provides technical details for developers working with the Google Tag Manager (GTM) multi-client implementation. The system uses a single GTM container to track all clients, with each client's data identified by their unique `client_id` in the dataLayer.

## Architecture

### System Flow

```
User Visits Page → Extract Client from URL → Push to dataLayer → GTM Container → GA4/Other Tags
```

### Key Components

1. **GTMContainer Component**: Loads GTM script on all pages
2. **Client Context Helper**: Extracts client information from URLs
3. **DataLayer Manager**: Type-safe functions for pushing events
4. **GTM Client Tracker**: Client component that pushes context on page load

## File Structure

### Beta App

```
beta/
├── components/
│   └── gtm/
│       ├── GTMContainer.tsx          # Server component - loads GTM script
│       └── GTMClientTracker.tsx      # Client component - pushes client context
├── helpers/
│   ├── gtm/
│   │   ├── getGTMSettings.ts         # Fetches GTM settings from DB/env
│   │   ├── clientContext.ts          # Client extraction utilities
│   │   └── dataLayer.ts              # DataLayer push functions
│   └── hooks/
│       └── useGTM.ts                 # React hook for GTM tracking
└── app/
    ├── layout.tsx                    # Includes GTMContainer
    ├── articles/[slug]/page.tsx      # Includes GTMClientTracker
    └── clients/[slug]/page.tsx      # Includes GTMClientTracker
```

### Admin App

```
admin/
├── components/
│   └── gtm/
│       └── GTMContainer.tsx          # Server component - loads GTM script
├── helpers/
│   └── gtm/
│       └── getGTMSettings.ts         # Fetches GTM settings from DB/env
└── app/
    └── layout.tsx                    # Includes GTMContainer
```

### Home App

```
home/
├── components/
│   └── gtm/
│       └── GTMContainer.tsx          # Server component - loads GTM script
├── helpers/
│   └── gtm/
│       └── getGTMSettings.ts         # Uses env variables only
└── app/
    └── layout.tsx                    # Includes GTMContainer
```

## Implementation Details

### 1. GTM Container Component

**Location**: `{app}/components/gtm/GTMContainer.tsx`

**Purpose**: Server component that injects GTM script into the page.

**How it works**:
- Fetches GTM settings from database (Settings model) or environment variable
- Only loads if `gtmEnabled` is true and `gtmContainerId` exists
- Injects GTM script using Next.js Script component
- Includes noscript fallback for users with JavaScript disabled

**Usage**:
```tsx
// In app/layout.tsx
import { GTMContainer } from "@/components/gtm/GTMContainer";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GTMContainer />
        {children}
      </body>
    </html>
  );
}
```

### 2. GTM Settings Helper

**Location**: `{app}/helpers/gtm/getGTMSettings.ts`

**Purpose**: Fetches GTM configuration from database or environment.

**Settings Priority**:
1. Database Settings (`Settings.gtmContainerId` and `Settings.gtmEnabled`)
2. Environment Variable (`NEXT_PUBLIC_GTM_CONTAINER_ID`)
3. Disabled by default if neither exists

**Return Type**:
```typescript
interface GTMSettings {
  containerId: string | null;
  enabled: boolean;
}
```

**Usage**:
```typescript
import { getGTMSettings } from "@/helpers/gtm/getGTMSettings";

const { containerId, enabled } = await getGTMSettings();
```

### 3. Client Context Helper

**Location**: `beta/helpers/gtm/clientContext.ts`

**Purpose**: Extracts client information from URLs or database queries.

**Functions**:

#### `getClientContext(clientId: string)`
Gets client context from client ID.

```typescript
const context = await getClientContext("507f1f77bcf86cd799439011");
// Returns: { client_id, client_slug, client_name } or null
```

#### `extractClientFromArticle(articleSlug: string)`
Extracts client from article slug.

```typescript
const context = await extractClientFromArticle("article-slug");
// Returns: { client_id, client_slug, client_name } or null
```

#### `extractClientFromSlug(clientSlug: string)`
Extracts client from client slug.

```typescript
const context = await extractClientFromSlug("client-slug");
// Returns: { client_id, client_slug, client_name } or null
```

**Return Type**:
```typescript
interface ClientContext {
  client_id: string;
  client_slug: string;
  client_name: string;
}
```

### 4. DataLayer Manager

**Location**: `beta/helpers/gtm/dataLayer.ts`

**Purpose**: Type-safe functions for pushing events to GTM dataLayer.

**Functions**:

#### `pushClientContext(clientData: ClientContextData)`
Pushes client context to dataLayer.

```typescript
pushClientContext({
  client_id: "507f1f77bcf86cd799439011",
  client_slug: "techcorp-solutions",
  client_name: "حلول التقنية المتقدمة"
});
```

#### `pushPageView(data: PageViewData)`
Pushes page view event to dataLayer.

```typescript
pushPageView({
  page_title: "Article Title",
  page_location: window.location.href,
  client_id: "507f1f77bcf86cd799439011",
  article_id: "507f1f77bcf86cd799439012"
});
```

#### `pushCustomEvent(eventName: string, data: CustomEventData)`
Pushes custom event to dataLayer.

```typescript
pushCustomEvent("button_click", {
  button_name: "Subscribe",
  client_id: "507f1f77bcf86cd799439011"
});
```

**Type Definitions**:
```typescript
interface ClientContextData {
  client_id: string;
  client_slug: string;
  client_name: string;
}

interface PageViewData {
  page_title: string;
  page_location: string;
  client_id?: string;
  article_id?: string;
}
```

### 5. GTM Client Tracker Component

**Location**: `beta/components/gtm/GTMClientTracker.tsx`

**Purpose**: Client component that automatically pushes client context and page view on mount.

**Usage**:
```tsx
// In server component (article page)
import { GTMClientTracker } from "@/components/gtm/GTMClientTracker";

export default async function ArticlePage({ params }) {
  const article = await getArticle(params.slug);
  
  return (
    <>
      {article.client && (
        <GTMClientTracker
          clientContext={{
            client_id: article.client.id,
            client_slug: article.client.slug,
            client_name: article.client.name,
          }}
          articleId={article.id}
          pageTitle={article.seoTitle || article.title}
        />
      )}
      {/* Article content */}
    </>
  );
}
```

**Props**:
```typescript
interface GTMClientTrackerProps {
  clientContext: ClientContextData | null;
  articleId?: string;
  pageTitle?: string;
}
```

### 6. useGTM Hook

**Location**: `beta/helpers/hooks/useGTM.ts`

**Purpose**: React hook for client-side components to push GTM events.

**Usage**:
```tsx
"use client";

import { useGTM } from "@/helpers/hooks/useGTM";

export function MyComponent() {
  const clientContext = {
    client_id: "507f1f77bcf86cd799439011",
    client_slug: "techcorp-solutions",
    client_name: "حلول التقنية المتقدمة"
  };
  
  useGTM({
    clientContext,
    articleId: "507f1f77bcf86cd799439012",
    pageTitle: "Article Title"
  });
  
  return <div>Content</div>;
}
```

## DataLayer Structure

### Initial dataLayer

GTM script automatically initializes:
```javascript
window.dataLayer = [
  {
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  },
];
```

### Client Context Event

```javascript
window.dataLayer.push({
  event: 'client_context',
  client_id: '507f1f77bcf86cd799439011',
  client_slug: 'techcorp-solutions',
  client_name: 'حلول التقنية المتقدمة',
});
```

### Page View Event

```javascript
window.dataLayer.push({
  event: 'page_view',
  page_title: 'Article Title',
  page_location: 'https://example.com/articles/article-slug',
  client_id: '507f1f77bcf86cd799439011',
  article_id: '507f1f77bcf86cd799439012',
});
```

### Custom Event Example

```javascript
window.dataLayer.push({
  event: 'newsletter_signup',
  client_id: '507f1f77bcf86cd799439011',
  form_location: 'article_footer',
});
```

## Integration Points

### Article Pages

**File**: `beta/app/articles/[slug]/page.tsx`

```tsx
import { GTMClientTracker } from "@/components/gtm/GTMClientTracker";

export default async function ArticlePage({ params }) {
  const article = await getArticle(params.slug);
  
  return (
    <>
      {article.client && (
        <GTMClientTracker
          clientContext={{
            client_id: article.client.id,
            client_slug: article.client.slug,
            client_name: article.client.name,
          }}
          articleId={article.id}
          pageTitle={article.seoTitle || article.title}
        />
      )}
      {/* Article content */}
    </>
  );
}
```

### Client Pages

**File**: `beta/app/clients/[slug]/page.tsx`

```tsx
import { GTMClientTracker } from "@/components/gtm/GTMClientTracker";

export default async function ClientPage({ params }) {
  const client = await getClient(params.slug);
  
  return (
    <>
      <GTMClientTracker
        clientContext={{
          client_id: client.id,
          client_slug: client.slug,
          client_name: client.name,
        }}
        pageTitle={client.seoTitle || client.name}
      />
      {/* Client content */}
    </>
  );
}
```

## Environment Variables

### Required (Optional - falls back to database)

```env
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX
```

**Note**: If not set, the system will use `Settings.gtmContainerId` from the database.

## Database Schema

### Settings Model

```prisma
model Settings {
  // ... other fields
  gtmContainerId String?
  gtmEnabled      Boolean @default(false)
}
```

### Analytics Model

```prisma
model Analytics {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  articleId String  @db.ObjectId
  clientId  String? @db.ObjectId  // Used for client-level queries
  
  // ... tracking fields
  
  @@index([articleId, timestamp])  // Fast article queries
  @@index([clientId, timestamp])   // Fast client queries
}
```

## Querying Analytics

### Whole Client Analytics

```typescript
// Get all analytics for a client
const clientAnalytics = await db.analytics.findMany({
  where: { clientId: "507f1f77bcf86cd799439011" },
  include: { article: true },
  orderBy: { timestamp: "desc" },
});

// Get total views for client
const totalViews = await db.analytics.count({
  where: { clientId: "507f1f77bcf86cd799439011" },
});
```

### Single Article Analytics

```typescript
// Get all analytics for an article
const articleAnalytics = await db.analytics.findMany({
  where: { articleId: "507f1f77bcf86cd799439012" },
  orderBy: { timestamp: "desc" },
});

// Get total views for article
const totalViews = await db.analytics.count({
  where: { articleId: "507f1f77bcf86cd799439012" },
});
```

## Testing

### 1. Verify GTM Script Loads

Open browser DevTools → Network tab → Filter by "gtm.js"
- Should see request to `https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX`

### 2. Check dataLayer

Open browser console:
```javascript
console.log(window.dataLayer);
```

Should see:
- Initial GTM event
- `client_context` event (if client detected)
- `page_view` event

### 3. GTM Preview Mode

1. Go to Google Tag Manager
2. Click "Preview"
3. Enter your website URL
4. Verify events appear with correct `client_id` and `article_id`

### 4. GA4 Real-Time Reports

1. Go to Google Analytics 4
2. Navigate to Reports → Real-time
3. Visit a page on your site
4. Verify events appear with custom dimensions

## Troubleshooting

### GTM Script Not Loading

**Check**:
1. `Settings.gtmEnabled` is `true` in database
2. `Settings.gtmContainerId` or `NEXT_PUBLIC_GTM_CONTAINER_ID` is set
3. No JavaScript errors in console
4. Network tab shows GTM script request

### Client Context Not Pushing

**Check**:
1. Client exists in database
2. Article has `clientId` field populated
3. `GTMClientTracker` component is included in page
4. Browser console shows `client_context` event in dataLayer

### Events Not Reaching GA4

**Check**:
1. GTM container is published
2. GA4 tag is configured in GTM
3. Custom dimensions are set up in GA4
4. Triggers are firing in GTM preview mode

## Best Practices

1. **Always include client_id**: Every event should include `client_id` if available
2. **Use type-safe functions**: Always use `pushClientContext`, `pushPageView`, `pushCustomEvent`
3. **Server-side client detection**: Extract client on server side when possible
4. **Error handling**: Wrap GTM calls in try-catch for production safety
5. **Performance**: GTM script loads asynchronously, doesn't block page render

## API Reference

### getGTMSettings()

```typescript
async function getGTMSettings(): Promise<GTMSettings>
```

Returns GTM settings from database or environment.

### pushClientContext()

```typescript
function pushClientContext(clientData: ClientContextData): void
```

Pushes client context to dataLayer.

### pushPageView()

```typescript
function pushPageView(data: PageViewData): void
```

Pushes page view event to dataLayer.

### pushCustomEvent()

```typescript
function pushCustomEvent(eventName: string, data?: CustomEventData): void
```

Pushes custom event to dataLayer.

## Support

For issues or questions:
1. Check browser console for errors
2. Verify GTM preview mode
3. Check database Settings model
4. Review this documentation
