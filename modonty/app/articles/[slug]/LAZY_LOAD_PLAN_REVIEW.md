# Senior dev review: Lazy-load plan vs codebase and official docs

## 1. Codebase vs plan – alignment

**Current flow (codebase):**
- `getArticleBySlug(slug, userId)` does one Prisma query with `include`: comments (with nested author, _count), user likes/dislikes/favorites, client (logo, og), author, category, featuredImage, tags, faqs, gallery, relatedTo, _count. Comments are flattened with `replyingTo` and sorted.
- Page runs that plus `Promise.all([ getRelatedArticlesByAuthor, getRelatedArticlesByClient, getRelatedArticlesByCategoryTags, getPendingFaqsForCurrentUser ])`.
- After mutations (submitComment, likeComment, approveComment, etc.) the code calls `revalidatePath(\`/articles/${articleSlug}\`)` and sometimes `router.refresh()`. The page is refetched and comments/FAQs come from the server again.

**Plan vs codebase:**
- **Minimal article:** The plan correctly identifies that comments and faqs can be dropped from the initial query. `getArticleBySlug` is a single `findFirst` with a large `include`; splitting into a minimal variant (no `comments`, no `faqs` in include) is straightforward. `_count` for comments/faqs is already available via `_count` on the article; the plan’s use of _count for headers is correct.
- **Comment shape:** Comments are post-processed (flattenCommentsWithContext, replyingTo, sort). Any `fetchArticleComments` must return the same shape (flattened, with replyingTo). The plan says “same shape as current article.comments” – implementation must replicate that logic in the new getter or a shared helper.
- **Mutations and revalidation:** Today, after submitComment / likeComment / approveComment the page uses revalidatePath and sometimes router.refresh(), so the full RSC payload (including comments) is refetched. With a minimal payload, revalidatePath/refresh will not refetch comments (they’re not in the initial response). The plan does not explicitly cover this: after a mutation you either need (a) optimistic update / appending the new comment in client state, or (b) calling the comments fetch again from the client. Same idea for FAQ (e.g. after submitAskClient). This is a gap.

**Verdict:** Plan matches the codebase for “what to slim” and “what to fetch when.” Missing: how to keep client-held comments/FAQs in sync after mutations (revalidate no longer returns that data).

---

## 2. Advantages of the plan

- **Fewer DB calls on load:** One lighter article query instead of one heavy + four extra. Most users never open comments/related; you save 4–5 queries per page view for them.
- **Faster TTFB / LCP:** Less work and smaller payload on the server for the first response. Article content and above-the-fold content can ship earlier.
- **Clear “one table per section”:** Each section (FAQ, comments, related, pending FAQs) has a single server action and a single fetch-on-open; easy to reason about and to add caching (e.g. by articleId) later.
- **Ids are enough:** articleId, clientId, userId (and authorId, categoryId, tagIds) are enough for all current getters; no need to pass full entities. The plan’s “pass only ids” is correct and keeps the API small.
- **Loading skeletons:** Specifying skeletons per section (comments, FAQ, cards) improves perceived performance and matches the existing loading.tsx style.
- **Manual related stays in payload:** Keeping `relatedTo` in the minimal article avoids a sixth lazy section and matches the fact it’s a small, curated list.

---

## 3. Disadvantages and risks

- **Server Actions for read-only fetch:** Next.js docs and common practice recommend Server Actions for mutations (forms, create/update). For client-side data fetching, the docs and many posts suggest Route Handlers (GET) + React Query/SWR so you get caching, deduping, and GET semantics. Using Server Actions called from useEffect/onOpenChange works but is not the pattern the docs emphasize for “fetch when user does X.” You accept more manual cache handling (e.g. “fetch once per section open”) and no built-in request deduping or cache keys. Alternative: expose GET routes (e.g. `/api/articles/[slug]/comments`) and use fetch + React Query in the lazy components; then you get cache keys, refetchOnMount, and consistency with common Next.js guidance.
- **Mutation aftermath:** After submitComment, likeComment, approveComment, submitAskClient, the current design relies on revalidatePath + optional router.refresh() to get fresh data. With a minimal page payload, refresh does not bring comments/FAQs. You must either: (1) have the server action return the updated list and set it in client state, or (2) refetch that section’s data from the client after success, or (3) optimistic updates only and accept possible staleness until the next open/refresh. The plan should explicitly choose one of these and document it.
- **SEO and crawlers:** Comments and FAQ in the main article body can matter for SEO (Q&A schema, engagement). If they’re loaded only on client open, crawlers that don’t execute JS (or run it sparingly) may not see them. If SEO for comments/FAQ is a requirement, you could keep one server-rendered block (e.g. first N comments + FAQ) in the minimal payload and lazy-load “load more” or the rest; or accept that lazy sections are not in the initial HTML.
- **Double fetch for pending FAQs:** FAQ section and Ask Client block both need pending FAQs. The plan mentions sharing state/cache by articleId; without a shared cache or a single “pending FAQs provider,” opening both can trigger two identical calls. Implementation should centralize (e.g. one place that holds pendingFaqs and exposes loadPendingFaqs).
- **Comments section count:** The header shows “التعليقات (N)”. With minimal load you only have _count; when the user opens and fetches comments, N is already correct. If you later add “load more” or pagination, N might differ from the loaded set; worth keeping in mind.

---

## 4. Official docs (summary)

- **Server Actions:** Documented as the primary way to run server code from the client, especially for mutations and form actions. Using them for read-only “fetch when user opens” is valid but not the main use case; some community guidance prefers Route Handlers + data libraries for client-side reads.
- **Streaming / Suspense:** Next.js recommends Suspense + async Server Components for slow or secondary content: the shell streams first, then deferred chunks. That improves TTFB and perceived load but still runs all server fetches (you don’t “skip” DB work). The plan’s “fetch only when user opens” actually reduces work and is complementary: you could later combine minimal load + streaming for the initial shell and still lazy-load sections on open.
- **Data fetching:** “Fetch as much as possible in server components” is the default. The plan intentionally moves some work to the client (on open) to reduce initial cost; that’s a tradeoff, not a violation of the model.

---

## 5. Recommendations

1. **Decide mutation strategy:** Document and implement how comments/FAQs stay correct after submitComment, likeComment, approveComment, submitAskClient (e.g. “server action returns updated list and client sets state” or “client refetches this section on success”).
2. **Consider GET + React Query for lazy sections:** If you want alignment with common Next.js patterns and better caching/deduping, expose GET endpoints for comments, FAQs, related, pending FAQs and call them from the lazy components with React Query; keep Server Actions for mutations only.
3. **If you keep Server Actions for fetch:** Put them in a single `"use server"` file, return serializable data only, and implement a small client-side cache (e.g. Map by articleId + section key) so reopening or sharing between FAQ and Ask Client doesn’t double-fetch.
4. **SEO:** If comments/FAQ must be in the initial HTML for crawlers, keep a minimal server-rendered slice (e.g. first 3 comments + first 3 FAQs) in the minimal article and lazy-load the rest; otherwise accept that lazy sections may not be indexed.
5. **Comment shape:** Reuse or extract `flattenCommentsWithContext` (and the sort) so `fetchArticleComments` returns the exact same structure the UI expects; avoid subtle bugs from shape drift.

---

## 6. Conclusion

The plan matches the codebase and achieves the goal: minimal initial load and per-section fetch on open. The main gaps are (1) mutation aftermath for comments/FAQs and (2) the choice between Server Actions vs Route Handlers + React Query for those fetches. Addressing (1) and explicitly choosing (2) will make the implementation robust and easier to maintain.
