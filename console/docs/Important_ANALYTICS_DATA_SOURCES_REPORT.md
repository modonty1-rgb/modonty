# Analytics Data Sources Report

**What this doc is:** A simple list of what the **Modonty public site** writes into the database for analytics. The **console** reads this data to show dashboards and reports. Here we explain each source in plain language: when it fires, what we skip for now, and how to test it.

---

## Part 1 — Implemented (Modonty writes these today)

Each item below is **live**: when the visitor does the action, Modonty sends data and a row (or update) is saved. Order is from simplest to understand to more advanced.

---

### ArticleView

- **What it is:** One row per time someone opens an article page.
- **When it fires:** As soon as the article page loads. A small script runs in the browser and sends a single request (no waiting for the user to do anything else).
- **What we store:** Which article, optional user if logged in, session id, referrer, browser info.
- **What we ignore for now:** Nothing; each view is recorded once per load.
- **Where it lives:** Article page component calls the view API. API: `modonty/app/api/articles/[slug]/view/route.ts`. Tracker: `modonty/app/articles/[slug]/components/article-view-tracker.tsx`.
- **How to test:** Open any published article on Modonty (e.g. `/articles/your-article-slug`). Check the DB `article_views` table (or console analytics that use article views); you should see a new row for that article/session.

---

### ClientView

- **What it is:** One row per time someone opens a client (brand) profile page.
- **When it fires:** As soon as the client page loads. Same idea as ArticleView: one request on page load.
- **What we store:** Which client, optional user, session id, referrer, browser info.
- **What we ignore for now:** Nothing; each view is recorded once per load.
- **Where it lives:** Client page tracker calls the view API. API: `modonty/app/api/clients/[slug]/view/route.ts`. Tracker: `modonty/app/clients/[slug]/components/client-view-tracker.tsx`.
- **How to test:** Open any client profile on Modonty (e.g. `/clients/client-slug`). Check `client_views` (or console client views); you should see a new row.

---

### ArticleLike / ArticleDislike / ArticleFavorite

- **What they are:** One row when a visitor likes, dislikes, or favorites an article.
- **When they fire:** When the user clicks the like, dislike, or favorite control on an article (or article card).
- **What we store:** Article id, user or session, timestamp.
- **What we ignore for now:** Nothing; each click is recorded.
- **Where they live:** APIs: `modonty/app/api/articles/[slug]/like/route.ts`, `dislike/route.ts`, `favorite/route.ts`; used from `article-interactions.ts`.
- **How to test:** On an article page (or feed card), click like, dislike, or favorite. Check `article_likes`, `article_dislikes`, or `article_favorites` for a new row.

---

### Share

- **What it is:** A count (or row) when someone uses the share action for an article.
- **When it fires:** When the user clicks a share button (e.g. share to a social platform or copy link).
- **What we store:** Article id, share context (e.g. platform).
- **What we ignore for now:** Nothing; each share action is recorded.
- **Where it lives:** `modonty/app/api/articles/[slug]/share/route.ts`.
- **How to test:** On an article page, click a share button (or “copy link”). Check the share API or related table for the new record.

---

### Comment (and replies) / CommentLike / CommentDislike

- **What they are:** Rows for when someone submits a comment, replies, or likes/dislikes a comment.
- **When they fire:** On submit of a comment or reply; on click of comment like/dislike.
- **What we store:** Article, comment, user or session, text (for comments), timestamp.
- **What we ignore for now:** Nothing; each action is recorded.
- **Where they live:** Comments: `modonty/app/api/articles/[slug]/comments/route.ts` and comment actions. Comment like/dislike: `modonty/app/api/comments/[id]/like/route.ts` and `dislike/route.ts`.
- **How to test:** Add a comment on an article; like or dislike a comment. Check `comments` and comment-like/dislike tables for new rows.

---

### ArticleFAQ (Ask client / visitor questions)

- **What it is:** When a visitor submits a question (e.g. “Ask the client”) on an article.
- **When it fires:** When the user submits the ask-client (FAQ) form.
- **What we store:** Article, question text, optional name/contact, timestamp.
- **What we ignore for now:** Nothing; each submission is recorded.
- **Where it lives:** `modonty/app/articles/[slug]/actions/ask-client-actions.ts`.
- **How to test:** Open an article that has “Ask the client” (or similar), submit a question. Check the table used for visitor questions (e.g. article FAQs or ask-client).

---

### Subscriber (client newsletter)

- **What it is:** When someone subscribes to a **client’s** newsletter on the site.
- **When it fires:** When the subscription form is submitted successfully.
- **What we store:** Email, client id, optional name, timestamp. (Note: `api/subscribe` may not persist; the one that persists is the one used by the form that writes to Subscriber.)
- **What we ignore for now:** Nothing for the main subscriber flow that writes to DB.
- **Where it lives:** `modonty/app/api/subscribers/route.ts`.
- **How to test:** Submit the client newsletter form on a page that uses this API. Check `subscribers` for a new row for that client.

---

### ContactMessage

- **What it is:** When someone sends a message via the contact form.
- **When it fires:** When the contact form is submitted successfully (server-side).
- **What we store:** Message content, sender info, timestamp.
- **What we ignore for now:** Nothing; each successful submit is recorded.
- **Where it lives:** `modonty/app/contact/actions/contact-actions.ts` (e.g. via contact API).
- **How to test:** Submit the site contact form. Check `contact_messages` (or equivalent) for a new row.

---

### ClientLike (Follow client)

- **What it is:** When a visitor follows a client (brand).
- **When it fires:** When the user clicks the follow button on a client profile.
- **What we store:** Client id, user or session, timestamp.
- **What we ignore for now:** Nothing; each follow is recorded.
- **Where it lives:** `modonty/app/api/clients/[slug]/follow/route.ts`.
- **How to test:** On a client profile page, click follow. Check the follow/client-like table for a new row.

---

### User (Registration)

- **What it is:** When someone creates an account (registers) on the site.
- **When it fires:** When the registration form is submitted successfully.
- **What we store:** User record (email, name, etc.) in the users table.
- **What we ignore for now:** Nothing; each successful signup is recorded.
- **Where it lives:** `modonty/app/users/register/actions/register-actions.ts`.
- **How to test:** Register a new user via the Modonty registration form. Check `users` for the new user.

---

### NewsSubscriber (global news newsletter)

- **What it is:** When someone subscribes to the **global** news newsletter (not a specific client).
- **When it fires:** When the global news subscribe form is submitted successfully.
- **What we store:** Email, optional name, timestamp.
- **What we ignore for now:** Nothing; each successful submit is recorded.
- **Where it lives:** `modonty/app/api/news/subscribe/route.ts`.
- **How to test:** Submit the global news subscribe form. Check `news_subscribers` (or equivalent) for a new row.

---

### FAQFeedback

- **What it is:** When someone sends feedback on a help/FAQ page.
- **When it fires:** When the FAQ feedback form is submitted.
- **What we store:** Feedback content, page/section, optional contact, timestamp.
- **What we ignore for now:** Nothing; each submit is recorded.
- **Where it lives:** `modonty/app/help/faq/actions/faq-feedback-actions.ts`.
- **How to test:** Submit the FAQ feedback form on the help/FAQ page. Check the FAQ feedback table for a new row.

---

### CTAClick (all 8 CTAs)

- **What it is:** One row each time a visitor clicks one of the **tracked** call-to-action buttons or links (e.g. “Read more”, “Subscribe”, “Visit client”, “Ask client”, “Comment”, “Share”, “More/Related articles”, “Visit website”).
- **When it fires:** On click of that CTA, before or as the user navigates. A small script sends the click to the API (fire-and-forget so it doesn’t block the page).
- **What we store:** CTA type, label, target URL, optional article/client, session, optional user, optional time-on-page/scroll at click.
- **What we ignore for now:** Like/dislike and favorite are **not** counted as CTAs here; they have their own tables (ArticleLike, etc.).
- **Where it lives:** API: `modonty/app/api/track/cta-click/route.ts`. Helper: `modonty/lib/cta-tracking.ts` (`trackCtaClick`). Shared link: `modonty/components/cta-tracked-link.tsx`. The 8 CTAs are: اقرأ المزيد (PostCardBody), اشترك (newsletter sidebar), Visit client page (article-client-card), اسأل العميل (ask-client-dialog open), أضف تعليق (comment-form-dialog open), مشاركة (article-share-buttons), More/Related (more-from-client, related-articles, article-manual-related), زيارة الموقع (hero-cta-visit-website on client profile).
- **How to test:** Click each of the 8 CTAs in the UI (e.g. “Read more” on a card, “Subscribe” in sidebar, “Visit website” on client page, open comment dialog, share, etc.). Check `cta_clicks` (or console CTA report) for new rows with the right type/label.

---

### ArticleLinkClick

- **What it is:** One row when a visitor clicks **any link inside the article body** (not the fixed CTAs above). Used to see which in-article links get clicked (internal vs external).
- **When it fires:** On click of a link inside the article content area. A single listener on the article body catches the click and sends it to the API without blocking navigation.
- **What we store:** Article id, link URL, link text, internal vs external, session, optional user.
- **What we ignore for now:** Nothing; we record each in-article link click. CTA links (e.g. “Read more” in the body) may create both a CTAClick and an ArticleLinkClick; that’s intentional (CTA = known buttons, ArticleLinkClick = any link in content).
- **Where it lives:** API: `modonty/app/api/track/article-link-click/route.ts`. Client: `modonty/app/articles/[slug]/components/article-body-link-tracker.tsx` (listens on `#article-content`).
- **How to test:** Open an article that has links in the body. Click one of those links. Check `article_link_clicks` for a new row with that link URL and article id.

---

### Conversion

- **What it is:** One row when a “conversion” happens: contact form sent, user signup, or newsletter signup (client or global). Used for conversion counts and rates.
- **When it fires:** **On the server**, right after we successfully save the main action (e.g. after creating the contact message, after creating the user, after creating the subscriber). So: contact submit → create ContactMessage → then create Conversion (CONTACT_FORM). Signup → create User → then create Conversion (SIGNUP). Client newsletter → create Subscriber → then create Conversion (NEWSLETTER, with clientId). Global news → create NewsSubscriber → then create Conversion (NEWSLETTER, no client).
- **What we store:** Conversion type, session id (from cookie), optional user id, optional client id, timestamp.
- **What we ignore for now:** Nothing; we create a conversion for each of the four flows above.
- **Where it lives:** Helper: `modonty/lib/conversion-tracking.ts` (`getOrCreateSessionId`, `createConversion`). Called from: `contact/actions/contact-actions.ts`, `users/register/actions/register-actions.ts`, `api/subscribers/route.ts`, `api/news/subscribe/route.ts`.
- **How to test:** (1) Submit contact form → check `conversions` for CONTACT_FORM. (2) Register a new user → check for SIGNUP. (3) Subscribe to a client newsletter → check for NEWSLETTER with that clientId. (4) Subscribe to global news → check for NEWSLETTER without clientId.

---

### Analytics (article view + leave)

- **What it is:** One row per article view, then **updated** when the user leaves the page with how long they stayed, how far they scrolled, and whether we count it as a “bounce”. Also stores traffic source (e.g. organic, referral).
- **When it fires:**  
  - **Create:** When the article view API runs (same time as ArticleView). We create an Analytics row with source, referrer, session, user, and return its id to the browser.  
  - **Update:** When the user leaves the page (or tab hides), the article-view tracker sends a PATCH with time on page, scroll depth, and bounce (e.g. left in &lt; 30s and scrolled &lt; 10%).
- **What we store:** Article id, client id, session, user, source/referrer, then (on leave) timeOnPage, scrollDepth, bounced. Optional later: Core Web Vitals (LCP, CLS, INP).
- **What we ignore for now:** Core Web Vitals (LCP, CLS, INP) are optional; we can add them later. Client profile pages don’t create Analytics rows yet (only article pages).
- **Where it lives:** Create: `modonty/app/api/articles/[slug]/view/route.ts` (same request as ArticleView). Update: `modonty/app/api/track/analytics/[id]/route.ts`. Client: `article-view-tracker.tsx` (stores analytics id, tracks time/scroll, sends PATCH on leave).
- **How to test:** Open an article, wait a few seconds, scroll a bit, then leave (close tab or navigate away). Check `analytics` for one row for that view; after leave it should have timeOnPage, scrollDepth, and bounced set. For source/referrer, open the article from another site or search and confirm source/referrer on the row.

---

## Part 2 — Not implemented / deferred (we don’t write these from Modonty yet)

The console may show dashboards that use these. Right now data for them comes only from seed or is empty. We’re **not** writing them from Modonty yet.

---

### EngagementDuration

- **What it is:** A table for “engagement” per page (article or client): time on page, scroll depth, completion rate, bounce, “engaged session”, etc.
- **When it would fire:** On leave or on a heartbeat while the user is on the page.
- **Why we ignore for now:** We already have similar data in **Analytics** for article views (time on page, scroll, bounce). EngagementDuration adds more detail and can cover client pages too. We deferred it to avoid duplication; we can add it when the console really needs these extra metrics or client-page engagement.

---

### CampaignTracking (UTM)

- **What it is:** A row when someone lands on the site with **UTM parameters** in the URL (e.g. from an ad or email link). Used for campaign reports. Cost/impressions/clicks usually come from ad platforms or admin, not from the site.
- **When it would fire:** On any page load where the URL has UTM params (e.g. `utm_source`, `utm_campaign`). We’d create or update a row with those params and session.
- **Why we ignore for now:** We’re not running paid campaigns or UTM-tagged links yet. When we do, we’ll add a small script that reads UTM from the URL and calls an API to save a CampaignTracking row. Cost/impressions/clicks will stay out of scope for the site (sync or manual later).

---

### LeadScoring

- **What it is:** A **computed** table: each row is a “lead” (session or user per client) with an engagement score and a label (HOT / WARM / COLD). The console Leads page reads from it.
- **When it “fires”:** It doesn’t fire from a single user action. A **job** (or button in the console) runs on a schedule or on demand: it reads Analytics, Conversion, ArticleView, ClientView, CTAClick, etc., computes scores per lead, and upserts LeadScoring.
- **Why we ignore for now:** The **data** that feeds lead scoring (Analytics, Conversion, views, CTAs) is already written by Modonty. What’s “missing” is the **scoring job** in the console. We implemented a “Refresh scores” button in the console that runs this job for the current client on demand (no cron). So LeadScoring is filled when the user clicks that button; we’re not ignoring it anymore, we’re filling it from the console side.

---

## Part 3 — How to test each implemented source

Use this as a checklist. For each item, do the action on the Modonty site, then check the DB (or the console screen that shows that data).

- **ArticleView:** Open an article → check article views (DB or console).
- **ClientView:** Open a client profile → check client views.
- **ArticleLike / Dislike / Favorite:** Click like, dislike, or favorite on an article → check the corresponding table.
- **Share:** Click share on an article → check share API/table.
- **Comment / CommentLike / CommentDislike:** Post a comment; like/dislike a comment → check comments and comment reactions.
- **ArticleFAQ (Ask client):** Submit “Ask the client” on an article → check ask-client/FAQ submissions.
- **Subscriber:** Submit client newsletter form → check `subscribers`.
- **ContactMessage:** Submit contact form → check contact messages.
- **ClientLike (Follow):** Click follow on a client profile → check follow table.
- **User:** Register a new user → check `users`.
- **NewsSubscriber:** Submit global news subscribe form → check news subscribers.
- **FAQFeedback:** Submit FAQ feedback on help page → check FAQ feedback table.
- **CTAClick:** Click each of the 8 CTAs (read more, subscribe, visit client, ask client, comment, share, more/related, visit website) → check `cta_clicks` with correct type/label.
- **ArticleLinkClick:** Open an article, click a link inside the article body → check `article_link_clicks`.
- **Conversion:** Submit contact form; register; subscribe to client newsletter; subscribe to global news → check `conversions` for CONTACT_FORM, SIGNUP, NEWSLETTER (with and without clientId).
- **Analytics:** Open an article, stay 10+ seconds, scroll, then leave → check `analytics` for one row with timeOnPage, scrollDepth, bounced and source/referrer set.

---

## Part 4 — Summary

- **Implemented (20):** ArticleView, ClientView; ArticleLike, ArticleDislike, ArticleFavorite; ArticleFAQ; Share; Comment, CommentLike, CommentDislike; Subscriber; ContactMessage; ClientLike; User; NewsSubscriber; FAQFeedback; CTAClick (8 CTAs); ArticleLinkClick; Conversion; Analytics (article view + leave).
- **Deferred:** EngagementDuration (overlap with Analytics); CampaignTracking (add when using UTM links).
- **LeadScoring:** Filled by the console “Refresh scores” button (on-demand job), not by Modonty directly.

---

## Part 5 — Where Modonty stands now (another level)

With these updates, Modonty has moved to a **higher level** of analytics maturity.

**Before (basic level):** Mostly page views and simple engagement (likes, comments, shares, forms). Little structured tracking of which actions drive results, where traffic comes from, or how users behave on the page.

**After (current level):**

- **Structured event tracking:** ArticleView, ClientView, CTAClick (8 CTAs), ArticleLinkClick, Conversion, and Analytics are all defined and implemented.
- **Attribution:** You know traffic source and referrer (Analytics), and which CTAs and in-article links get clicked.
- **Conversion funnel:** Conversions are recorded for contact, signup, and newsletter (client + global), so you can measure conversion rate and types.
- **Engagement quality:** Time on page, scroll depth, and bounce are stored per article view (Analytics), so you can see engagement quality, not just counts.
- **Session continuity:** The `modonty_view_sid` cookie (and sessionId across events) lets you tie views, clicks, and conversions to the same visit/session.
- **Console use of data:** The console can show real data from Modonty: views, CTAs, link clicks, conversions, analytics, and lead scoring (via the Refresh scores button).

In short: Modonty has moved from "basic counters and forms" to a **data-rich product**. You can answer "where do users come from?", "what do they click?", "do they convert?", and "how long do they stay?" with real data.
