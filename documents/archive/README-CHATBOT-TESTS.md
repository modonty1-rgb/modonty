# Chatbot Test Scripts

## Run RAG Scores Test (no auth)

```bash
cd modonty
pnpm exec tsx scripts/test-chatbot-rag-scores.ts
```

Requires: COHERE_API_KEY, DB connection (.env). Validates all 4 cases and prints topScore/topRerankScore.

## Run Full HTTP Cases Test (needs auth cookie)

```bash
cd modonty
CHATBOT_TEST_COOKIE="next-auth.session-token=YOUR_COOKIE" pnpm exec tsx scripts/test-chatbot-cases.ts
```

Get cookie: Log in at http://localhost:3000 → DevTools → Application → Cookies → copy `next-auth.session-token`.

## Expected Results

| Case | Query | Expected |
|------|-------|----------|
| out-of-scope | ما هو الطقس اليوم في الرياض؟ | outOfScope |
| in-scope + DB | ما هي أفضل ممارسات تحسين المحتوى لمحركات البحث؟ | redirect (cards) |
| in-scope + no DB | ما هي تحديثات Google March 2026؟ | message (Serper) |
| in-scope + no DB | كيف أستخدم Ahrefs لتحليل المنافسين؟ | message (Serper) |

## Tuning

If in-scope+no-DB still shows cards, raise `RERANK_REDIRECT_THRESHOLD` in `app/api/chatbot/chat/route.ts` (default: 0.6).
