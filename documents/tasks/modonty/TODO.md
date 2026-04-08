# Modonty Campaign Launch TODO
**Status:** READY TO START  
**Campaign Cost:** High Stakes  
**Target Launch:** ASAP (depends on Phase 1 completion)

---

## 📋 PHASE 1: CRITICAL FIXES (2-3 Days) — DO THIS FIRST

### Email Service Setup
- [ ] **1.1** Choose email provider (Resend recommended)
- [ ] **1.2** Create account and get API key
- [ ] **1.3** Add API key to `.env.local` as `RESEND_API_KEY`
- [ ] **1.4** Create email template components:
  - [ ] Welcome email template
  - [ ] Newsletter template
  - [ ] Contact confirmation template
- [ ] **1.5** Create `modonty/lib/email.ts` with send functions
  - [ ] `sendWelcomeEmail(email: string)`
  - [ ] `sendContactConfirmation(data: contactData)`
  - [ ] `sendAdminNotification(contactData)`
- [ ] **1.6** Update `modonty/app/api/news/subscribe/route.ts` to send welcome email
- [ ] **1.7** Update `modonty/app/contact/actions/contact-actions.ts` to send emails
- [ ] **1.8** Create `modonty/app/api/news/send-newsletter/route.ts` (batch sender)
- [ ] **1.9** Test in staging: subscribe → check inbox for email
- [ ] **1.10** Test in staging: contact form → check both admin + user emails
- [ ] **1.11** Deploy to production

### Rate Limiting
- [ ] **2.1** Create Upstash Redis account (free tier)
- [ ] **2.2** Get `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- [ ] **2.3** Create `modonty/lib/rate-limit.ts` with:
  - [ ] Redis client initialization
  - [ ] Rate limit checking function
  - [ ] Sliding window (100 req/min per IP)
- [ ] **2.4** Add rate limiting middleware to:
  - [ ] `/api/news/subscribe` (100/min)
  - [ ] `/api/contact` (10/min)
  - [ ] `/api/comments/[id]/like` (50/min)
  - [ ] `/api/users/register` (5/min)
- [ ] **2.5** Test with `artillery` tool (simulate bot spam)
- [ ] **2.6** Verify 429 responses when limit exceeded
- [ ] **2.7** Deploy to production

### Error Tracking (Sentry)
- [ ] **3.1** Create Sentry project (free tier)
- [ ] **3.2** Get Sentry DSN
- [ ] **3.3** Create `modonty/lib/sentry.ts` initialization
- [ ] **3.4** Update `modonty/app/error.tsx` to capture errors
- [ ] **3.5** Update API routes to capture caught errors
- [ ] **3.6** Setup Slack alerts for critical errors
- [ ] **3.7** Test by triggering a sample error route
- [ ] **3.8** Verify error appears in Sentry dashboard
- [ ] **3.9** Deploy to production

### Phase 1 Verification
- [ ] **4.1** Run `pnpm tsc --noEmit` (zero errors)
- [ ] **4.2** Run `pnpm build` (succeeds)
- [ ] **4.3** Test staging environment:
  - [ ] Subscribe to newsletter → email arrives within 30s
  - [ ] Submit contact form → admin gets email
  - [ ] Contact form submitter gets confirmation email
  - [ ] Spam bot test (rapid subscribe) → rate limited after 100 attempts
  - [ ] Trigger error → appears in Sentry
- [ ] **4.4** Performance check (Lighthouse >85)
- [ ] **4.5** Check mobile responsive
- [ ] **4.6** Deploy to production

**Phase 1 Complete?** → Go to Phase 2

---

## 📋 PHASE 2: CAMPAIGN PREP (1-2 Days) — BEFORE LAUNCH

### Database Optimization
- [ ] **5.1** Enable MongoDB slow query logging
- [ ] **5.2** Run query analysis on production (identify slow queries)
- [ ] **5.3** Add indexes to Prisma schema:
  - [ ] `article` on `slug`, `publishedAt`, `status`
  - [ ] `client` on `slug`
  - [ ] `newsSubscriber` on `email`, `subscribed`
  - [ ] `contactMessage` on `createdAt`
  - [ ] `comment` on `articleId`, `status`
- [ ] **5.4** Run `pnpm prisma:push` to apply indexes
- [ ] **5.5** Test query performance before/after
- [ ] **5.6** Monitor index usage

### Database Backups
- [ ] **6.1** Go to MongoDB Atlas console
- [ ] **6.2** Enable automatic backups (7-day retention)
- [ ] **6.3** Set backup frequency to daily
- [ ] **6.4** Document backup restoration procedure
- [ ] **6.5** Test restore from backup in test environment
- [ ] **6.6** Create backup SLA document

### Image Optimization
- [ ] **7.1** Verify Cloudinary auto-compression:
  - [ ] Update image URLs to include `q_auto,f_auto,c_limit,w_1920`
  - [ ] Test WebP/AVIF format delivery
- [ ] **7.2** Test with Google PageSpeed Insights
- [ ] **7.3** Verify CLS (cumulative layout shift) <0.1
- [ ] **7.4** Optimize above-fold images
- [ ] **7.5** Verify image load times <2s on mobile 4G

### Analytics Dashboard (Basic)
- [ ] **8.1** Create `/admin/analytics` page
- [ ] **8.2** Add widgets:
  - [ ] Total subscribers count
  - [ ] Subscribers added (last 7 days, chart)
  - [ ] Contact form submissions (last 7 days)
  - [ ] Top articles by views
  - [ ] Top clients by traffic
- [ ] **8.3** Wire up data from:
  - [ ] GTM events
  - [ ] `newsSubscriber` table
  - [ ] `contactMessage` table
  - [ ] `interaction` table (likes, views)
- [ ] **8.4** Test data accuracy
- [ ] **8.5** Verify no performance impact

### Security Verification
- [ ] **9.1** Verify CSRF tokens on all forms
- [ ] **9.2** Check cookies: httpOnly, secure, sameSite
- [ ] **9.3** Test rate limiting on login (5 tries → 15min lockout)
- [ ] **9.4** Verify API route auth protection
- [ ] **9.5** Check for secrets in `.env.example` (should have none)

### Load Testing
- [ ] **10.1** Create load test script with `artillery`
- [ ] **10.2** Simulate 100 concurrent users for 5 minutes
- [ ] **10.3** Monitor:
  - [ ] Response times (target: <500ms p95)
  - [ ] Error rate (target: 0%)
  - [ ] Database connection pool
  - [ ] Memory usage
- [ ] **10.4** Identify and fix bottlenecks
- [ ] **10.5** Document max capacity (X concurrent users)

### Chatbot QA (NEW - Important!)
- [ ] **10.1** Test chatbot with 10 sample user prompts
- [ ] **10.2** Verify responses are relevant (check RAG working)
- [ ] **10.3** Test in both Arabic and English
- [ ] **10.4** Verify chat history saves correctly
- [ ] **10.5** Check timeout handling (set to 30s max per request)
- [ ] **10.6** Monitor Cohere API cost (should be <$0.10 per request)
- [ ] **10.7** Test with rapid requests (verify rate limiting behavior)
- [ ] **10.8** Add rate limiting: max 5 conversations/user/day
- [ ] **10.9** Setup daily cost monitoring (alert if >$50/day)
- [ ] **10.10** Document chatbot limitations for support team

### Performance Testing (NEW - CRITICAL FOR CAMPAIGN)
- [ ] **10.1** Run Lighthouse on homepage
  - [ ] Mobile score ≥85
  - [ ] Desktop score ≥90
  - [ ] LCP <2.5s
  - [ ] FID <100ms
  - [ ] CLS <0.1
- [ ] **10.2** Run Lighthouse on article page
  - [ ] Same thresholds as homepage
- [ ] **10.3** Run Lighthouse on category page
- [ ] **10.4** Run Lighthouse on client profile page
- [ ] **10.5** Check Core Web Vitals (all GREEN)
  - [ ] Use Google PageSpeed Insights
  - [ ] Check on mobile + desktop
- [ ] **10.6** Load test (simulate campaign traffic):
  - [ ] 100 concurrent users for 5 minutes
  - [ ] Response time <500ms p95
  - [ ] Error rate 0%
- [ ] **10.7** Monitor database during load test
  - [ ] CPU usage <70%
  - [ ] Memory usage <80%
  - [ ] Connection pool not exhausted
- [ ] **10.8** Check image optimization
  - [ ] All images <200KB
  - [ ] WebP/AVIF formats used
  - [ ] Responsive images working

### GTM Verification (NEW - CRITICAL FOR CAMPAIGN)
- [ ] **11.1** Verify GTM container installed
  - [ ] GTM script in `<head>` (app/layout.tsx)
  - [ ] Container ID correct: `GTM-XXXX`
- [ ] **11.2** Test GTM is firing:
  - [ ] Open page in browser
  - [ ] Open DevTools → Network
  - [ ] Filter by "gtm" or "analytics"
  - [ ] Should see requests to `www.googletagmanager.com`
- [ ] **11.3** Verify custom events tracked:
  - [ ] **Page views:** Every page navigation
    - [ ] Home page → GTM event `page_view`
    - [ ] Article page → GTM event `page_view` + `article_view`
    - [ ] Client profile → GTM event `page_view` + `client_view`
  - [ ] **Interactions:** (CRITICAL)
    - [ ] Like article → GTM event `like_article` with articleId
    - [ ] Comment submitted → GTM event `comment_submitted` with articleId
    - [ ] Question asked → GTM event `question_asked` with articleId
    - [ ] Client followed → GTM event `client_followed` with clientId
    - [ ] Article shared → GTM event `article_shared` with platform
    - [ ] Newsletter subscribed → GTM event `newsletter_subscribe`
    - [ ] Contact form submitted → GTM event `contact_submitted`
  - [ ] **Conversions:** (CLIENT DASHBOARD)
    - [ ] Each interaction visible in client dashboard
- [ ] **11.4** Test GTM Data Layer:
  - [ ] Open DevTools Console
  - [ ] Type: `console.log(window.dataLayer)`
  - [ ] Should show array of events with proper data
  - [ ] Check event structure (has eventName, articleId, userId, etc.)
- [ ] **11.5** Test in Google Analytics 4:
  - [ ] Login to Google Analytics
  - [ ] Go to Real-time report
  - [ ] Trigger interaction on site (like, comment, etc.)
  - [ ] Should see event appear in GA4 Real-time within 10 seconds
  - [ ] Event name correct
  - [ ] User count increasing
- [ ] **11.6** Setup GA4 Conversion Goals:
  - [ ] Newsletter subscription → conversion
  - [ ] Contact form submission → conversion
  - [ ] Follow client → conversion (optional)
  - [ ] Comment posted → engagement event
  - [ ] Article like → engagement event
- [ ] **11.7** Test conversion tracking:
  - [ ] Subscribe to newsletter
  - [ ] Check GA4: Should show as conversion
  - [ ] Submit contact form
  - [ ] Check GA4: Should show as conversion
  - [ ] Check client dashboard: Counts match GA4
- [ ] **11.8** Verify no GTM errors:
  - [ ] DevTools Console: No GTM errors/warnings
  - [ ] GTM debugger tool: All tags firing correctly
- [ ] **11.9** Test on different pages:
  - [ ] Homepage: Page view event fires
  - [ ] Article: Article view + likes event fires
  - [ ] Category: Category view event fires
  - [ ] Client: Client follow event fires
  - [ ] FAQ: Question asked event fires

### Phase 2 Verification
- [ ] **12.1** Run `pnpm tsc --noEmit` again
- [ ] **12.2** Full QA pass on all pages:
  - [ ] Homepage loads fast
  - [ ] Article pages work
  - [ ] Client profiles work
  - [ ] Category filtering works
  - [ ] Search works
  - [ ] User registration works
  - [ ] Auth flow works
  - [ ] Comments work (pending + approved)
- [ ] **11.3** Mobile testing on 3+ devices
- [ ] **11.4** All forms submit successfully
- [ ] **11.5** Check for broken links (404s)
- [ ] **11.6** Lighthouse score >85 across pages
- [ ] **11.7** Core Web Vitals all green

**Phase 2 Complete?** → Go to Campaign Launch

---

## 🚀 PHASE 3: LAUNCH WEEK (Active Monitoring)

### Pre-Launch Checklist
- [ ] **12.1** Final database backup
- [ ] **12.2** Verify all env vars in production
- [ ] **12.3** Check SSL certificate (valid, not expired)
- [ ] **12.4** Verify CDN caching (Cloudinary + Next.js)
- [ ] **12.5** Smoke test production (quick QA)
- [ ] **12.6** Setup on-call alert system

### Launch Day
- [ ] **13.1** Monitor error logs (Sentry) every 15 min
- [ ] **13.2** Check email delivery rate (Resend dashboard)
- [ ] **13.3** Monitor database performance
- [ ] **13.4** Check subscriber growth rate
- [ ] **13.5** Monitor contact form submissions
- [ ] **13.6** Verify newsletter sending works (if scheduled)
- [ ] **13.7** Be ready to rollback if critical errors

### Week 1 Tasks
- [ ] **14.1** Daily error log review
- [ ] **14.2** Track email metrics:
  - [ ] Delivery rate
  - [ ] Open rate (if trackable)
  - [ ] Bounce rate
- [ ] **14.3** Monitor page speed (weekly Lighthouse)
- [ ] **14.4** Respond to contact form leads within 2 hours
- [ ] **14.5** Track subscriber growth
- [ ] **14.6** Look for abuse patterns (rate limiting working?)
- [ ] **14.7** Daily backup verification

**Phase 3 Complete?** → Move to Phase 4

---

## 📋 PHASE 4: POST-LAUNCH POLISH (Week 2+)

### Comment Moderation UI
- [ ] **15.1** Create `/admin/comments` dashboard page
- [ ] **15.2** Show pending/approved/rejected comments with filters
- [ ] **15.3** Add bulk approve/reject actions
- [ ] **15.4** Notify mods when new comments submitted
- [ ] **15.5** Notify users when comment approved
- [ ] **15.6** Test moderation workflow

### Advanced Analytics
- [ ] **16.1** Add time series charts (daily growth)
- [ ] **16.2** Add conversion funnel visualization
- [ ] **16.3** Add traffic breakdown by source
- [ ] **16.4** Setup automated weekly email reports
- [ ] **16.5** Connect to Google Sheets for executive reporting
- [ ] **16.6** Create dashboard for clients to see their article metrics

### Cache Optimization
- [ ] **17.1** Review cache headers on all routes
- [ ] **17.2** Set article routes to cache 30 days
- [ ] **17.3** Set category routes to cache 7 days
- [ ] **17.4** Set client routes to cache 14 days
- [ ] **17.5** Test cache revalidation after edit/publish
- [ ] **17.6** Monitor cache hit rates

### SEO Fine-tuning
- [ ] **18.1** Verify JSON-LD on all articles
- [ ] **18.2** Check og:image dimensions (1200x630)
- [ ] **18.3** Verify canonical tags (no duplicates)
- [ ] **18.4** Submit sitemaps to Google Search Console
- [ ] **18.5** Check for crawl errors in GSC
- [ ] **18.6** Setup Bing Webmaster Tools

### Mobile Experience Polish
- [ ] **19.1** Test touch interactions (tap targets 44px+)
- [ ] **19.2** Test form auto-fill on mobile
- [ ] **19.3** Check keyboard behavior
- [ ] **19.4** Verify video playback on mobile
- [ ] **19.5** Test bottom sheet / mobile menu
- [ ] **19.6** Check readability on small screens

---

## 📊 DAILY STANDUP CHECKLIST (During Campaign)

### Every Morning (9 AM)
- [ ] Check Sentry for overnight errors
- [ ] Check Resend dashboard (email delivery rate)
- [ ] Review new contact form submissions
- [ ] Check subscriber growth (compare to yesterday)
- [ ] Quick performance check (Lighthouse)

### Every Evening (5 PM)
- [ ] Summary of day's errors
- [ ] Email delivery summary
- [ ] Contact form lead count
- [ ] Database performance check
- [ ] Document any issues for next day

---

## ✅ DONE / COMPLETED TASKS

_Move completed tasks here with date_

Example:
- ✅ **1.3** Added RESEND_API_KEY to .env.local (2026-04-08)

---

## 🎯 SUCCESS CRITERIA

After launch, these metrics should be green:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Email delivery rate | >98% | ? | ? |
| Subscriber growth | 200+/day | ? | ? |
| Contact form submissions | 50+/day | ? | ? |
| Page load time | <2s | ? | ? |
| Bounce rate | <40% | ? | ? |
| Error rate | <0.1% | ? | ? |
| Core Web Vitals | All green | ? | ? |
| Lighthouse score | >85 | ? | ? |

---

## 🚨 ROLLBACK PLAN

If critical issues occur:

1. **Email not working:** Disable subscribe form, notify users
2. **Rate limiting too strict:** Increase limit or disable temporarily
3. **Database slow:** Scale up MongoDB connection pool
4. **High error rate:** Rollback latest deploy
5. **Complete outage:** Switch to backup + restore from latest backup

---

**Created:** 2026-04-08  
**Last Updated:** [When you start]  
**Owner:** [Your name]  
**Status:** READY TO EXECUTE
