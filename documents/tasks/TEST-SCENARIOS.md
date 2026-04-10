# Admin Test Scenarios — Data Integrity & Real Interactions

> Last Updated: 2026-04-09
> Based on: Live inspection of http://localhost:3000
> Purpose: Verify every data point shown in the admin is real, accurate, and correct.

---

## Current Data Snapshot (Source of Truth)

| Entity | Count | Key Facts |
|--------|-------|-----------|
| Articles | 3 | 2 Published, 1 Writing, all for نوفا |
| Clients | 2 | نوفا (Pro), بلسم (Standard) |
| Categories | 4 | 1 with articles (التسويق الرقمي = 3) |
| Tags | 5 | SEO (3 articles), ذكاء اصطناعي (3 articles) |
| Industries | 4 | نوفا → التجارة الإلكترونية, بلسم → الرعاية الصحية |
| Authors | 1 | Modonty (3 articles, 2 published) |
| Media | 3 | All belong to بلسم (3 screenshots, 84 KB) |
| Subscribers | 2 | Both for نوفا — محمد, فاطمة |
| Contact Messages | 2 | منى (Read), طارق (New) |
| Admins | 1 | modonty@modonty.com |
| Plans | 4 | Basic / Standard / Pro / Premium |

---

## SCENARIO 1 — Dashboard Numbers Match Reality

**What to verify:** Every number on the dashboard card is accurate.

| Card | Shows | Expected | Pass? |
|------|-------|----------|-------|
| Total Articles | 3 | Articles table → 3 rows | ✅ |
| Clients | 2 | Clients table → 2 rows | ✅ |
| Users | 1 | /users → 1 admin | ✅ |
| Subscribers | 2 | /subscribers → 2 rows | ✅ |
| Active Subscriptions | 2 | Both clients Active | ✅ |
| Expiring Soon | 0 | No client within 7 days of expiry | ✅ |
| Overdue Payments | 0 | Both clients show Paid | ✅ |
| Expired Subscriptions | 0 | No expired clients | ✅ |

**Critical check:** Dashboard "2 published" articles stat — but نوفا client shows "2" in Articles column. Article "مستقبل التعليم الرقمي" is Writing (not published). Count source = **published only** ✅

---

## SCENARIO 2 — Articles Data Consistency

**Articles in system (3 total):**

| Title | Client | Category | Status | SEO | Tags |
|-------|--------|----------|--------|-----|------|
| مستقبل التعليم الرقمي في السعودية | نوفا | التسويق الرقمي | Writing | 80% | ? |
| الذكاء الاصطناعي في الرعاية الصحية | نوفا | التسويق الرقمي | Published | 80% | ? |
| دليل SEO المتاجر الإلكترونية 2025 | نوفا | التسويق الرقمي | Published | 80% | SEO, ذكاء اصطناعي |

**Scenario 2A — Publish the Writing article**
1. Go to /articles → click "مستقبل التعليم الرقمي"
2. Click Edit → change status from Writing → Published
3. **Expected results:**
   - Article list: Writing filter = 0, Published = 3
   - Articles header: "3 published"
   - نوفا client: Articles column → 3 (was 2)
   - Dashboard: "Total Articles 3" stays, "2 published" → "3 published"
   - Author Modonty: "2 published" → "3 published"

**Scenario 2B — Create a new article for بلسم**
1. Go to /articles → New Article
2. Assign to: عيادات بلسم الطبية, Category: التقنية والذكاء الاصطناعي
3. Save as Draft
4. **Expected results:**
   - Articles total: 4
   - Dashboard: Total Articles = 4
   - بلسم client: Articles column 0 → 1
   - Category التقنية والذكاء الاصطناعي: 0 → 1 article

**Scenario 2C — SEO score is 80% for all — verify what's missing (20%)**
1. Open any article → view SEO guidance/technical
2. Identify which 3 checks are failing (100% = 15 checks pass, 80% = ~12/15)
3. Fix the missing fields on one article
4. **Expected:** SEO score changes from 80% → higher %

---

## SCENARIO 3 — Client Data Consistency

**Scenario 3A — بلسم has 52% SEO, نوفا has 70% — fix بلسم SEO**
1. Go to /clients → click بلسم → Overview tab → "Setup SEO" button
2. Fill in SEO Title, SEO Description, canonical URL
3. Save
4. **Expected:**
   - بلسم SEO bar changes from 52% → higher
   - Clients list: SEO column for بلسم updates
   - SEO Overview page: بلسم article SEO updates if cascade enabled

**Scenario 3B — نوفا article quota: 2/8 published, 3 total articles**
1. Go to /clients → نوفا row → Articles column shows "2"
2. Verify: this is **published** articles count, not total
3. Open نوفا → Content tab → confirm 3 articles visible (2 published + 1 Writing)
4. **Expected:** quota counts published articles only (not drafts/writing)

**Scenario 3C — Client subscription plan mismatch**
1. Dashboard: "Active Subscriptions = 2"
2. Plans page: Pro has 1 client, Standard has 1 client → total = 2 ✅
3. Basic and Premium: 0 clients — verify these plans are visible but unused
4. Change بلسم plan from Standard → Pro
5. **Expected:**
   - Plans page: Standard → 0 clients, Pro → 2 clients
   - بلسم detail: plan badge changes
   - بلسم article quota: 4/mo → 8/mo

---

## SCENARIO 4 — Categories Hierarchy & Article Counts

**Current state:**
- التسويق الرقمي (root) → 3 articles ✅
- تحسين محركات البحث SEO (child of التسويق الرقمي) → 0 articles
- التجارة الإلكترونية (root) → 0 articles
- التقنية والذكاء الاصطناعي (root) → 0 articles

**Scenario 4A — Article count cascades from child to parent?**
1. Edit article "دليل SEO المتاجر الإلكترونية 2025" → change category from التسويق الرقمي → تحسين محركات البحث SEO (child)
2. **Expected:**
   - التسويق الرقمي (parent): 3 → 2 articles
   - تحسين محركات البحث SEO (child): 0 → 1 article
   - Categories table reflects immediately

**Scenario 4B — Delete a category with 0 articles**
1. Delete التجارة الإلكترونية (0 articles)
2. **Expected:**
   - Categories total: 4 → 3
   - No articles affected (was 0)
   - Client "نوفا" industry is التجارة الإلكترونية (the Industry, not Category) — no impact

---

## SCENARIO 5 — Industries → Client Cascade

**Current state:**
- التجارة الإلكترونية industry → 1 client (نوفا)
- الرعاية الصحية industry → 1 client (بلسم)
- التعليم والتدريب → 0 clients
- التقنية والذكاء الاصطناعي → 0 clients

**Scenario 5A — Rename an industry → cascades to client JSON-LD**
1. Edit التجارة الإلكترونية → rename to "التجارة الإلكترونية والتسوق"
2. **Expected:**
   - نوفا client detail: Industry field shows new name
   - نوفا JSON-LD (technical view): Organization.industry updates
   - Industry article count unchanged

**Scenario 5B — Delete industry with 0 clients**
1. Delete التعليم والتدريب (0 clients)
2. **Expected:**
   - Industries: 4 → 3
   - No clients affected

---

## SCENARIO 6 — Media Library

**Current state:** 3 files, all belong to عيادات بلسم الطبية, 84 KB total

**Scenario 6A — Upload a new image for نوفا**
1. Go to /media → Upload
2. Select image, assign to نوفا
3. **Expected:**
   - Media: 3 → 4 files
   - A new group "متجر نوفا للإلكترونيات" appears in library
   - File count & storage % updates

**Scenario 6B — Assign media to an article**
1. Edit article → attach uploaded image as featured image
2. **Expected:**
   - Article detail page: featured image visible
   - Article SEO score: may increase (image present = +points)

---

## SCENARIO 7 — Subscribers

**Current state:** 2 subscribers (both نوفا) — محمد (sub1@test.com), فاطمة (sub2@test.com)

**Scenario 7A — Unsubscribe a subscriber**
1. Click "Unsubscribe" for محمد
2. **Expected:**
   - Status changes: Subscribed → Unsubscribed
   - Dashboard Subscribers: 2 → 1
   - Unsubscribe button disappears (or changes to "Subscribe")

**Scenario 7B — Verify subscriber linked to client**
1. Subscribers table shows "متجر نوفا للإلكترونيات" for both
2. Go to نوفا client detail → Subscribers section
3. **Expected:** Both subscribers visible inside client view

---

## SCENARIO 8 — Contact Messages

**Current state:**
- منى | mona@test.sa | عرض سعر | **Read** | Apr 8, 2026
- طارق | tariq@test.sa | استفسار | **New** | Apr 8, 2026

**Scenario 8A — Mark طارق message as Read**
1. Click the "mark as read" action on طارق row
2. **Expected:**
   - Status badge: New → Read
   - Statistics section: New count decreases

**Scenario 8B — View message details**
1. Click view (eye icon) on منى
2. **Expected:** Full message content visible, status stays Read

**Scenario 8C — Delete a message**
1. Delete طارق message
2. **Expected:**
   - Contact Messages (2) → (1)
   - Table shows only منى

---

## SCENARIO 9 — SEO Overview Accuracy

**Current state:** 7/14 pages Generated, 7 Pending

**Pages with SEO (Generated):** Home, Clients, Categories, Trending, Tags, Industries, Articles
**Pages without SEO (Pending):** FAQ, About, Terms, User Agreement, Privacy Policy, Cookie Policy, Copyright Policy

**Scenario 9A — Regenerate All and verify count**
1. Go to /seo-overview
2. Click "Regenerate All (14 pages)"
3. **Expected:**
   - All 14 pages → Generated
   - Counter: 14/14
   - Pending legal pages remain Pending (they have no content/settings yet)

**Scenario 9B — SEO Title missing for Clients/Categories listing**
1. SEO Overview: Clients row shows SEO Title = "—" (empty)
2. Go to Settings → Clients tab → add SEO Title
3. Save → Regenerate Cache
4. **Expected:** SEO Overview → Clients row → SEO Title now shows the value

---

## SCENARIO 10 — Settings → Cascade Verification

**Scenario 10A — Change Brand Description → verify it cascades**
1. Settings → Modonty tab → change Brand Description
2. Click Save Modonty SEO
3. **Expected:**
   - Toast success
   - SEO Overview: Home "Last Generated" timestamp updates

**Scenario 10B — Change Settings OG Image → verify listing pages update**
1. Settings → Media tab → update Main Image (OG) with new Cloudinary URL
2. Go to Settings → Clients tab → Regenerate Cache
3. **Expected:**
   - Social Sharing Image preview in Clients tab updates
   - modonty /clients page source: og:image changes to new URL

---

## SCENARIO 11 — Plans & Pricing Integrity

**Current state:**
| Plan | SAR/yr | Articles/mo | Clients Using |
|------|--------|-------------|---------------|
| Basic | 1,200 | 2 | 0 |
| Standard | 2,400 | 4 | 1 (بلسم) |
| Pro | 4,800 | 8 | 1 (نوفا) |
| Premium | 9,600 | 16 | 0 |

**Scenario 11A — Edit a plan price**
1. Go to /subscription-tiers → edit Basic plan → change price to 1,500 SAR/yr
2. **Expected:**
   - Plans page card updates immediately
   - Clients using Basic plan: their subscription price reflects new rate (or not — check if historic)

**Scenario 11B — Article quota enforced on client**
1. نوفا is Pro: 8 articles/month limit, currently 2/8 published
2. Try to publish 7 more articles for نوفا (total would exceed 8)
3. **Expected:** At article 9, system prevents publish with quota error

---

## SCENARIO 12 — User Management

**Scenario 12A — Add a second admin**
1. /users → Add Admin
2. Email: admin2@modonty.com, name: Admin Two
3. **Expected:**
   - Users list: 1 → 2 admins
   - Dashboard Users: 1 → 2

**Scenario 12B — Cannot delete last admin**
1. Try to delete modonty@modonty.com (the only admin)
2. **Expected:** Action blocked with error — system must always have ≥1 admin

---

## KNOWN ISSUES TO INVESTIGATE

| # | Issue | Severity |
|---|-------|----------|
| 1 | `/audience` → 404 (sidebar link broken) | Medium |
| 2 | Contact messages show Client = "—" (not linked to a client) | Low |
| 3 | بلسم has 52% SEO — below threshold, needs SEO setup | Low |
| 4 | نوفا media = 0 files — no images uploaded for the client with 3 articles | Low |
| 5 | All 3 articles use same category (التسويق الرقمي) — test variety | Info |
| 6 | Subscribers only linked to نوفا — بلسم has no subscribers | Info |

---

## Test Priority Order

1. **SCENARIO 1** — Dashboard accuracy (foundation)
2. **SCENARIO 3A** — Fix بلسم SEO (most visible gap)
3. **SCENARIO 2A** — Publish Writing article (tests status flow)
4. **SCENARIO 9B** — Add SEO Title to listing pages
5. **SCENARIO 10B** — OG Image cascade (v0.25.0 feature)
6. **SCENARIO 7A** — Unsubscribe flow
7. **SCENARIO 8A** — Contact message status update
8. **SCENARIO 5A** — Industry rename cascade
9. **SCENARIO 11B** — Quota enforcement
10. **SCENARIO 12** — User management
