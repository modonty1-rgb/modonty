# Performance Optimization Rules - AI Guidelines

**Purpose:** Prevent common performance issues that degrade Lighthouse scores  
**Target:** Mobile Performance Score 91+  
**Last Updated:** January 20, 2026 (Achieved: 94/100)

---

## 🚨 CRITICAL RULES - ALWAYS FOLLOW

### Rule 1: NEVER Use `force-dynamic` Without Extreme Justification

**❌ WRONG:**
```typescript
// DON'T DO THIS - Kills performance!
export const dynamic = 'force-dynamic';
```

**✅ CORRECT:**
```typescript
// Use ISR (Incremental Static Regeneration)
export async function generateStaticParams() {
  // Pre-render pages at build time
  return await db.model.findMany({ select: { slug: true } });
}

export const revalidate = 3600; // Cache for 1 hour
```

**Why This Rule Exists:**
- `force-dynamic` renders pages on EVERY request (no caching)
- Kills TTFB (Time to First Byte)
- Destroys LCP (Largest Contentful Paint)
- Makes pages 10x slower
- **Real Impact:** Dropped score from 91 to <91 in our case

**When `force-dynamic` is Acceptable:**
- Real-time dashboards with live data
- User-specific pages that MUST be personalized
- Admin pages where caching would be dangerous

**Solution for Most Cases:**
- Use ISR with `generateStaticParams` + `revalidate`
- Move personalization to client-side (useState, useEffect)
- Use API routes for dynamic data

---

### Rule 2: ALWAYS Set TypeScript Target to Modern Browsers

**❌ WRONG:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017"  // TOO OLD - includes unnecessary polyfills
  }
}
```

**✅ CORRECT:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022"  // Modern browsers support this natively
  }
}
```

**Why This Rule Exists:**
- Old targets (ES5, ES2015, ES2017) force TypeScript to transpile modern features
- Adds polyfills for features browsers already support
- **Real Impact:** Added 14 KiB of unnecessary JavaScript

**Modern Features That Don't Need Polyfills (ES2022):**
- `Array.prototype.at`
- `Array.prototype.flat`
- `Array.prototype.flatMap`
- `Object.fromEntries`
- Optional chaining (`?.`)
- Nullish coalescing (`??`)

**Check Official Next.js Support:**
```json
// package.json - ALWAYS ADD THIS
{
  "browserslist": [
    "chrome 111",
    "edge 111", 
    "firefox 111",
    "safari 16.4"
  ]
}
```

**Reference:** [Next.js Supported Browsers](https://nextjs.org/docs/architecture/supported-browsers)

---

### Rule 3: ALWAYS Use `optimizePackageImports` for Icon/UI Libraries

**❌ WRONG:**
```typescript
// next.config.ts - Missing optimization
const nextConfig = {
  // No optimizePackageImports!
};
```

**✅ CORRECT:**
```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-slider',
      '@radix-ui/react-tabs',
      '@radix-ui/react-label',
    ],
  },
};
```

**Why This Rule Exists:**
- Icon/UI libraries export hundreds or thousands of components
- Without optimization, entire library is bundled (even unused parts)
- **Real Impact:** 42 KiB of unused JavaScript

**Common Libraries That Need This:**
- `lucide-react` (1000+ icons)
- `@radix-ui/*` (multiple packages)
- `react-icons/*` (thousands of icons)
- `date-fns` (300+ date functions)
- `lodash-es` (hundreds of utilities)

**How to Find What to Add:**
1. Check `package.json` dependencies
2. Grep for imports: `from '@radix-ui/` or `from 'lucide-react'`
3. Add each package to `optimizePackageImports`

**Reference:** [Next.js optimizePackageImports](https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports)

---

### Rule 4: ALWAYS Set `priority={true}` on LCP Images

**❌ WRONG:**
```tsx
// First image on page - NO priority!
<Image 
  src={post.image} 
  alt={post.title}
  fill
  loading="lazy"  // WRONG for LCP image!
/>
```

**✅ CORRECT:**
```tsx
// First image gets priority
<Image 
  src={post.image} 
  alt={post.title}
  fill
  priority={true}  // Critical for LCP!
  fetchPriority="high"  // Extra hint to browser
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**Why This Rule Exists:**
- LCP (Largest Contentful Paint) is the biggest image/text block
- Without `priority`, image loads AFTER JavaScript
- Creates 2-3 second delays
- **Real Impact:** 2,810ms resource load delay

**How to Identify LCP Element:**
1. Run PageSpeed Insights
2. Look for "LCP element" in diagnostics
3. Usually the hero image or first post image

**Auto-Implementation Pattern:**
```tsx
// In list components
{posts.map((post, index) => (
  <PostCard 
    post={post} 
    priority={index === 0}  // Only first one gets priority
  />
))}
```

**Reference:** [Next.js Image Priority](https://nextjs.org/docs/app/api-reference/components/image#priority)

---

### Rule 5: NEVER Use Cloudinary `w_auto` in Transformations

**❌ WRONG:**
```typescript
// OptimizedImage.tsx or similar
function optimizeCloudinaryUrl(url: string): string {
  return `${baseUrl}/upload/f_auto,q_auto,w_auto/${path}`;
  // ❌ w_auto causes client-side delay!
}
```

**✅ CORRECT:**
```typescript
// OptimizedImage.tsx
function optimizeCloudinaryUrl(url: string): string {
  return `${baseUrl}/upload/f_auto,q_auto/${path}`;
  // ✅ f_auto and q_auto are server-side only
}
```

**Why This Rule Exists:**
- `w_auto` requires JavaScript to calculate width client-side
- Delays image request until JavaScript executes
- Breaks LCP optimization
- **Real Impact:** Part of 2,810ms resource load delay

**Safe Cloudinary Transformations:**
- `f_auto` - Auto format (WebP/AVIF) ✅ Server-side
- `q_auto` - Auto quality ✅ Server-side
- `dpr_auto` - Device pixel ratio ✅ Server-side
- `c_limit` - Limit dimensions ✅ Server-side

**Unsafe Transformations:**
- `w_auto` - Auto width ❌ Client-side delay!
- `h_auto` - Auto height ❌ Client-side delay!

**Use Next.js `sizes` Instead:**
```tsx
<Image 
  src={cloudinaryUrl}
  sizes="(max-width: 768px) 100vw, 50vw"  // Browser picks size
  fill
/>
```

**Reference:** [Cloudinary Auto Parameters](https://cloudinary.com/documentation/transformation_reference#w_width)

---

### Rule 6: ALWAYS Remove Console Logs in Production

**❌ WRONG:**
```typescript
// Shipping console.log to production
console.log('Debug info', data);
console.error('Error details', error);
```

**✅ CORRECT:**
```typescript
// next.config.ts - Auto-remove in production
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],  // Keep errors/warnings
    } : false,
  },
};
```

**Why This Rule Exists:**
- Console logs add to bundle size
- Expose debug information to users
- Can slow down rendering
- Not helpful to end users

**What to Keep:**
- `console.error` - Actual errors
- `console.warn` - Important warnings

**What to Remove:**
- `console.log` - Debug logs
- `console.info` - Info logs
- `console.debug` - Debug logs

---

### Rule 7: ALWAYS Configure Modern Image Formats

**❌ WRONG:**
```typescript
// next.config.ts - No image configuration
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: 'cdn.example.com' }],
    // Missing formats!
  },
};
```

**✅ CORRECT:**
```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],  // Modern formats first
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};
```

**Why This Rule Exists:**
- AVIF is 30-50% smaller than JPEG
- WebP is 25-35% smaller than JPEG
- Faster downloads = better LCP
- Automatic browser fallback

**Format Priority:**
1. AVIF (smallest, newest)
2. WebP (smaller, widely supported)
3. JPEG/PNG (fallback)

**Reference:** [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)

---

## 📋 VERIFICATION CHECKLIST

Before deploying, AI MUST verify:

### ✅ Performance Configuration
- [ ] TypeScript target is ES2022 or newer
- [ ] Browserslist defined in package.json for modern browsers
- [ ] optimizePackageImports includes all icon/UI libraries
- [ ] removeConsole enabled for production
- [ ] Modern image formats (AVIF, WebP) configured

### ✅ Rendering Strategy
- [ ] ISR with generateStaticParams for static/semi-static pages
- [ ] revalidate time set (3600 for 1 hour is good default)
- [ ] force-dynamic ONLY used when absolutely necessary
- [ ] Client-side data fetching for personalization

### ✅ Image Optimization
- [ ] First/LCP image has priority={true}
- [ ] fetchPriority="high" set on LCP image
- [ ] No w_auto in Cloudinary transformations
- [ ] Proper sizes attribute on all images
- [ ] Alt text on all images

### ✅ Code Quality
- [ ] No console.log in production code
- [ ] No unused imports
- [ ] No legacy polyfills
- [ ] Tree-shaking enabled

---

## 🔧 HOW TO CHECK IF RULES ARE FOLLOWED

### Quick Audit Script
```bash
# 1. Check TypeScript target
cat tsconfig.json | grep "target"
# Should be: "target": "ES2022" or newer

# 2. Check for force-dynamic
grep -r "force-dynamic" app/
# Should return minimal results or have comments explaining why

# 3. Check optimizePackageImports
cat next.config.ts | grep "optimizePackageImports"
# Should include lucide-react, @radix-ui, etc.

# 4. Check for console.log in production code
grep -r "console.log" app/ components/
# Should be minimal or zero

# 5. Build and check bundle sizes
pnpm build:modonty
# Look for warnings about large chunks
```

### PageSpeed Insights Check
```bash
# After deployment, test:
# 1. Open: https://pagespeed.web.dev/
# 2. Enter: https://your-site.com
# 3. Check Mobile score
# 4. Target: 91+ (achieved: 94)
```

---

## 🚨 WHAT TO DO IF SCORE DROPS

### If Performance Score < 91

**Step 1: Identify the Issue**
```bash
# Run PageSpeed Insights
# Look at "Opportunities" and "Diagnostics" sections
```

**Step 2: Common Causes**

| Issue | Solution | File to Check |
|-------|----------|---------------|
| Legacy JavaScript | Check tsconfig.json target | tsconfig.json |
| Unused JavaScript | Check optimizePackageImports | next.config.ts |
| LCP delay | Check priority prop on images | Components using Image |
| Slow TTFB | Check for force-dynamic | page.tsx files |
| Large images | Check Cloudinary transformations | OptimizedImage.tsx |

**Step 3: Reference This Document**
- Read the specific rule that was violated
- Apply the ✅ CORRECT solution
- Verify with checklist
- Redeploy and test

---

## 📚 OFFICIAL DOCUMENTATION REFERENCES

Always check official docs before making changes:

1. **Next.js 16 Performance**
   - [Supported Browsers](https://nextjs.org/docs/architecture/supported-browsers)
   - [Image Component](https://nextjs.org/docs/app/api-reference/components/image)
   - [Package Bundling](https://nextjs.org/docs/app/guides/package-bundling)
   - [ISR](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

2. **Cloudinary**
   - [Image Transformations](https://cloudinary.com/documentation/transformation_reference)
   - [Automatic Optimizations](https://cloudinary.com/documentation/image_optimization)

3. **Web Performance**
   - [PageSpeed Insights](https://pagespeed.web.dev/)
   - [Core Web Vitals](https://web.dev/vitals/)
   - [Lighthouse](https://developer.chrome.com/docs/lighthouse/)

---

## 🎯 SUCCESS METRICS

### Target Scores (Mobile)
- **Performance:** ≥ 91 (Achieved: 94 ✅)
- **Accessibility:** ≥ 95 (Achieved: 100 ✅)
- **Best Practices:** ≥ 90 (Achieved: 96 ✅)
- **SEO:** ≥ 95 (Achieved: 100 ✅)

### Target Metrics
- **LCP:** < 2.5s
- **FCP:** < 1.8s
- **TTFB:** < 600ms
- **JavaScript:** < 300 KiB total

---

## 💡 AI ASSISTANT INSTRUCTIONS

When working on this codebase:

1. **ALWAYS read this file first** before making performance-related changes
2. **NEVER use force-dynamic** without explicit user request and justification
3. **ALWAYS check tsconfig.json target** is ES2022 or newer
4. **ALWAYS add to optimizePackageImports** when adding new UI libraries
5. **ALWAYS set priority={true}** on first/hero images
6. **NEVER use w_auto** in Cloudinary transformations
7. **ALWAYS verify** against checklist before deployment
8. **REFER to official docs** when unsure (links above)

---

**Last Performance Audit:** January 20, 2026  
**Score Achieved:** 94/100 Mobile Performance  
**Issues Fixed:** Legacy JS (14 KiB), LCP delay (2.8s), Unused JS (42 KiB)  
**Maintained By:** Performance optimization rules
