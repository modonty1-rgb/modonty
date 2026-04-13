# Homepage Performance – Recommendations

Shared reference of decisions and next steps for optimizing the `/` page.

---

## Navbar (Top Navigation)

**Current:** `TopNav` is a small client component managing mobile top row and mounting `MobileMenuContainer` with a delay. `TopNavDesktop` uses `NavLinksClient` and `UserAreaClient`. All client-only logic (session, chat, mobile menu) is encapsulated.

**Keep:** Current structure. Tests show removing/changing `TopNav` barely changes Lighthouse – not the main bottleneck.

---

## Feed / PostCard Section

**Current:**
- Slimmed `PostCard` with Avatar (shadcn), title, excerpt, meta row, emoji counters, simple share link
- Hero: full 16:9 image with `priority=true`
- Other cards: shorter thumbnails, lazy-loaded

**Keep:** This structure removes non-essential JS and DOM work per card while maintaining visual richness.

---

## Hero / Above-the-Fold Section

**Current:** Hero + 3 additional posts rendered on first load (`limit: 4`). Hero is LCP on desktop and mobile.

**Decision:** Keep one strong hero with full image for desktop and mobile.

**Future Option:** If more LCP/TBT improvement needed later, consider lighter mobile hero (smaller image or text-first) while keeping full hero on desktop and article pages.

---

## Session / Auth Section

**Pattern:**
- `layout.tsx` uses `SessionProviderWrapper` to call `auth()` server-side and wrap app in custom `SessionProvider` (no direct next-auth client `SessionProvider`)
- Wrapped in single `<Suspense>` (required by Next.js for uncached data)
- Client: `useSession()` reads from context without extra fetch

**Decision:** Keep this pattern. It fixed `Date.now()` prerender issues and keeps session logic centralized.

---

## CSS / globals.css

**Current:** Already lean – Tailwind base/components/utilities + design tokens and few utilities (`line-clamp-2`, `.scrollbar-thin`, `.sr-only`).

**Note:** Lighthouse's "render-blocking CSS (~10 KB)" is normal and not a major optimization target compared to image/JS work.

---

## Overall Bottlenecks

Based on Lighthouse + bundle analysis:
- **Framework cost:** React/Next runtime and router
- **Hero image:** Full `OptimizedImage` as LCP for desktop and mobile
- **First 4 posts:** Even optimized, renders 1 hero + 3 cards above fold

---

## Future Experiments (If Needed)

1. **Lighter mobile hero:** Text-first with smaller/deferred image on mobile; keep full hero on desktop and article pages
2. **Fewer above-fold posts:** 1 hero + 2 cards instead of 1 + 3 (tradeoff: fewer visible items)
3. **Selective feature disabling:** Disable chat/features on `/` only (only if data shows they're in main long task)
