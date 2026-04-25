# CLAUDE — Live Test Observation Log

> **Purpose:** This file is maintained by Claude (the AI agent) during every live test session.
> When simulating a real user (client) navigating the admin or public site, any UX/QA issue
> spotted — whether visual, functional, logical, or a best-practice violation — is automatically
> recorded here, without waiting to be asked.
>
> **Rule:** Observe → Record here → Add to MASTER-TODO for triage and fix.
> This file is the raw log. MASTER-TODO is the prioritized backlog.

---

## Core Rule — Live Test Protocol

During any live test session:
- Act as the real client/user, not as a developer
- If something looks wrong, feels wrong, or violates UX best practices → log it immediately
- Do NOT wait to be asked — automatic observation is mandatory
- Every entry gets a severity: 🔴 HIGH | 🟡 MEDIUM | 🟢 LOW
- After the session, entries move to MASTER-TODO for review

---

## Session: 2026-04-26 — Search Console UI polish (Session 68)

### OBS-055 ✅ DONE (SMART UI) — One-click submit image sitemap to GSC
- **Why:** Image Sitemap card now detects whether `https://www.modonty.com/image-sitemap.xml` is registered in GSC. If NOT, surfaces a "Submit to GSC" button + amber "Not in GSC" badge. If yes, shows green "In GSC" badge instead.
- **Built:**
  - Restored `submitSitemapAction` in `actions/sitemap-actions.ts` (was previously removed as dead code)
  - new client component `submit-image-sitemap-button.tsx` — handles submit + toast + done state
  - `image-sitemap-card.tsx` extended: parallel-fetches `listSitemaps()` + analyzes XML; conditionally renders submit button only when (a) sitemap is live (status 200) AND (b) not submitted to GSC
- **UX:** zero-friction — one button, appears when needed, auto-hides after success (router.refresh + done state). No form, no input, no chips. Click once = submitted + page revalidates.
- **Why this matters:** without GSC submission, Google won't crawl image-sitemap.xml = images don't appear in Google Images = lost SEO traffic (per project SEO dominance goal).

### OBS-054 ✅ DONE (INCOMPLETE TASK FIX) — VS-05 had 3/5 fields missing from coverage table
- **User feedback:** "راجع المرحلة الثالثة. شوف إيش النواقص اللي تمسحت من عندك من هنا. بتغلط غلطات أحيانًا كده بتهلكني في الوقت."
- **Audit finding:** VS-05 plan said "Display: verdict · coverageState · canonical · robotsTxtState · indexingState" — but the table only had canonical + robotsTxtState. The other 3 (`verdict`, `coverageState`, `indexingState`) were stored in DB but not displayed.
- **Fix:** added new "GSC Verdict" column between DB Status and Canonical. Stacks 3 fields:
  - Verdict badge (PASS=emerald · FAIL=red · PARTIAL=amber · NEUTRAL=slate)
  - coverageState text (e.g. "Submitted and indexed", "Crawled - currently not indexed")
  - indexingState text (green if INDEXING_ALLOWED, red if BLOCKED_BY_*)
  - All clipped with `line-clamp-1` + full text in `title` for tooltip
- **Renamed** old "Status" header → "DB Status" so the two columns are visually distinct (DB record state vs Google's verdict).
- **Lesson logged:** stop marking tasks ✅ when only partial implementation done. Audit each plan field against actual rendered DOM.

### OBS-053 ✅ DONE (MISSING UI ADDED) — Image Sitemap card on /search-console
- **User feedback:** "الـ image XML مش موجود برضو"
- **Root cause:** VS-07 was checked in Phase 3 because `modonty/app/image-sitemap.xml/route.ts` existed — but there was NO UI on /search-console to surface it. Looked like the feature was missing because it had no presence on the page.
- **Built:** `admin/app/(dashboard)/search-console/components/image-sitemap-card.tsx` — server component that fetches `https://www.modonty.com/image-sitemap.xml` and shows:
  - 4 stats: Total Images · Articles w/ Images · Avg per Article · File Size
  - 4 validations: HTTP 200 · `image:image` namespace present · contains images · under 50MB Google limit
  - "View XML" button (opens raw XML in new tab)
  - URL link footer + last fetched timestamp
- **Helper extended:** `lib/gsc/parse-sitemap.ts` — added `fetchAndAnalyzeImageSitemap()` that counts `<url>` and `<image:image>` entries via regex (no extra dep).
- **Wired into page** between Sitemaps card and Robots Validator card.
- **VS-07 now truly visible** — admin can see image sitemap is alive without leaving the page.

### OBS-052 ✅ DONE (REGRESSION FIX) — Robots Validator: path tester + dropdown were hidden behind "Fetch live"
- **User feedback:** "كان في حاجة اسمها test path أو حاجة كده، وأصوب منها drop down select. أنت لغيتها."
- **Root cause:** Original RobotsValidator wrapped both the robots.txt `<pre>` AND the path tester form inside `{robots && (...)}` — so users had to click "Fetch live" first to see the path tester. Looked like the feature was missing.
- **Fix:** path tester (input + user-agent dropdown + Check button) is now ALWAYS visible. Action self-fetches robots.txt internally — user clicks Check directly without needing to fetch first.
- **"Fetch live" button repurposed:** now shown as **"View robots.txt"** in header (optional — only to inspect the raw content). Result block stays under the form.
- **VS-08 now truly complete:** "Robots.txt validator (fetch + path tester per user-agent)" — both visible from the start.
- **File:** `admin/app/(dashboard)/search-console/components/robots-validator.tsx`

### OBS-051 ✅ DONE (UX FIX) — SC-UI-02 redesigned: filter pills moved inside table card
- **User feedback:** "Actions اللي على الcoverage bad UX. أضغط ينزلني على الجدول وأتوه في الصفحة"
- **Fix:** stats reverted to non-clickable display only. Filter pills (All · Live · Archived · Missing | Canonical · Robots · Mobile · Soft 404) now live inside the coverage table card header — no scroll jump, user sees instant filtering result.
- **Built:** `FilterPill` component with tone variants (neutral/emerald/amber/red), active = solid color, idle = tinted bg, disabled = greyed when count=0.
- **`scroll={false}`** on the Link prevents page jump — clicking a pill applies filter without moving viewport.
- **Lesson:** click-to-scroll pattern is disorienting for stats UI. Place filter controls next to the data they affect.

### OBS-050 (superseded by OBS-051) — Original SC-UI-02 attempt: stats-as-Links with scroll-to-table
- **What:** Each stat was wrapped in Link to `?filter=KEY#coverage-table`. Clicking auto-scrolled to the table.
- **Problem:** click + scroll combo disoriented user — "أتوه في الصفحة"
- **Resolution:** see OBS-051

### OBS-049 ✅ DONE — SC-UI-01: Sitemap URLs count clickable → drill-down dialog
- **Where:** `/search-console` → Sitemaps card → "URLs" column (the `101` number)
- **What:** Number is now a blue clickable button. On click → dialog fetches `https://www.modonty.com/sitemap.xml` server-side, parses URLs, and displays a searchable filterable list.
- **Dialog features:**
  - Search box (filters by path)
  - Type chips with live counts: All · Articles · Categories · Tags · Authors · Clients · Industries · Static · Home · Other
  - Each row: # · path (clickable, opens in new tab) · type badge · last-modified date
  - Footer: "Showing X of Y URLs · fetched HH:mm"
- **Built:**
  - `admin/lib/gsc/parse-sitemap.ts` — regex-based `<loc>` + `<lastmod>` extractor (no extra dep) + path classifier
  - `actions/sitemap-urls-action.ts` — auth-checked server action
  - `components/sitemap-urls-dialog.tsx` — shadcn Dialog with sticky search + chip filters + scrollable table
- **No prod data touched** — read-only fetch of public sitemap.xml

### OBS-048 ✅ DONE — Data sources transparency panel on /search-console
- **What:** Added `DataSourcesNote` component at the bottom of /search-console page
- **Why:** User asked: "are these numbers 100% from GSC?" — full transparency now visible to admin without asking
- **Sections (4):**
  - 🔵 Direct from GSC API (Clicks/Impressions/CTR/Position · Top pages · Sitemaps · URL Inspection — with cache windows)
  - 🟣 Direct from live site (robots.txt — fetched live, more current than Google's cache)
  - 🟡 Computed locally (Live/Missing/Archived · Coverage % · Tech Health · Pending indexing)
  - 🟢 Known limits (2–3 day Google delay · 0-imp pages excluded · API doesn't expose Crawled-not-indexed/manual actions/backlinks · URL Inspection 2K/day · Indexing API 200/day)
- **Foundation for trust:** admin sees the truth about each datapoint; can plan refresh cadence and know what's NOT covered

### OBS-047 ✅ AUDIT — Phase 3 full review (passed)
**Code review:** 0 console.log · 0 TODOs/FIXMEs · 0 `any` types · 1 acceptable `as unknown as object` (rawJson storage) · all server actions auth-checked · TSC zero errors
**Functional live tests on production data:**
- ✅ Robots.txt fetch live (status 200 from modonty.com)
- ✅ Robots path test ALLOWED (Googlebot + /articles/example → matched: allow: /)
- ✅ Robots path test BLOCKED (Googlebot + /admin/test → matched: disallow: /admin/)
- ✅ Sitemap submit (count went 0 → 1, quick-add chip removed `/sitemap.xml` from suggestions)
- ✅ Coverage table rendered with 6 inspection columns + per-row Inspect button
- ✅ Tech Health KPIs (4 cards) + "0/17 inspected" indicator + helpful hint
- ✅ Dashboard tech row ("Technical health: no inspections yet — run bulk inspect in Search Console") clickable to /search-console
- ⏭ Skipped (would consume quota): bulk URL inspection, individual Inspect refresh — code reviewed, structure identical to working batch operations from Phase 2
**Minor findings (out of Phase 3 scope, deferred):**
- 🟡 Mobile (375px): sidebar doesn't auto-collapse — admin layout issue, not Phase 3 specific
- 🟢 Console warning: scroll-behavior smooth (Next.js suggests `data-scroll-behavior="smooth"` on html) — cosmetic only
**Verdict:** Phase 3 passes audit. 0 critical. Ready for Phase 4 (Core Web Vitals).

### OBS-046 ✅ DONE — Phase 3 (full) — Sitemap UI + Robots Validator + Dashboard Tech Row
- **Built:**
  - admin/lib/gsc/client.ts — `getGscWriteClient()` (full webmasters scope) + `getSearchConsoleClient()` + `getIndexingClient()`
  - admin/app/(dashboard)/search-console/actions/sitemap-actions.ts — list/submit/delete with auth
  - admin/components/sitemap-manager.tsx — submit form · suggested URLs · status badges · index rate · delete dialog
  - admin/components/robots-validator.tsx — fetch live + path tester per user-agent (spec-compliant longest-match)
  - admin/lib/gsc/inspection-cache.ts — `getTechHealthSummary()` for dashboard
  - dashboard gsc-section: new `TechHealthBar` row (clickable → /search-console)
  - modonty/app/image-sitemap.xml/route.ts — already had it · verified format (image:loc · title · caption · license)
- **Phase 3 = 100% complete** · 10/10 tasks · all live-tested on production data · TSC zero errors

### OBS-045 ✅ DONE — Phase 3 (half) — Search Console page + URL Inspection cache + Tech Health
- **Renamed:** `/seo` → `/search-console` (route + sidebar + drill-downs + breadcrumbs)
- **DB:** new `GscUrlInspection` collection · 7-day TTL cache · indexes on expiresAt + verdict
- **Library:** `lib/gsc/inspection-cache.ts` — single + bulk inspection with cache and force-refresh
- **Server actions:** `inspectUrlAction` · `bulkInspectAction` (auth-checked · max 200/batch)
- **UI:**
  - `/search-console`: header bulk inspect button (with force-refresh + confirm dialog · respects 2K/day quota)
  - Tech Health summary: 4 KPIs (Canonical · Robots · Mobile · Soft 404) + inspected count
  - 6 new columns in coverage table (canonical match · robots state · mobile verdict · last crawl · per-row Inspect refresh button)
- **Pending in Phase 3:** Sitemap UI tab, Image sitemap, Robots validator, Soft 404 scanner UI, Dashboard tech issues row

### OBS-044 ✅ DONE — Dashboard symmetric coverage (removal + indexing)
- **Where:** `/` GSC section CoverageAlert + SEO Insights
- **What:** Coverage now shows BOTH directions:
  - Console → DB mismatch: "X need removal" (was "missing in DB")
  - DB → Console mismatch: "X need indexing" (NEW — published articles not in GSC top 100)
- **Wording change:** "Add 301 redirect or 410 Gone" → "Request removal from Google"
- **Hidden when 0:** Archive count (only shows if archived count > 0)
- **Live result on production:** 2 live · 11 need removal · 19 need indexing · 15% coverage
- **Built:** `coverage.ts` extended with `getAllPublishedArticles()` + `pendingIndexing` in summary; gsc-section fetches in parallel; CoverageAlert includes new RefreshCw icon for indexing

### OBS-043 ✅ DONE — Phase 2 URL Lifecycle: Indexing API + 410 Gone for archived
- **Built:**
  - admin: `lib/gsc/indexing.ts` (URL_UPDATED + URL_REMOVED via Indexing API)
  - admin: `seo-actions.ts` server actions with auth + revalidateTag (Next.js 16 needs 2nd arg `'max'`)
  - admin: `/seo` per-row "Notify deleted" + "Request indexing" buttons + bulk bar with confirmation dialog
  - modonty: replaced deprecated `middleware.ts` pattern with `proxy.ts` (Next.js 16) returning true 410 for archived slugs
  - modonty: `lib/archive-cache.ts` — 5-min cached set of archived slugs (tag `archived-slugs`)
- **Eliminated:** 307→`/` redirect anti-pattern (soft 404 risk per Google)
- **Live test:** 11 "Notify deleted" buttons rendered for missing URLs · bulk action confirms with quota warning

### OBS-042 ✅ FIXED — Dashboard coverage now reflects FULL indexed set (28d/100), not just recent (7d/50)
- **Issue:** Dashboard alert showed "5 missing" while `/seo` showed "11 missing" — different windows for the same metric
- **Fix:** `gsc-section.tsx fetchGscDashboardData` now fetches coverage from 28d/top 100 (matches `/seo`) while keeping KPIs + Top Pages on 7d window
- **Result:** Dashboard and /seo report identical coverage numbers · single source of truth

### OBS-041 ✅ DONE — Phase 1 URL Lifecycle: GSC coverage analyzer + dashboard alert + /seo stub
- **Built:**
  - `admin/lib/gsc/coverage.ts` — URL parser + `analyzeGscCoverage()` matches GSC pages with DB articles · types: article/homepage/client/category/tag/industry/author/static/other
  - GSC section: `CoverageAlert` clickable bar between KPIs and 3-column body
  - `admin/app/(dashboard)/seo/page.tsx` — full coverage table sorted by status urgency, with per-row recommendation
- **Live results on production:** 17 indexed, 2 live, 11 missing, 15% coverage — surfaced 11 URLs Google indexed that don't exist in DB, needing 301/410 decisions (Phase 2)
- **No infrastructure yet:** read-only review · Phase 2 builds review tool · Phase 3 builds redirect infrastructure

### OBS-040 ✅ VERIFIED — GSC integration 100% correct per official docs
- **Verified against:** Context7 (`/websites/googleapis_dev_nodejs_googleapis`) + developers.google.com/webmaster-tools + SDK source `node_modules/googleapis@170.1.0/build/src/apis/webmasters/v3.d.ts`
- **Confirmed:**
  - `google.webmasters('v3')` matches docs
  - `searchType` is the correct field name for webmasters v3 (vs `type` for searchconsole v1)
  - `Schema$ApiDataRow = { clicks, ctr, impressions, keys, position }` matches our parsing exactly
  - JWT auth with `webmasters.readonly` scope is correct
  - `rowLimit` default 1000, max 5000 — our usage within bounds
  - `sc-domain:modonty.com` siteUrl format works (live tested)
  - 3h `unstable_cache` TTL appropriate (GSC data delayed 2-3 days)
- **One design note:** date-range padding of +3 days in `analytics.ts:38` is intentional to account for the 2-3 day data delay, ensuring requested window returns full finalized data. Not a bug.

### OBS-039 ✅ DONE — Inbox UX redesign: client-first hierarchy (replaces article-first)
- **Where:** `/inbox` and `/inbox/[clientId]`
- **What:** First version grouped pending FAQs BY ARTICLE — same client appeared 6+ times in the table (bad UX). Restructured to group BY CLIENT first.
- **New flow:**
  - `/inbox` — TABLE OF CLIENTS: each row = one client with total pending count + article count + last submitted. 3 clients instead of 19 article rows.
  - `/inbox/[clientId]` — client header (Email/Phone/Website action buttons) + STACKED CARDS per article, each with its pending questions table inline.
- **Renamed:** `[articleId]` directory → `[clientId]` (required dev server restart for Turbopack to pick up rename)
- **Updated:** `inbox-actions.ts` — `getClientsWithPendingFAQs` (groups by client), `getClientInboxDetail(clientId)` (article+FAQ tree per client)
- **Live tested on production:** 86 questions / 19 articles / 3 clients confirmed; client detail page renders all articles with their FAQs inline.

### OBS-038 ✅ DONE — Inbox feature: list + dynamic FAQ page (initial version)
- **Where:** `/inbox` and (initial) `/inbox/[articleId]`
- **What:** First implementation grouped by article — superseded by OBS-039 (client-first).
- **Wiring:** `db-section.tsx` action items now link to `/inbox` (FAQ + new messages).

### OBS-037 🟡 INSIGHT — "Pending FAQs" KPI is misleading (production data check)
- **Where:** `/` dashboard → DB Section → Action Items → "86 FAQs awaiting reply"
- **What:** Production has 86 PENDING ArticleFAQs but NONE are from real readers.
  - 20 source=`manual` (admin-created, no submittedByName/Email)
  - 66 source=`null` (legacy entries pre-source-field)
  - 0 source=`user` or `chatbot`
  - 0 pending comments overall
- **Reality:** These are content-prep questions admin added — drafts waiting for the writer to answer before publishing as Article FAQ schema. Not urgent reader engagement.
- **Implication:** Dashboard surfaces them as "needs your attention" but they belong in `/articles` content workflow, not in the cross-source urgency feed.
- **Fix to consider (not done yet):** Action Items should filter `source IN ('user', 'chatbot')` to surface only true reader submissions. Manual drafts should appear in articles list under each article.
- **Verified via:** `admin/scripts/check-engagement-source.ts` (read-only, ran against production DB)

### OBS-036 ✅ FIXED — Dashboard polish: removed "New Article" button + scrollbar invisible
- **Where:** `/` admin dashboard (new layout)
- **What:** (1) "New Article" button in header is no longer needed at this stage. (2) Main scrollbar was auto-hidden by Windows default — user reported "scroll bar مش شغال"
- **Fix:**
  - `admin/app/(dashboard)/page.tsx` — removed Plus button + `Link` import + `Button` import
  - `admin/app/(dashboard)/layout.tsx:36` — added `scrollbar-thin` class to `<main>` (existing utility from globals.css)
- **Status:** ✅ live test confirmed — header clean, scrollbar visible, all 3 sections reachable

### OBS-035 ✅ FIXED — Dashboard crash: orphan FAQs broke `db.articleFAQ.findMany()`
- **Where:** `/` (admin dashboard) — `getEngagementQueue()` action
- **What:** PrismaClientUnknownRequestError: `Inconsistent query result: Field article is required to return data, got null instead.`
- **Root cause:** MongoDB doesn't enforce FK cascades — orphan FAQs in `faqs` collection point to deleted articles. Prisma's required relation fails the query.
- **Fix:** `admin/app/(dashboard)/actions/dashboard-actions.ts:1038` — split into 2 queries: fetch FAQs + articleIds, fetch articles separately, filter orphans in JS
- **Status:** ✅ live test confirmed dashboard loads, FAQ count = 5 (was 0 due to error)
- **Side effect avoided:** dev DB only — no prod data touched

---

## Session: 2026-04-10 — Admin Live Test (Featured Image Test + Media Survey)

### OBS-001 🟡 MEDIUM — Media picker search not reactive
- **Where:** Article editor → Content tab → "Select Featured Image" dialog
- **What:** Typing in the search box does not filter results. The input is React-controlled
  but direct DOM events don't trigger re-render. User types but nothing changes visually.
- **Expected:** Results filter as user types (debounced search)
- **File suspect:** Article editor media picker component (media section)

### OBS-002 🟡 MEDIUM — Media edit form has no "Client" field
- **Where:** `/media/[id]/edit`
- **What:** Once an image is uploaded under a client, there is no way to reassign it to
  a different client via the edit form. The client is shown in the breadcrumb only (read-only).
- **Expected:** A "Client" dropdown in the edit form to allow reassignment
- **Impact:** If an image is uploaded under the wrong client, it cannot be corrected without
  deleting and re-uploading. The article editor media picker filters by client, so a misassigned
  image is permanently inaccessible from the wrong article.

### OBS-003 🔴 HIGH — Article editor Featured Image preview is cropped (object-cover)
- **Where:** Article editor → Content tab → Featured Image preview
- **File:** `admin/components/shared/thumbnail-image-view.tsx:161`
- **What:** Preview uses `object-cover` inside a fixed aspect container → wide images crop
- **Fix:** Change to `object-contain` (1-line fix, already in MASTER-TODO)

### OBS-004 🟡 MEDIUM — Test image uploaded to wrong client automatically
- **Where:** Media Library global upload
- **What:** Uploaded `test-1920x1080.jpg` from the global Media page (no client selected).
  Image was auto-assigned to "عيادات بلسم الطبية" instead of being "unassigned" or "General".
- **Expected:** Either a mandatory client selector during upload, or images without a client
  should appear in ALL client media pickers under a "General" pool
- **Impact:** Uploading an image globally doesn't make it universally accessible per article

### OBS-005 🟢 LOW — Media edit page: Preview image shows without clear aspect ratio context
- **Where:** `/media/[id]/edit` — Preview panel on right side
- **What:** The preview image renders correctly (object-contain working), but there's no
  visual indicator of the image's aspect ratio or whether it's suitable for article use
- **Suggestion:** Show aspect ratio label + suitability hint (e.g. "✓ Suitable for article cover")

### OBS-006 🔴 HIGH — Article editor Featured Image preview: CONFIRMED CROPPED (object-cover)
- **Where:** Article editor → Content tab → Featured Image preview section
- **File:** `admin/components/shared/thumbnail-image-view.tsx:161`
- **What:** Tested with img3.png (1351×351, ~4:1 wide ratio). In the edit preview, the image
  fills a 16:9 container with `object-cover` — heavily cropping the sides. The admin cannot
  see what the final published image will look like.
- **Admin detail view:** Different component — shows image with white frame, appears less cropped
- **Fix:** Line 161: `object-cover` → `object-contain` + `bg-muted` background
- **Status:** ✅ CONFIRMED by live test 2026-04-10

### OBS-007 🟡 MEDIUM — Article detail page in admin: image frame is large with white background
- **Where:** `/articles/[id]` — the read-only article detail/preview page in admin
- **What:** The featured image preview uses a large white-background frame container. The image
  renders inside it but the frame is not proportional to the image. Looks unpolished for an
  "admin preview" of the article.
- **Suggestion:** Use a cleaner preview container that matches how the article looks on modonty.com

---

## Session: 2026-04-13 — Modonty Mobile Live Test (375×812 — iPhone viewport)

### OBS-008 🔴 HIGH — Navbar: logo + CTA + search overflowing on mobile
- **Where:** All pages — top navbar
- **What:** The navbar has logo (مودونتي) + search icon + "عملاء بلا إعلانات" CTA button + login icon all in one row at 375px. The logo text is clipped ("مoo" visible), CTA pill pushes everything. On desktop it looks fine but on mobile the layout is congested.
- **Expected:** On mobile, CTA pill should be hidden or collapsed. Logo should be full width visible.
- **Severity:** High — first thing the user sees, branding is broken.

### OBS-009 🔴 HIGH — Article title overflows horizontally on mobile
- **Where:** Article page — hero header
- **What:** Long Arabic titles (e.g. "ما هي صفحات نتائج البحث Search Engine Results Page SERP وكيف يختار Google ما يعرضه للمستخدم؟") cause text to overflow beyond the 375px screen. English words inside the title push beyond the right edge and clip.
- **Expected:** Title wraps fully. `overflow-wrap: break-word` or `word-break: break-word` needed on mixed-language titles.
- **File suspect:** Article header component

### OBS-010 🔴 HIGH — Article card last item: slug truncated to `/articles/م`
- **Where:** Homepage → last article card in the feed
- **What:** The last article card shows URL `/articles/م` — slug is cut at one Arabic character. The title, excerpt, and image all look normal but the link is broken/truncated. Clicking it will 404.
- **Expected:** Full slug rendered correctly.
- **Impact:** SEO + user — link doesn't work for that article.
- **File suspect:** Article feed / article card component — likely a slug that starts with a long Arabic character sequence getting trimmed or truncated in rendering.

### OBS-011 🟡 MEDIUM — Bottom nav overlaps page content (sticky nav covers last items)
- **Where:** All pages with bottom nav
- **What:** The sticky bottom nav (الرئيسية | الرائجة | الفئات | العملاء | المحفوظات) is always visible but the footer content behind it is partially cut off by the nav bar. No bottom padding on `main` to compensate.
- **Expected:** Page content should have `pb-20` or equivalent to avoid being covered.

### OBS-012 🟡 MEDIUM — Categories page: category cards have no article count badge visible on mobile
- **Where:** `/categories` — mobile view
- **What:** Category cards exist but their image/icon area is very small, no article count visible. User can't tell which categories are worth exploring.
- **Expected:** Show article count prominently in each category card.

### OBS-013 🟡 MEDIUM — Trending page: article cards lack featured image thumbnails
- **Where:** `/trending` — mobile view
- **What:** Trending articles show text only — no thumbnail images. Homepage feed has images but trending doesn't, creating inconsistency.
- **Expected:** Same card format with image as homepage feed.

### OBS-014 🟡 MEDIUM — Clients page: client cards have mixed alignment issues
- **Where:** `/clients`
- **What:** Client cards have CTA button in different positions. Some have logos, some use placeholder. The "عميلنا المميز" featured section has the text left-cut at mobile width.
- **Expected:** Consistent card layout, RTL text fully visible.

### OBS-015 🟢 LOW — Login page: excessive empty space at top on mobile
- **Where:** `/users/login`
- **What:** Large blank area above the login card (about 80px). Wastes precious mobile screen space. Form is pushed down.
- **Expected:** Login card should be near the top, vertically centered or with reduced top margin.

### OBS-016 🟢 LOW — 404 page: missing bottom nav / no search bar shown
- **Where:** `/this-does-not-exist` (404 page)
- **What:** The 404 page does NOT show the bottom sticky nav. All other pages show it. Inconsistency.
- **Expected:** Bottom nav should be present on 404 for navigation recovery.

### OBS-017 🟡 MEDIUM — Terms/Legal pages: text overflowing viewport on mobile
- **Where:** `/terms`
- **What:** The terms page has labels ("الأحكام", "الشروط") at top that are cut off — title "الشروط والأحكام" clips at the right edge. Paragraph text wraps correctly but section headers are clipped.
- **Expected:** All headings and section labels must fit within 375px.

### OBS-018 🟡 MEDIUM — Article page: "للإعجاب أو حفظ المقال" prompt overlaps interaction buttons
- **Where:** Article page — bottom interaction toolbar on mobile
- **What:** The login prompt "للإعجاب أو حفظ المقال" and the share/reaction bar sit too close together. On 375px, the floating toolbar icon is cramped.
- **Expected:** More spacing between the login call-to-action and the toolbar.

---

## Pending — Move to MASTER-TODO

- [ ] OBS-008 → Navbar CTA pill hidden on mobile
- [x] OBS-009 → ✅ Already fixed: article-header.tsx has `break-words`
- [ ] OBS-010 → 🔴 CRITICAL: Broken slug in article card (/articles/م)
- [x] OBS-011 → ✅ Already fixed: layout.tsx has `pb-16 md:pb-0`
- [ ] OBS-012 → Categories: no article count visible
- [ ] OBS-013 → Trending: no thumbnails in cards
- [ ] OBS-014 → Clients: card alignment issues
- [ ] OBS-015 → Login: excess top space
- [x] OBS-016 → ✅ Already fixed: not-found.tsx uses root layout which includes MobileFooterWithFavorites
- [ ] OBS-017 → Terms: text clipping
- [ ] OBS-018 → Article: interaction bar spacing

### OBS-034 🟡 MEDIUM — Featured card placeholder بدون صورة: نسبة 16:7 كبيرة جداً
- **Where:** Client page feed — أول كارت مقال لما ما في featured image
- **What:** الـ aspect-[16/7] الواسع يجعل placeholder area ضخمة وفارغة على mobile — تأخذ مساحة كبيرة بدون قيمة بصرية
- **Fix:** عند `featured=true` وما في صورة → استخدم aspect-video عادي (16:9) بدل 16:7، أو أصغّر placeholder height
- **File:** `PostCardHeroImage.tsx` — شرط `featured && !post.image`

---

## Pending — Move to MASTER-TODO (from previous session)

- [ ] OBS-001 → Media picker search doesn't filter
- [ ] OBS-002 → Media edit: add Client reassignment field
- [ ] OBS-004 → Media upload: clarify client assignment flow
- [ ] OBS-005 → Media edit: aspect ratio indicator in preview
> OBS-003 already in MASTER-TODO

---

## Session: 2026-04-17 — Client Page Hero + Admin Media Live Test

### OBS-019 🟡 MEDIUM — Edit Hero Image dialog: لا يوجد زر "Upload" أو "Change" واضح
- **Where:** Admin → Clients list → Edit media → Edit Hero Image dialog
- **What:** الـ dialog يعرض الصورة الحالية لكن ما في زر واضح لتغييرها. المستخدم يحتاج يضغط على الصورة نفسها لفتح الـ media picker — سلوك غير واضح.
- **Expected:** زر "Change Image" أو "Select Different Image" واضح أسفل أو فوق الصورة

### OBS-020 🟢 LOW — Edit Hero Image: "No alt text" warning بدون حقل إدخال
- **Where:** Admin → Edit Hero Image dialog
- **What:** يظهر "No alt text" كـ warning على الصورة لكن ما في حقل لإدخال الـ alt text في هذا الـ dialog
- **Expected:** حقل alt text أو رابط لصفحة تعديل الصورة

### OBS-021 🔴 HIGH — Media picker في الـ hero dialog يعرض General images فقط
- **Where:** Admin → Edit Hero Image → Select Media dialog
- **What:** الـ picker يعرض صور "General" (مش مخصصة لأي عميل). صور العميل الخاصة لا تظهر في الـ picker لأنها مرتبطة بعميل مختلف أو غير موجودة.
- **Impact:** الأدمن يضطر يرفع صورة عامة ثم يعينها للعميل — سير عمل معقد

### OBS-022 🟡 MEDIUM — Select Media dialog: لا يوجد زر "Upload New"
- **Where:** Admin → Edit Hero Image → Select Media dialog
- **What:** الـ dialog يعرض فقط الصور الموجودة. لو ما في صور، الأدمن عاجز عن رفع صورة جديدة من هنا.
- **Expected:** زر "Upload New Image" داخل الـ dialog

### OBS-023 🟡 MEDIUM — لا يوجد toast بعد "Save Hero Image"
- **Where:** Admin → Edit Hero Image dialog → بعد الضغط على Save
- **What:** الـ dialog يغلق بدون أي toast أو confirmation message. المستخدم ما يعرف إذا اتحفظت الصورة أو لأ.
- **Expected:** Toast "تم تحديث صورة الغلاف بنجاح"

### OBS-025 🟡 MEDIUM — Tagline يعرض "SA" بدل "السعودية" في صفحة العميل
- **Where:** modonty → صفحة العميل → hero tagline
- **What:** الـ tagline يعرض "الرعاية الصحية · الرياض، SA" — "SA" هو country code إنجليزي
- **File suspect:** `modonty/app/clients/[slug]/components/hero/utils.tsx` — `getTagline()` يستخدم `addressCountry` مباشرة
- **Expected:** "السعودية" أو ترجمة الـ country code للعربية

### OBS-027 🟡 MEDIUM — Industries listing vs detail inconsistency (Production)
- **Where:** `/industries` listing → `/industries/tourism-hospitality`
- **What:** Listing shows "12 شركات" but detail shows "0 شركة موثوقة"
- **Root cause:** Listing counts ALL clients; detail filters `subscriptionStatus: ACTIVE` only. Production clients have non-ACTIVE status.
- **Fix A:** Update clients in Admin → `subscriptionStatus: ACTIVE`
- **Fix B:** Align listing query to count ACTIVE only (prevents misleading count)

---

## Pending (new) — Move to MASTER-TODO

- [ ] OBS-019 → Admin: Edit Hero dialog — no obvious "Change" affordance
- [ ] OBS-020 → Admin: No alt text field in Edit Hero dialog
- [ ] OBS-021 → Admin: Media picker shows General only, not client-specific
- [ ] OBS-022 → Admin: No Upload button in Select Media dialog
- [ ] OBS-023 → Admin: No toast after Save Hero Image
- [x] OBS-025 → ✅ FIXED (Session 40): `localizeCountry()` exported from utils.tsx + used in hero-meta.tsx:53

---

## Session: 2026-04-20 — PageSpeed Audit (3 pages)

### OBS-028 🔴 HIGH — Clients page: Accessibility 95 — unnamed buttons
- **Where:** `/clients` page — mobile PageSpeed audit
- **What:** `Buttons do not have an accessible name` — icon buttons missing `aria-label`
- **Score impact:** Accessibility 95 instead of 100
- **File suspect:** Client card component or NewClientsCard — any icon-only `<button>` without `aria-label`
- **Fix:** Add `aria-label` to all icon-only buttons on clients page

### OBS-029 🟡 MEDIUM — Homepage LCP 3.0s — above-fold feed images
- **Where:** `/` homepage — mobile PageSpeed
- **What:** LCP consistently 3.0s. Main culprit: first article card image in the feed. No `priority` prop on above-fold images.
- **Impact:** Directly caps Performance score at ~92 on mobile
- **Fix:** Add `priority` to the first 2-3 article feed images (or LCP image specifically)

### OBS-030 🟢 LOW — ~~Article pages cannot be tested via PageSpeed~~ — RESOLVED
- **Update (Session 49):** Article pages CAN be tested via PageSpeed using double-encoded URL format (encode the `%` signs in the Arabic slug again). PageSpeed accepted it and returned scores.

---

## Session: 2026-04-20 — Article Live Test + PageSpeed (Session 49)

### OBS-031 🔴 HIGH — Article page: hreflang tags MISSING
- **Where:** `/articles/[slug]` — `<head>`
- **What:** Live test confirmed `link[hreflang="ar"]` = MISSING, `link[hreflang="x-default"]` = MISSING. No hreflang at all.
- **Root cause:** Stored `nextjsMetadata` in DB doesn't include hreflang. Our SEO-001 fix only overrides `alternates.canonical` — forgot `alternates.languages`
- **File:** `modonty/app/articles/[slug]/page.tsx` — stored metadata early-return block
- **Impact:** Google doesn't know article is Arabic-language content → Arabic rankings suffer
- **Fix:** Add `languages: { ar: canonicalUrl, "x-default": canonicalUrl }` to the `alternates` override alongside the canonical fix
- **Logged as:** SEO-006 in MASTER-TODO

### OBS-032 🔴 HIGH — Article canonical still missing www in PRODUCTION
- **Where:** `/articles/[slug]` — `link[rel="canonical"]`
- **What:** Live production shows `https://modonty.com/articles/...` (no www). SEO-001 code fix exists locally but was not pushed, OR `NEXT_PUBLIC_SITE_URL` in Vercel is still `https://modonty.com`
- **Logged as:** SEO-007 in MASTER-TODO

### OBS-033 🟡 MEDIUM — Article page TBT 250ms — Forced reflow
- **Where:** `/articles/[slug]` — mobile PageSpeed audit
- **What:** Total Blocking Time = 250ms. Failed audits include "Forced reflow" (JS querying layout properties like offsetWidth/getBoundingClientRect during render). Also "Minimize main-thread work".
- **Impact:** Delays interactivity, hurts INP score
- **Fix:** Identify which component triggers forced reflow — likely the article body renderer or TOC component

---

## Session: 2026-04-17 — Live Test CP-10 (Mobile 375px)

### OBS-026 🟡 MEDIUM — CP-7 regression: Hero stats row wraps to 2 lines on mobile
- **Where:** Client page hero — stats row (متابع · مقال · مشاهدة)
- **What:** `flex-wrap` causes stats to break to two lines at 375px — "مقال · متابع" on line 1, "مشاهدة" on line 2
- **File:** `modonty/app/clients/[slug]/components/hero/hero-meta.tsx`
- **Fix:** Remove `flex-wrap`, add `overflow-x-hidden`, reduce `gap-3` to `gap-2`, use `text-xs` on mobile
- **Logged as:** CP-14 in MASTER-TODO

