# Client Detail Page - Quick Start Guide

## What Was Built

World-class client detail page with:
- Hero section (cover photo, logo, stats, CTAs)
- Tabbed navigation (Overview, Articles, About)
- Enhanced company information
- Social media integration
- Share functionality
- Related clients recommendations
- Article filtering and sorting

## How to Test

### 1. Start Development Server

```bash
cd modonty
pnpm dev
```

### 2. Visit a Client Page

Navigate to: `http://localhost:3000/clients/[client-slug]`

Example: `http://localhost:3000/clients/client-1-%D8%A8%D8%B1%D9%85%D8%AC%D9%8A%D8%A9-%D8%AC%D8%AF%D8%A9-1768750183959-0`

### 3. Test Features

**Hero Section**:
- ✓ Cover image displays
- ✓ Logo appears correctly
- ✓ "Visit Website" button (if URL exists)
- ✓ Stats: followers, articles, views
- ✓ Social media icons (if sameAs URLs exist)

**Tabs**:
- ✓ "نظرة عامة" (Overview) - about + contact + featured articles
- ✓ "المقالات" (Articles) - all articles with sort dropdown
- ✓ "معلومات" (About) - company details

**Share Button**:
- ✓ Share to Facebook, Twitter, LinkedIn
- ✓ Copy link functionality

**Article Sorting**:
- ✓ "الأحدث أولاً" (Newest first)
- ✓ "الأقدم أولاً" (Oldest first)
- ✓ "الترتيب الأبجدي" (Alphabetical)

**Related Clients**:
- ✓ Scroll down in Overview tab
- ✓ Check related clients appear (same industry)
- ✓ Click to navigate

## Responsive Testing

### Desktop (> 1024px)
- 3-column article grid
- Side-by-side CTAs in hero
- Full-width hero section

### Tablet (768px - 1024px)
- 2-column article grid
- Adjusted spacing

### Mobile (< 768px)
- 1-column layout
- Stacked CTAs
- Mobile-optimized spacing

## Common Issues

### Issue: "Module not found: @radix-ui/react-tabs"
**Solution**: Package already installed. If missing:
```bash
cd modonty
pnpm add @radix-ui/react-tabs
```

### Issue: Cover image not displaying
**Cause**: Client missing ogImageMedia or twitterImageMedia
**Solution**: Add cover image in admin panel or use gradient fallback (already implemented)

### Issue: No related clients showing
**Cause**: Client missing industry, or no other clients in same industry
**Solution**: Assign industry to client in admin panel

### Issue: Stats showing 0
**Cause**: No ClientLike or ClientView records yet
**Expected**: Normal for new clients

### Issue: Build errors
**Solution**: Regenerate Prisma:
```bash
cd modonty
npx prisma generate
pnpm install
pnpm dev
```
