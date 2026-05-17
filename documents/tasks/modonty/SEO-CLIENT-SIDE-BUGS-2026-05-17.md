# Modonty SEO Client-Side Bugs — TODO List

**Last Updated:** 2026-05-17 (🎉 ALL 14 TASKS DONE — ready for push)
**Total bugs:** 6 CRITICAL + 8 MEDIUM · **Done:** 14/14 ✅ · **Phase 1: ✅** · **Phase 2: ✅** · **Phase 3: ✅** · **Phase 4: ✅**

---

## 🔍 Audit + Refactor (2026-05-17) — Tasks 1-5 fully aligned with Next.js 16

| Task | SEO works? | Next.js 16 best practice? | Status |
|---|---|---|---|
| 1 — related-articles | ✅ | ✅ Server Component, `ArticleSectionCollapsible` is the only Client boundary | Refactored |
| 2 — more-from-client | ✅ | ✅ Server Component | Refactored |
| 3 — more-from-author | ✅ | ✅ Server Component | Refactored |
| 4 — article-faq | ✅ | ✅ Server Component, `FaqCollapsibleBody` (new) = small Client wrapper for collapse toggle only | Refactored |
| 5 — client-followers-list | ✅ | ✅ Pure Server Component | Already correct |
| 6 — client-comments-section + form | ✅ | ✅ Server section + Server Action form (`useActionState`) | Already correct |
| Helpers (`"use cache"` + `cacheTag` + `cacheLife("hours")`) | n/a | ✅ Correct Next.js 16 syntax | Already correct |
| **Bonus:** `article-manual-related.tsx` | ✅ | ✅ Converted to Server Component (was unrelated `"use client"`) | Refactored |

**Refactor changes (2026-05-17):**
1. `related-articles.tsx`, `more-from-client.tsx`, `more-from-author.tsx`, `article-manual-related.tsx`: removed `"use client"` + `useState(open)`, use `defaultOpen={true}` (uncontrolled mode on `ArticleSectionCollapsible`).
2. `article-section-collapsible.tsx`: changed `icon` prop type from `ComponentType<{ className?: string }>` to `ReactNode` so Server Components can pass `<IconAi className="..." />` JSX across the Server→Client boundary (component references can't be serialized in RSC payload — only rendered elements).
3. `article-faq.tsx`: converted to Server Component. Created new `faq-collapsible-body.tsx` Client wrapper that owns `useState(isCollapsed)` + toggle button + CSS hide-class. FAQ cards (server content) passed as `children`.
4. All icon usages updated: `icon={IconX}` → `icon={<IconX className="h-4 w-4 shrink-0 text-muted-foreground" />}`.

**Verified source:** Next.js docs `docs/01-app/01-getting-started/05-server-and-client-components.mdx` — "Pass Server Component as child to Client Component", "Use the `children` prop to create a slot in a Client Component", "Server Components passed as children are rendered ahead of time".

**Live test results:**
- 3 sections (`related-articles-heading`, `more-from-client-heading`, `more-from-author-heading`) render with correct h2 + visible content
- 5 article links + 5 h3 tags in raw HTML
- Collapse toggle interactivity preserved (`aria-expanded` toggles `false`↔`true`)
- TSC: zero errors
- Console: zero errors (only HMR/Fast Refresh logs)

---
**Estimated hidden internal links:** ~60-100 per article page · ~20+ per profile page

---

## 🛠️ Workflow per task (لا تتخطى أي خطوة)

For each bug below:

1. ✅ Read current component + identify all state/fetch logic
2. ✅ Convert: fetch in parent `page.tsx` → pass as prop → component becomes presentational
3. ✅ Run `pnpm tsc --noEmit` in modonty → must be zero errors
4. ✅ Live test on dev:
   - Open page in browser
   - Right-click → View Source (`Ctrl+U`)
   - **Search source for the rendered content** (article titles, FAQ questions, etc.)
   - Confirm content present in raw HTML (not just visible after JS loads)
5. ✅ Run Playwright snapshot to verify visual UI unchanged
6. ✅ Get user approval ("نفذ" / "go")
7. ✅ Version bump + backup + changelog + commit + push
8. ✅ Verify on production: `curl -s https://www.modonty.com/articles/<slug> | grep "<expected text>"`
9. ✅ Mark task done + move to Done section + update Last Updated date

---

## 🔴 Phase 1 — Article page (`/articles/[slug]`)

### [x] Task 1 — `related-articles.tsx` ✅ DONE (local — pending push)
- **File:** [modonty/app/articles/[slug]/components/related-articles.tsx](modonty/app/articles/[slug]/components/related-articles.tsx)
- **Bug:** `"use client"` + `useEffect` fetches related articles → Google sees skeleton
- **Hidden links:** ~3-5 article links per page
- **Fix applied (2026-05-17):**
  - Added `getRelatedArticlesByArticleId(article.id)` to `Promise.all` in `page.tsx`
  - Passed `relatedArticles` as prop to `<RelatedArticles>`
  - Component rewritten as presentational (removed useState/useEffect/loading/error/Skeleton)
  - Kept `useState(open)` for collapsible UI (interactivity OK)
  - Early-return `null` when empty (cleaner than "no articles" placeholder)
- **Live test result on dev:**
  - **Before:** 1 article link in raw HTML · "مقالات قد تهمك" heading: 0
  - **After:** 3 article links in raw HTML · "مقالات قد تهمك" heading: 1
  - Browser UI: section displays both related articles correctly
  - Console errors: 0
  - Visual: ✅ unchanged
- **TSC:** zero errors
- **Status:** ✅ Done on local · ⏳ Pending user approval + push

### [x] Task 2 — `more-from-client.tsx` ✅ DONE (local — pending push)
- **File:** [modonty/app/articles/[slug]/components/more-from-client.tsx](modonty/app/articles/[slug]/components/more-from-client.tsx)
- **Bug:** Same pattern — fetches "المزيد من نفس العميل" via useEffect
- **Hidden links:** ~3-5 article links per page
- **Fix applied (2026-05-17):**
  - Added `getRelatedArticlesByClient(clientId, articleId)` to `Promise.all` in page.tsx (conditional on clientId)
  - Passed `articles` as prop
  - Component rewritten as presentational (same pattern as Task 1)
  - Early-return null when empty
- **Live test (Playwright dev):**
  - **Article كيما زون:** MoreFromClient section in raw HTML ✅ · 1 related article visible · all links exposed to Googlebot
  - **Article جبر سيو (only article for that client):** section hidden (early-return null) — correct behavior
- **TSC:** zero errors · **Console errors:** 0
- **Status:** ✅ Done on local · ⏳ Pending user approval + push

### [x] Task 3 — `more-from-author.tsx` ✅ DONE (local — pending push)
- **File:** [modonty/app/articles/[slug]/components/more-from-author.tsx](modonty/app/articles/[slug]/components/more-from-author.tsx)
- **Bug:** Same pattern — fetches "المزيد من نفس الكاتب" via useEffect
- **Hidden links:** ~3-5 article links per page
- **Fix applied (2026-05-17):**
  - Added `getRelatedArticlesByAuthor(authorId, articleId)` to `Promise.all` in page.tsx (conditional on authorId)
  - Passed `articles` as prop
  - Component rewritten as presentational
  - Early-return null when empty
- **Live test (Playwright dev — article `content-marketing-medical-centers`):**
  - MoreFromAuthor section in raw HTML ✅ · 2 article titles + links exposed to Googlebot
- **TSC:** zero errors · **Console errors:** 0
- **Status:** ✅ Done on local · ⏳ Pending user approval + push

### [x] Task 4 — `article-faq.tsx` ✅ DONE (local — pending push)
- **File:** [modonty/app/articles/[slug]/components/faq/article-faq.tsx](modonty/app/articles/[slug]/components/faq/article-faq.tsx)
- **Bug:** FAQs loaded only when user expands collapse → Google indexes empty
- **Hidden content:** All FAQ Q&A pairs (5-20 per article)
- **⚠️ Updated priority (2026-05-17):** Google DEPRECATED FAQ Rich Results on **May 7, 2026** (10 days ago). JSON-LD schema still works for content understanding (AI Overviews, ChatGPT Search, Perplexity), but no special SERP display.
- **Fix applied (2026-05-17):**
  - Added `getPendingFaqsForCurrentUser(articleId)` to `Promise.all` in page.tsx (conditional on userId)
  - Reused existing `articleFaqsForJsonLd` fetch for both JSON-LD + UI (single source)
  - Passed `faqs` + `pendingFaqs` as props
  - Component rewritten as presentational — removed useState/useEffect/loading/error/Skeleton
  - **Collapse behavior changed:** `{!isCollapsed && <div>...}` → `<div className={isCollapsed ? "hidden" : "space-y-4"}>` (CSS hide, NOT DOM removal — Google reads either way)
  - Kept `useState(isCollapsed)` for UI interactivity
  - Early-return null when `faqsCount === 0 || faqs.length === 0`
- **Live test (Playwright dev — seeded 2 test FAQs):**
  - Q1, Q2, A1, A2 all in raw HTML ✅
  - FAQPage JSON-LD schema present ✅
  - JSON-LD contains question text ✅
  - Heading "الأسئلة الشائعة (2)" displays correctly ✅
  - Initially collapsed (UI works) ✅
  - Content exists in DOM regardless of collapse state ✅
  - Test FAQs cleaned up after verification ✅
- **TSC:** zero errors · **Console errors:** 0
- **Status:** ✅ Done on local · ⏳ Pending user approval + push

---

## 🔴 Phase 2 — Client page (`/clients/[slug]`)

### [x] Task 5 — `client-followers-list.tsx` ✅ DONE (local — pending push)
- **File:** [modonty/app/clients/[slug]/components/client-followers-list.tsx](modonty/app/clients/[slug]/components/client-followers-list.tsx)
- **Bug:** Followers list fetched via `useEffect` + `fetch(/api/clients/.../followers)`
- **Hidden links:** 4+ user profile links
- **Fix applied (2026-05-17):**
  - Added `getClientFollowers(client.slug, 6)` call in `followers/page.tsx` (server-side)
  - Passed `followers` array as prop to `<ClientFollowersList>`
  - Component rewritten as **pure Server Component** (no `"use client"` at all — no state needed)
  - Removed useState/useEffect/loading/error states + 4 fetch logic
  - Removed `clientSlug` prop (only needed for client-side fetch, no longer needed)
- **Live test (Playwright dev — `/clients/كيما-زون/followers`):**
  - Followers card heading in raw HTML ✅
  - 2 followers visible in raw HTML ✅
  - "عرض الملف" links to `/users/profile/<id>` present ✅
  - Console errors: 0
- **Note:** `/followers` route is `noindex` by design — fix still valuable for UX + code cleanliness
- **TSC:** zero errors
- **Status:** ✅ Done on local · ⏳ Pending user approval + push

### [x] Task 6 — `client-comments-section.tsx` ✅ DONE (local — pending push)
- **File:** [modonty/app/clients/[slug]/components/client-comments-section.tsx](modonty/app/clients/[slug]/components/client-comments-section.tsx)
- **Bug:** Comments fetched via `useEffect` + `fetch(/api/clients/.../comments)` — list hidden until JS hydration
- **Hidden content:** Approved comment text + author names (SEO content for client trust)
- **Context7 verified (2026-05-17):** Next.js docs confirm Server (data + render) ⇄ Client (form interactivity) split as official pattern.
- **Fix applied (2026-05-17):**
  - Created `helpers/client-comments.ts` with `getClientComments(slug, 50)` — uses `"use cache"` + `cacheTag("clients")` + `cacheLife("hours")` matching other client helpers
  - Added `getClientComments(slug)` to `page.tsx` Promise.all alongside other client data fetches
  - **Split component into 2:**
    - `client-comments-section.tsx` → **Server Component** (no `"use client"`) — renders comments list in raw HTML, nests the form
    - `client-comment-form.tsx` → **Client Component** (new file) — only form submission interactivity (useState/useSession/useRouter)
  - Removed useState/useEffect/fetch/loading state for comments list
  - Empty state ("لا توجد تعليقات بعد") now server-rendered (was lazy-loaded before)
- **Live test (Playwright dev — `/clients/كيما-زون`):**
  - `"آراء حول كيما زون"` heading in raw HTML ✅
  - Empty state "لا توجد تعليقات بعد" server-rendered ✅ (no approved comments on dev DB for this client)
  - Form placeholder "شارك رأيك في هذه الشركة" in raw HTML ✅ (Client Component nested correctly)
  - Console errors: 0
- **TSC:** zero errors
- **Upgrade #2 (2026-05-17 — Next.js 16 best practice via Context7):**
  - **Why:** First pass copied old `fetch()` + `useState` form code. Re-verified with Context7 — Next.js 16 App Router recommends **Server Actions + `useActionState`** for all form mutations (not legacy `fetch()` to API route POST).
  - **What changed:**
    - Created `app/clients/[slug]/actions/client-comment-actions.ts` with `'use server'` + `postClientCommentAction(prevState, formData)` signature for `useActionState`
    - Zod `safeParse` validation server-side (typed errors, no manual length checks)
    - 60s rate limit + auth + Telegram notify preserved inside Server Action
    - `revalidatePath('/clients/<slug>')` after insert (auto-refreshes APPROVED list after moderation)
    - Refactored `client-comment-form.tsx`:
      - `useActionState(action, initialState)` → built-in `pending` (no manual `useState(submitting)`)
      - `<form action={formAction}>` (progressive enhancement — works without JS)
      - Hidden `<input name="clientSlug">` instead of closure-captured prop in body
      - `aria-live="polite"` error/success message (single source, no separate error/success states)
      - Form resets on successful submit via `attempt` counter + `useEffect`
    - **Removed POST handler** from `/api/clients/[slug]/comments/route.ts` (replaced by Server Action — no other consumers grep-confirmed). GET kept as-is.
  - **Verified after upgrade:** hidden input + textarea + heading + empty state + form placeholder all in raw HTML · TSC zero errors · console clean
- **Status:** ✅ Done on local (Next.js 16 compliant) · ⏳ Pending user approval + push (Tasks 1-6 batched together)

---

## 🟠 Phase 3 — Performance refactor (UX + indirect SEO)

**Reframe decision (2026-05-17):** Originally flagged as "skip — noindex". Khalid pushed back:
> "ما حيفيده الـ SEO، بس لو فيه تعديل يقدر يفيد الـ performance، هذا برضو بيساعد الـ SEO."

**Honest breakdown:**

| Benefit type | Applies here? |
|---|---|
| Direct SEO (CWV ranking) | ❌ Google never crawls noindex pages |
| Indirect SEO (engagement signals — time on site, pages/session) | ✅ Logged-in users browse profile faster → stay longer |
| UX for logged-in users | ✅ Real win |
| Client bundle (shared chunks) | ⚠️ Limited — shared components already shipped for indexed pages |
| Next.js 16 best practice consistency | ✅ Codebase uniformity |

**Verified noindex (no change needed to robots/metadata):**
- `modonty/app/users/profile/layout.tsx:9` → `robots: "noindex,nofollow"`
- `modonty/app/robots.ts:16, 26` → `/users/profile/` disallowed for `*` and `Googlebot`

### Tasks (perf + UX, not direct SEO):
- [x] Task 7 — `users/profile/page.tsx` (stats) ✅ DONE (local — pending push)
  - **Context7-verified:** Next.js 16 pattern `auth()` in Server Component + `redirect()` for unauthenticated (replaces `useSession() + useEffect + router.push`).
  - **Files:** new `helpers/profile-stats.ts` (server fetch) · `page.tsx` rewritten as Server Component
  - **Fix:** removed `"use client"` + useState + useEffect + Skeleton. Server-side `auth()` + `Promise.all([getProfileStats, getProfileBio])` + `redirect('/users/login')` if no session.
  - **Live test (Playwright dev, logged in as modonty@modonty.com):** stat values 2/1/0/1/0 rendered server-side · "انضم في ٢ أبريل ٢٠٢٦" in raw HTML · no skeleton · 5 stat labels in raw HTML · server-side redirect verified (no session → /users/login with no flash)
  - **TSC:** zero errors · **Console:** zero errors
- [x] Task 8 — `users/profile/components/activity-feed.tsx` ✅ DONE (local — pending push)
  - **Context7-verified:** Next.js 16 — `searchParams: Promise<{ page?: string }>` on Server Component page + `<Link href="?page=N">` for pagination (no client state, no JS required).
  - **Files:** new `helpers/profile-activity.ts` (server fetch — merges 4 activity sources + sorts + paginates) · `page.tsx` updated (searchParams + Promise.all includes activity) · `activity-feed.tsx` rewritten as Server Component
  - **Fix:** removed `"use client"` + useState + useEffect + Skeleton + client fetch + onClick pagination buttons. Now: page reads `searchParams.page`, fetches activity server-side via Promise.all alongside stats/bio, passes activities + pagination as props. Pagination via `<Link>` to `/users/profile?page=N#activity` — server re-renders on nav.
  - **Live test (Playwright dev, logged in):** "النشاط الأخير (3)" heading in raw HTML · 3 activities visible with correct hrefs incl `#comment-{id}` anchors · no skeleton flicker · `id="activity"` anchor present · activity ordering preserved (timestamp desc) · pagination hidden when totalPages=1
  - **Edge case verified:** navigating to `/users/profile?page=2` when only 1 page exists → graceful empty state ("لا يوجد نشاط حتى الآن"), stats still render, no crash, no console errors. Server-side `safePage` clamping works.
  - **TSC:** zero errors · **Console:** zero errors
- [x] Task 9 — `users/profile/favorites/page.tsx` ✅ DONE (local — pending push)
  - **Context7-verified:** same Server Component + `auth()` + `redirect()` pattern as Task 7. PUBLISHED filter applied server-side via Prisma `findMany` + `.filter()` after fetch.
  - **Files:** new `helpers/profile-favorites.ts` (server fetch with PUBLISHED filter) · `favorites/page.tsx` rewritten as Server Component
  - **Fix:** removed `"use client"` + useSession + useEffect + Skeleton + fetch loop. Server-side `auth()` + `getProfileFavorites(userId, 20)`. Date formatting now via module-scope `Intl.DateTimeFormat("ar-SA")` (extracted outside JSX — no re-creation per render).
  - **Live test (Playwright dev, logged in):** breadcrumb "المحفوظات" in raw HTML · ProfileTabs visible · empty state ("لا توجد مقالات محفوظة") server-rendered (test user has 0 favorites) · no skeleton flicker · RTL layout correct
  - **TSC:** zero errors · **Console:** zero errors
- [x] Task 10 — `users/profile/following/page.tsx` ✅ DONE (local — pending push)
  - **Context7-verified:** same Server Component pattern as Task 7-9. ClientFollowButton stays as Client Component (it owns its own follow/unfollow state).
  - **Files:** new `helpers/profile-following.ts` (server fetch from `clientLike` table) · `following/page.tsx` rewritten as Server Component
  - **Fix:** removed `"use client"` + useSession + useEffect + Skeleton + dead `handleUnfollow` (was filtering local state but was never wired to `<ClientFollowButton>` callback — verified by reading old code). Server-side `auth()` + `getProfileFollowing(userId, 20)`.
  - **Live test (Playwright dev, logged in):** breadcrumb "المتابعون" in raw HTML · "العملاء المتابعون (1)" heading rendered · 1 followed client (متجر نوفا للإلكترونيات + 5 مقال + التجارة الإلكترونية) visible · ClientFollowButton ("متابع") functional · 2 client links in raw HTML · no skeleton flicker
  - **TSC:** zero errors · **Console:** zero errors
- [x] Task 11 — `users/profile/comments/page.tsx` ✅ DONE (local — pending push)
  - **Context7-verified:** same Server Component + searchParams pagination pattern as Task 8 (ActivityFeed). DELETED comments filtered server-side.
  - **Files:** new `helpers/profile-comments.ts` (server fetch + count + pagination) · `comments/page.tsx` rewritten as Server Component with `searchParams: Promise<{ page?: string }>`
  - **Fix:** removed `"use client"` + useState + useEffect + Skeleton + onClick pagination. Pagination now via `<Link href="?page=N#comments">` — server re-renders. CommentCard remains Client Component (owns its own interactivity).
  - **TypeScript narrowing:** added `VisibleCommentStatus = Exclude<CommentStatus, "DELETED">` type alias so the helper output matches CommentCard's expected status union. Safe cast since `where` clause already excludes DELETED.
  - **Live test (Playwright dev, logged in):** breadcrumb "تعليقاتي" in raw HTML · "تعليقاتي (2)" heading rendered · 2 comment cards visible with "موافق عليه" status badges · comment content rendered ("أنصح بـ Semrush." + "مقال ممتاز!") · 2 article links in raw HTML · pagination hidden (totalPages=1) · no skeleton flicker
  - **TSC:** zero errors · **Console:** zero errors
- [x] Task 12 — `users/profile/liked/page.tsx` ✅ DONE (local — pending push)
  - **Context7-verified:** same Server Component pattern. Sub-components (TypeBadge, ClientLikeCard, ArticleLikeCard) converted to Server functions inline (no state, no event handlers).
  - **Files:** new `helpers/profile-liked.ts` (server fetch — merges clientLike + articleLike timelines + sorts) · `liked/page.tsx` rewritten as Server Component
  - **Fix:** removed `"use client"` + useSession + useEffect + Skeleton + console.error noise. `formatRelativeTime` from `@/lib/utils` is pure (no client hooks) — works fine inside Server Component.
  - **Live test (Playwright dev, logged in):** breadcrumb "الإعجابات" in raw HTML · "الإعجابات (2)" heading · 1 client like card (متجر نوفا · badge "عميل" · thumb-up icon · "أعجبك منذ 1 أسبوع") · 1 article like card (ماهو السيو · badge "مقالة" · excerpt · "أعجبك منذ 2 أسبوعين") · 1 client link + 1 article link in raw HTML · no skeleton flicker
  - **TSC:** zero errors · **Console:** zero errors
- [x] Task 13 — `users/profile/disliked/page.tsx` ✅ DONE (local — pending push) — **Phase 3 COMPLETE**
  - **Context7-verified:** same Server Component pattern. 3 sub-components (TypeBadge, ClientDislikeCard, ArticleDislikeCard, CommentDislikeCard) converted to Server functions inline.
  - **Files:** new `helpers/profile-disliked.ts` (merges 3 dislike timelines: client + article + comment, sorts desc) · `disliked/page.tsx` rewritten as Server Component
  - **Fix:** removed `"use client"` + useSession + useEffect + Skeleton + console.error noise. Same pattern as Task 12 but with 3 item types instead of 2.
  - **TypeScript fix:** Prisma returns `author: null` for optional relation but interface uses `author?: { ... }` (undefined). Mapped `author: dislike.comment.author ?? undefined`.
  - **Live test (Playwright dev, logged in):** breadcrumb "غير المعجبة" in raw HTML · empty state ("لا توجد عناصر غير معجبة" + CTA "استكشف المحتوى") server-rendered (test user has 0 disliked) · ProfileTabs visible · no skeleton flicker
  - **TSC:** zero errors · **Console:** zero errors

**Pattern:** Same as Tasks 1-4 refactor — fetch in `page.tsx`, pass as props, minimize Client boundary, Server Components by default.

---

## 🟢 Phase 4 — Lowest priority

### [x] Task 14 — `ask-client-dialog.tsx` ✅ DONE (local — pending push) — **Phase 4 COMPLETE**
- **Context7-verified:** Dialog MUST stay Client (interactive overlay + form state). `react-hook-form` + `zodResolver` + Server Action is a valid Next.js 16 pattern (alternative to `useActionState` for forms with rich client-side validation).
- **Verified both callers always pass `pendingFaqs`:**
  - `article-client-card.tsx` (sidebar) → passes `pendingFaqs={askClientProps.pendingFaqs}` from `page.tsx` Promise.all (Task 4 fetch)
  - `article-mobile-engagement-bar.tsx` → uses `triggerOnly={true}` (pending FAQs section never renders)
- **Dead code removed:**
  - `pendingFaqsLocal`, `pendingLoading`, `pendingError` state (never reachable in production callers)
  - `useEffect` lazy fetch on `pendingOpen`
  - `retryPending` function + retry UI
  - Skeleton loader for pending FAQs
  - `fetchPendingFaqsForArticle` import (no longer used in this file)
  - Post-submit manual fetch (`router.refresh()` re-triggers Server Component Promise.all which re-fetches `pendingFaqs`)
- **Kept (correct as-is):** `"use client"`, react-hook-form, Server Action call, manual `isSubmitting` state alongside RHF.
- **Live test (Playwright dev, logged in):** "اسأل العميل" + "اسأل كيما زون مباشرةً" buttons present in raw HTML · clicking opens dialog with title "تواصل مع كيما زون" + description with article title · name + email auto-filled from session (readonly) · question textarea focusable · "إرسال السؤال" + "إلغاء" buttons functional · "أسئلتك المعلقة" button visible (pending dialog) · modal overlay + close X work
- **TSC:** zero errors · **Console:** zero errors

---

## ✅ Done

(empty — tasks will move here as completed)

---

## 📈 Expected Impact After Phases 1+2

- Google discovers internal links from every article + client page
- The 8 "unknown" pages from GSC audit get found within 7-14 days **naturally** (no manual Request Indexing)
- New articles auto-discover within 24-48 hours
- FAQ Rich Results restored in Google SERPs
- Crawl budget no longer wasted on lazy-loaded skeletons

---

## ❌ NOT in scope (already correct, do not touch)

- robots.txt — fixed (all bots open)
- IndexNow integration — live and working
- Sitemap — submits all URLs correctly
- Schema/JSON-LD — server-rendered correctly
- Buttons (like/share/follow/favorite) — correctly client-side
- Trackers (view/click/CTA) — correctly client-side
- Forms (comment/contact/newsletter) — correctly client-side
- TOC, reading progress, scroll effects — DOM enhancement, no content hidden

---

## 🔍 How to verify a fix worked (live test recipe)

```bash
# Production verification after deploy
curl -s "https://www.modonty.com/articles/<slug>" > /tmp/page.html

# Count internal article links in raw HTML (should be > 0 after fix)
grep -o 'href="/articles/[^"]*"' /tmp/page.html | wc -l

# Check for related-article titles (should match expected)
grep -o '<h3[^>]*>[^<]*</h3>' /tmp/page.html | head
```

If raw HTML contains the links → ✅ Google can see them → fix worked.
