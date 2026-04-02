# Google Tag Manager (GTM) Multi-Client Setup Guide

## Overview

GTM for tracking analytics across all clients using one container. Each client identified by unique `client_id` in dataLayer.

## How It Works

- **One GTM Container**: Single main GTM container for all clients
- **Client Identification**: Each client tracked by unique `client_id`
- **Automatic Tracking**: System detects which client and tracks accordingly

```
Visitor Views Page → System Detects Client → Data Sent to GTM → GA4
```

## Setting Up GTM

### Step 1: Get GTM Container ID

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Create new container or select existing one
3. Copy Container ID (format: `GTM-XXXXXXX`)

### Step 2: Configure in Admin Dashboard

1. Log in to Admin Dashboard
2. Navigate to **Settings** → **GTM Settings**
3. Enter GTM Container ID
4. Toggle **Enable GTM** to ON
5. Click **Save**

**Alternative**: Set `NEXT_PUBLIC_GTM_CONTAINER_ID` in environment config.

### Step 3: Verify Setup

1. Visit any article or client page
2. Open DevTools (F12)
3. Go to Console tab
4. Type: `window.dataLayer`
5. Should see events with `client_id` and `article_id`

## What Gets Tracked

### Automatic Tracking

1. **Page Views**: Every article/client page visit
   - Includes: page title, URL, client ID, article ID

2. **Client Context**: Which client visitor is viewing
   - Client ID, slug, and name

3. **Article Views**: Specific article visits
   - Links article to its client

### Data Sent to GTM

- `client_id`: Unique identifier (e.g., `507f1f77bcf86cd799439011`)
- `client_slug`: URL-friendly identifier (e.g., `techcorp-solutions`)
- `client_name`: Display name (e.g., `حلول التقنية المتقدمة`)
- `article_id`: Article identifier (if viewing article)
- `page_title`: Page title
- `page_location`: Full page URL

## Setting Up Google Analytics 4 (GA4)

### Step 1: Create Custom Dimensions in GA4

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select GA4 property
3. Go to **Admin** → **Custom Definitions** → **Custom Dimensions**
4. Click **Create Custom Dimension**

**Create three dimensions**:

| Dimension | Name | Scope | Parameter |
|-----------|------|-------|-----------|
| 1 | Client ID | Event | client_id |
| 2 | Client Slug | Event | client_slug |
| 3 | Client Name | Event | client_name |

### Step 2: Configure GTM Tag

1. In GTM, go to **Tags**
2. Create new tag or edit GA4 tag
3. Under **Fields to Set**, add:
   - `client_id`: `{{client_id}}`
   - `client_slug`: `{{client_slug}}`
   - `client_name`: `{{client_name}}`
4. Under **Custom Dimensions**, map:
   - Dimension 1: `{{client_id}}`
   - Dimension 2: `{{client_slug}}`
   - Dimension 3: `{{client_name}}`

### Step 3: Create Variables in GTM

1. Go to **Variables** in GTM
2. Click **New** under User-Defined Variables
3. Create these variables:

| Variable | Type | Data Layer Name |
|----------|------|-----------------|
| client_id | Data Layer Variable | client_id |
| client_slug | Data Layer Variable | client_slug |
| client_name | Data Layer Variable | client_name |

### Step 4: Create Trigger

1. Go to **Triggers** in GTM
2. Click **New**
3. Trigger Type: **Custom Event**
4. Event name: `page_view` or `client_context`
5. Save

### Step 5: Publish Container

1. Click **Submit** in GTM
2. Add version name and description
3. Click **Publish**

## Analyzing Data

### In Google Analytics 4

**View Client Performance**:
1. Go to **Reports** → **Events**
2. Add secondary dimension: **Client Name** or **Client ID**
3. Filter by specific client

**Create Custom Report**:
1. Go to **Explore** → **Free Form**
2. Add dimensions: **Client Name**, **Page Title**
3. Add metrics: **Event Count**, **Users**
4. Filter by `client_id`

### In Google Tag Manager

**Preview Mode**:
1. Click **Preview**
2. Enter website URL
3. Navigate pages
4. See real-time dataLayer events

**Debug View**:
1. In GTM, go to **Debug** (after preview)
2. See all firing events
3. Verify `client_id` and `article_id`

## Use Cases

### Track Individual Client Performance

Filter by Client Name = "Client A" in GA4 → Reports → Events

### Compare Client Performance

Create custom report grouped by Client Name

### Track Specific Article

Filter by Page Title = "Article X" in GA4

### Client-Level Analytics Dashboard

Filter by Client ID = "specific_id" in GA4

## Common Scenarios

### New Client Onboarding

1. Client added to system (gets unique `client_id`)
2. GTM automatically tracks when visitors view their articles
3. No additional GTM configuration needed
4. Data appears in GA4 with client dimensions

### Adding Client-Specific Tags

**Example**: Facebook Pixel for specific client

1. In GTM, create new tag (Facebook Pixel)
2. Create trigger: Custom Event
3. Condition: `client_id` equals specific client ID
4. Publish container
5. Only that client's pages fire Facebook Pixel

### Client-Specific Goals

**Example**: Newsletter signups per client

1. Technical team adds custom event: `newsletter_signup` with `client_id`
2. In GTM, create conversion tag
3. Trigger on `newsletter_signup` event
4. Filter by `client_id` in GA4

## Troubleshooting

### GTM Not Loading

**Check**:
1. GTM Container ID is correct in Admin Settings
2. "Enable GTM" is toggled ON
3. No ad blockers preventing GTM
4. Browser console for errors

### Client Data Not Appearing

**Check**:
1. Visit page with client (article or client page)
2. Open console: `window.dataLayer`
3. Look for `client_context` event
4. Verify `client_id` is present

### GA4 Not Receiving Data

**Check**:
1. GTM container is published
2. GA4 tag is configured correctly
3. Custom dimensions are set up in GA4
4. Triggers are firing (check GTM Preview mode)
5. GA4 Measurement ID is correct

### Wrong Client ID in Reports

**Check**:
1. Verify client exists in database
2. Article has correct `clientId` field
3. Clear browser cache and test again
4. Check GTM Preview mode for actual dataLayer values

## Best Practices

1. **Regular Monitoring**: Check GA4 Real-Time reports daily
2. **Testing**: Always use GTM Preview mode before publishing
3. **Documentation**: Track which clients have special tracking needs
4. **Performance**: GTM loads asynchronously (doesn't slow site)

## FAQ

**Q: Do I need separate GTM containers for each client?**
A: No. One container with client identification via `client_id`.

**Q: Can clients see their own analytics?**
A: Yes, if you set up client-specific GA4 views filtered by `client_id`.

**Q: What if a page doesn't have a client?**
A: Pages without clients still track, but without `client_id` (platform-level).

**Q: Can I add custom tracking for specific clients?**
A: Yes. Create tags with triggers checking for specific `client_id`.

**Q: How do I track conversions per client?**
A: Set up conversion events with `client_id`, then filter by client in GA4.

**Q: What's the difference between client_id and client_slug?**
A:
- `client_id`: Unique database identifier (e.g., `507f1f77bcf86cd799439011`)
- `client_slug`: URL-friendly identifier (e.g., `techcorp-solutions`)

## Getting Help

**Technical Issues**:
- Screenshot of browser console (`window.dataLayer`)
- GTM Container ID
- Specific page URL where issue occurs

**References**:
- [Google Tag Manager Help](https://support.google.com/tagmanager)
- [GA4 Custom Dimensions](https://support.google.com/analytics/answer/10075209)
