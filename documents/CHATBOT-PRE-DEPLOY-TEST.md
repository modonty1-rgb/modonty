# Chatbot Pre-Deploy Test Plan

Full checklist before deploying chatbot changes to production.

---

## Prerequisites

- [ ] `COHERE_API_KEY` set in env
- [ ] `SERPER_API_KEY` set in env (for in-scope + no-DB case)
- [ ] Database accessible
- [ ] Dev server running: `pnpm dev:modonty`
- [ ] Logged in at http://localhost:3000 (for manual tests)

---

## Phase 1: Automated Scripts

### 1.1 RAG Scores Test (no auth)

```bash
cd modonty
pnpm run test:chatbot-rag
```

| Check | Expected |
|-------|----------|
| Exit code | 0 |
| Passed | 4/4 |
| out-of-scope | outOfScope=true |
| in-scope-db-match | wouldRedirect=true |
| in-scope-no-db | wouldRedirect=false |
| in-scope-no-db-2 | wouldRedirect=false |

### 1.2 HTTP API Cases (requires auth cookie)

1. Log in at http://localhost:3000
2. DevTools → Application → Cookies → copy `next-auth.session-token`
3. Run:

```bash
cd modonty
CHATBOT_TEST_COOKIE="next-auth.session-token=YOUR_COOKIE" pnpm run test:chatbot-cases
```

| Check | Expected |
|-------|----------|
| All cases | type matches expected |
| out-of-scope | type: "outOfScope" |
| in-scope-db | type: "redirect" |
| in-scope-no-db | type: "message" (Serper) |

---

## Phase 2: Manual UI Tests (Category Chat)

**Scope:** Content SEO category.

### 2.1 Open Chatbot

- [ ] Open homepage, click chat trigger
- [ ] Select **Content SEO** topic
- [ ] Confirm header shows: `الموضوع: Content SEO`
- [ ] Confirm welcome message mentions asking in-scope questions first

### 2.2 Case 1: Out-of-Scope

| Step | Action | Expected |
|------|--------|----------|
| 1 | Type: `ما هو الطقس اليوم في الرياض؟` | |
| 2 | Send | Out-of-scope message (سؤالك خارج نطاق...) |
| 3 | No article cards | ✓ |
| 4 | No Serper links | ✓ |

### 2.3 Case 2: In-Scope + DB Match

| Step | Action | Expected |
|------|--------|----------|
| 1 | Type: `ما هي أفضل ممارسات تحسين المحتوى لمحركات البحث؟` | |
| 2 | Send | Article redirect cards appear |
| 3 | Cards link to real articles | ✓ |
| 4 | Message: "عثرنا على مقالات ذات صلة..." | ✓ |

### 2.4 Case 3: In-Scope + No DB (Serper)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Type: `ما هي تحديثات Google March 2026؟` | |
| 2 | Send | Streaming answer (not cards) |
| 3 | Web source links appear below answer | ✓ |
| 4 | Label: "المصدر: نتائج البحث على الويب" | ✓ |

### 2.5 Case 4: In-Scope + No DB (Serper)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Type: `كيف أستخدم Ahrefs لتحليل المنافسين؟` | |
| 2 | Send | Streaming answer (not cards) |
| 3 | Web source links appear | ✓ |

---

## Phase 3: Article Chat (Optional)

- [ ] Open an article page
- [ ] Open chatbot from article context
- [ ] Ask a question about the article
- [ ] Confirm answer is grounded in article content (no redirect cards for article chat)

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
- [ ] Phase 1.2 HTTP test: all cases correct (if cookie available)
- [ ] Phase 2.1–2.5 manual: all 4 flows behave as expected
- [ ] No cards for in-scope + no-DB queries
- [ ] Serper links visible when Serper used
- [ ] Phase 3 article chat: works (if tested)
- [ ] No console errors during tests

---

## Rollback Notes

If issues appear in production:

- `RERANK_REDIRECT_THRESHOLD` in `app/api/chatbot/chat/route.ts` (current: 0.6) – raise to reduce false DB matches
- `OUT_OF_SCOPE_THRESHOLD` in `lib/rag/scope.ts` (current: 0.42) – adjust scope sensitivity
