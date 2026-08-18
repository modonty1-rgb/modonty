# modo-chat — file map

Route: `/modo-chat`. Generated from the code on 2026-08-18, after the industry rewiring.
Every fact below carries how it was measured. Re-verify before acting on it.

## The scope axis — read this first

Modo answers inside an **INDUSTRY**, not a content category. Partners belong to an industry
(`Client.industryId`), so an industry is the only scope that can end in a booking. Measured
2026-08-18 via `GET /modo-chat/api/industries`: السياحة العلاجية holds **21 partners**, and it
has no category of its own — scoping by category answered a dentist question out of a category
holding one partner while the twenty-one clinics sat unseen.

Category is still accepted by `api/chat` (`categorySlug`) so older callers keep working, but
nothing in this UI sends it any more.

## The page

| File | What it is | Client? |
|---|---|---|
| `page.tsx` | wraps `PageLayout` in `<Suspense>`. `robots: index:false` — the page is not indexed | server |
| `loading.tsx` | renders `PageSkeleton` | server |
| `error.tsx` | the route's error boundary | yes |

`<Suspense>` here is **required, not decorative**: `PageLayout` calls `useSearchParams()`,
which Next forces under a boundary. Do not remove it.

## components/

| Folder | What the visitor sees | Client? |
|---|---|---|
| `page-layout/PageLayout.tsx` | the frame: header with the character, the title, «محادثة جديدة», and the two tabs (جديد · سجل) | yes |
| `page-layout/PageSkeleton.tsx` | the grey placeholder while the page loads | no |
| `login-card/LoginCard.tsx` | «مودو شات بانتظارك» + the sign-in button, shown when nobody is signed in | yes |
| `chat-list/ChatList.tsx` | the conversation: messages, composer, industry cards, partner cards, article suggestion | yes |
| `composer/Composer.tsx` | the auto-growing input + send button | yes |
| `partner-cards/PartnerCards.tsx` | the bookable partner cards under an answer — the conversion | yes |
| `history-list/HistoryList.tsx` | past conversations under the «سجل» tab | yes |
| `shared/TypingDots.tsx` | the three dots while the answer streams | yes |

`ChatList` and `HistoryList` are loaded with `dynamic(..., { ssr: false })` from `PageLayout`
— neither is in the first bundle.

## data/ — anything that crosses the network or touches the database

| File | Returns |
|---|---|
| `cohere-client.ts` | the configured client + the three model ids + the shared types. Built per call, because the key is read at request time |
| `embed-texts.ts` | embeddings for semantic search, batched at 96 texts per call (the vendor's hard limit) |
| `rerank-documents.ts` | documents reordered by relevance |
| `ask-cohere.ts` | one full answer, no streaming |
| `stream-cohere-answer.ts` | an async generator of text deltas |
| `get-embedded-chunks.ts` | cached chunk vectors; loads article BODIES only for articles whose cache is cold |
| `retrieve-from-embedded.ts` | the best chunks for a question, plus `bestArticleId` for the "read deeper" card |
| `get-industry-scope.ts` | one industry's articles + partners — the corpus Modo answers from |
| `rank-partners.ts` | the partners actually related to a question, when no article covers it |
| `is-out-of-scope.ts` | true when the question is not about this ARTICLE. Used by `api/article/[slug]` only — the category/industry gate was deleted (see traps) |
| `search-serper.ts` | web results, used only when the platform has no answer and no relevant partner |
| `check-rate-limit.ts` | 20/hour, 100/day, counted from `chatbot_messages` itself so the counter cannot drift |
| `save-chatbot-message.ts` | writes the exchange to `chatbot_messages` |

## helpers/ — pure, no network, no database

`chunk-article-content.ts` · `is-greeting.ts` · `get-scope-icon.ts` · `hash-content.ts` ·
`new-conversation-id.ts` · `has-trusted-content.ts` · `build-category-db-prompt.ts` ·
`build-category-web-prompt.ts` · `build-article-db-prompt.ts` · `build-article-web-prompt.ts` ·
`build-identity-prompt.ts`

## api/ — the doors for the mobile app and the browser

| Endpoint | Method |
|---|---|
| `api/chat` | POST — ask inside an industry (`industrySlug`) or a category (`categorySlug`) |
| `api/article/[slug]` | POST — ask about one article |
| `api/industries` | GET — the industries that have at least one active partner, most partners first |
| `api/suggest-industry` | POST — guess the industry from a free-text message |
| `api/history` | GET — past conversations |
| `api/conversation` | GET — one thread, to restore it after a reload |

## The answer decision tree, as measured live on 2026-08-18

1. **Identity/greeting** → answered from the identity prompt, no retrieval.
2. **A chunk clears the answer floor** → answer from our own articles, with the partners behind
   them as bookable cards. Measured: «أبغى أزرع أسنان في مصر، كم التكلفة» → rerank `0.997`,
   3 chunks, answer with real prices + two clinics with «احجز».
3. **No chunk, but a RELEVANT partner exists** → partner-first («الشريك أولى», Khalid).
4. **No chunk and no relevant partner** → web search with sources, plus the closest article as
   further reading if it clears `SUGGEST_MIN_SCORE`. Measured: rhinoplasty question → rerank
   `0.077`, no partner offered, 8 web sources, `suggestedArticle: undefined`.

Timings on a warm cache (dev, 2026-08-18): `chunksMs ≈ 2100`, `retrieveMs ≈ 800–1500` over
153 chunks. Total request 21–42s — **the rest is model generation**, not retrieval.

## Traps already hit

- **`askCohere` is imported dynamically** inside `api/chat/route.ts` and
  `api/article/[slug]/route.ts` (`const { askCohere } = await import(...)`), only on the
  non-streaming path. A plain grep for the import at the top of the file will miss it.
- **The pre-retrieval out-of-scope gate was deleted.** It embedded the question plus a
  600-character excerpt of article titles and refused anything under `0.52` — stricter than
  retrieval's own floor, on a worse proxy, and paid for before a single chunk was read.
  Measured: a legitimate follow-up scored `0.4565` and was refused. Retrieval decides scope now.
- **A cancelled stream is normal, not an error.** The visitor closing the tab cancels the
  response; every later `enqueue` throws `ERR_INVALID_STATE`, and the catch block then enqueued
  *again* on the same dead controller. The stream now has a `cancel()` handler.
- **`suggestedArticle` used to be the most-VIEWED article in scope**, which put a
  herniated-disc article under a rhinoplasty answer. It is now the closest article by rerank,
  or nothing.
- **Partners used to be offered alphabetically** — a rhinoplasty question returned three
  pain-management clinics under «شركاء يقدرون يخدمونك». Ranked by `rank-partners.ts` now.
- **`Industry.socialImage` is the platform default logo for every industry** (measured: all 8).
  Do not render it — the chips showed six identical grey squares. `getScopeIcon` gives a
  distinct icon for free.
- **`export const revalidate` is illegal here**: `cacheComponents` is enabled in
  `next.config.ts` and the build fails on it.
- The page renders a **sign-in gate** for anonymous visitors; the whole conversation is behind
  auth. Testing it signed-out shows only the gate.
- Every reranker threshold in this route (`RERANK_MIN_SCORE`, `SUGGEST_MIN_SCORE`,
  `MIN_RELEVANCE`) is **PROVISIONAL**. The vendor states scores are query-dependent and not
  comparable across queries, and prescribes calibrating on 30–50 representative questions.
  That calibration has not been run.
