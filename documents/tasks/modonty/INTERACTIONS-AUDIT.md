# Modonty Visitor-to-Client Interactions — Complete Audit
**Critical for Campaign Launch** — Verify 100% Before Going Live
**Status:** DISCOVERY COMPLETE — Ready for Testing

---

## 📊 QUICK OVERVIEW

| Interaction Type | Frontend | Backend | DB Storage | Client Sees | Status |
|------------------|----------|---------|-----------|-------------|--------|
| **Like Article** | ✅ Button | ✅ API/Action | ✅ articleLike | ✅ Count | Need Test |
| **Dislike Article** | ✅ Button | ✅ API/Action | ✅ articleDislike | ✅ Count | Need Test |
| **Favorite Article** | ✅ Button | ✅ Action | ✅ articleFavorite | ✅ Count | Need Test |
| **Submit Comment** | ✅ Form | ✅ Action | ✅ comment | ✅ List | Need Test |
| **Like Comment** | ✅ Button | ✅ Action | ✅ commentLike | ✅ Count | Need Test |
| **Dislike Comment** | ✅ Button | ✅ Action | ✅ commentDislike | ✅ Count | Need Test |
| **Reply to Comment** | ✅ Form | ✅ Action | ✅ comment | ✅ List | Need Test |
| **Ask Question (FAQ)** | ✅ Form | ✅ Action | ✅ articleFAQ | ✅ List | Need Test |
| **Follow Client** | ✅ Button | ✅ API | ✅ clientLike | ✅ Count | Need Test |
| **Unfollow Client** | ✅ Button | ✅ API | ✅ clientLike | ✅ Count | Need Test |
| **Share Article** | ✅ Buttons | ✅ API | ✅ share | ✅ Count | Need Test |

---

## 🔴 INTERACTION #1: LIKE ARTICLE

### What Happens
1. Visitor clicks "👍 Like" button on article page
2. Frontend sends request to backend
3. Backend saves to `articleLike` table
4. Like counter increments on page
5. Client dashboard shows total likes for their article

### Technical Details

**Frontend Code:**
- File: `modonty/app/articles/[slug]/components/article-interaction-buttons.tsx`
- Trigger: Click "Like" button
- Action: `likeArticle(articleId, articleSlug)`

**Backend Path:** Server Action
- File: `modonty/app/articles/[slug]/actions/article-interactions.ts`
- Function: `export async function likeArticle(articleId, articleSlug)`
- Also has API route: `modonty/app/api/articles/[slug]/like/route.ts` (POST/DELETE)

**Database:**
- Table: `articleLike`
- Fields: `articleId`, `userId`, `sessionId`, `createdAt`
- Key: `unique(articleId, userId)` — one like per user per article

**What Client Sees:**
- In article view: Like count increases
- In dashboard: Article analytics show like count
- Should track: likes per article per day

### Verification Checklist

- [ ] **1.1** Login as regular user, go to any article
- [ ] **1.2** Click "Like" button → count increases by 1
- [ ] **1.3** Click "Like" again → toggles (removes like, count decreases)
- [ ] **1.4** Open browser DevTools → Network tab → verify POST to `/api/articles/[slug]/like`
- [ ] **1.5** Check response → includes `{ success: true, likes: X, dislikes: Y }`
- [ ] **1.6** Check database → `db.articleLike` has new record with your userId
- [ ] **1.7** Login to admin dashboard (separate app) → verify client sees like count in article analytics
- [ ] **1.8** Check client dashboard shows like in real-time (no refresh needed?)
- [ ] **1.9** Test dislike button after like → dislike should remove like, add dislike
- [ ] **1.10** Test from different user account → should show separate like (one per user)

**Files Involved:**
- `modonty/app/articles/[slug]/actions/article-interactions.ts` (server action)
- `modonty/app/api/articles/[slug]/like/route.ts` (API route)
- Database: `articleLike` table

---

## 🔴 INTERACTION #2: DISLIKE ARTICLE

### What Happens
1. Visitor clicks "👎 Dislike" button on article page
2. Backend saves to `articleDislike` table
3. Like is automatically removed if user had liked
4. Dislike counter increments on page
5. Client sees total dislikes in dashboard

### Technical Details

**Frontend:** Similar to Like
**Backend:** `dislikeArticle()` in server actions
**Database:** `articleDislike` table
**Logic:** 
- Like and Dislike are mutually exclusive
- If you like then dislike → like is removed, dislike is added
- If you dislike then dislike again → dislike is removed (toggle)

### Verification Checklist

- [ ] **2.1** Login, go to article
- [ ] **2.2** Click "Dislike" → count increases by 1, like count unchanged
- [ ] **2.3** Click "Like" → dislike is removed, like is added
- [ ] **2.4** Click "Dislike" → like is removed, dislike is added
- [ ] **2.5** Check DevTools Network → POST successful
- [ ] **2.6** Check database → `articleDislike` table updated
- [ ] **2.7** Check client dashboard shows dislikes count
- [ ] **2.8** Test that like + dislike can never both exist for same user on same article

---

## 🔴 INTERACTION #3: FAVORITE ARTICLE

### What Happens
1. Visitor clicks "⭐ Favorite" button
2. Backend saves to `articleFavorite` table
3. Favorite counter increments
4. Used for "Save for Later" functionality
5. Client can see in dashboard

### Verification Checklist

- [ ] **3.1** Click Favorite button → count increases
- [ ] **3.2** Click again → toggle (removes favorite)
- [ ] **3.3** Check database → `articleFavorite` record exists
- [ ] **3.4** Check client dashboard → shows favorite count
- [ ] **3.5** Verify user can view their saved articles in profile

---

## 🔴 INTERACTION #4: SUBMIT COMMENT

### What Happens
1. Visitor fills comment form and clicks "Post Comment"
2. Comment is sanitized (HTML escape) for security
3. Saved to `comment` table with `status: APPROVED`
4. Comment appears on article page
5. Client sees comment count increase in dashboard

### Technical Details

**Frontend:** Comment form component
**Backend:** `submitComment()` server action
**File:** `modonty/app/articles/[slug]/actions/comment-actions.ts`
**Validation:**
- Content required (min 1 char, max 1000 chars)
- HTML sanitized to prevent XSS
- User must be authenticated

**Database:**
- Table: `comment`
- Fields: `content`, `articleId`, `authorId`, `status`, `createdAt`
- Status: APPROVED by default (auto-approved, no moderation step?)

**⚠️ ISSUE FOUND:** Comments are auto-approved! No moderation step. Clients might see spam/inappropriate comments immediately.

### Verification Checklist

- [ ] **4.1** Login, go to article, fill comment form
- [ ] **4.2** Submit → comment appears immediately on page
- [ ] **4.3** Comment counter increases
- [ ] **4.4** Refresh page → comment still appears
- [ ] **4.5** Check DevTools Network → POST successful
- [ ] **4.6** Check database → `comment` record with your userId
- [ ] **4.7** Test HTML injection → `<script>alert('xss')</script>` → should be escaped, not executed
- [ ] **4.8** Test comment length validation → >1000 chars → should error
- [ ] **4.9** Check client dashboard → comment count increases
- [ ] **4.10** Check client dashboard → comment text visible
- [ ] **4.11** Test comment appears in "all comments" view on article
- [ ] **4.12** Test comment appears under correct article (no cross-article bugs)

**Security Check:**
- [ ] Verify HTML is escaped (look for `&lt;` instead of `<`)
- [ ] Verify no script injection possible
- [ ] Verify comment author is correct user (not someone else's name)

---

## 🔴 INTERACTION #5: LIKE COMMENT

### What Happens
1. Visitor clicks "👍" under a comment
2. Like is recorded in `commentLike` table
3. Like counter increases under comment
4. Can't like and dislike same comment simultaneously

### Verification Checklist

- [ ] **5.1** Find a comment on article
- [ ] **5.2** Click like → count increases
- [ ] **5.3** Click again → toggle off
- [ ] **5.4** Test dislike → removes like, adds dislike
- [ ] **5.5** Check database → `commentLike` record
- [ ] **5.6** Verify counter is accurate
- [ ] **5.7** Test from different user → should show separate like

---

## 🔴 INTERACTION #6: DISLIKE COMMENT

### Similar to Like Comment
- Same verification process
- Check `commentDislike` table
- Verify mutually exclusive with like

### Verification Checklist

- [ ] **6.1** Click dislike on a comment
- [ ] **6.2** Count increases
- [ ] **6.3** Like is removed if it existed
- [ ] **6.4** Database updated correctly

---

## 🔴 INTERACTION #7: REPLY TO COMMENT

### What Happens
1. Visitor clicks "Reply" on a comment
2. Reply form appears
3. Submits reply to same `comment` table (with `parentId`)
4. Reply appears indented under parent comment
5. Client sees in comment list

### Technical Details

**Frontend:** Reply form dialog
**Backend:** `submitReply()` server action
**Database:** 
- Table: `comment` (same table)
- Field: `parentId` → links reply to parent comment
- Also auto-approved (no moderation)

### Verification Checklist

- [ ] **7.1** Click "Reply" under a comment
- [ ] **7.2** Fill reply form, submit
- [ ] **7.3** Reply appears under parent comment
- [ ] **7.4** Reply shows author name correctly
- [ ] **7.5** Check database → `comment` with `parentId` set
- [ ] **7.6** Test 2-level nesting works (reply to reply)
- [ ] **7.7** Verify reply counts are correct
- [ ] **7.8** Client dashboard shows total comment count includes replies

---

## 🔴 INTERACTION #8: ASK QUESTION (FAQ)

### What Happens
1. Visitor fills "Ask Client a Question" form
2. Question is saved to `articleFAQ` table
3. Status: PENDING (not auto-answered)
4. Client receives notification
5. Client can answer in admin dashboard
6. Answer appears on article FAQ section
7. Visitor sees their question status

### Technical Details

**Frontend:** Ask dialog in article sidebar
**Backend:** `submitAskClient()` server action
**File:** `modonty/app/articles/[slug]/actions/ask-client-actions.ts`
**Database:**
- Table: `articleFAQ`
- Fields: `articleId`, `question`, `answer`, `status` (PENDING/PUBLISHED), `submittedByName`, `submittedByEmail`
- Limit: Max 5 pending questions per email per article

**Logic:**
- Sanitizes HTML (security)
- Validates email (must have name and email)
- Limits to prevent spam

### Verification Checklist

- [ ] **8.1** Login, go to article, find "Ask Client" section
- [ ] **8.2** Fill form with question, submit
- [ ] **8.3** See success message "Question submitted"
- [ ] **8.4** Refresh page → question appears in "Pending Q&A" section
- [ ] **8.5** Check database → `articleFAQ` record with `status: PENDING`
- [ ] **8.6** Login to client admin dashboard → see pending question
- [ ] **8.7** Client answers question in admin
- [ ] **8.8** Return to article → answer appears in FAQ
- [ ] **8.9** FAQ status changes to PUBLISHED in database
- [ ] **8.10** Test spam protection → submit 5 questions, 6th should error
- [ ] **8.11** Verify submitter email is stored (for follow-up)
- [ ] **8.12** Test HTML injection in question → should be escaped

---

## 🔴 INTERACTION #9: FOLLOW CLIENT

### What Happens
1. Visitor goes to client profile page
2. Clicks "Follow" button
3. Saved to `clientLike` table (following uses same table as "likes")
4. Button changes to "Following"
5. Client's follower count increases
6. Visitor's profile shows "Following these clients"
7. Visitor gets notifications for new articles from client

### Technical Details

**Frontend:** Follow button on client profile
**Backend:** API endpoint
**File:** `modonty/app/api/clients/[slug]/follow/route.ts`
**Methods:** GET (check status), POST (follow), DELETE (unfollow)
**Database:** 
- Table: `clientLike` (reused for both article likes AND client follows)
- Stores: `clientId`, `userId`

**⚠️ DESIGN NOTE:** Using "like" table for "follow" is confusing. Should ideally be separate table, but it works.

### Verification Checklist

- [ ] **9.1** Login, go to client profile page
- [ ] **9.2** Click "Follow" button
- [ ] **9.3** Button changes to "Following"
- [ ] **9.4** Follower count increases by 1
- [ ] **9.5** Check DevTools Network → POST successful
- [ ] **9.6** Check database → `clientLike` record created
- [ ] **9.7** Refresh page → button still shows "Following"
- [ ] **9.8** Check user profile → "Following" list updated
- [ ] **9.9** Click "Following" button → toggle to "Follow"
- [ ] **9.10** Follower count decreases by 1
- [ ] **9.11** Login to client admin → see follower count increased
- [ ] **9.12** Verify client gets notified of new followers (if implemented)
- [ ] **9.13** Test from multiple users → followers accumulate

---

## 🔴 INTERACTION #10: SHARE ARTICLE

### What Happens
1. Visitor clicks share button (Twitter, LinkedIn, Facebook, WhatsApp, Email, Copy Link)
2. Share is tracked in `share` table
3. Share counter shows on article
4. Client dashboard shows share metrics
5. Social platforms (optional): Pre-fills share with article title + link

### Technical Details

**Frontend:** Share button group on article
**Backend:** API endpoint
**File:** `modonty/app/api/articles/[slug]/share/route.ts`
**Database:**
- Table: `share`
- Fields: `articleId`, `clientId`, `platform` (enum: TWITTER, LINKEDIN, FACEBOOK, WHATSAPP, EMAIL, COPY_LINK, OTHER)

**Note:** Only tracking share intention, not actual success of share (user might close dialog without sharing)

### Verification Checklist

- [ ] **10.1** Go to article, find share buttons
- [ ] **10.2** Click Twitter share button
- [ ] **10.3** Check DevTools Network → POST to `/api/articles/[slug]/share`
- [ ] **10.4** Response includes `{ success: true }`
- [ ] **10.5** Check database → `share` record created with platform: TWITTER
- [ ] **10.6** Test other platforms → Facebook, LinkedIn, WhatsApp, Email, Copy Link
- [ ] **10.7** Each creates `share` record with correct platform
- [ ] **10.8** Share count increments on article (if displayed)
- [ ] **10.9** Check client dashboard → share metrics visible
- [ ] **10.10** Test social share actually opens correct share dialog (Twitter, FB, etc.)
- [ ] **10.11** Verify article title + link included in share preview
- [ ] **10.12** Test from multiple users → shares accumulate

---

## 📊 CLIENT DASHBOARD — WHAT CLIENTS SEE

### Location
Admin app (separate from modonty public site)
Path: `/admin/articles/[id]` (article detail view)

### Data Shown
| Metric | Source | Should Update | Real-Time? |
|--------|--------|--------------|-----------|
| Likes count | `articleLike` table | After visitor likes | Yes |
| Dislikes count | `articleDislike` table | After visitor dislikes | Yes |
| Comments count | `comment` table | After visitor submits | Yes |
| Favorites count | `articleFavorite` table | After visitor saves | Yes |
| Shares count | `share` table | After visitor shares | Yes |
| Q&A count | `articleFAQ` table | After visitor asks | Yes |
| Followers count | `clientLike` table | After visitor follows | Yes |

### Issues to Check
1. **Real-time updates:** Does count update without page refresh?
2. **Data lag:** Is there any delay between visitor action and dashboard update?
3. **Accuracy:** Is count calculation correct?
4. **Missing interactions:** Are all interactions displayed?

### Verification Checklist

- [ ] **C1** Open client admin dashboard
- [ ] **C2** Find analytics/dashboard section
- [ ] **C3** See like count for article
- [ ] **C4** In separate browser/tab: like article on public site
- [ ] **C5** Dashboard updates WITHOUT page refresh → count +1
- [ ] **C6** Add comment on public site
- [ ] **C7** Dashboard updates WITHOUT page refresh → comment count +1
- [ ] **C8** Submit FAQ question
- [ ] **C9** Dashboard updates → Q&A count +1
- [ ] **C10** Follow client
- [ ] **C11** Dashboard updates → follower count +1
- [ ] **C12** Share article on multiple platforms
- [ ] **C13** Dashboard shows breakdown by platform (Twitter, FB, LinkedIn, etc.)
- [ ] **C14** Test with multiple visitors simultaneously
- [ ] **C15** All counts accumulate correctly (no duplicates, no missing counts)

---

## 🚀 INTERACTION DATA FLOW SUMMARY

```
VISITOR ACTION → FRONTEND TRIGGER → BACKEND SAVE → DB UPDATE → CLIENT SEES
    ↓                   ↓                  ↓             ↓           ↓
Click Like      likeArticle()      articleLike.create  articleLike   Dashboard
Click Comment   submitComment()    comment.create      comment       Dashboard
Ask Question    submitAskClient()  articleFAQ.create   articleFAQ     Dashboard
Follow Client   POST /follow       clientLike.create   clientLike     Dashboard
Share Article   POST /share        share.create        share          Dashboard
```

---

## 📋 TESTING MATRIX

### Test Scenario: New Article from Client ABC
1. Publish article on client's admin
2. Article appears on modonty public site ✓
3. Visitor A comes and:
   - [ ] Likes article → Dashboard shows 1 like ✓
   - [ ] Follows client → Dashboard shows 1 follower ✓
   - [ ] Asks question → Dashboard shows 1 pending Q&A ✓
   - [ ] Shares on Twitter → Dashboard shows 1 Twitter share ✓
4. Visitor B comes and:
   - [ ] Likes article → Dashboard shows 2 likes (not 1) ✓
   - [ ] Comments → Dashboard shows 1 comment ✓
   - [ ] Replies to Visitor A's comment → Dashboard shows 2 comments ✓
5. Refresh dashboard → All counts persist ✓
6. Next day: Check if counts accurate ✓

---

## 🔧 COMMON ISSUES & FIXES

| Issue | Symptom | Cause | Fix |
|-------|---------|-------|-----|
| **Like doesn't save** | Click like, number doesn't increase | Backend error or no auth | Check DB, check console errors |
| **Duplicate likes** | Like count > 1 per user | Race condition | Add unique constraint check |
| **Comment doesn't appear** | Submit comment, doesn't show | Moderation pending? | Check status in DB, default to APPROVED |
| **Dashboard doesn't update** | Like/comment added but dashboard stuck | Cache not invalidated | Check `revalidatePath()` calls |
| **Wrong user likes** | Shows other user's name on like | Auth issue | Verify `session.user.id` correct |
| **Share not recorded** | Click share, no DB entry | API route failing | Check error logs in Sentry |
| **Comment HTML injected** | Can submit `<script>` tags | No sanitization | Verify sanitizeComment() runs |

---

## ✅ FINAL VERIFICATION CHECKLIST

Before campaign launch, verify:

### Frontend
- [ ] All interaction buttons visible and clickable
- [ ] No console errors when clicking buttons
- [ ] Responsive on mobile (touch targets ≥44px)
- [ ] Loading states work (show spinner during request)
- [ ] Error messages display if interaction fails
- [ ] Success messages/toasts appear after interaction

### Backend
- [ ] All server actions working (no 500 errors)
- [ ] All API routes return correct status codes
- [ ] No unhandled errors (check Sentry logs)
- [ ] Auth check working (unauthenticated users can't interact)
- [ ] Rate limiting not blocking legitimate interactions
- [ ] Database constraints preventing duplicates

### Database
- [ ] All records saved correctly with right fields
- [ ] User IDs match (not other user's interaction)
- [ ] Timestamps accurate
- [ ] Counts calculated correctly
- [ ] No orphaned records (deleted articles but interactions remain)

### Client Dashboard
- [ ] All metrics visible
- [ ] Counts update without page refresh (real-time or polling)
- [ ] Breakdown by type (likes, comments, shares)
- [ ] Breakdown by platform (for shares)
- [ ] Historical data preserved (not reset daily)
- [ ] Accurate (spot-check counts match DB)

---

## 📝 TEST EXECUTION PLAN

### Phase 1: Individual Interaction Testing (2 hours)
1. Test each interaction type separately
2. Check frontend, backend, database, dashboard for each
3. Document any failures
4. Fix critical bugs
5. Re-test

### Phase 2: Multi-User Simulation (1 hour)
1. 3+ test users interacting simultaneously
2. Verify counts don't duplicate or conflict
3. Check race condition handling
4. Verify dashboard accuracy under concurrent load

### Phase 3: Load Testing (1 hour)
1. Simulate 100 interactions/minute
2. Check database performance
3. Verify no timeouts
4. Monitor memory/CPU usage

### Phase 4: Security Testing (1 hour)
1. XSS injection in comments
2. SQL injection in search
3. Unauthorized access to dashboard
4. Comment from blocked user

### Phase 5: Integration Testing (1 hour)
1. Full user journey: Register → Read article → Like → Comment → Follow → Share
2. Check all steps work end-to-end
3. Verify data consistent across all pages
4. Test on mobile and desktop browsers

---

**Total Testing Time:** ~6 hours

**Timeline Recommendation:**
- Day 1: Individual interactions (2 hrs)
- Day 2: Multi-user + Load (2 hrs)
- Day 3: Security + Integration (2 hrs)
- Day 4: Bug fixes + final verification

---

## 🎯 PASS CRITERIA

All interactions MUST:
- ✅ Save to database correctly
- ✅ Update frontend without errors
- ✅ Appear in client dashboard in real-time
- ✅ Handle errors gracefully (don't crash)
- ✅ Work on mobile
- ✅ Work when multiple users interact simultaneously
- ✅ Have no XSS/injection vulnerabilities
- ✅ Require authentication (except shares)
- ✅ Not allow duplicate actions (except views/shares)

**Status: READY FOR TESTING**

---

**Last Updated:** 2026-04-08
**Created By:** Expert Interaction Audit
**Ready To:** Test each interaction step-by-step
