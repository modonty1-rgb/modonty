## Home Page Performance – Working Recommendations

This file is our shared reference of **decisions and next steps** for optimizing the `/` page, based on all tests so far.

---

## Navbar (Top Navigation)

- **Scope**: `TopNav`, `TopNavDesktop`, `NavLinksClient`, `UserAreaClient`, `UserMenu`, `LogoNav`, search/mobile menu/chat controls.
- **Current structure**:
  - `TopNav` is a small client component that manages:
    - Mobile top row: `LogoNav` + compact `SearchLink` + `ChatTriggerButton` + `UserMenu`.
    - Mounting `MobileMenuContainer` after a short delay to keep TBT low.
    - Desktop shell via `TopNavDesktop`.
  - `TopNavDesktop`:
    - Uses `NavLinksClient` (desktop search + nav links using `usePathname`).
    - Uses `UserAreaClient` (desktop `UserMenu` + chat trigger).
  - Shared logo component:
    - `LogoNav` renders the brand logo using `next/image` (server-safe, responsive sizes).
  - Shared search component:
    - `SearchLink` is server-safe and used in both desktop (`NavLinksClient`) and mobile (`TopNav`).
    - Behaves as a simple link to `/search` in all cases (no separate mobile search sheet).
  - Mobile controls:
    - Top bar: compact search + chat trigger + `UserMenu` (login/avatar).
    - Bottom bar (`MobileFooter`): main nav icons + `MobileMenuTrigger` (vertical three dots).
    - `MobileMenuContainer` is **mounted with a small delay** (deferred via `useEffect`) instead of on the first paint.
- **Keep**:
  - `TopNav` as the only navbar client shell; client-only logic (session, chat, mobile menu) encapsulated in `TopNav`, `UserMenu`, `UserAreaClient`, and `ChatSheetContainer`.
  - Mobile and desktop layouts as they are (consistent and simple).
- **Why**:
  - Tests show removing or heavily changing `TopNav` barely changes Lighthouse; it is not the main bottleneck compared to hero/feed.

---

## Feed / PostCard Section

- **Scope**: `FeedContainer`, `FirstArticleCard`, `PostCard`, `InfiniteArticleList` (and its on‑view wrapper).
- **Keep**:
  - Slimmed `PostCard` with:
    - Avatar via shadcn `Avatar` (`AvatarImage` + `AvatarFallback`), no `next/image` wrapper.
    - Title + excerpt + meta row (`RelativeTime` + reading time).
    - Emoji counters instead of heavy reaction buttons.
    - Simple share link (no `PostCardActions` menu).
    - Audio badge (text‑only) on the card; full TTS only on article page.
  - Thumbnail images for non‑hero cards:
    - Hero (`priority=true`): full 16:9 `OptimizedImage` as LCP.
    - Other cards: shorter thumbnails (`h-32 sm:h-40`), lazy‑loaded, non‑priority.
- **Why**:
  - This keeps the feed visually rich but removes most non‑essential JS and DOM work from each card.

---

## Hero / Above‑the‑Fold Section

- **Current**:
  - Hero card + 3 additional posts rendered on first load (`limit: 4`).
  - Hero uses full‑size image and is the LCP on both desktop and mobile.
- **Decision now**:
  - Keep **one strong hero** with a full image for desktop and mobile.
- **Future option**:
  - If we still need more LCP/TBT improvement later:
    - Consider a **lighter mobile hero** (smaller image or text‑first) while keeping the full hero on desktop and article page.

---

## Session / Auth Section

- **Pattern**:
  - `layout.tsx`:
    - Uses `SessionProviderWrapper` to call `auth()` server‑side and wrap the app in a custom `SessionProvider` (no direct client `SessionProvider` from next-auth).
    - Wrapped in a single `<Suspense>` as required by Next for uncached data.
  - Client:
    - `useSession()` in header/components only **reads** session from context (no extra fetch).
- **Decision**:
  - Keep this pattern; it fixed `Date.now()`/prerender issues and keeps session logic centralized.

---

## CSS / `globals.css` Section

- `globals.css` is already lean:
  - Tailwind base/components/utilities + design tokens and a few utilities (`line-clamp-2`, `.scrollbar-thin`, `.sr-only`).
- Lighthouse’s “render‑blocking CSS (~10 KB)” is normal and **not a major optimization target** compared to image/JS work.

---

## Overall Bottlenecks (LCP/TBT Summary)

Based on Lighthouse + bundle analysis:

- **Framework cost**:
  - React/Next runtime and router.
- **Hero image**:
  - Full `OptimizedImage` as LCP for both desktop and mobile.
- **Total work for first 4 posts**:
  - Even with optimizations, we still render 1 hero + 3 cards above the fold.

---

## Future Experiments (If Needed)

If we want to push the performance score higher later, likely experiments are:

1. **Even lighter mobile hero**:
   - Text‑first hero on mobile with a smaller or deferred image, while keeping full hero image on desktop and article page.
2. **Reduce number of above‑the‑fold posts**:
   - 1 hero + 2 cards instead of 1 + 3 (tradeoff: fewer items visible initially).
3. **Selective disabling of chat / extra features on `/`**:
   - Only if data shows chatbot or other components appear in the main long task.

