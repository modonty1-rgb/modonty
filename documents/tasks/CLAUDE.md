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

