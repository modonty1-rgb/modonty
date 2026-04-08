# Modonty Campaign Launch — Quick Start Guide

**Read this first.** Then follow TODO.md in order.

---

## 🎯 The Problem

You're launching a **high-cost campaign** but modonty has **3 critical blockers**:

1. ❌ **Email not working** — subscribers saved, emails never sent
2. ❌ **No rate limiting** — bots can spam/DDoS your signup form  
3. ❌ **Contact form broken** — submissions vanish, customers can't reach you

**Fix these now** or campaign will fail.

---

## ⚡ Quick Timeline

| Phase | What | Days | Status |
|-------|------|------|--------|
| **Phase 1** | Fix 3 blockers | 2-3 | START HERE |
| **Phase 2** | Performance + backups | 1-2 | Then this |
| **Phase 3** | Launch + monitor | Week 1 | Then launch |
| **Phase 4** | Polish features | Week 2+ | Post-launch |

---

## 🔴 PHASE 1: Critical Fixes (Start Today)

### Task 1: Add Email Service (~2 hours)
**Why:** Subscribers aren't getting emails. Newsletter is useless.

**Steps:**
1. Go to https://resend.com → Sign up (free)
2. Get API key
3. Add to modonty `.env.local`: `RESEND_API_KEY=re_xxxxx`
4. Create email templates (welcome, contact confirmation)
5. Update `/api/news/subscribe` route to send email
6. Test: Subscribe with real email → should arrive <30 seconds
7. Deploy

**Files to change:**
- `modonty/lib/email.ts` — NEW
- `modonty/app/api/news/subscribe/route.ts` — UPDATE
- `modonty/app/contact/actions/contact-actions.ts` — UPDATE

---

### Task 2: Add Rate Limiting (~1.5 hours)
**Why:** Without this, bots can spam your signup form during campaign.

**Steps:**
1. Go to https://upstash.com → Create free Redis database
2. Get REST URL and token
3. Add to `.env.local`: 
   ```
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```
4. Create `modonty/lib/rate-limit.ts`
5. Add rate limiting to:
   - `/api/news/subscribe` (100/min)
   - `/api/contact` (10/min)
6. Test with curl rapid requests → should get 429 after limit
7. Deploy

**Files to change:**
- `modonty/lib/rate-limit.ts` — NEW
- `modonty/app/api/news/subscribe/route.ts` — UPDATE
- `modonty/app/api/contact/route.ts` — UPDATE

---

### Task 3: Add Error Tracking (~1.5 hours)
**Why:** If bugs happen, you need to know immediately.

**Steps:**
1. Go to https://sentry.io → Sign up (free tier)
2. Create new Next.js project
3. Get DSN value
4. Add to `.env.local`: `SENTRY_DSN=https://...`
5. Create `modonty/lib/sentry.ts` to initialize
6. Test: Create sample error route → check Sentry dashboard
7. Setup Slack notification when error occurs
8. Deploy

**Files to change:**
- `modonty/lib/sentry.ts` — NEW
- `modonty/app/error.tsx` — UPDATE

---

## ✅ Phase 1 Verification (Before moving to Phase 2)

Test each in staging environment:

- [ ] **Email:** Subscribe to newsletter → email arrives
- [ ] **Email:** Submit contact form → both admin + user get emails
- [ ] **Rate limiting:** Spam subscribe 150 times → get 429 after 100
- [ ] **Error tracking:** Trigger error → appears in Sentry
- [ ] **Build:** Run `pnpm build` → succeeds
- [ ] **Types:** Run `pnpm tsc --noEmit` → zero errors
- [ ] **Production:** Deploy and smoke test

**If all green:** Continue to Phase 2

---

## 🟠 PHASE 2: Campaign Prep (~2 days)

### Before Launch
- [ ] Database backups enabled (MongoDB Atlas)
- [ ] Database indexes added (for fast queries during traffic spike)
- [ ] Images optimized (Cloudinary auto-compress)
- [ ] **Chatbot QA completed** (test prompts, verify RAG, check costs)
- [ ] Analytics dashboard created (track growth)
- [ ] Load test passed (100 concurrent users)
- [ ] Mobile testing done (iOS + Android)

### Full QA Pass
- [ ] Homepage loads fast
- [ ] All articles render correctly
- [ ] Search works
- [ ] Forms submit (subscribe, contact, register)
- [ ] Auth flows work (login, logout, password reset)
- [ ] Comments load and work
- [ ] No 404 errors
- [ ] Lighthouse score >85
- [ ] Core Web Vitals all green

**If all green:** Ready to launch

---

## 🚀 PHASE 3: Launch Week

### Day 1 (Launch)
- [ ] Final backup
- [ ] Smoke test production
- [ ] Go live
- [ ] Monitor errors every 15 minutes
- [ ] Check email delivery rate
- [ ] Watch subscriber count

### Days 2-7
- [ ] Daily error review
- [ ] Email metrics check (delivery, bounces)
- [ ] Page speed verification
- [ ] Subscriber growth tracking
- [ ] Contact form response speed (2hr SLA)

---

## 📁 Key Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `PRODUCTION-READINESS.md` | Complete checklist + details | Reference guide |
| `TODO.md` | Daily working checklist | Use this to track |
| `QUICK-START.md` | This file — overview | Quick reference |

---

## 💰 Cost Summary

| Service | Purpose | Cost | Setup |
|---------|---------|------|-------|
| **Resend** | Email | $0-20/mo | 15 min |
| **Upstash** | Rate limiting | Free | 10 min |
| **Sentry** | Error tracking | free | 10 min |
| **MongoDB Atlas** | Backups | Included | 5 min |
| **Total** | - | ~$20-50/mo | ~45 min |

---

## 🎯 Campaign Success Criteria

After 1 week, these should be true:

- ✅ Email sending >98% delivery rate
- ✅ Subscribers growing 200+/day
- ✅ Contact form getting 50+/day  
- ✅ Zero critical errors
- ✅ Page load time <2s
- ✅ No security incidents
- ✅ Database performing well
- ✅ Conversion rate >5%

---

## 🚨 If Something Goes Wrong

| Problem | Solution |
|---------|----------|
| Emails not arriving | Check Resend dashboard → verify API key → test domain |
| Rate limiting too harsh | Increase limit or disable temporarily |
| Database slow | Check indexes → check connection pool → scale up |
| High error rate | Check Sentry → find pattern → fix → deploy |
| Page slow | Check image sizes → check database queries → optimize |
| Subscribers can't signup | Check form validation → check rate limit → check email service |

---

## ✅ Ready?

1. **Read** `PRODUCTION-READINESS.md` (understand all the details)
2. **Follow** `TODO.md` (execute each task in order)
3. **Verify** each phase before moving to next
4. **Monitor** daily during launch week
5. **Celebrate** when metrics are green 🎉

---

**Questions? Check PRODUCTION-READINESS.md for full details.**

**Ready to start Phase 1? Go to TODO.md**

---

*Created: 2026-04-08*  
*Status: READY TO EXECUTE*
