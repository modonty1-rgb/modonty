# Client Page Tracking Audit

This doc describes what tracking is already in place on the client profile page and what is still missing. It applies to `/clients/[slug]` and its sub-routes (feed, followers, likes, reviews, photos, reels, contact, about, mentions). The reference for “what counts as tracking” is [Important_ANALYTICS_DATA_SOURCES_REPORT.md](./Important_ANALYTICS_DATA_SOURCES_REPORT.md).

---

## Full scan: every interactive element

**Hero (main client page)**  
- Page load: tracked (ClientView via `ClientViewTracker`).  
- “زيارة الموقع” button: tracked (CTA “زيارة الموقع” + clientId).  
- Follow / unfollow button: tracked (follow API → `client_likes`).  
- Share button (opens menu): **tracked** (Share row with clientId via `/api/clients/[slug]/share` + CTA “Share client”).  
- Social icons (LinkedIn, Twitter, Facebook): **tracked** (CTA “Social (LinkedIn)” etc. + clientId).  

**Sticky tab nav**  
- Tabs “الكل”, “حول”, “تواصل مع الشركة”, etc.: **tracked** (CTA “Tab – [label]” + clientId).  

**Feed (main content)**  
- Per article card: “اقرأ المزيد” link: tracked (CTA “اقرأ المزيد” + articleId + clientId).  
- Per article card footer: stats row link to article: **tracked** (CTA “Feed card – عرض المقال”).  
- Per article card footer: “مشاركة” link: **tracked** (CTA “Feed card – مشاركة”).  
- Empty state: **tracked** (CTA “Empty state – …” for each button).  

**Left column / Contact block**  
- Website, email, phone, WhatsApp links: **tracked** (Contact – website|email|phone|WhatsApp).  
- Copy url/email/phone buttons: **tracked** (Contact – copy url|email|phone).  

**Right column**  
- Followers, likes, reviews, photos, related clients links: **tracked** (View followers, View likes, View reviews, View photo article, Visit client from related, etc.).  

**Sub-routes**  
- Followers list → user profile: **tracked** (View follower profile).  
- Reviews page → article: **tracked** (View review article).  
- Photos/Reels → article: **tracked** (View photo article, View reel article).  

**Article list view**  
- Sort buttons and article row link: **tracked** (Article list – sort …, Article list – article).  

**Error page**  
- “Try again” and links to /clients and /: plain buttons/links; not tracked (and usually not needed for analytics).  

**Summary of full scan**  
All interactive elements on the client page and sub-routes are now tracked: ClientView, “زيارة الموقع”, follow/unfollow, share (Share + CTA), social links, tabs, contact block, sidebar links, feed card footer, empty state, article list, sub-route links. Contact form submit is ContactMessage. Error-page buttons are excluded by design.

**Confirmation: will this cover full track?**  
Yes. The full scan above lists every interactive element under `/clients/[slug]` and its sub-routes. There are no other buttons, links, or click handlers in the client route that are missing from the “not tracked” list. Implementing the following gives 100% coverage for the client page: (1) client-share API + CTA when user shares; (2) CTA for each hero social link; (3) CTA for each tab click (optional); (4) CTA for each contact-block action (website, email, phone, WhatsApp, copy URL/email/phone); (5) CTA for each sidebar link (followers, reviews, likes, photos, related clients, and links to user profiles or articles from those blocks); (6) CTA for feed card footer (stats row and “مشاركة”) and for empty-state buttons; (7) CTA for article list sort and article row link when that view is shown; (8) CTA for sub-route links (followers list → user profile, reviews → article, photos/reels → article). Error-page buttons are excluded by design (not needed for analytics). After (1)–(8), every visitor action on the client page that can be tracked will be tracked.

---

## What’s implemented

**Page view (ClientView)**  
When someone opens a client profile, we record one view. A small tracker on the page sends a request to the client view API, which writes a row to `client_views` (client, optional user, session, referrer, etc.). So every load of the client page is counted.

**Visit website (زيارة الموقع)**  
If the client has a website URL, the hero shows a “زيارة الموقع” button. Clicking it is tracked as a CTA: we send the click to the CTA API and store it in `cta_clicks` with the client id and target URL. So you know when someone goes from the profile to the client’s site.

**Follow / unfollow**  
The follow button in the hero calls the follow API (POST to follow, DELETE to unfollow). That API updates the follow table (`client_likes`). So every follow and unfollow is recorded.

**Read more on feed cards**  
The feed on the client page shows article cards. Each card’s “اقرأ المزيد” link is a tracked CTA: it sends a CTA click with the article and client id. So clicks from the client feed into articles are in `cta_clicks`. When the user lands on the article, the article page records its own view and optional analytics; nothing else is needed on the client page for that.

**Share client (hero)**  
The hero share button uses `ShareButtons` with `onShare`: we call `trackCtaClick` (label “Share client” or platform-specific) and `fetch(/api/clients/[slug]/share)` to create a Share row with `clientId` and platform. API: `modonty/app/api/clients/[slug]/share/route.ts`.

**Social links, tabs, contact, sidebar, feed footer, empty state, article list, sub-routes**  
All of these use `CtaTrackedLink` or `trackCtaClick` with distinct labels and optional `clientId`/`articleId`. See [Important_ANALYTICS_DATA_SOURCES_REPORT.md](./Important_ANALYTICS_DATA_SOURCES_REPORT.md) for the full CTA list.

---

## Summary

**Full tracking in place.** We track: client page view, visit website, follow/unfollow, share client (Share + CTA), social links, tab navigation, contact block (links + copy), sidebar (followers, likes, reviews, photos, related clients), feed card footer (stats + مشاركة), empty-state buttons, article list (sort + row link), and sub-route links (followers list, reviews, reels, photos). Every interactive element on `/clients/[slug]` and its sub-routes is covered except the error page (excluded by design).

---

## Suggested next steps

- None required for full coverage. To add more granular labels or new surfaces later, use `CtaTrackedLink` or `trackCtaClick` with a clear label and optional `clientId`/`articleId`.
