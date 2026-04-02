# TBT Optimization Plan – MODONTY

Reference checklist for reducing Total Blocking Time and improving mobile Lighthouse performance. Work **phase by phase**, re-measuring after each phase.

## Performance Tracking

| Phase | FCP (ms) | LCP (ms) | TBT (ms) | CLS | Notes |
|-------|----------|----------|----------|-----|-------|
| 0 – Baseline | 1700 | 8700 | 3520 | 0.001 | Mobile, incognito, default Lighthouse |
| 1 – Layout/Nav | 1700 | 8100 | 4020 | 0.001 | After layout/nav split & logo simplification |
| 2 – Chatbot deferred |  |  |  |  |  |
| 3 – Feed/cards |  |  |  |  |  |
| 4 – Dates/time |  |  |  |  |  |
| 5 – Auth/session |  |  |  |  |  |
| 6 – Final |  |  |  |  |  |

---

## Phase 0 – Baseline (no code changes)

- [ ] Run Lighthouse (Mobile, default settings) on `/`
  - [ ] Record FCP, LCP, TBT, CLS
  - [ ] Save report (JSON or screenshot)
- [ ] Record Performance trace (DevTools → Performance → Record + Reload)
  - [ ] CPU: 4× slowdown, Network: Slow 4G
  - [ ] Confirm largest long task is `(anonymous) → Evaluate Script`

---

## Phase 1 – Layout & Navigation Slimming

**Goal:** Reduce client JavaScript on every page via the layout.

**Files to review:**
- `modonty/app/layout.tsx`
- `modonty/components/TopNav.tsx`
- `modonty/components/MobileFooter.tsx`
- `modonty/components/Logo.tsx`
- `modonty/components/chatbot/ChatTriggerButton.tsx`

**Checklist:**
- [x] `RootLayout` is Server Component only
- [x] Split `TopNav`: move client logic to `components/top-nav/` with dynamic imports
- [x] Ensure `Footer`, `MobileFooter` have no unnecessary client logic
- [x] `Logo`: remove client hooks, keep as simple server Image + Link

**Measure after:**
- [ ] Re-run Lighthouse (Mobile) on `/`, record new TBT
- [ ] Confirm initial `(anonymous) → Evaluate script` is smaller

---

## Phase 2 – Defer Chatbot Entirely

**Goal:** Remove chatbot code from initial JS; load only on user interaction.

**Files:**
- `modonty/components/chatbot/ChatSheet.tsx`
- `modonty/components/chatbot/ChatSheetContainer.tsx`
- `modonty/components/chatbot/ChatTriggerButton.tsx`

**Checklist:**
- [x] `ChatSheetContainer` uses `next/dynamic` with `ssr: false`, mounts only after `open === true`
- [x] `ChatSheet` lazy-loads heavy children via `next/dynamic`
- [x] Chatbot store only imported by chatbot files
- [x] DevTools confirms chatbot JS not in initial long task on `/`

**Measure after:**
- [ ] Re-run Lighthouse (Mobile), note TBT delta
- [ ] Verify chatbot modules absent from main long tasks

---

## Phase 3 – Home Feed & Article Lists

**Goal:** Reduce client work from rendering/hydrating many cards.

**Files:**
- `modonty/app/page.tsx`
- `modonty/components/ArticleCard.tsx`
- `modonty/components/PostCard.tsx`
- `modonty/components/InfiniteArticleList.tsx`

**Checklist:**
- [x] `ArticleCard` / `PostCard` are Server Components
- [ ] Split interactive pieces into client islands (like button, bookmark toggle, share)
- [ ] Homepage renders first N posts (5–8) above fold
- [ ] Use `InfiniteArticleList` or wrapper to load more on scroll
- [ ] No unnecessary client hooks in card components

**Measure after:**
- [ ] Run Lighthouse (Mobile), compare TBT and Performance
- [ ] Long tasks related to list hydration should shrink

---

## Phase 4 – Date & Time Helpers

**Goal:** Avoid extra client CPU work from date parsing during hydration.

**Files:**
- `modonty/components/RelativeTime.tsx`
- `modonty/components/FormattedDate.tsx`

**Checklist:**
- [ ] Identify all `RelativeTime` and `FormattedDate` usage
- [ ] For static content: format dates on server, pass strings
- [ ] Keep `RelativeTime` (client) only where label must update live
- [ ] Remove `Date.now()` from render paths

**Measure after:**
- [ ] Quick Lighthouse run, ensure no regressions, verify TBT win

---

## Phase 5 – Auth & Session Cleanup

**Goal:** Simplify session handling, reduce client complexity.

**Files:**
- `modonty/components/providers/SessionContext.tsx`
- Files using `useSession`

**Checklist:**
- [ ] Replace `status === "loading"` checks with simple `session` existence checks
- [ ] Keep profile/settings UI as Server Components where possible
- [ ] Hydrate only truly interactive sections

**Measure after:**
- [ ] Final Lighthouse (Mobile) run and Performance trace
- [ ] Confirm TBT significantly lower than baseline
- [ ] No new regressions in FCP/LCP/CLS

---

## Phase 6 – Final Review

- [ ] Compare all Lighthouse runs (baseline vs each phase)
- [ ] Note which phases gave biggest TBT drops
- [ ] Decide if further optimizations needed (code splitting by route, third-party scripts)

---

**This checklist is our working reference. Update as we move through phases and learn.**
