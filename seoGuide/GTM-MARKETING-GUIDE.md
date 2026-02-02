# Google Tag Manager (GTM) Multi-Client Setup Guide
## Marketing Manager Documentation

## Overview

This guide explains how to set up and use Google Tag Manager (GTM) for tracking analytics across all clients on the Modonty platform. With this system, you can track individual client performance and article analytics using a single GTM container.

## What is GTM?

Google Tag Manager is a tool that allows you to manage and deploy marketing tags (tracking codes) on your website without modifying the code. Think of it as a control center for all your analytics and marketing tools.

## How It Works

### Single Container, Multiple Clients

- **One GTM Container**: The platform uses one main GTM container for all clients
- **Client Identification**: Each client's data is identified by their unique `client_id`
- **Automatic Tracking**: The system automatically detects which client a visitor is viewing and tracks accordingly

### Data Flow

```
Visitor Views Page → System Detects Client → Data Sent to GTM → Analytics Tools (GA4, etc.)
```

## Setting Up GTM

### Step 1: Get Your GTM Container ID

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Create a new container or select an existing one
3. Copy your Container ID (format: `GTM-XXXXXXX`)

### Step 2: Configure in Admin Dashboard

1. Log in to the Admin Dashboard
2. Navigate to **Settings** → **GTM Settings**
3. Enter your GTM Container ID (e.g., `GTM-XXXXXXX`)
4. Toggle **Enable GTM** to ON
5. Click **Save**

**Alternative**: If you prefer using environment variables, contact your technical team to set `NEXT_PUBLIC_GTM_CONTAINER_ID` in the environment configuration.

### Step 3: Verify Setup

1. Visit any article or client page on your website
2. Open browser DevTools (F12)
3. Go to Console tab
4. Type: `window.dataLayer`
5. You should see events with `client_id` and `article_id` fields

## What Gets Tracked

### Automatic Tracking

The system automatically tracks:

1. **Page Views**
   - Every time someone visits an article or client page
   - Includes: page title, URL, client ID, article ID (if applicable)

2. **Client Context**
   - Which client the visitor is viewing
   - Client ID, slug, and name

3. **Article Views**
   - When someone views a specific article
   - Links article to its client

### Data Sent to GTM

Every page view includes:
- `client_id`: Unique identifier for the client (e.g., `507f1f77bcf86cd799439011`)
- `client_slug`: URL-friendly client identifier (e.g., `techcorp-solutions`)
- `client_name`: Client's display name (e.g., `حلول التقنية المتقدمة`)
- `article_id`: Article identifier (if viewing an article)
- `page_title`: Title of the page
- `page_location`: Full URL of the page

## Setting Up Google Analytics 4 (GA4)

### Step 1: Create Custom Dimensions in GA4

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your GA4 property
3. Go to **Admin** → **Custom Definitions** → **Custom Dimensions**
4. Click **Create Custom Dimension**

Create these three dimensions:

**Dimension 1: Client ID**
- Dimension name: `Client ID`
- Scope: Event
- Event parameter: `client_id`
- Description: "Unique identifier for each client"

**Dimension 2: Client Slug**
- Dimension name: `Client Slug`
- Scope: Event
- Event parameter: `client_slug`
- Description: "URL-friendly client identifier"

**Dimension 3: Client Name**
- Dimension name: `Client Name`
- Scope: Event
- Event parameter: `client_name`
- Description: "Display name of the client"

### Step 2: Configure GTM Tag

1. In Google Tag Manager, go to **Tags**
2. Create a new tag or edit existing GA4 Configuration tag
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

**Variable: client_id**
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `client_id`
- Data Layer Version: Version 2

**Variable: client_slug**
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `client_slug`
- Data Layer Version: Version 2

**Variable: client_name**
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `client_name`
- Data Layer Version: Version 2

### Step 4: Create Trigger

1. Go to **Triggers** in GTM
2. Click **New**
3. Trigger Type: **Custom Event**
4. Event name: `page_view` or `client_context`
5. This trigger fires on: All Custom Events
6. Save

### Step 5: Publish Container

1. Click **Submit** in GTM
2. Add version name and description
3. Click **Publish**

## Analyzing Data

### In Google Analytics 4

#### View Client Performance

1. Go to **Reports** → **Events**
2. Add secondary dimension: **Client Name** or **Client ID**
3. Filter by specific client to see their article performance

#### Create Custom Report

1. Go to **Explore** → **Free Form**
2. Add dimensions: **Client Name**, **Page Title**
3. Add metrics: **Event Count**, **Users**
4. Filter by `client_id` to see specific client data

### In Google Tag Manager

#### Preview Mode

1. Click **Preview** in GTM
2. Enter your website URL
3. Navigate through pages
4. See real-time dataLayer events with client information

#### Debug View

1. In GTM, go to **Debug** (after preview)
2. See all events firing
3. Verify `client_id` and `article_id` are present

## Use Cases

### 1. Track Individual Client Performance

**Question**: "How many views did Client A's articles get this month?"

**Answer**: 
- Go to GA4 → Reports → Events
- Filter by Client Name = "Client A"
- View event count and users

### 2. Compare Client Performance

**Question**: "Which client's articles perform best?"

**Answer**:
- Create custom report in GA4
- Group by Client Name
- Compare metrics: views, users, engagement

### 3. Track Specific Article Performance

**Question**: "How is Article X performing?"

**Answer**:
- Filter by Page Title = "Article X"
- View metrics: views, users, time on page
- See which client it belongs to via Client Name dimension

### 4. Client-Level Analytics Dashboard

**Question**: "Show me all analytics for Client B"

**Answer**:
- Create custom report
- Filter by Client ID or Client Name = "Client B"
- View all their articles' performance together

## Common Scenarios

### Scenario 1: New Client Onboarding

**Steps**:
1. Client is added to the system (gets unique `client_id`)
2. GTM automatically starts tracking when visitors view their articles
3. No additional GTM configuration needed
4. Data appears in GA4 with client dimensions

### Scenario 2: Adding New Tracking Tags

**Example**: Adding Facebook Pixel for a specific client

**Steps**:
1. In GTM, create new tag (Facebook Pixel)
2. Create trigger: Custom Event
3. Condition: `client_id` equals specific client ID
4. Publish container
5. Only that client's pages will fire Facebook Pixel

### Scenario 3: Client-Specific Goals

**Example**: Track newsletter signups per client

**Steps**:
1. Technical team adds custom event: `newsletter_signup` with `client_id`
2. In GTM, create conversion tag
3. Trigger on `newsletter_signup` event
4. Filter by `client_id` in GA4 to see per-client conversions

## Troubleshooting

### GTM Not Loading

**Check**:
1. GTM Container ID is correct in Admin Settings
2. "Enable GTM" is toggled ON
3. No ad blockers preventing GTM script
4. Check browser console for errors

### Client Data Not Appearing

**Check**:
1. Visit a page with a client (article or client page)
2. Open browser console: `window.dataLayer`
3. Look for `client_context` event
4. Verify `client_id` is present

### GA4 Not Receiving Data

**Check**:
1. GTM container is published
2. GA4 tag is configured correctly
3. Custom dimensions are set up in GA4
4. Triggers are firing (check GTM Preview mode)
5. GA4 Measurement ID is correct in GTM tag

### Wrong Client ID in Reports

**Check**:
1. Verify client exists in database
2. Article has correct `clientId` field
3. Clear browser cache and test again
4. Check GTM Preview mode to see actual dataLayer values

## Best Practices

### 1. Regular Monitoring

- Check GA4 Real-Time reports daily
- Verify client dimensions are populating correctly
- Monitor for any tracking gaps

### 2. Testing Before Publishing

- Always use GTM Preview mode before publishing
- Test on staging environment first
- Verify client_id appears in all events

### 3. Documentation

- Keep track of which clients have special tracking needs
- Document any custom events or tags
- Maintain list of client IDs for reference

### 4. Performance

- GTM loads asynchronously (doesn't slow down site)
- Only one container loads (efficient)
- Client detection happens automatically

## FAQ

### Q: Do I need separate GTM containers for each client?

**A**: No. The system uses one container with client identification. Each client's data is separated using `client_id` in the dataLayer.

### Q: Can clients see their own analytics?

**A**: Yes, if you set up client-specific GA4 views or reports filtered by their `client_id`.

### Q: What if a page doesn't have a client?

**A**: Pages without clients (like home page) still track, but without `client_id`. This is platform-level tracking.

### Q: Can I add custom tracking for specific clients?

**A**: Yes. In GTM, create tags with triggers that check for specific `client_id` values.

### Q: How do I track conversions per client?

**A**: Set up conversion events in GTM that include `client_id`, then filter by client in GA4 reports.

### Q: What's the difference between client_id and client_slug?

**A**: 
- `client_id`: Unique database identifier (e.g., `507f1f77bcf86cd799439011`)
- `client_slug`: URL-friendly identifier (e.g., `techcorp-solutions`)
- Use `client_id` for filtering/segmentation
- Use `client_slug` for human-readable reports

## Getting Help

### Technical Issues

Contact your development team with:
- Screenshot of browser console (`window.dataLayer`)
- GTM Container ID
- Specific page URL where issue occurs
- Expected vs. actual behavior

### GTM Configuration Help

- [Google Tag Manager Help Center](https://support.google.com/tagmanager)
- [GTM Community Forum](https://support.google.com/tagmanager/community)

### GA4 Help

- [Google Analytics Help Center](https://support.google.com/analytics)
- [GA4 Custom Dimensions Guide](https://support.google.com/analytics/answer/10075209)

## Summary

✅ **One GTM Container** manages all clients  
✅ **Automatic Client Detection** - no manual configuration needed  
✅ **Complete Analytics Coverage** - track whole clients or individual articles  
✅ **Easy Setup** - just add GTM Container ID in Admin Settings  
✅ **Flexible** - add custom tags per client if needed  

The system is designed to be simple for marketing teams while providing powerful analytics capabilities for all clients.
