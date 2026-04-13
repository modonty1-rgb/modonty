# Chatbot Pre-Deploy Test Plan

Full checklist before deploying chatbot changes to production.

## Prerequisites

- [ ] `COHERE_API_KEY` set in env
- [ ] `SERPER_API_KEY` set in env (for in-scope + no-DB case)
- [ ] Database accessible
- [ ] Dev server: `pnpm dev:modonty`
- [ ] Logged in at http://localhost:3000

---

## Phase 1: Automated Scripts

### 1.1 RAG Scores Test

```bash
cd modonty
pnpm run test:chatbot-rag
```

Expected:
- Exit code: 0
- Passed: 4/4
- out-of-scope: `outOfScope=true`
- in-scope-db-match: `wouldRedirect=true`
- in-scope-no-db: `wouldRedirect=false`
- in-scope-no-db-2: `wouldRedirect=false`

### 1.2 HTTP API Cases

1. Log in at http://localhost:3000
2. DevTools → Application → Cookies → copy `next-auth.session-token`
3. Run:
```bash
cd modonty
CHATBOT_TEST_COOKIE="next-auth.session-token=YOUR_COOKIE" pnpm run test:chatbot-cases
```

Expected:
- all cases: type matches expected
- out-of-scope: `type: "outOfScope"`
- in-scope-db: `type: "redirect"`
- in-scope-no-db: `type: "message"` (Serper)

---

## Phase 2: Manual UI Tests (Category Chat)

**Scope:** Content SEO category.

### 2.1 Open Chatbot
- [ ] Homepage, click chat trigger
- [ ] Select **Content SEO** topic
- [ ] Header shows: `الموضوع: Content SEO`
- [ ] Welcome message mentions asking in-scope questions

### 2.2 Case 1: Out-of-Scope
- [ ] Type: `ما هو الطقس اليوم في الرياض؟`
- [ ] Send
- [ ] Out-of-scope message appears
- [ ] No article cards or Serper links

### 2.3 Case 2: In-Scope + DB Match
- [ ] Type: `ما هي أفضل ممارسات تحسين المحتوى لمحركات البحث؟`
- [ ] Send
- [ ] Article redirect cards appear
- [ ] Cards link to real articles
- [ ] Message: "عثرنا على مقالات ذات صلة..."

### 2.4 Case 3: In-Scope + No DB (Serper)
- [ ] Type: `ما هي تحديثات Google March 2026؟`
- [ ] Send
- [ ] Streaming answer (not cards)
- [ ] Web source links appear below
- [ ] Label: "المصدر: نتائج البحث على الويب"

### 2.5 Case 4: In-Scope + Serper
- [ ] Type: `كيف أستخدم Ahrefs لتحليل المنافسين؟`
- [ ] Send
- [ ] Streaming answer
- [ ] Web source links visible

---

## Phase 3: Article Chat (Optional)

- [ ] Open article page
- [ ] Open chatbot from article context
- [ ] Ask question about article
- [ ] Confirm answer is grounded in article (no redirect cards for article chat)

---

## Phase 4: Server Console Checks

While running manual tests, verify logs:

| Case | Log pattern | Meaning |
|------|-------------|---------|
| Out-of-scope | `[chatbot] outOfScope=true` | Early exit |
| DB match | `[chatbot-flow] source=DB, outcome=redirect` | Redirect path |
| Serper | `[chatbot-flow] source=Serper, outcome=stream` | Web search path |
| RAG scores | `topRerankScore` in `[chatbot-rag]` | Rerank-based decision |

---

## Verification Checklist

- [ ] Phase 1.1 RAG test: 4/4 passed
- [ ] Phase 1.2 HTTP test: all cases correct
- [ ] Phase 2.1–2.5 manual: all flows behave as expected
- [ ] No cards for in-scope + no-DB queries
- [ ] Serper links visible when Serper used
- [ ] Phase 3 article chat: works (if tested)
- [ ] No console errors

---

## Rollback Notes

If issues appear in production:

- `RERANK_REDIRECT_THRESHOLD` in `app/api/chatbot/chat/route.ts` (current: 0.6) – raise to reduce false DB matches
- `OUT_OF_SCOPE_THRESHOLD` in `lib/rag/scope.ts` (current: 0.42) – adjust scope sensitivity
