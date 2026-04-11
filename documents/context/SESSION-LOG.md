# Session Context — Last Updated: 2026-04-11 (User Account Polish + FAQ Reply Notification Fix)

> This file is the handoff document for the next agent/session.
> Read this FIRST before starting any work.
> Update this file BEFORE every push.

---

## Current Versions
- **admin**: v0.29.0
- **modonty**: v1.22.0
- **console**: v0.1.2

---

## ✅ Session 15 — User Account Polish + FAQ Reply Notification Fix (2026-04-11)

### What Was Done

**1. console v0.1.2 — Bug fix**
- `question-actions.ts`: `replyToQuestion` now creates `faq_reply` notification for the user after client replies
  - Looks up user via `submittedByEmail` → creates `db.notification` with type `faq_reply`
  - Wrapped in try/catch so notification failure never blocks the reply
  - Full live flow tested end-to-end: user asks → client replies → bell shows 1 → notification visible

**2. modonty v1.22.0 — User account + semantic HTML**
- Settings tabs simplified from 7 → 4 (profile · security · appearance · account)
- Removed duplicate "disliked" tab from profile grid (6 → 5 columns)
- Nested `<main>` fixed in `articles/[slug]/page.tsx` → changed to `<div>`
- sr-only `<h1>` added to 6 profile sub-pages (favorites, liked, comments, following, disliked, settings)
- `aria-labelledby` added to authors/[slug] + news sections
- `aria-label` added to MobileFooter nav
- `aria-label` added to LeftSidebar + RightSidebar
- `aria-hidden="true"` on SidebarSkeletons
- `BellRevalidateTrigger` added to notifications page (bell count syncs on every visit)

**3. Tooling**
- `UserPromptSubmit` hook added to `.claude/settings.local.json` — enforces automatic TODO file updates on every task completion
- `feedback_todo_file_rules.md` memory updated with migration rules

**4. Known UX Gap (USR-N1 — MASTER-TODO MEDIUM)**
- `faq_reply` notification type not handled in notifications detail panel — shows empty right side
- `notifications/page.tsx` needs a case for `faq_reply` to fetch ArticleFAQ data and show question + answer

---

## ✅ Session 14 — modonty Public Site Polish + Brand Compliance (2026-04-11)

### What Was Done

**1. Security fixes (modonty)**
- `/api/subscribers` — replaced `email.includes("@")` with Zod `z.string().email().max(254)`
- `/api/articles/[slug]/view` — deduplication: one view per (articleId, sessionId) per day
- Removed all `console.log` from production APIs: `comments/like`, `comments/dislike`, `users/liked`, `users/disliked`
- Removed security-sensitive `console.log` from admin auth (tokens were being logged): `forgot-password-actions.ts`, `reset-password-actions.ts`, `send-reset-email.ts`

**2. Console app — best practices (console)**
- Added `loading.tsx` + `error.tsx` for new `[articleId]` stats route
- Added `skeleton.tsx` component to console UI

**3. modonty public site (modonty v1.21.0)**

| Fix | File | Change |
|-----|------|--------|
| G1 — JWTSessionError | `.env.local` | New `AUTH_SECRET` + corrected `NEXTAUTH_URL` to `localhost:3001` |
| G3 — Newsletter no feedback | `newsletter-cta.tsx` | Added error state + "جاري الاشتراك..." |
| HP2 — No platform intro | `FeedContainer.tsx` | Strip "مرحباً بك في مودونتي" above feed |
| HP3 — Empty "جديد مودونتي" | `ModontyCard.tsx` | `if (articles.length === 0) return null` |
| HP4 — Cards no image | `PostCardHeroImage.tsx` | `bg-muted` + `IconArticle` placeholder |
| G2 — Footer links only | `Footer.tsx` | Added quick links: الرئيسية / الرائجة / العملاء / عن مودونتي |
| A6 — Reading progress | verified | Already active — no change needed |
| Loading pages | 11 new files | about, contact, legal, login, authors/[slug], notifications, profile sub-pages |
| BR1-4 — Brand Compliance | 24 files | 66 violations → all replaced with `text-primary` / `bg-primary/10` / `text-accent` / `text-destructive` |

---

## ⚠️ Pending Manual Actions (Vercel)

1. **AUTH_SECRET** — Update in Vercel Dashboard → Project → Settings → Environment Variables
   Value: `rGtnuhR8EeViMTAbFAF9bhL3sH38iRdxsovdyXRnoJI=`
   After updating: Redeploy. All logged-in users will be signed out (expected).
2. **NEXTAUTH_URL** — Confirm Vercel has `https://modonty.com` (not localhost)

---

## 📋 What's Left

### MASTER-TODO
- Email integration (Resend) — needs Resend subscription first
- Mobile Phase 2 (MOB1-7) — mockup ready in `design-preview/page.tsx`
- Admin auth actions — 13 remaining (contact-messages, faq, upload, etc.)
- Admin UX improvements (media picker search, inline picker, etc.)

### MODONTY-PUBLIC-TODO
- ✅ ALL TASKS COMPLETE

---

## Ports
- admin: 3000
- modonty: 3001
- console: 3002

## Test Credentials
- Admin: modonty@modonty.com / Modonty123!
- Console (Nova): see admin → Clients → Nova Electronics
