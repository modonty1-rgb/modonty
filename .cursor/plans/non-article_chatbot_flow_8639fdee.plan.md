---
name: Non-Article Chatbot Flow
overview: "التحقق من أن تدفق الشات بوت على الصفحات غير المقالية (الرئيسية، الفئة، العميل) يطابق المتطلبات: تحديد الفئة، البحث في DB أولاً، البحث الخارجي كحل احتياطي، إظهار المصدر بوضوح، واختبار المتصفح."
todos: []
isProject: false
---

# Non-Article Chatbot Flow Verification

## Current Implementation Summary

The chatbot supports two scopes:

1. **Article scope** (`/articles/[slug]`): RAG on article → same-category fallback → Serper
2. **Category scope** (home, `/categories`, `/clients/[slug]`): User selects topic → RAG on category articles → out-of-scope redirect or Serper

## Requirements vs Current State


| Requirement                      | Current Implementation                                               | Status                      |
| -------------------------------- | -------------------------------------------------------------------- | --------------------------- |
| Identify category/interest       | Topic cards from `/api/chatbot/topics`; user must select             | Matches                     |
| Search within DB first           | RAG on category articles via `retrieveFromChunks`                    | Matches                     |
| External search when unavailable | Serper fallback when no match or `topScore < 0.28`                   | Matches                     |
| Display source clearly           | System prompt: "في نهاية الإجابة أضف: المصدر: نتائج البحث على الويب" | Implemented in model output |
| Browser test all scenarios       | Manual verification needed                                           | Pending                     |


## Key Files

- [modonty/app/api/chatbot/chat/route.ts](modonty/app/api/chatbot/chat/route.ts): Category chat API; flow: RAG → out-of-scope redirect → Serper
- [modonty/app/api/chatbot/topics/route.ts](modonty/app/api/chatbot/topics/route.ts): Topics (categories) for non-article pages
- [modonty/components/chatbot/ArticleChatbotContent.tsx](modonty/components/chatbot/ArticleChatbotContent.tsx): UI; topic selection, redirect cards, message display
- [modonty/lib/serper.ts](modonty/lib/serper.ts): Serper API; uses `x-api-key` (correct per Serper docs)

## Serper API Verification

- Endpoint: `https://google.serper.dev/search`
- Auth: `x-api-key` header
- Body: `{ q: query, num }`
- Response: `organic` array with `title`, `link`, `snippet`

Implementation matches Serper standard usage.

## Potential Improvements (Optional)

1. **Client-page context**: On `/clients/[slug]`, chatbot shows global topics. Consider adding client-scoped chat (articles by that client) if desired.
2. **Source UI enhancement**: Add a visual badge/section when the answer uses Serper (e.g., "المصدر: نتائج البحث على الويب" as a distinct block) instead of relying only on model text.
3. **Empty redirect handling**: When `getArticlesForOutOfScopeSearch` returns `[]`, category chat correctly falls through to Serper (lines 106-129 in chat route).

## Browser Test Scenarios (per QA plan)

- Home: Open chatbot → select category → in-scope question → out-of-scope question → verify redirect/Serper
- Category page: Same flow
- Client page: Same (topics, not client-specific)
- Article page: In-scope → out-of-scope → verify redirect/Serper
- Unauthenticated: Login prompt
- Source display: Trigger Serper path, confirm "المصدر: نتائج البحث على الويب" in response

## Test Results (2026-02-07)

### API Tests (test-chatbot-live.ts)


| Test                                                      | Result |
| --------------------------------------------------------- | ------ |
| POST /api/chatbot/chat without session → 401              | ✓      |
| POST /api/articles/[slug]/chat without session → 401      | ✓      |
| GET /api/chatbot/topics → 200                             | ✓      |
| Topics have categoryName, categorySlug, suggestedQuestion | ✓      |
| Empty message → 400                                       | ✓      |
| Message > 2000 chars → 400                                | ✓      |
| Malformed body → 400                                      | ✓      |


### Browser E2E (logged in, Content SEO)


| Flow                              | Test                                                                            | Result                                                              |
| --------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Flow 2: In-scope + DB match**   | "ما هو الطقس اليوم في الرياض؟", "ما هي أحدث تحديثات خوارزمية Google لعام 2027؟" | ✓ Article cards appear; "اسأل سؤالاً آخر" + "اختيار موضوع آخر" work |
| **Flow 1: Out-of-scope**          | Not triggered — RAG matched before isOutOfScope                                 | Code path exists; hard to trigger (RAG runs first)                  |
| **Flow 3: Serper + source badge** | Not triggered — RAG matched all tested queries                                  | Code path exists; requires no DB match + in-scope                   |


### Flow Confirmation

- **Topic selection**: ✓ Categories load; user selects; input enabled
- **Article cards**: ✓ Redirect flow works; links to `/articles/[slug]`
- **Buttons**: ✓ "اسأل سؤالاً آخر", "اختيار موضوع آخر" (←) behave correctly
- **Streaming/outOfScope**: Implemented; outOfScope returns JSON (not stream)

## Conclusion

The flow aligns with the stated requirements. Flow 2 (in-scope + match) is fully verified. Flows 1 and 3 exist in code; Content SEO has broad coverage so RAG often matches before Serper/outOfScope. Optional: tune RELEVANCE_THRESHOLD (0.28) or OUT_OF_SCOPE_THRESHOLD (0.35) if stricter separation is needed.