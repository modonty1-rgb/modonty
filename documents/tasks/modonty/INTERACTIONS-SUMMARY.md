# Modonty Interactions — Quick Summary
**ملخص التفاعلات بين الزوار والعملاء**

---

## 🎯 THE 10 INTERACTIONS

| # | Interaction | User Action | Data Saved | Client Sees | Status |
|---|-------------|-------------|-----------|------------|--------|
| 1 | **Like Article** | Click 👍 | articleLike | Like count | ⏳ Test |
| 2 | **Dislike Article** | Click 👎 | articleDislike | Dislike count | ⏳ Test |
| 3 | **Favorite Article** | Click ⭐ | articleFavorite | Favorite count | ⏳ Test |
| 4 | **Comment** | Submit text | comment | Comment list + count | ⏳ Test |
| 5 | **Like Comment** | Click 👍 on comment | commentLike | Like count | ⏳ Test |
| 6 | **Dislike Comment** | Click 👎 on comment | commentDislike | Dislike count | ⏳ Test |
| 7 | **Reply to Comment** | Submit reply | comment (parentId set) | Nested replies | ⏳ Test |
| 8 | **Ask Question** | Submit FAQ form | articleFAQ | Pending Q&A | ⏳ Test |
| 9 | **Follow Client** | Click Follow | clientLike | Follower count | ⏳ Test |
| 10 | **Share Article** | Click share button | share | Share count by platform | ⏳ Test |

---

## 🔍 WHAT TO VERIFY FOR EACH INTERACTION

For **every interaction**, verify:

```
✅ FRONTEND     → Button/form works, shows success/error message
✅ BACKEND      → Server action or API route processes request
✅ DATABASE     → Data saved correctly with right fields
✅ DASHBOARD    → Client sees count/data update in real-time (no page refresh)
✅ CONCURRENT   → Multiple users interacting = counts accurate (no duplicates)
✅ SECURITY     → XSS/injection attacks prevented, auth required
✅ MOBILE       → Works on phone (touch targets 44px+)
```

---

## 📋 TESTING ROADMAP

**Time Estimate:** ~8 hours total

| Phase | What | Time | Files |
|-------|------|------|-------|
| **Setup** | Create test users, open tabs | 30 min | INTERACTIONS-TODO.md |
| **Test 1-2** | Like/Dislike/Favorite | 1.5 hrs | INTERACTIONS-TODO.md |
| **Test 3** | Comments (+ replies, likes) | 1.5 hrs | INTERACTIONS-TODO.md |
| **Test 4** | FAQ Questions | 1 hr | INTERACTIONS-TODO.md |
| **Test 5** | Follow Client | 45 min | INTERACTIONS-TODO.md |
| **Test 6** | Share Article | 30 min | INTERACTIONS-TODO.md |
| **Test 7** | Real-time Dashboard | 1 hr | INTERACTIONS-TODO.md |
| **Test 8** | Concurrent Users | 1.5 hrs | INTERACTIONS-TODO.md |
| **Final** | Verification + Mobile | 1 hr | INTERACTIONS-TODO.md |

---

## 🔴 3 CRITICAL BUGS FOUND

While scanning code, I found these issues:

### Bug 1: Comments Auto-Approved (No Moderation)
**File:** `modonty/app/articles/[slug]/actions/comment-actions.ts:53`
```typescript
status: CommentStatus.APPROVED,  // ← Auto-approved!
```
**Impact:** Spam/inappropriate comments appear immediately  
**Fix:** Change to `PENDING`, require client approval  
**Recommendation:** Hold comments for moderation before publishing

---

### Bug 2: No Rate Limiting on Ask Question
**File:** `modonty/app/articles/[slug]/actions/ask-client-actions.ts:62`
```typescript
if (pendingCount >= 5) {  // ← Only limits to 5 per user per article
```
**Impact:** User could ask many questions across many articles  
**Fix:** Add global rate limit (max 10 questions per user per day)  
**Recommendation:** Prevent FAQ spam

---

### Bug 3: Share Tracking Not Auth-Protected
**File:** `modonty/app/api/articles/[slug]/share/route.ts:6`
```typescript
// No auth check before tracking share!
```
**Impact:** Bots could spam fake shares  
**Fix:** Add auth check + rate limiting  
**Recommendation:** Only authenticated users or per-IP limit

---

## 📖 HOW TO USE THESE DOCUMENTS

### Step 1: Read INTERACTIONS-AUDIT.md
- Understand all 10 interactions
- See data flow for each
- Understand what client sees

### Step 2: Use INTERACTIONS-TODO.md
- Go through each test group in order
- Check off each test as you go
- Document any failures

### Step 3: Track Results
- Mark ✅ PASS or ❌ FAIL
- Document any bugs found
- Fix critical bugs before launch

---

## ✅ SUCCESS CRITERIA

**Before campaign launch, ALL of these must be true:**

- ✅ All 44 tests PASS
- ✅ No XSS injection possible in comments
- ✅ Comments properly moderated (not auto-approved)
- ✅ Rate limiting on question form
- ✅ Share tracking protected
- ✅ Real-time dashboard updates
- ✅ Works on mobile
- ✅ Works with multiple concurrent users
- ✅ No data loss or duplicates

---

## 🚀 NEXT STEPS

1. **Today:**
   - Read INTERACTIONS-AUDIT.md (30 min)
   - Setup test users (30 min)

2. **Tomorrow (8 hours):**
   - Execute INTERACTIONS-TODO.md groups 1-6 (4 hours)
   - Execute groups 7-8 (2 hours)
   - Fix critical bugs (2 hours)

3. **Next Day:**
   - Re-test fixed bugs (2 hours)
   - Final verification (1 hour)
   - Document results

**Total: 10 hours before campaign launch**

---

## 📞 FOUND ISSUES SUMMARY

| Issue | Severity | File | Fix Time |
|-------|----------|------|----------|
| Comments auto-approved | 🔴 HIGH | comment-actions.ts | 1-2 hrs |
| No rate limit on FAQ | 🟠 MEDIUM | ask-client-actions.ts | 1 hr |
| Share not rate-limited | 🟠 MEDIUM | share/route.ts | 1 hr |

**Total fix time: 3-4 hours**

---

## 📊 INTERACTION FLOW DIAGRAM

```
VISITOR                          MODONTY PUBLIC SITE
  ↓
  └─→ [Click Like Button]
       └─→ likeArticle()
            └─→ articleLike.create()
                 └─→ MongoDB: articleLike table
                      ↓
                 ┌─────────────────────────────────┐
                 │                                 │
          MODONTY ADMIN DASHBOARD          PUBLIC SITE
          (Client sees)                    (Visitor sees)
                 │                              │
          Like Count: 1                   Button highlights
          ← Updates in real-time         Count increases
                 │                              │
                 └──────────────────────────────┘
```

---

**Created:** 2026-04-08  
**Status:** READY FOR EXECUTION  
**Estimated Test Duration:** 8 hours  
**Critical Issues Found:** 3 (fix before launch)  

**Ready to test?** Start with INTERACTIONS-TODO.md Setup section 👇
