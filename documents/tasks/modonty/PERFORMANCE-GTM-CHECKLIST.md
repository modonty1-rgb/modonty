# Performance & GTM Testing Checklist
**Critical Before Campaign Launch**

---

## 🚀 PERFORMANCE TESTING

### Test 1: Lighthouse Audit (Desktop & Mobile)

**Tools Needed:**
- Chrome DevTools
- PageSpeed Insights (https://pagespeed.web.dev)
- Website (modonty.com)

**Test Pages:**
1. Homepage
2. Article page (sample)
3. Category page (sample)
4. Client profile (sample)
5. Search results

**For Each Page:**

```
DESKTOP:
☐ Lighthouse score ≥90
☐ FCP <1.8s
☐ LCP <2.5s
☐ CLS <0.1
☐ FID <100ms
☐ TTFB <600ms

MOBILE:
☐ Lighthouse score ≥85
☐ FCP <3.0s
☐ LCP <2.5s
☐ CLS <0.1
☐ FID <100ms
☐ TTFB <600ms
```

**How to Test:**
1. Open Chrome
2. Open DevTools (F12)
3. Go to Lighthouse tab
4. Click "Analyze page load"
5. Wait 30-60 seconds
6. Check scores match thresholds above

---

### Test 2: Core Web Vitals (Google PageSpeed)

**Go to:** https://pagespeed.web.dev

**Test Each URL:**
- `https://modonty.com/` (homepage)
- `https://modonty.com/articles/[sample-slug]` (article)
- `https://modonty.com/categories/[category-slug]` (category)
- `https://modonty.com/clients/[client-slug]` (client profile)

**Expected Results:**
```
Largest Contentful Paint (LCP): GREEN (<2.5s)
First Input Delay (FID):        GREEN (<100ms)
Cumulative Layout Shift (CLS):  GREEN (<0.1)
```

**Document:**
- [ ] Screenshot each page's PageSpeed report
- [ ] All metrics GREEN
- [ ] No RED metrics

---

### Test 3: Load Testing (Simulate Campaign Traffic)

**Tools Needed:**
- Artillery (npm install -g artillery)

**Create `load-test.yml`:**
```yaml
config:
  target: "https://modonty.com"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"
scenarios:
  - name: "Homepage + Browse"
    flow:
      - get:
          url: "/"
      - get:
          url: "/articles/[sample-slug]"
      - get:
          url: "/categories"
      - post:
          url: "/api/articles/[slug]/like"
          json:
            liked: true
```

**Run Test:**
```bash
artillery run load-test.yml
```

**Expected Results:**
```
Response times:
  p50: <200ms
  p95: <500ms
  p99: <1000ms

Error rate: <0.1%

Throughput:
  rps: 50+ (requests per second)
```

**Document:**
- [ ] Artillery report saved
- [ ] Response times acceptable
- [ ] No timeouts
- [ ] Error rate <0.1%
- [ ] Database didn't crash

---

### Test 4: Image Optimization

**Check Each Image:**

For article featured images:
- [ ] File size <200KB
- [ ] Format: WebP or AVIF
- [ ] Responsive (multiple sizes)
- [ ] Load time <1s on 4G

For client logos:
- [ ] File size <50KB
- [ ] SVG preferred
- [ ] Load time <200ms

For gallery images:
- [ ] File size <300KB
- [ ] Lazy loaded (not all at once)
- [ ] Responsive sizes
- [ ] Load time <1.5s per image on 4G

**How to Check:**
1. Open DevTools → Network tab
2. Filter by Images
3. Load each image
4. Check file size and load time
5. Use https://tinyjpg.com to compress if needed

**Document:**
- [ ] All images <acceptable size>
- [ ] No oversized images
- [ ] Lazy loading working

---

## 📊 GTM (Google Tag Manager) TESTING

### Test 1: GTM Container Installation

**Check if GTM is installed:**

1. Open DevTools Console (F12 → Console)
2. Type: `window.gtag`
3. Should see a function (GTM installed)

**Or:**
1. View page source (Ctrl+U)
2. Search for "GTM-"
3. Should find: `<script async src="https://www.googletagmanager.com/gtag/js?id=GTM-..."></script>`

**Document:**
- [ ] GTM container found in HTML
- [ ] Container ID: GTM-____________
- [ ] Script in `<head>` section
- [ ] No errors in console

---

### Test 2: GTM Events Firing

**Open DevTools → Network Tab**

**Trigger Actions & Watch Network:**

| Action | Expected Event | Search For |
|--------|----------------|-----------|
| Load page | page_view | `gtm` → check request |
| Click Like | like_article | `gtm` → new request |
| Submit comment | comment_submitted | `gtm` → new request |
| Ask question | question_asked | `gtm` → new request |
| Follow client | client_followed | `gtm` → new request |
| Share article | article_shared | `gtm` → new request |
| Subscribe newsletter | newsletter_subscribe | `gtm` → new request |
| Submit contact | contact_submitted | `gtm` → new request |

**How to Check:**
1. Open DevTools → Network tab
2. Filter: `gtm` or `google`
3. Perform action on website
4. Watch for new request to `www.googletagmanager.com/gtag/js`
5. Request should complete successfully (status 200/204)

**Document:**
- [ ] All 8 events trigger GTM requests
- [ ] No failed requests (404, 500, etc.)
- [ ] Events fire within 1-2 seconds of action

---

### Test 3: GTM Data Layer

**Check Data Being Sent:**

1. Open DevTools → Console
2. Type: `window.dataLayer`
3. Expand array
4. Should see events like:
```javascript
[
  {
    event: "page_view",
    pageTitle: "مودونتي - الرئيسية",
    pageUrl: "https://modonty.com/"
  },
  {
    event: "like_article",
    articleId: "abc123",
    articleTitle: "عنوان المقال",
    userId: "user456"
  },
  ...
]
```

**Document:**
- [ ] dataLayer populated with events
- [ ] Each event has proper structure
- [ ] articleId/userId present for interactions
- [ ] Event names match Google Analytics setup

---

### Test 4: Google Analytics 4 Real-Time

**Login to Google Analytics:**

1. Go to https://analytics.google.com
2. Select property: **Modonty**
3. Go to: Reports → Real-time
4. You should see current activity

**Trigger Events:**
- [ ] Load homepage → "Active users" increases
- [ ] Visit article → "Active pages" shows article
- [ ] Like article → Real-time event appears
- [ ] Submit comment → Real-time event appears
- [ ] Ask question → Real-time event appears

**Expected:**
- Real-time shows events within 10 seconds
- User count accurate
- Event names match GTM setup

**Document:**
- [ ] GA4 receiving events
- [ ] Event names correct
- [ ] No data discrepancies

---

### Test 5: GA4 Conversion Tracking

**Setup Conversions (if not already done):**

1. GA4 → Admin → Conversions
2. Create these conversions:
   - [ ] newsletter_subscribe
   - [ ] contact_submitted
   - [ ] comment_submitted (engagement)
   - [ ] article_liked (engagement)
   - [ ] client_followed (engagement)

**Test Conversion:**
1. Subscribe to newsletter
2. Go to GA4 → Real-time
3. Should see conversion event
4. Check admin dashboard: count increases

**Document:**
- [ ] All conversions setup in GA4
- [ ] Each conversion fires correctly
- [ ] Client dashboard counts match GA4

---

### Test 6: GTM Custom Events Detail

**For Each Interaction, Verify Event Has:**

```javascript
// Like Article Event Should Contain:
{
  event: "like_article",
  articleId: "[article-id]",
  articleTitle: "[article-title]",
  articleSlug: "[article-slug]",
  clientId: "[client-id]",
  clientName: "[client-name]",
  userId: "[user-id]",
  timestamp: "[ISO-timestamp]"
}

// Comment Event Should Contain:
{
  event: "comment_submitted",
  articleId: "[article-id]",
  articleTitle: "[article-title]",
  commentLength: 150,
  userId: "[user-id]",
  timestamp: "[ISO-timestamp]"
}

// Newsletter Subscribe Should Contain:
{
  event: "newsletter_subscribe",
  email: "[email-hash]", // Never send raw email
  source: "footer|sidebar|landing-page"
  timestamp: "[ISO-timestamp]"
}

// Contact Form Should Contain:
{
  event: "contact_submitted",
  contactType: "[type]",
  subject: "[subject-hash]",
  timestamp: "[ISO-timestamp]"
}
```

**How to Check:**
1. DevTools Console: `console.log(window.dataLayer[window.dataLayer.length - 1])`
2. Should show full event object
3. All fields present
4. No sensitive data (emails, passwords)

**Document:**
- [ ] All events have required fields
- [ ] No sensitive data exposed
- [ ] Event structure consistent

---

## ✅ FINAL CHECKLIST

### Performance:
- [ ] All Lighthouse scores ≥85 mobile / ≥90 desktop
- [ ] All Core Web Vitals GREEN
- [ ] Load test: response times <500ms p95
- [ ] Load test: error rate <0.1%
- [ ] All images optimized (<200KB)
- [ ] No performance regressions

### GTM/Analytics:
- [ ] GTM container installed correctly
- [ ] All 8 events firing (page_view, like, comment, FAQ, follow, share, subscribe, contact)
- [ ] GA4 receiving events in real-time
- [ ] Data Layer contains proper event data
- [ ] Conversions tracked (newsletter, contact)
- [ ] Client dashboard counts match GA4
- [ ] No privacy violations (no raw emails/passwords)

---

## 📋 DOCUMENT RESULTS

**Performance Test Date:** ___________
**Tester:** ___________
**All Tests Passed?** ☐ YES / ☐ NO

**GTM Test Date:** ___________
**Tester:** ___________
**All Events Working?** ☐ YES / ☐ NO

**Issues Found:**
```
[List any failures or problems]
```

**Ready for Campaign?** ☐ YES / ☐ NO

---

**Status:** READY FOR TESTING  
**Estimated Time:** 4-6 hours total  
**Priority:** CRITICAL (before launch)
