# Modonty Visitor Interactions — Complete Reference
**ملخص التفاعلات بين الزوار والعملاء**
**Status:** DISCOVERY COMPLETE — Ready for Testing
**Last Updated:** 2026-04-08

---

## THE 10 INTERACTIONS — QUICK OVERVIEW

| # | Interaction | Frontend | Backend | DB Storage | Client Sees | Status |
|---|-------------|----------|---------|-----------|-------------|--------|
| 1 | **Like Article** | ✅ Button | ✅ API/Action | ✅ articleLike | Like count | Need Test |
| 2 | **Dislike Article** | ✅ Button | ✅ API/Action | ✅ articleDislike | Dislike count | Need Test |
| 3 | **Favorite Article** | ✅ Button | ✅ Action | ✅ articleFavorite | Favorite count | Need Test |
| 4 | **Comment** | ✅ Form | ✅ Action | ✅ comment | Comment list + count | Need Test |
| 5 | **Like Comment** | ✅ Button | ✅ Action | ✅ commentLike | Like count | Need Test |
| 6 | **Dislike Comment** | ✅ Button | ✅ Action | ✅ commentDislike | Dislike count | Need Test |
| 7 | **Reply to Comment** | ✅ Form | ✅ Action | ✅ comment (parentId) | Nested replies | Need Test |
| 8 | **Ask Question (FAQ)** | ✅ Form | ✅ Action | ✅ articleFAQ | Pending Q&A | Need Test |
| 9 | **Follow Client** | ✅ Button | ✅ API | ✅ clientLike | Follower count | Need Test |
| 10 | **Share Article** | ✅ Buttons | ✅ API | ✅ share | Share count by platform | Need Test |

---

## WHAT TO VERIFY FOR EACH INTERACTION

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

## INTERACTION FLOW

```
VISITOR ACTION → FRONTEND TRIGGER → BACKEND SAVE → DB UPDATE → CLIENT SEES
    ↓                   ↓                  ↓             ↓           ↓
Click Like      likeArticle()      articleLike.create  articleLike   Dashboard
Click Comment   submitComment()    comment.create      comment       Dashboard
Ask Question    submitAskClient()  articleFAQ.create   articleFAQ    Dashboard
Follow Client   POST /follow       clientLike.create   clientLike    Dashboard
Share Article   POST /share        share.create        share         Dashboard
```

---

## 3 CRITICAL BUGS FOUND

| Bug | Severity | File | Fix |
|-----|----------|------|-----|
| Comments auto-approved (no moderation) | 🔴 HIGH | `comment-actions.ts:53` | Change `APPROVED` → `PENDING` |
| No global rate limit on Ask Question | 🟠 MEDIUM | `ask-client-actions.ts:62` | Add max 10/user/day |
| Share tracking not auth-protected | 🟠 MEDIUM | `share/route.ts` | Add auth + per-IP limit |

---

## INTERACTION #1: LIKE ARTICLE

**What Happens**: Visitor clicks 👍 → saved to `articleLike` → counter increments → client sees in dashboard

**Files:**
- `modonty/app/articles/[slug]/components/article-interaction-buttons.tsx`
- `modonty/app/articles/[slug]/actions/article-interactions.ts`
- `modonty/app/api/articles/[slug]/like/route.ts` (POST/DELETE)

**DB:** `articleLike` — fields: `articleId`, `userId`, `sessionId`, `createdAt` — unique(articleId, userId)

**Verification:**
- [ ] **1.1** Login, go to any article
- [ ] **1.2** Click Like → count +1
- [ ] **1.3** Click Like again → toggle off, count -1
- [ ] **1.4** DevTools Network → POST to `/api/articles/[slug]/like`
- [ ] **1.5** Response → `{ success: true, likes: X, dislikes: Y }`
- [ ] **1.6** DB → `articleLike` has new record with your userId
- [ ] **1.7** Admin dashboard → client sees like count in article analytics
- [ ] **1.8** Dashboard updates in real-time (no refresh)
- [ ] **1.9** Click Dislike after Like → like removed, dislike added
- [ ] **1.10** Different user → separate like (one per user)

---

## INTERACTION #2: DISLIKE ARTICLE

**What Happens**: Visitor clicks 👎 → saved to `articleDislike` → like auto-removed if existed → counter increments

**Logic:** Like and Dislike are mutually exclusive. Toggle behavior on second click.

**Verification:**
- [ ] **2.1** Login, go to article
- [ ] **2.2** Click Dislike → count +1, like count unchanged
- [ ] **2.3** Click Like → dislike removed, like added
- [ ] **2.4** Click Dislike → like removed, dislike added
- [ ] **2.5** DevTools Network → POST successful
- [ ] **2.6** DB → `articleDislike` updated
- [ ] **2.7** Dashboard → dislikes count visible
- [ ] **2.8** Like + dislike can NEVER both exist for same user on same article

---

## INTERACTION #3: FAVORITE ARTICLE

**What Happens**: Visitor clicks ⭐ → saved to `articleFavorite` → counter increments → "save for later" functionality

**Verification:**
- [ ] **3.1** Click Favorite → count +1
- [ ] **3.2** Click again → toggle off
- [ ] **3.3** DB → `articleFavorite` record exists
- [ ] **3.4** Dashboard → favorite count visible
- [ ] **3.5** User can view saved articles in their profile

---

## INTERACTION #4: SUBMIT COMMENT

**What Happens**: Visitor fills form → sanitized → saved to `comment` → appears on page → dashboard shows count

**File:** `modonty/app/articles/[slug]/actions/comment-actions.ts`

**DB:** `comment` — fields: `content`, `articleId`, `authorId`, `status`, `createdAt`

**⚠️ BUG:** `status: APPROVED` by default at line 53 — no moderation step

**Verification:**
- [ ] **4.1** Login, fill comment form
- [ ] **4.2** Submit → comment appears on page
- [ ] **4.3** Comment counter +1
- [ ] **4.4** Refresh → comment persists
- [ ] **4.5** DevTools → POST successful
- [ ] **4.6** DB → `comment` record with your userId
- [ ] **4.7** XSS test: `<script>alert('xss')</script>` → escaped, not executed
- [ ] **4.8** Length validation → >1000 chars → error
- [ ] **4.9** Dashboard → comment count +1
- [ ] **4.10** Dashboard → comment text visible
- [ ] **4.11** Comment appears in correct article (no cross-article bugs)
- [ ] **4.12** HTML escaped in DB (look for `&lt;` instead of `<`)

---

## INTERACTION #5: LIKE COMMENT

**What Happens**: Visitor clicks 👍 on a comment → saved to `commentLike` → counter increments

**Verification:**
- [ ] **5.1** Find a comment, click Like → count +1
- [ ] **5.2** Click again → toggle off
- [ ] **5.3** Click Dislike → like removed, dislike added
- [ ] **5.4** DB → `commentLike` record
- [ ] **5.5** Counter accurate
- [ ] **5.6** Different user → separate like

---

## INTERACTION #6: DISLIKE COMMENT

**What Happens**: Same flow as Like Comment but uses `commentDislike` table. Mutually exclusive with like.

**Verification:**
- [ ] **6.1** Click Dislike on a comment → count +1
- [ ] **6.2** Like is removed if it existed
- [ ] **6.3** DB → `commentDislike` updated

---

## INTERACTION #7: REPLY TO COMMENT

**What Happens**: Visitor clicks Reply → form appears → submitted with `parentId` → appears indented under parent

**DB:** Same `comment` table — `parentId` field links to parent comment

**⚠️ NOTE:** Also auto-approved, same issue as comments

**Verification:**
- [ ] **7.1** Click Reply under a comment
- [ ] **7.2** Fill form, submit
- [ ] **7.3** Reply appears under parent comment
- [ ] **7.4** Author name correct
- [ ] **7.5** DB → `comment` with `parentId` set
- [ ] **7.6** 2-level nesting works (reply to reply)
- [ ] **7.7** Reply counts correct
- [ ] **7.8** Dashboard comment count includes replies

---

## INTERACTION #8: ASK QUESTION (FAQ)

**What Happens**: Visitor submits question form → saved to `articleFAQ` with status PENDING → client answers in admin → answer appears in FAQ section

**File:** `modonty/app/articles/[slug]/actions/ask-client-actions.ts`

**DB:** `articleFAQ` — fields: `articleId`, `question`, `answer`, `status` (PENDING/PUBLISHED), `submittedByName`, `submittedByEmail`

**Limit:** Max 5 pending per email per article (⚠️ no global limit — bug)

**Verification:**
- [ ] **8.1** Login, find "Ask Client" section on article
- [ ] **8.2** Fill form, submit
- [ ] **8.3** Success message appears
- [ ] **8.4** Refresh → question in "Pending Q&A"
- [ ] **8.5** DB → `articleFAQ` with `status: PENDING`
- [ ] **8.6** Client admin → sees pending question
- [ ] **8.7** Client answers in admin
- [ ] **8.8** Return to article → answer appears in FAQ
- [ ] **8.9** DB → status changed to PUBLISHED
- [ ] **8.10** Spam test → submit 5 questions, 6th should error
- [ ] **8.11** HTML injection in question → escaped

---

## INTERACTION #9: FOLLOW CLIENT

**What Happens**: Visitor on client profile clicks Follow → saved to `clientLike` → button changes to "Following" → follower count +1

**File:** `modonty/app/api/clients/[slug]/follow/route.ts` (GET/POST/DELETE)

**DB:** `clientLike` — fields: `clientId`, `userId`

**⚠️ DESIGN NOTE:** Follow uses "like" table — confusing naming but works

**Verification:**
- [ ] **9.1** Login, go to client profile
- [ ] **9.2** Click Follow → button changes to "Following"
- [ ] **9.3** Follower count +1
- [ ] **9.4** DevTools → POST successful
- [ ] **9.5** DB → `clientLike` record created
- [ ] **9.6** Refresh → button still shows "Following"
- [ ] **9.7** User profile → "Following" list updated
- [ ] **9.8** Click "Following" → unfollow, count -1
- [ ] **9.9** Admin dashboard → follower count updated
- [ ] **9.10** Multiple users → followers accumulate

---

## INTERACTION #10: SHARE ARTICLE

**What Happens**: Visitor clicks share (Twitter/LinkedIn/Facebook/WhatsApp/Email/Copy) → tracked in `share` table → platform breakdown in dashboard

**File:** `modonty/app/api/articles/[slug]/share/route.ts`

**DB:** `share` — fields: `articleId`, `clientId`, `platform` (TWITTER/LINKEDIN/FACEBOOK/WHATSAPP/EMAIL/COPY_LINK/OTHER)

**⚠️ NOTE:** Tracks share intention, not success (user might close dialog without sharing)

**⚠️ BUG:** No auth check before tracking — bots can spam fake shares

**Verification:**
- [ ] **10.1** Go to article, find share buttons
- [ ] **10.2** Click Twitter → DevTools POST to `/api/articles/[slug]/share`
- [ ] **10.3** Response → `{ success: true }`
- [ ] **10.4** DB → `share` record with `platform: TWITTER`
- [ ] **10.5** Test all platforms → separate record per platform
- [ ] **10.6** Share count increments on article
- [ ] **10.7** Dashboard → share metrics by platform
- [ ] **10.8** Social share opens correct dialog
- [ ] **10.9** Article title + link included in share preview

---

## CLIENT DASHBOARD — WHAT CLIENTS SEE

| Metric | DB Source | Real-Time? |
|--------|-----------|-----------|
| Likes count | `articleLike` | Yes |
| Dislikes count | `articleDislike` | Yes |
| Comments count | `comment` | Yes |
| Favorites count | `articleFavorite` | Yes |
| Shares count | `share` | Yes |
| Q&A count | `articleFAQ` | Yes |
| Followers count | `clientLike` | Yes |

**Dashboard Verification:**
- [ ] **C1** Open admin dashboard
- [ ] **C2** Like article in public site → dashboard updates without refresh
- [ ] **C3** Submit comment → comment count +1 in dashboard
- [ ] **C4** Ask question → Q&A count +1
- [ ] **C5** Follow client → follower count +1
- [ ] **C6** Share on multiple platforms → breakdown by platform visible
- [ ] **C7** Multiple visitors simultaneously → counts accumulate correctly

---

## COMMON ISSUES & FIXES

| Issue | Symptom | Cause | Fix |
|-------|---------|-------|-----|
| Like doesn't save | Number doesn't increase | Backend error or no auth | Check DB + console errors |
| Duplicate likes | Count > 1 per user | Race condition | Check unique constraint |
| Comment doesn't appear | Submit but no show | Status PENDING? | Check DB status field |
| Dashboard doesn't update | Count stuck | Cache not invalidated | Check `revalidatePath()` calls |
| Wrong user on like | Other user's name | Auth issue | Verify `session.user.id` |
| Share not recorded | No DB entry | API route failing | Check error logs |
| Comment HTML injected | `<script>` executes | No sanitization | Verify sanitizeComment() runs |

---

## FINAL VERIFICATION CHECKLIST

**Frontend**
- [ ] All interaction buttons visible and clickable
- [ ] No console errors on click
- [ ] Mobile responsive (touch targets ≥44px)
- [ ] Loading states work (spinner during request)
- [ ] Error messages display on failure
- [ ] Success toasts appear after interaction

**Backend**
- [ ] All server actions working (no 500 errors)
- [ ] All API routes return correct status codes
- [ ] Auth check working (unauthenticated users blocked)
- [ ] Rate limiting not blocking legitimate users
- [ ] DB constraints preventing duplicates

**Database**
- [ ] All records saved with correct fields
- [ ] User IDs match (no auth leaks)
- [ ] Timestamps accurate
- [ ] Counts calculated correctly

**Dashboard**
- [ ] All metrics visible
- [ ] Counts update in real-time
- [ ] Breakdown by platform (shares)
- [ ] Historical data preserved

---

## SUCCESS CRITERIA — Before Campaign Launch

- ✅ All interactions save to DB correctly
- ✅ Frontend updates without errors
- ✅ Real-time dashboard updates
- ✅ No XSS/injection vulnerabilities
- ✅ No duplicate actions (except views/shares)
- ✅ Works on mobile
- ✅ Works under concurrent users
- ✅ 3 critical bugs fixed (auto-approve, rate limit, share auth)
