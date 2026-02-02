# Client Detail Page Components

This folder contains route-specific components for the client detail page, following the enhanced UI/UX design inspired by LinkedIn company pages and Medium publications.

## Components Overview

### 1. `client-hero.tsx`
The hero section component featuring:
- Cover image (1536×768px recommended)
- Circular logo overlay
- Company name with verification badge
- Primary CTA buttons (Visit Website, Follow)
- Stats bar (followers, articles, views)
- Social media links (LinkedIn, Twitter, Facebook)

**Props:**
- `client`: Client object with logo, cover image, name, social links
- `stats`: { followers, articles, totalViews }

### 2. `client-about.tsx`
Enhanced about section displaying:
- Company description
- Industry information
- Founding date
- Company size (number of employees)
- Location (city, region, country)
- Legal form
- Commercial registration number

**Props:**
- `client`: Client object with all business information

### 3. `client-contact.tsx`
Contact information card with:
- Website link
- Email (with copy-to-clipboard)
- Phone number (with copy-to-clipboard)

**Props:**
- `client`: Client object with contact information

### 4. `related-clients.tsx`
Displays similar clients based on industry:
- Grid of related client cards
- Logo, name, and article count
- Links to client pages
- Hover effects

**Props:**
- `clients`: Array of related client objects

### 5. `share-client-button.tsx`
Social sharing dropdown menu:
- Facebook, Twitter, LinkedIn sharing
- Email sharing
- Copy link to clipboard
- Share confirmation

**Props:**
- `clientName`: Name of the client for share text
- `clientUrl`: URL to share

### 6. `article-list.tsx`
Articles grid with filtering:
- Sort by newest, oldest, or alphabetically
- Responsive grid layout
- Hover effects and animations
- Empty state handling

**Props:**
- `articles`: Array of article objects
- `clientName`: Client name for empty state

## Helpers

### `client-stats.ts`
Helper functions for fetching client statistics:
- `getClientStats(clientId)`: Returns followers and total views
- `getRelatedClients(clientId, industryId, limit)`: Returns related clients

## Design Features

### Responsive Design
- Mobile-first approach
- Breakpoints: mobile (< 768px), tablet (768px), desktop (1024px+)
- Grid layouts that adapt to screen size
- Mobile-specific CTA button placement

### Accessibility
- ARIA labels on icons and buttons
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- Alt text on all images

### Performance
- Next.js Image optimization for cover photos
- Lazy loading for below-fold content
- Optimized database queries with Promise.all
- Efficient component re-rendering

### Micro-interactions
- Hover scale effects on cards (1.02×)
- Image zoom on hover (1.05×)
- Smooth transitions (300ms duration)
- Button ripple effects
- Copy confirmation feedback

## Usage Example

```tsx
import { ClientHero } from "./components/client-hero";
import { ClientAbout } from "./components/client-about";
import { ArticleList } from "./components/article-list";
import { getClientStats } from "./helpers/client-stats";

// In your page component
const stats = await getClientStats(client.id);

<ClientHero client={client} stats={stats} />
<ClientAbout client={client} />
<ArticleList articles={client.articles} clientName={client.name} />
```

## Industry Standards Applied

Based on LinkedIn 2026 company page standards and Medium publication design:
- Hero section with branded imagery
- Follow/engagement buttons prominently displayed
- Stats row for social proof
- Tabbed navigation for content organization
- Related items for discovery
- Professional, clean design aesthetic
- Trust indicators (verification badges)

## Future Enhancements

Potential improvements:
- Full follow/unfollow backend implementation
- Real-time follower count updates
- Advanced article filtering (by category, date range)
- Contact form in About tab
- Map integration for company location
- Testimonials/reviews section
- Activity timeline
- Employee directory (if applicable)
