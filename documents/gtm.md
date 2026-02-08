#

GTM Multi-Client Implementation Plan

## Overview

Implement a single GTM container that tracks all clients by pushing client context to the dataLayer based on URL patterns. Use GA4 custom dimensions for client segmentation in analytics.

## Architecture

```javascript
URL Pattern → Extract Client → Push to dataLayer → GTM → GA4 (with client dimension)
```

### Data Flow

1. User visits page (e.g., `/articles/{slug}` or `/clients/{slug}`)

2. Client utility extracts client info from URL

3. Client data pushed to `dataLayer`

4. GTM reads dataLayer and sends to GA4 with client custom dimension

5. Server action tracks to database with clientId

## Implementation Steps

### 1. GTM Container Component

**File:** `components/gtm/GTMContainer.tsx`

- Load GTM script with container ID from env

- Initialize dataLayer

- Handle Next.js route changes (push client data on navigation)

**Key Features:**

- Server-side GTM script injection

- Client-side dataLayer management

- Route change detection

### 2. Client Context Utility

**File:** `helpers/gtm/clientContext.ts`

- Extract client from URL patterns:

- `/articles/{slug}` → Lookup article → Get clientId

- `/clients/{slug}` → Use slug directly

- Home page → No client (or default)

- Return client data structure:

  ```typescript
  {
    clientId: string;
    clientSlug: string;
    clientName: string;
  }
  ```

### 3. DataLayer Manager

**File:** `helpers/gtm/dataLayer.ts`

- `pushClientContext(clientData)` - Push client info to dataLayer

- `pushPageView(data)` - Push page view event

- `pushCustomEvent(eventName, data)` - Push custom events

- Type-safe dataLayer interface

### 4. GTM Hook for Client Components

**File:** `hooks/useGTM.ts`

- React hook to push client context on mount

- Auto-detect client from current route

- Push to dataLayer when client changes

### 5. Server Action for Analytics Tracking

**File:** `actions/analytics.ts`

- `trackPageView(articleId, clientId, analyticsData)`

- Store in `Analytics` model with clientId

- Integrate with existing Analytics schema

### 6. Page-Level Integration

**Files to Update:**

- `app/layout.tsx` - Add GTMContainer

- `app/articles/[slug]/page.tsx` - Push client context on article page

- `app/clients/[slug]/page.tsx` - Push client context on client page

### 7. Environment Configuration

**File:** `.env.local`

```env
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 8. GTM Setup Documentation

**File:** `GTM_SETUP_GUIDE.md`

- Instructions for setting up GTM container

- GA4 custom dimension configuration (client_id, client_slug, client_name)

- Trigger setup for page views

- Testing instructions

## Technical Details

### DataLayer Structure

```typescript
// Initial dataLayer
window.dataLayer = [
  {
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  },
];

// Client context push
window.dataLayer.push({
  event: 'client_context',
  client_id: '507f1f77bcf86cd799439011',
  client_slug: 'techcorp-solutions',
  client_name: 'حلول التقنية المتقدمة',
});

// Page view push
window.dataLayer.push({
  event: 'page_view',
  page_title: 'Article Title',
  page_location: window.location.href,
  client_id: '...',
  article_id: '...',
});
```

### GA4 Custom Dimensions

Configure in GA4:

- `client_id` (Custom Dimension 1) - Client ObjectId

- `client_slug` (Custom Dimension 2) - Client slug

- `client_name` (Custom Dimension 3) - Client name

### URL Pattern Matching

```typescript
// Extract client from URL
/articles/{slug} → Query Article by slug → Get clientId
/clients/{slug} → Use slug as clientSlug
/ → No client (or platform-level tracking)
```

## Files to Create

1. `components/gtm/GTMContainer.tsx` - GTM script loader

2. `helpers/gtm/clientContext.ts` - Client extraction utility

3. `helpers/gtm/dataLayer.ts` - DataLayer management

4. `hooks/useGTM.ts` - React hook for GTM

5. `actions/analytics.ts` - Server actions for tracking

6. `GTM_SETUP_GUIDE.md` - Setup documentation

## Files to Modify

1. `app/layout.tsx` - Add GTMContainer

2. `app/articles/[slug]/page.tsx` - Add client context push

3. `app/clients/[slug]/page.tsx` - Add client context push

4. `.env.local` - Add GTM container ID

## Testing Strategy

1. Test dataLayer pushes in browser console

2. Verify GTM preview mode shows client data

3. Confirm GA4 receives events with custom dimensions

4. Test route changes (Next.js navigation)

5. Verify database tracking includes clientId

## Benefits

- Single GTM container for all clients

- Client segmentation in GA4 via custom dimensions

- Centralized tracking management

- Easy to add more tags (Facebook Pixel, etc.)
