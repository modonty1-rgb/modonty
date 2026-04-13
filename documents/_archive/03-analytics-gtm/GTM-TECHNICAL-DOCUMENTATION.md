# GTM Multi-Client Implementation - Technical Documentation

## System Flow

```
User Visits Page → Extract Client from URL → Push to dataLayer → GTM Container → GA4/Other Tags
```

## File Structure

### Beta App

```
beta/
├── components/gtm/
│   ├── GTMContainer.tsx          # Loads GTM script
│   └── GTMClientTracker.tsx      # Pushes client context
├── helpers/
│   ├── gtm/
│   │   ├── getGTMSettings.ts     # Fetches GTM settings
│   │   ├── clientContext.ts      # Client extraction
│   │   └── dataLayer.ts          # DataLayer push functions
│   └── hooks/
│       └── useGTM.ts             # React hook
└── app/
    ├── layout.tsx
    ├── articles/[slug]/page.tsx
    └── clients/[slug]/page.tsx
```

### Admin App

```
admin/
├── components/gtm/
│   └── GTMContainer.tsx
├── helpers/gtm/
│   └── getGTMSettings.ts
└── app/layout.tsx
```

### Home App

```
home/
├── components/gtm/
│   └── GTMContainer.tsx
├── helpers/gtm/
│   └── getGTMSettings.ts
└── app/layout.tsx
```

## Key Components

### 1. GTMContainer Component

**Location**: `{app}/components/gtm/GTMContainer.tsx`

Server component that injects GTM script. Fetches settings from database or environment variable.

**Usage**:
```tsx
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

**Priority**:
1. Database Settings (`Settings.gtmContainerId` and `Settings.gtmEnabled`)
2. Environment Variable (`NEXT_PUBLIC_GTM_CONTAINER_ID`)
3. Disabled by default

**Return Type**:
```typescript
interface GTMSettings {
  containerId: string | null;
  enabled: boolean;
}
```

**Usage**:
```typescript
const { containerId, enabled } = await getGTMSettings();
```

### 3. Client Context Helper

**Location**: `beta/helpers/gtm/clientContext.ts`

**Functions**:

```typescript
// Get client context by ID
const context = await getClientContext("507f1f77bcf86cd799439011");

// Extract client from article slug
const context = await extractClientFromArticle("article-slug");

// Extract client from client slug
const context = await extractClientFromSlug("client-slug");
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

**Functions**:

```typescript
pushClientContext({
  client_id: "507f1f77bcf86cd799439011",
  client_slug: "techcorp-solutions",
  client_name: "حلول التقنية المتقدمة"
});

pushPageView({
  page_title: "Article Title",
  page_location: window.location.href,
  client_id: "507f1f77bcf86cd799439011",
  article_id: "507f1f77bcf86cd799439012"
});

pushCustomEvent("button_click", {
  button_name: "Subscribe",
  client_id: "507f1f77bcf86cd799439011"
});
```

### 5. GTM Client Tracker Component

**Location**: `beta/components/gtm/GTMClientTracker.tsx`

Client component that pushes client context and page view on mount.

**Usage**:
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

### 6. useGTM Hook

**Location**: `beta/helpers/hooks/useGTM.ts`

React hook for client-side components.

**Usage**:
```tsx
"use client";

import { useGTM } from "@/helpers/hooks/useGTM";

export function MyComponent() {
  useGTM({
    clientContext: {
      client_id: "507f1f77bcf86cd799439011",
      client_slug: "techcorp-solutions",
      client_name: "حلول التقنية المتقدمة"
    },
    articleId: "507f1f77bcf86cd799439012",
    pageTitle: "Article Title"
  });

  return <div>Content</div>;
}
```

## DataLayer Structure

### Initial dataLayer

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

```tsx
// beta/app/articles/[slug]/page.tsx
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

```tsx
// beta/app/clients/[slug]/page.tsx
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

```env
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX
```

If not set, uses `Settings.gtmContainerId` from database.

## Database Schema

```prisma
model Settings {
  gtmContainerId String?
  gtmEnabled      Boolean @default(false)
}

model Analytics {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  articleId String  @db.ObjectId
  clientId  String? @db.ObjectId

  @@index([articleId, timestamp])
  @@index([clientId, timestamp])
}
```

## Querying Analytics

```typescript
// All analytics for a client
const clientAnalytics = await db.analytics.findMany({
  where: { clientId: "507f1f77bcf86cd799439011" },
  include: { article: true },
  orderBy: { timestamp: "desc" },
});

// Total views for client
const totalViews = await db.analytics.count({
  where: { clientId: "507f1f77bcf86cd799439011" },
});

// All analytics for an article
const articleAnalytics = await db.analytics.findMany({
  where: { articleId: "507f1f77bcf86cd799439012" },
  orderBy: { timestamp: "desc" },
});

// Total views for article
const totalViews = await db.analytics.count({
  where: { articleId: "507f1f77bcf86cd799439012" },
});
```

## Testing

### 1. Verify GTM Script Loads

Open DevTools → Network tab → Filter by "gtm.js"

Should see: `https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX`

### 2. Check dataLayer

Open console:
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
3. Enter website URL
4. Verify events appear with correct `client_id` and `article_id`

### 4. GA4 Real-Time Reports

1. Go to Google Analytics 4
2. Navigate to Reports → Real-time
3. Visit a page on your site
4. Verify events appear with custom dimensions

## Troubleshooting

### GTM Script Not Loading

**Check**:
1. `Settings.gtmEnabled` is `true`
2. `Settings.gtmContainerId` or `NEXT_PUBLIC_GTM_CONTAINER_ID` is set
3. No JavaScript errors in console
4. Network tab shows GTM script request

### Client Context Not Pushing

**Check**:
1. Client exists in database
2. Article has `clientId` field populated
3. `GTMClientTracker` component is included
4. Browser console shows `client_context` event

### Events Not Reaching GA4

**Check**:
1. GTM container is published
2. GA4 tag is configured in GTM
3. Custom dimensions are set up in GA4
4. Triggers are firing in GTM preview mode

## Best Practices

1. Always include `client_id` in every event if available
2. Use type-safe functions: `pushClientContext`, `pushPageView`, `pushCustomEvent`
3. Extract client on server side when possible
4. Wrap GTM calls in try-catch for production safety
5. GTM script loads asynchronously (doesn't block page render)

## API Reference

```typescript
async function getGTMSettings(): Promise<GTMSettings>

function pushClientContext(clientData: ClientContextData): void

function pushPageView(data: PageViewData): void

function pushCustomEvent(eventName: string, data?: CustomEventData): void
```
