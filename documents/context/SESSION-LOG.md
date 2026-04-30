# Session Context — Last Updated: 2026-04-30 (Session 74 — **Shared Env Migration + Local Test** ✅ done · Phase 4 (Vercel) deferred to next session)

> This file is the handoff document for the next agent/session.
> Read this FIRST before starting any work.
> Update this file BEFORE every push.

---

## Current Versions (no version bump in Session 74 — env-only changes, no app code touched)
- **admin**: v0.44.0 (committed `300a805` Session 73)
- **modonty**: v1.43.0 (committed `300a805` Session 73)
- **console**: v0.4.0 (committed `300a805` Session 73)

> ⚠️ Last commit on `main`: `300a805` (Session 73). **Session 74 work is uncommitted** — all env file changes + 3 changelog scripts hardcoded PROD URL + 2 admin code edits (brand description hardcoded).

---

## ✅ Session 74 — 2026-04-30 (Shared Env Migration + Local Verification)

### Summary
Major refactor of monorepo env management. ZERO production code changes (apart from 3 changelog scripts + 2 brand-description hardcodes). All Next.js apps now load shared env vars via `.env.shared` at root.

### What was done

**Phase 0-3 ✅ — Wired all 3 apps**
- New file: `MODONTY/.env.shared` (gitignored, 34 active keys + 12 commented unused)
- New file: `MODONTY/.env.shared.example` (committed template)
- `console/next.config.ts` + `modonty/next.config.ts` + `admin/next.config.ts` — added `dotenv.config({ path: '../.env.shared' })` at top (4 lines each)
- `console/package.json` + `modonty/package.json` — added `dotenv@^16.6.1` + `cheerio@^1.0.0` (cheerio was a pre-existing missing dep — bug from Session 71)
- Priority: `<app>/.env.local > <app>/.env > .env.shared` (override:false, Next.js standard)

**Phase 3.5 ✅ — Cleanup of duplicates**
- 6 per-app `.env`/`.env.local` files cleaned of duplicate keys (commented-out for rollback safety)
- Backup of all 6 files: `c:/tmp/env-backup-2026-04-29/`
- 5 pre-existing bugs fixed:
  1. console/.env: `NEXTAUTH_URL=https://admin.modonty.com` → `https://console.modonty.com`
  2. console/.env: `RESEND_FROM=no-reply@admin.modonty.com` → `no-reply@modonty.com`
  3. console/.env: `NEXT_PUBLIC_SITE_URL=https://modonty.com` → `https://www.modonty.com`
  4. .env.shared: `GOOGLE_SEARCH_CONSOLE_SITE_URL=https://modonty.com` → `https://www.modonty.com`
  5. modonty/.env: empty `TELEGRAM_BOT_TOKEN=` placeholder was overriding shared (commented out)

### Keys moved to `.env.shared` (34 active)
DATABASE_URL · AUTH_TRUST_HOST · NEXT_PUBLIC_SITE_URL · REVALIDATE_SECRET · INTERNAL_LOG_SECRET · GOOGLE_CLIENT_ID/SECRET · 6 Cloudinary · RESEND_API_KEY/FROM · 7 GSC + PageSpeed · NEXT_PUBLIC_GTM_CONTAINER_ID · 3 OpenAI · COHERE_API_KEY · SERPER_API_KEY · UNSPLASH · NEWS · 5 Telegram (with new TELEGRAM_WEBHOOK_SECRET = `b0b05ce0c9bdda586dff0f2a2097e3cf6acb0608656617f186d5a159de9fbc61`)

### Keys hardcoded (NOT secrets — by user decision)
- `PRODUCTION_DATABASE_URL` → hardcoded in 3 changelog scripts (admin/scripts/add-changelog.ts · changelog-sync.ts · changelog-prod.ts) per user "ما أبغى أتخبط في الـ environment"
  - ⚠️ **Atlas password rotation = update 3 scripts**
- `NEXT_PUBLIC_BRAND_DESCRIPTION` → hardcoded in 2 admin seed locations (not a secret)

### Audit & verification (4-level)
1. Independent Agent (155s, 68 calls) → 12 unused keys
2. Combined OR-pattern grep → ZERO matches
3. 12 individual greps → ZERO matches each
4. Edge-case grep (bracket access + dynamic prefix) → ZERO matches

12 unused keys commented in `.env.shared` (verified UNUSED 2026-04-30):
- `GSC_MODONTY_CLIENT_EMAIL` (client_email is inside KEY_BASE64 JSON)
- `NEXT_PUBLIC_GTM_DEBUG`, `NEXT_PUBLIC_GTM_ENVIRONMENT`
- `NEXT_PUBLIC_PHONE_NUMBER`, `NEXT_PUBLIC_WHATSAPP_NUMBER`
- 7 `NEXT_PUBLIC_SOCIAL_*` (replaced by DB Settings — `modonty/lib/settings/get-platform-social-links.ts`)

### Local test ✅ (PROD DB)
- `pnpm install` → 14.4s clean
- `pnpm prisma:generate` + `prisma:validate` → ✅
- 3 dev servers running on 3000/3001/3002 → all HTTP 200
- Playwright live tests ✅ on each:
  - **console**: login Kimazone → dashboard → site-health (PSI live: Mobile 62, Desktop 78) → settings (Telegram "مربوط")
  - **admin**: login modonty@modonty.com → dashboard (KPIs live) → /search-console (17 indexed, 11 missing, 19 pending — all GSC live)
  - **modonty**: homepage + sitemap (17KB) + image-sitemap (26KB) + robots.txt all 200
- Zero env-related errors. JWTSessionError on modonty browser nav = stale cookies (OBS-118 — pre-existing, not env issue).

### Next session — Phase 4 (Vercel)
~35-40 min UI work:
1. Backup .env from each Vercel project (Settings → Environment Variables → Download)
2. Team Settings → Environment Variables → Shared tab → Import .env.shared → Link to all 3 projects
3. Verify Shared section visible in each project
4. Delete duplicates from Project-level (low-risk first → DATABASE_URL last)
5. Redeploy 3 projects (no cache)
6. Update Telegram webhook with new secret:
   ```
   curl -X POST "https://api.telegram.org/bot8739374417:AAGaV6s6KaEwU7Jl5_sySrjx4YF9DUg099Y/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://console.modonty.com/api/telegram/webhook","secret_token":"b0b05ce0c9bdda586dff0f2a2097e3cf6acb0608656617f186d5a159de9fbc61"}'
   ```
7. Live verify 3 production domains

### Phase 5 (later — final cleanup)
After Phase 4 confirmed working: remove all `# UNUSED` and `# moved to .env.shared` comments from per-app `.env` files. Pure cleanup.

### TODO for production rotation (security)
- Regenerate AUTH_SECRETs in Vercel UI for all 3 apps (rotation best practice)
- Rotate Atlas DB password — needs to update `.env.shared` + 3 changelog scripts + Vercel Shared

---

## ✅ Session 73 — 2026-04-29 (Repo Cleanup + Marketing Brief + Pre-push)

### Summary
Three groups of work this session:

**1. Repo Cleanup (~1.45 GB + 1.7 MB freed)**
- `.next/` cache (admin 975 MB · modonty 376 MB · console) deleted
- test-screenshots, test-results, admin/logs, .playwright-mcp deleted
- Backups trimmed 16 → 5 most recent
- 31 one-off scripts archived (debug/test/check/seed) → eventually deleted in Phase 4
- 6 root configs moved to `documents/` (clients-table.yml · ga4.txt · mockup · compass-connections.json moved out)
- `documents/_archive/` reduced 150 → 0 files (folder deleted entirely)
- `DESIGN_SYSTEM.md` → `documents/07-design-ui/` (proper home)
- `shared.md` → `documents/implementation-plans/SHARED_ENV_MIGRATION_PLAN.md`
- `frontend-master-SKILL.md` → `.claude/skills/frontend-master.md` (Claude skill location)

**2. Marketing Brief 2026 (deliverable for marketing team)**
- New `documents/01-business-marketing/MARKETING-BRIEF-2026.html` (16 sections)
- Built on **live PROD DB tier data** (مجاني/الانطلاقة/الزخم/الريادة — 0/499/1299/2999 SAR)
- Inventory of 28 console features + 22 admin features + modonty 45+ pages from 3 parallel agents
- 5 Hooks for Reels/Ads + Persona narrative ("أحمد") + Four Powers framework + Honest Numbers credibility section
- HTML with Tajawal font, sticky TOC, scroll-spy, RTL, print-ready
- BUSINESS-OVERVIEW.md + MODONTY-STORY-SCRIPT.md merged + deleted (one source of truth now)

**3. Documents structure cleanup**
- 04-technical-dev: deprecated `settings-ui-removed-fields.md` deleted; `PRODUCTION-ENV-VARS.md` rebuilt with 3 apps (incl. Console — was missing) + correct `GSC_MODONTY_*` names + Telegram + PageSpeed + 5 gotchas
- 02-seo: verified 4 files (kept) — disavow-linkbooster.txt + AUDIT-4 are standby for negative SEO emergency
- 07-design-ui: gap-report-v2 verified vs code → 5 gaps resolved → replaced with `PENDING-UX-GAPS.md` (only unresolved)

**Pre-push verification (all green):**
- TSC zero errors on admin · modonty · console
- Build success on admin · modonty · console
- Backup completed (63 collections, 2.5MB)
- Changelog entries (v0.44.0 + v0.4.0 + v1.43.0) written to LOCAL + PROD DBs
- `verify-client-password.ts` (security risk leftover) deleted

### Files structure now
```
documents/
  01-business-marketing/
    MARKETING-BRIEF-2026.html  (single source of truth, 16 sections)
  02-seo/
    AUDIT-4-BACKLINK-SPAM-GUIDE.md (standby)
    ROBOTS-SITEMAP-REFERENCE.md
    SEO-STRUCTURED-DATA-METADATA-REFERENCE.md (794 lines, gold)
    disavow-linkbooster.txt (standby)
  03-analytics-gtm/ga4.txt
  04-technical-dev/PRODUCTION-ENV-VARS.md (rebuilt, 3 apps)
  07-design-ui/
    DESIGN_SYSTEM.md (1277 lines, design tokens)
    PENDING-UX-GAPS.md (G1-G3 + B1/B2/B4 + accessibility + typography)
    mockups/
  audits/REPO-CLEANUP-AUDIT.md
  implementation-plans/SHARED_ENV_MIGRATION_PLAN.md
  context/SESSION-LOG.md (this file)
  tasks/✅ MASTER-TODO.md, 🏆 MASTER-DONE.md, etc.
```

### Pending decisions (carry forward)
- Atlas password rotation (`test-prisma-connection.ts` was in working tree, deleted, but in git history `493d4e5` — user decided to rotate Atlas account later instead of cleaning git history)
- Other documents folders (03-analytics-gtm · 05-performance · 06-ai-chatbot · 08-intake-setup · admin-setting-docs · console-docs · guides · guidelines · modonty-docs) — not yet reviewed in Session 73

---

## ⏳ Session 72 — 2026-04-29 (Telegram Integration · Site Health Dashboard) — included in v0.44.0/0.4.0/1.43.0

---

## ⏳ Session 72 — 2026-04-29 (Telegram Integration · Site Health Dashboard)

### Summary
Three major value-add features built end-to-end with live tests on PROD DB:

**1. Telegram Per-Client Notifications — OBS-187 to OBS-196**
- New per-client bot `@ModontyAlertsBot` (separate from existing admin global `TELEGRAM_BOT_TOKEN`)
- Used distinct env var `TELEGRAM_CLIENT_BOT_TOKEN` to avoid conflict
- Schema: 5 new optional fields on `Client` (telegramChatId, telegramPairingCode, telegramPairingExpiresAt, telegramConnectedAt, telegramEventPreferences) — no migration needed (MongoDB schemaless)
- Pairing flow: console UI generates 6-digit code (10-min TTL) → user sends `/start` to bot then the code → webhook validates + binds chat_id
- Webhook: `console/app/api/telegram/webhook/route.ts` — verifies `x-telegram-bot-api-secret-token` header
- Telegram catalog: started as 26 events, finalized at 22 after cleanup (removed redundant questionNew/clientLike/clientDislike + admin-only newsletterSubscribe)
- **All 22 events live-tested via Playwright** (Tester TG visitor account created on modonty + Kimazone admin in console)
- Dev setup uses ngrok tunnel (URL `https://5429-142-154-87-194.ngrok-free.app` → console:3000) for webhook
- All messages include footer: timestamp (en-GB Asia/Riyadh) + geo (city/country) using Node native + free ip-api.com fallback

**2. clientFavorite + clientComment — Built end-to-end (OBS-199)**
- User: "أضيفهم لأنهم بالفعل مهمون للعميل... شغلهم تمامًا، اتركهم شغالين 100% من كل الجهات"
- `clientFavorite` (modonty): API `/api/clients/[slug]/favorite` (GET/POST/DELETE) + `ClientFavoriteButton` UI on client page hero (Bookmark icon) + Telegram event
- `clientComment` (modonty): API `/api/clients/[slug]/comments` (POST PENDING + GET list APPROVED) + `ClientCommentsSection` form/list on client page (after FAQ section) + Telegram event
- Console approval page: `/dashboard/client-comments` with 5 KPIs + filter pills + approve/reject/delete/restore actions
- Sidebar entry "آراء حول الشركة" with `Quote` icon (NOT MessageSquare — collides with article-comments top-nav bell)

**3. Site Health Dashboard (OBS-202 to OBS-207)**
- New `/dashboard/site-health` page — value-add for client subscriptions
- Architecture: **NO DB persistence** (per user request "بس مجرد عرض للعميل كخدمة")
- 9 free helpers in `console/lib/health/`: ssl, dns, headers, robots, sitemap, domain (RDAP), meta+OG (cheerio), schema-check, pagespeed (Google PSI)
- 2 cards: "Google PageSpeed" (raw scores Mobile + Desktop side-by-side, direct from Google) + "Modonty Health Score" (separate aggregate of our own checks: security headers, DNS, SEO essentials, CWV)
- **Critical bug caught by user:** initial UI showed misleading 70/100 vs Google's 57. Two bugs found + fixed: `URLSearchParams.set("category", ...)` overwrote (changed to `append`), and UI mixed PSI scores with Modonty aggregate (now strictly separated).
- All free APIs: PageSpeed Insights API key + GSC service account copied from `admin/.env.local` to `console/.env.local`
- Cheerio installed: `pnpm add cheerio` ← only new dep
- Sidebar entry "صحة موقعك" with `Activity` icon

### Live test results (kimazone.net via Playwright)
- Telegram: 21/22 events delivered messages successfully (leadHigh future-ready)
- Site Health: Mobile=Perf 55, A11y 63, BP 100, SEO 91 (matches Google ✓); Desktop=Perf 42, A11y 75, BP 100, SEO 91; Modonty=58/100 Grade C
- All forms (favorite/comment) successfully submitted via Tester TG visitor account

### Key files added/changed
**New files (modonty):**
- `app/api/clients/[slug]/favorite/route.ts`
- `app/api/clients/[slug]/comments/route.ts`
- `app/clients/[slug]/components/client-favorite-button.tsx`
- `app/clients/[slug]/components/client-comments-section.tsx`
- `lib/telegram/{client,events,notify,geo}.ts` (mirrored from console)

**New files (console):**
- `app/api/telegram/webhook/route.ts`
- `app/(dashboard)/dashboard/settings/components/telegram-card.tsx`
- `app/(dashboard)/dashboard/settings/actions/telegram-actions.ts`
- `app/(dashboard)/dashboard/client-comments/{page.tsx,actions/,components/,helpers/}` (full module)
- `app/(dashboard)/dashboard/site-health/{page.tsx,components/score-hero.tsx,category-section.tsx,pagespeed-card.tsx}`
- `lib/telegram/{client,events,notify,pairing,geo}.ts`
- `lib/health/{types,ssl,dns,headers,robots,sitemap,domain,meta,schema-check,pagespeed,aggregator}.ts`

**Modified (modonty):**
- 6 API routes wired with `notifyTelegram` (article view/share/like/dislike/favorite, comments POST + reply, comment like/dislike, client view/follow/share, subscribers, contact)
- `lib/conversion-tracking.ts` (auto-fires `conversion` Telegram event)
- `app/clients/[slug]/page.tsx` (added ClientCommentsSection)
- `app/clients/[slug]/components/hero/hero-cta.tsx` (added ClientFavoriteButton)
- `lib/telegram.ts` (existing admin file unchanged — coexists with new lib/telegram/ directory)

**Modified (console):**
- `lib/ar.ts` (added telegram + clientComments + siteHealth namespaces)
- `app/(dashboard)/components/{sidebar.tsx,mobile-sidebar.tsx,dashboard-layout-client.tsx,dashboard-header.tsx}` (sidebar entries)
- `app/(dashboard)/layout.tsx` (fetches pendingClientCommentsCount)
- `app/(dashboard)/dashboard/settings/{page.tsx,actions/,components/}` (Telegram card integrated; OBS-188 prior settings rebuild also reflected)
- `dataLayer/prisma/schema/schema.prisma` (5 telegram fields added to Client model)

### Known issues / decisions deferred
- ⚠️ `leadHigh` event in catalog but no `lib/lead-scoring/` exists in modonty — future-ready (UI checkbox visible, doesn't fire)
- ⚠️ ngrok URL is local-only — production deploy requires fresh `setWebhook` curl pointing to `https://console.modonty.com/api/telegram/webhook`
- ⚠️ Bot token (`8739374417:...`) was leaked in chat twice — user accepted risk and authorized continued use; should `/revoke` and rotate before production
- ⚠️ modonty/.env.local was switched to PROD `modonty` DB to enable testing (was on `modonty_dev`) — **CRITICAL: revert before final push if dev DB needed**
- ⚠️ console/.env.local has new env vars (`TELEGRAM_CLIENT_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`, `GOOGLE_PAGESPEED_API_KEY`, `GSC_MODONTY_*`) — must be added to Vercel env settings before production deploy
- 🟡 Cheerio added as new dep in console/package.json — unrelated tiptap peer-dep warnings (pre-existing, not caused by this session)

### Decisions taken (architecture)
- **Telegram architecture:** Option B (single shared @ModontyAlertsBot) chosen over Option A (per-client BotFather bots). Simpler UX.
- **Site Health architecture:** No DB persistence — every page visit triggers fresh parallel checks (~3-10s with Suspense streaming). User explicitly rejected DB-backed approach.
- **GSC architecture:** Service account (existing `gsc-modonty@modonty.iam.gserviceaccount.com`) instead of OAuth-per-user — simpler, but requires each client to add the service-account email as user on their GSC property for per-client access.

### Manual setup required before production
1. Vercel env vars (console + modonty): see list above under "Known issues"
2. Telegram `/revoke` to rotate the leaked token
3. `setWebhook` curl pointing to `https://console.modonty.com/api/telegram/webhook` with the new secret
4. Verify with `getWebhookInfo`

---

## ⏳ Session 71 — 2026-04-28 (Campaigns + Notifications + Subscribers + Leads + Console UI sweep)

### Summary
Three big pieces shipped end-to-end with live Playwright tests, all on PROD DB:

**1. Campaigns Sales Teaser (console + admin) — OBS-168 + OBS-169**
- Replaced empty `/dashboard/campaigns` analytics page with high-conversion sales teaser
- 6 sections: hero ("قريباً" badge — no time commitment) · quota strip (mirrors `articlesPerMonth`) · 3 reach tiers (own/industry/full DB) · 5-step workflow · 4 features · final CTA gradient
- New Prisma model `CampaignInterest` (one-row-per-client with idempotent reach updates + auto history line in `notes` field) + 2 enums (`CampaignReach`, `CampaignInterestStatus`)
- New admin page `/campaigns/leads`: KPIs (NEW/CONTACTED/CONVERTED/CANCELLED) · search · 5 filter pills · table · Sheet drawer with WhatsApp deep-link, status workflow (auto-stamps contactedAt/convertedAt/cancelledAt), notes/history pre-block
- Sidebar: new "Campaign Leads" item under Audience group with Megaphone icon

**2. Unified Notifications Bell (admin) — OBS-170**
- User reframed Notification table as the gateway for ANY admin notification type
- Built `lib/notifications/registry.ts` (type → icon/tone/label/href fn) + 3 server actions (list / markRead / markAllRead) + Popover-based `NotificationsBell` component
- 3 types registered: `contact_reply` (blue) · `campaign_interest` (violet) · `faq_reply` (emerald). Unknown types → grey Bell fallback
- Replaced legacy `<Link href="/contact-messages">` bell + removed `ContactMessagesBadge` import from header
- **Critical Prisma+MongoDB gotcha caught + fixed**: `where: { readAt: null }` doesn't match documents missing the field. All unread queries now use `OR: [{ readAt: null }, { readAt: { isSet: false } }]`. Writers also explicitly set `readAt: null` on create.

**3. Subscribers Page Hardening (console) — OBS-172**
- Senior audit found 14 issues (2 critical / 3 high / 5 medium / 4 low) — all fixed
- 🔴 **Security:** all 5 server actions now `auth()`-checked + `ensureOwnedSubscriber` cross-tenant guard. Removed `clientId` from action signatures (callers can't spoof).
- 🔴 **CSV escape:** RFC 4180 (quote/double-quote/newline) + UTF-8 BOM (Arabic in Excel)
- 🟠 Pagination (take: 200) + sonner toasts replacing alert/confirm + dead code purge
- 🟡 Responsive grid + KPI percentage hints + polished empty states (3 contextual variants) + proper `Prisma.JsonValue` typing + Latin date format
- 🟢 Bulk select + bulk actions + search bar + Sheet drawer + filter pill "بموافقة الخصوصية" + status/consent badges with icons + trash button separated from toggle

**4. Leads Page Rebuild (console) — OBS-173**
- Senior audit found ~24 issues including **4 CRITICAL data-integrity bugs** (page returned WRONG results to client). All fixed.
- 🔴 **Stale leads** — refresh now deletes leads outside the 30-day window (was: HOT lead from 2 months ago stayed HOT forever)
- 🔴 **Anonymous→User split** — `sessionToUser` map merges anonymous activity into the known user when the same session is later linked to a userId
- 🔴 **Email always null** — bulk-fetch User table to populate `email` field (phone stays null until per-user phone capture exists)
- 🔴 **Qualification clarity** — `isQualified` now an INDEPENDENT badge alongside HOT/WARM/COLD level. Filter "مؤهل فقط" added.
- 🟠 N+1 upsert → `Promise.all` batches of 10 · Sonner toast feedback · "آخر تحديث: منذ X" timestamp · dead code purge
- 🟡 Responsive grid · empty states (3 contextual variants) · Latin dates · title matches sidebar · subtitle mentions 30-day window
- 🟢 Search bar · score progress bar visualization · detail Sheet drawer with 4-component score breakdown + WhatsApp/Email CTAs · CSV export with RFC 4180 escaping · Flame/TrendingUp/Snowflake icons for HOT/WARM/COLD
- **Live math verification:** Ahmed Osman = (viewScore 20 + timeScore 1 + interactionScore 80 + conversionScore 0)×0.25 = 25 ✓ matches DB exactly

### Live Test Results (Playwright on PROD DB, kimazone client)
- ✅ Campaigns: 6 sections render · 5 CTAs · reach update with auto history line · idempotency (same reach = no-op) · WhatsApp deep-link with pre-filled Arabic
- ✅ Admin Leads: KPIs · table · drawer · status cycle (NEW→CONTACTED→CONVERTED auto-stamps timestamps)
- ✅ Notifications Bell: badge count · dropdown · click row marks read + navigates · "Mark all read" clears badge
- ✅ Subscribers: 5 seeded test subs (incl. edge cases `smith,jr@` + `O"Brien, John`) — search/filter/bulk/drawer/CSV escape all verified · test data cleaned up after

### Files changed
**Schema (1 file):**
- `dataLayer/prisma/schema/schema.prisma` — added `CampaignInterest` model + 2 enums + `Client.campaignInterest` relation. `pnpm prisma:generate` ran successfully.

**Console (12 files):**
- `app/(dashboard)/dashboard/campaigns/actions/register-interest.ts` — NEW
- `app/(dashboard)/dashboard/campaigns/components/campaigns-teaser.tsx` — NEW
- `app/(dashboard)/dashboard/campaigns/page.tsx` — slim wrapper
- `app/(dashboard)/dashboard/subscribers/actions/subscriber-actions.ts` — full rewrite
- `app/(dashboard)/dashboard/subscribers/helpers/subscriber-queries.ts` — pagination + types
- `app/(dashboard)/dashboard/subscribers/components/subscribers-table.tsx` — full rewrite
- `app/(dashboard)/dashboard/subscribers/page.tsx` — responsive KPI grid
- `app/(dashboard)/dashboard/leads/actions/refresh-lead-scores.ts` — refactor (returns RefreshResult)
- `app/(dashboard)/dashboard/leads/components/refresh-lead-scores-button.tsx` — sonner toast feedback
- `app/(dashboard)/dashboard/leads/components/leads-table.tsx` — full rewrite (search + drawer + score viz)
- `app/(dashboard)/dashboard/leads/helpers/lead-queries.ts` — `getLeadsLastRefreshedAt` + dead code removed
- `app/(dashboard)/dashboard/leads/page.tsx` — responsive grid + last-refreshed badge
- `lib/lead-scoring/compute.ts` — sessionToUser merge + email population + delete-stale + parallel upsert
- `lib/ar.ts` — extended `campaigns` (60+) + `subscribers` (50+) + `leads` (60+) namespaces

**Admin (8 files):**
- `lib/notifications/registry.ts` — NEW
- `lib/notifications/actions.ts` — NEW
- `components/admin/notifications-bell.tsx` — NEW
- `app/(dashboard)/campaigns/leads/page.tsx` — NEW
- `app/(dashboard)/campaigns/leads/actions/leads-actions.ts` — NEW
- `app/(dashboard)/campaigns/leads/components/leads-table.tsx` — NEW
- `components/admin/header.tsx` — replaced legacy bell, removed `ContactMessagesBadge` import
- `components/admin/sidebar.tsx` — added Megaphone import + "Campaign Leads" nav item

### Pending before push
1. ⏳ Bump `console/package.json` v0.3.0 → v0.4.0 (significant new features)
2. ⏳ Bump `admin/package.json` v0.43.2 → v0.44.0 (new Campaign Leads page + Notifications Bell)
3. ⏳ Add changelog entry via `admin/scripts/add-changelog.ts`
4. ⏳ Run `bash scripts/backup.sh` for safety
5. ⏳ Final TSC sweep on both apps (already green — re-verify before push)
6. ⏳ Optional: live test all 3 features once more after server restart
7. ⏳ User explicit confirmation before `git push` (per memory rule `feedback_push_confirmation`)

### Pending issues from earlier sessions (still open)
- ⚠️ `admin/.env.local` + `console/.env.local` still point to PROD (since OBS-125). End of console session = decide whether to revert to `modonty_dev` for next session.
- CONS-001..004 HIGH security items still pending (compliance check, RLS, admin notifications for client approvals, dev button hide). Subscribers security closed one chunk; the other 4 remain.
- CTA event labels in DB still come from modonty.com tracking code (Latin) — out of scope.

### Next agent: BEFORE next push
- Bump versions (admin + console)
- Add changelog
- Run backup script
- Get explicit user push confirmation
- After push, decide on PROD-vs-dev `.env.local` state for next session

---

## ⏳ Session 70 — READY TO PUSH 2026-04-27 (console v0.3.0 + admin v0.43.2)

### Summary
Massive console session focused on the client portal app. Two phases:
- **Phase 1 — Copy/Plain-language overhaul:** 28 COPY items + 2 visual jargon fixes + 7 bonus dashboard fixes. Replaced JSON-LD/Schema/UTM/GTM/Staging/LCP/CLS/INP/TTFB/TBT/Organic English/jargon with plain Arabic descriptive labels. Verified across 17 pages with regex sweep.
- **Phase 2 — Responsive overhaul:** Header redesign for mobile (no wordmark cropping), profile form 2-column on desktop (was 1-col wasting space), media filter wrap, top-articles chart rebuilt (recharts → Arabic-friendly progress list), URL inputs `dir="ltr"`, action buttons 40px + aria-labels, table filter wraps, HelpCollapsible touch target fix, and **layout overhaul to eliminate nested scrollbars** (removed `h-screen overflow-hidden` + main `flex-1 overflow-y-auto` → page now scrolls naturally with one scrollbar).

### Key user calls during the session
- "خلي الـ console يشتغل على الـ production" → switched `console/.env.local` to PROD DB to match admin (TEMPORARY for session)
- Discovered admin's `client-server-schema.ts` slug regex blocked Arabic slugs → fixed regex to accept `\u0600-\u06FF` (Arabic block) + `a-z0-9_-`
- "أعمل كل الإصلاحات" → executed full responsive overhaul in one pass

### Files changed
**console (12 files modified + 1 new):**
- `lib/ar.ts` (~700 lines rewrite)
- `app/(dashboard)/components/dashboard-header.tsx` (mobile redesign + parent path navTitle)
- `app/(dashboard)/components/dashboard-layout-client.tsx` (removed nested scrollbars)
- `app/(dashboard)/dashboard/page.tsx` (Arabic subLines)
- `app/(dashboard)/dashboard/components/{traffic-chart,top-articles-chart}.tsx` (Arabic source labels + chart rebuild)
- `app/(dashboard)/dashboard/analytics/page.tsx` (sourceLabel + ctaType mappers)
- `app/(dashboard)/dashboard/content/page.tsx` (Arabic status + dates)
- `app/(dashboard)/dashboard/profile/components/profile-form.tsx` (`lg:grid-cols-2` + `dir="ltr"`)
- `app/(dashboard)/dashboard/media/components/{media-gallery,branding-media-section}.tsx` (Arabic + flex-wrap filters)
- `app/(dashboard)/dashboard/comments/components/comments-table.tsx` (h-10 + aria-label)
- `app/(dashboard)/dashboard/{questions,leads,subscribers,support}/...` (flex-wrap filters + table responsive)
- `app/(dashboard)/dashboard/seo/{competitors,keywords}/page.tsx` + `seo/components/{intake-tab,intake-field}.tsx` (Arabic descriptions + collapsible touch target)
- `app/(dashboard)/dashboard/settings/page.tsx` (Arabic subscription badges)
- `app/(dashboard)/dashboard/articles/[articleId]/error.tsx` (humane Arabic)
- `app/icon.svg` (NEW — favicon fix)
- `package.json` 0.2.0 → 0.3.0

**admin (1 file modified):**
- `app/(dashboard)/clients/actions/clients-actions/client-server-schema.ts` — slug regex accepts Arabic
- `package.json` 0.43.1 → 0.43.2

### Verification
- ✅ TSC clean on console / admin / modonty
- ✅ 17/17 pages × 3 viewports (375 / 768 / 1366) = 0 overflow, 0 small buttons, 0 nested scroll
- ✅ Live test: kimazone client login + navigation through 17 pages on PROD DB
- ✅ Backup: `backup-2026-04-27_15-37` (62 collections, 2.5M)

### Pending issues
1. **`admin/.env.local` and `console/.env.local` both point to PROD** — need to revert to `modonty_dev` after push completes (TEMPORARY warnings present in both files).
2. CTA event labels stored in DB ("Feed card – عنوان المقال", "Tab – الكل", etc.) — come from modonty.com tracking code, not console. Future task: localize tracking labels in modonty public site.
3. CONS-VIS-003 mixed numerals (Latin + Arabic) — out of scope.
4. CONS-001/002/003/004 HIGH security items still pending (compliance check, RLS, admin notifications, dev button hide).

### Next agent: BEFORE next push
- Revert env.local files to dev DB once console session is complete.
- Address HIGH security items (CONS-001..004) — see `documents/tasks/CONSOLE-TODO.md`.

---

## ✅ Session 69 — PUSHED 2026-04-26 (modonty v1.42.0 + admin v0.43.1)

### Summary
Massive search-console session. Two pushes to main:
- `dd99016` — admin v0.43.0: Removal Queue + Stage 14 with 3-state manual GSC tracking
- `8a6b59c` — modonty v1.42.0 + admin v0.43.1: 410 for non-published slugs + Tech Health drill-down

### Key findings (verified from official Google docs, 6 sources)
- **Indexing API exists** (`urlNotifications:publish` for URL_UPDATED + URL_DELETED) but is restricted to JobPosting + BroadcastEvent. Submissions for modonty articles are silently rejected (publish returns 200 with empty metadata; getMetadata returns 404 — per Google docs, this means submission was NOT accepted).
- **No public API** for GSC Removals tool or Request-Indexing button. Both are manual web UI only. Confirmed from Search Console API v1 reference + Discovery doc.
- **Browser automation blocked**: Google blocks Playwright + Chrome with `--remote-debugging-port` from signing in (anti-bot). Browserbase MCP didn't help in time-vs-value calculation.
- **Conclusion**: manual GSC flow is the right path. 3-state UI (pending → opened → done) tracks the user's intent in our DB.

### Files changed (Session 69 — both commits)
**admin (v0.43.0 → v0.43.1):**
- `app/(dashboard)/search-console/page.tsx` — Removal Queue with track states + Tech Health drill-down stats
- `app/(dashboard)/search-console/components/seo-row-action.tsx` — unified 3-state component for delete + index
- `app/(dashboard)/search-console/components/tech-health-dialog.tsx` (new) — drill-down for Canonical/Robots/Mobile/Soft 404
- `app/(dashboard)/search-console/components/tech-health-stat.tsx` (new) — clickable stat trigger
- `app/(dashboard)/search-console/actions/removal-tracking-actions.ts` (new) — server actions for GscManualRequest CRUD
- `app/(dashboard)/search-console/pipeline/[articleId]/page.tsx` (new) + `pipeline-runner.tsx` (new) — 13-stage indexing pipeline + Stage 14 manual GSC button
- `app/(dashboard)/search-console/components/{auto-fix-schema-button,pending-indexing-card,robots-audit-dialog,robots-txt-dialog,schema-validation-dialog,stage-details-dialog,view-schema-validation-button}.tsx` (new helpers)
- `lib/seo/{article-validator,crux,pagespeed,pipeline-stages}.ts` (new) — pipeline backend
- `lib/gsc/indexing.ts` — added `URL_DELETED` (was wrongly `URL_REMOVED`) + getMetadata helpers
- `app/(dashboard)/search-console/actions/pipeline-actions.ts` (new) — pipeline runner
- `scripts/{check-live-urls,check-removal-status,debug-*,test-*,verify-removal-queue-state}.ts` — debug scripts (kept for future investigations)
- `package.json` 0.42.0 → 0.43.0 → 0.43.1
- `scripts/add-changelog.ts` — v0.43.0 + v1.42.0 entries

**modonty (v1.41.1 → v1.42.0):**
- `proxy.ts` — now returns 410 for ANY non-PUBLISHED slug (was: only ARCHIVED)
- `lib/archive-cache.ts` — flipped to "published-slugs" set (the inverse of the old "archived-slugs")
- `package.json` 1.41.1 → 1.42.0

**dataLayer:**
- `prisma/schema/schema.prisma` — renamed `GscRemovalRequest` → `GscManualRequest` with new `type` field (REMOVAL | INDEXING) + compound unique on (url, type). Kept `@@map("gsc_removal_requests")` to preserve existing collection.

**root:**
- `.mcp.json` — added `chrome-devtools` + `browserbase` MCPs (kept for non-Google sites)
- `.claude/settings.json` — added permissions for the new bash commands tested

### What's working in production
- ✅ admin Removal Queue + Stage 14 (3-state, opens GSC + clipboard, tracks done in DB)
- ✅ admin Tech Health drill-down (clickable Canonical/Robots/Mobile/Soft 404)
- ✅ modonty 410 for non-published slugs (Google de-indexes faster than noindex)

### What's pending / known issues
1. **Vercel env var `GSC_MODONTY_KEY_BASE64`** missing in production — `Failed to load sitemaps` toast on `/search-console`. User-side fix in Vercel Dashboard → Settings → Environment Variables.
2. **Canonical bug revealed by drill-down**: site declares `https://modonty.com/...` but Google chose `https://www.modonty.com/...`. Decide on www-vs-non-www and unify the canonical generator.
3. **Double-encoded canonical for clients**: `%25D8%25...` instead of `%D8%...`. Bug in client-page canonical generation.
4. **API keys exposed in chat logs** (BROWSERBASE_API_KEY + GEMINI_API_KEY) — user should rotate from respective dashboards. Removed from `.claude/settings.json` before commit, but env vars still set in Windows.

### Memory rule added (mandatory for next agent)
- `feedback_verify_before_claiming.md`: never claim how an external API behaves until tested live; never assume a file is deployed without checking `git status` / `git ls-files`; never extrapolate "all of X are Y" from a single sample. Confident-wrong answers destroy trust.

### Tooling state
- 6 MCPs project-level configured: `playwright`, `context7`, `gsc`, `code-review-graph`, `chrome-devtools`, `browserbase`.
- Chrome with `--remote-debugging-port=9222` running with isolated profile at `C:/Users/w2nad/chrome-mcp-profile` — only useful for non-Google sites.

---

## ✅ Session 66 — PUSHED 2026-04-24 (Changelog filter fix — admin v0.42.0)

### Summary
Two fixes to changelog page:
1. Filter now hides non-matching items WITHIN each card (not just the cards themselves)
2. Added "Hard Refresh" button (top-right) that calls `router.refresh()` with spin animation

### Files changed (Session 66)
**admin:**
- `app/(dashboard)/changelog/changelog-client.tsx` — filter prop on ChangelogCard + Hard Refresh button
- `scripts/changelog-sync.ts` — added v0.42.0 entry
- `package.json` — version bump 0.41.1 → 0.42.0

---

## ✅ Session 65 — PUSHED 2026-04-24 (Changelog system overhaul — admin v0.41.1)

### Summary
Complete overhaul of the changelog system — scripts, data, and UI.

**Root bug found & fixed:** pnpm auto-loads `.env` before scripts run, so `dotenv.config()` was silently ignored (DATABASE_URL already set to production). Fix: `{ override: true }` in all `dotenv.config()` calls. Scripts were writing to production instead of local all along.

**What changed:**
- `changelog-sync.ts` — unified SOT script derived from git log with real release dates
  - `--reset` flag: clears DB and re-inserts with correct dates
  - Default (no flag): writes to BOTH local + production simultaneously
  - `--local` / `--prod` for single-target
- Both DBs reset and re-seeded with 41 clean entries, correct dates from git log
- `changelog-client.tsx` — enhanced UI: stats bar, type filter, current version badge
- `actions.ts` — semantic version sort (not createdAt) so order is always correct
- `page.tsx` — added `force-dynamic`

**New script commands:**
```
pnpm changelog:sync              → sync missing to BOTH DBs (use every push)
pnpm changelog:sync:local/prod   → single target
pnpm changelog:reset             → clear + re-insert BOTH DBs
pnpm changelog:reset:local/prod  → single target reset
```

**Workflow from now on:** When pushing a new version, add its entry to the CHANGELOG array in `changelog-sync.ts`, then run `pnpm changelog:sync`.

### Files changed (Session 65)
**admin:**
- `scripts/changelog-sync.ts` (NEW — unified SOT script)
- `scripts/changelog-local.ts` (NEW — legacy single-target, kept for reference)
- `scripts/changelog-prod.ts` (NEW — legacy single-target, kept for reference)
- `app/(dashboard)/changelog/actions.ts` — semantic sort + noStore
- `app/(dashboard)/changelog/changelog-client.tsx` — stats bar + filter + current badge
- `app/(dashboard)/changelog/page.tsx` — force-dynamic
- `package.json` — new changelog:sync/reset scripts

### Notes for next agent
- **DB state**: Both `modonty_dev` and `modonty` have 41 clean entries, correct dates ✅
- **Next push workflow**: Add new entry to CHANGELOG array in `scripts/changelog-sync.ts`, then `pnpm changelog:sync`
- **pnpm env bug**: pnpm auto-loads `.env` before scripts — always use `{ override: true }` in `dotenv.config()` for scripts that need `.env.local`
- **Next task**: "Important real-world task outside admin" — user will specify at start of next session

---

## ✅ Session 64 — PUSHED 2026-04-24 (Global Error Logging — admin v0.41.0)

### Summary
Built a fully internal error logging system for the admin app — no external services (no Sentry/Datadog). Every server-side error (Server Components, Server Actions, Route Handlers, Middleware) is now automatically captured and stored in MongoDB, visible under **System → Error Logs**.

**Key pieces:**
- `instrumentation.ts` — Next.js `onRequestError` hook captures all server errors and POSTs to internal API
- `app/api/internal/log-error/route.ts` — protected internal endpoint (INTERNAL_LOG_SECRET header)
- `SystemError` model in Prisma schema (new `system_errors` collection)
- `app/(dashboard)/system-errors/` — new page with table, delete per-item, clear all
- All `error.tsx` files updated to use shared `PageError` component showing error message + digest with link to Error Logs
- Sidebar: "Error Logs" added under System

**Env var added to Vercel:**
- `INTERNAL_LOG_SECRET` — required for the instrumentation → API route auth

### Files changed (Session 64)
**admin:**
- `instrumentation.ts` (NEW)
- `app/api/internal/log-error/route.ts` (NEW)
- `app/(dashboard)/system-errors/page.tsx` (NEW)
- `app/(dashboard)/system-errors/loading.tsx` (NEW)
- `app/(dashboard)/system-errors/actions/system-errors-actions.ts` (NEW)
- `app/(dashboard)/system-errors/components/system-errors-table.tsx` (NEW)
- `components/admin/page-error.tsx` (NEW)
- `components/admin/sidebar.tsx` — added Error Logs link
- `components/admin/breadcrumb-utils.ts` — added 'system-errors' label
- `app/(dashboard)/articles/error.tsx` — uses PageError
- `app/(dashboard)/categories/error.tsx` — uses PageError
- `app/(dashboard)/clients/error.tsx` — uses PageError
- `app/(dashboard)/database/error.tsx` — uses PageError
- `app/(dashboard)/export-data/error.tsx` — uses PageError
- `app/(dashboard)/industries/error.tsx` — uses PageError
- `app/(dashboard)/tags/error.tsx` — uses PageError

**dataLayer:**
- `prisma/schema/schema.prisma` — added SystemError model

### Notes for next agent
- Error logging fully verified in production ✅
- Telegram OTP for slug change: was broken (missing TELEGRAM_BOT_TOKEN + TELEGRAM_ADMIN_CHAT_ID on Vercel) → now fixed
- Vercel env vars confirmed set: INTERNAL_LOG_SECRET, TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID

---

## ✅ Session 63 — PUSHED 2026-04-21 (PERF-008 + PERF-003 + bundle analyzer cleanup)

### Summary
- **PERF-008**: Deferred `ArticleSidebarEngagement` to `ssr: false`
- **PERF-003**: Bundle analyzer investigation — Won't Fix (framework limitation)
- **Bundle analyzer cleanup**: Removed `@next/bundle-analyzer` wrapper from `next.config.ts`

### Files changed (Session 63)
**modonty:**
- `app/articles/[slug]/components/client-lazy.tsx`
- `app/articles/[slug]/page.tsx`
- `app/articles/[slug]/components/article-interaction-buttons.tsx`
- `next.config.ts`
