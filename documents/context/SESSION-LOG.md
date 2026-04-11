# Session Context — Last Updated: 2026-04-11 (jbr SEO Integration — v1.24.0)

> This file is the handoff document for the next agent/session.
> Read this FIRST before starting any work.
> Update this file BEFORE every push.

---

## Current Versions
- **admin**: v0.29.0
- **modonty**: v1.24.0
- **console**: v0.1.2

---

## ✅ Session 18 — jbr SEO Integration — Sales Funnel (2026-04-11)

### What Was Done (modonty v1.24.0)

**6 CTAs across modonty pointing to jbrseo.com:**
- `DesktopUserAreaClient.tsx` + `TopNav.tsx` — Header: "عملاء بلا إعلانات ↗" ديسكتوب outline + موبايل solid
- `app/clients/page.tsx` — `/clients` CTA gradient panel في نهاية الصفحة
- `app/clients/components/clients-hero.tsx` — Hero إعادة تصميم بعمودين: B2C (قارئ) + B2B (صاحب عمل) بنصوص SEO قوية
- `components/layout/Footer.tsx` — "هل تريد عملاء من جوجل بلا إعلانات؟ جبر SEO ↗"
- `app/clients/[slug]/page.tsx` — "أعجبك ما رأيت؟" في نهاية كل صفحة عميل
- `app/articles/[slug]/components/article-footer.tsx` — "تريد محتوى مثل هذا يجذب عملاء؟" في footer كل مقال

**MASTER-TODO مُحدَّث:**
- JBRSEO-ADMIN-1: نصوص الهيرو تأتي من الأدمن (مستقبل)
- JBRSEO-7/8: about page + analytics (LOW)

---

## ✅ Session 17 — Profile Page Polish (2026-04-11)

### What Was Done (modonty v1.23.0)

**Files changed**
- `app/users/profile/layout.tsx` — removed hero gradient banner (`h-24 bg-gradient-to-r from-[#0e065a] to-[#3030ff]`)
- `app/users/profile/page.tsx` — removed `CardHeader` block, removed `-mt-16`/`-mt-12` banner offsets, replaced 5 heavy stat cards with a single inline row of number+label items separated by dividers

---

## ✅ Session 16 — Chatbot Phase 1 Complete (CHAT-1 → CHAT-5) (2026-04-11)

### What Was Done (modonty v1.22.0)

**1. New files**
- `lib/rag/prompts.ts` — centralized prompt builder (4 prompts: category DB/web, article DB/web). Strict rules: persona, no hallucination, cite source, Arabic فصحى, 3 paragraphs max
- `app/api/chatbot/suggest-category/route.ts` — Cohere embed cosine similarity → returns top category if score > 0.35

**2. Modified files**
- `app/api/chatbot/chat/route.ts` — added suggestedArticle (top-viewed in category after Serper), trusted sources check (hasTrustedContent), prompt from lib/rag/prompts
- `app/api/articles/[slug]/chat/route.ts` — same trusted sources + prompt from lib/rag/prompts
- `components/chatbot/ArticleChatbotContent.tsx` — full rewrite: auto-detect category (CHAT-2), "اسأل العميل" card after web answers (CHAT-1), suggested article card (CHAT-3), no-sources amber card (CHAT-4), input always visible

**3. Bugs found and fixed during live test (CHAT-5)**
- `ArticleChatbotContent.tsx:124` — empty-content suggestion message was sent to Cohere → 400 error. Fix: filter `m.content.trim().length > 0` before building history
- `lib/rag/scope.ts` — OUT_OF_SCOPE_THRESHOLD raised 0.42 → 0.52 (cooking passed as in-scope at 0.42)
- `lib/rag/prompts.ts` — `hasTrustedContent` added UNTRUSTED_DOMAINS blacklist (TikTok, YouTube, Instagram, etc.) — previously TikTok was accepted as "trusted"

**4. Live test results (CHAT-5 — 8 cases)**
- ✅ UI: input always visible, category chip, welcome message
- ✅ CHAT-2: auto-detect "التسويق الرقمي" from first message
- ✅ DB redirect: matched SEO article, redirect cards shown
- ✅ Web answer: source cited + suggested article card + "اسأل العميل" button
- ✅ Out-of-scope: cooking question rejected correctly
- ✅ Article chatbot: no category needed, answers from article content
- ✅ History tab: all sessions saved with timestamps

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
- Chatbot Phase 2 (CHAT-FAQ1-4) — Admin FAQ generation from chat history
- Email integration (Resend) — needs Resend subscription first
- Mobile Phase 2 (MOB1-7) — mockup ready in `design-preview/page.tsx`
- Admin auth actions — 13 remaining (contact-messages, faq, upload, etc.)
- Admin UX improvements (media picker search, inline picker, etc.)
- USR-N1 — faq_reply notification detail view in modonty

### CHATBOT-TODO
- ✅ Phase 1 (CHAT-1 to CHAT-5) ALL COMPLETE
- Phase 2 (CHAT-FAQ1-4) — Admin FAQ generation — not started

---

## Ports
- admin: 3000
- modonty: 3001
- console: 3002

## Test Credentials
- Admin: modonty@modonty.com / Modonty123!
- Console (Nova): see admin → Clients → Nova Electronics
