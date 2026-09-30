---
name: subscriber-journey-qa
description: Live, visible test of everything a Modonty subscriber (public-site user) does — sign-up/login, profile edit, likes/dislikes/favorites/comments/shares/views on articles, reels (videos) and client pages, follows, reviews, notifications — across many test subscribers, in Khalid's own Chrome through Playwright MCP, one step at a time. After every click it reads the number on the page and compares it with the database (stored counter vs actual rows), and logs every finding (interaction bugs AND any UI/UX note) to an HTML findings board. Use when Khalid asks to test the subscriber journey, interactions, likes/counters, «رحلة المشترك», «فحص التفاعلات», «تأكد إن الإعجابات شغالة», or invokes /subscriber-journey-qa. modonty_dev only.
---

# Subscriber journey QA — رحلة المشترك، حيّة

Khalid (29 Sep 2026): «أبغى أتأكد إن كل حاجة شغّالة مية في المية… يكون لايف على البلاي رايت أشوف معاك».
Everything runs **visibly** in his Chrome (Playwright MCP, extension mode). Nothing important runs where he cannot see it.

Scripts: `.claude/skills/subscriber-journey-qa/scripts/` — run them from the **MODONTY repo root**. `_db.mjs` refuses any database but `modonty_dev`.

## 0. Before the first screen

1. Dev server for the public site on `http://localhost:3000` (reuse if up; never a second one; never production).
2. `node <scripts>/seed-subscribers.mjs --count 20` → `qa-sub-01@test.local … qa-sub-20` · password `Qa-Sub-2026!` · names start «[تجربة]».
3. `node <scripts>/invariants.mjs` → the **baseline**. Every ✗ already present is logged as a finding *before* testing (so a later ✗ is known to be new or old).
4. `node <scripts>/note.mjs` (no args) builds `documents/qa/subscriber-journey/findings.html`. Open it in its own tab (served over http — the extension blocks `file:`) and keep it; it refreshes every 15 s.
5. Pick targets with real data: 2–3 published articles from **different clients**, 1–2 reels, 2 client pages. Write their slugs down.

## 1. The loop — one step at a time

For each step:
1. **Label it on screen**: inject a fixed red banner with `browser_evaluate` («الخطوة ٣/٢٠ · مشترك ٠٤ · إعجاب — بانتظار ملاحظاتك»).
2. **Do it like a user**: `browser_click` / `browser_type` on the real control (find it with `browser_snapshot`; never call the server directly).
3. **Read the page**: `browser_evaluate` the number/state now shown (like count, button pressed state, toast, URL).
4. **Read the truth**: `node <scripts>/truth.mjs article <slug> --user qa-sub-04@test.local` (or `reel` / `client` / `user`).
5. **Compare**: page number = stored counter = rows. Any ✗ → `note.mjs add` immediately with the raw lines as `--evidence`.
6. **Report in 2–3 Arabic lines with the raw evidence, then STOP** until Khalid writes «تم» (or gives a note — log it).

Any UI/UX thing noticed on the way (clipped text, confusing label, slow response, no feedback after a click, layout jump, wrong empty state) is logged too: `--area UI` or `--area UX`.

## 2. The journey (per subscriber — the first ones in full, the rest on the multi-user steps)

| # | Area | Steps |
|---|---|---|
| A | الحساب | sign-up of one **new** user through the page · login · wrong password message · logout · protected action while logged out (must ask to log in) |
| B | البروفايل | edit name / bio / picture · change password (login with the new one) · the new name shows on their old comments · profile tabs (liked, disliked, favorites, following, activity) match what they did |
| C | المقالة | like → count +1 · like again → −1 · dislike → like switch (never both) · favorite / unfavorite · comment (pending vs approved) · reply · like a comment · share each platform button (a `Share` row per click) · view counted |
| D | الريلز | like · favorite · comment · reply · like a comment · view · counts on the reel equal the rows |
| E | صفحة العميل | follow / unfollow · like / dislike · one review only (a second must be refused or edit the first) · comment · share · view |
| F | الإشعارات | which action creates which notification, for whom; unread count; mark as read |
| G | عدّة مشتركين | the same article/reel liked by subscribers 01…N one after another → page count = N = rows = stored counter; then half of them unlike → exact |
| H | ضغط مزدوج | two fast clicks on like/favorite (`browser_click` with `doubleClick`) → the counter must move once. Known risk to measure: `like-article.ts` and `reel-interactions.ts` ignore a unique-violation on create but still `increment` the counter |

Order: A → B → C → D → E → F → G → H. Mobile width is out of scope unless Khalid asks (desktop phase).

## 2b. Driving notes (learned on the first run, 29 Sep 2026)

- **Banner at the bottom, `pointer-events:none`** — at the top it covers the header user menu and every click times out.
- **Wait for hydration before typing**: `waitForLoadState('networkidle')` + ~1.5 s, or the login form submits empty and the session stays null.
- **Confirm a login by polling `/api/auth/session`**, not by the URL — the redirect after a good login takes up to ~10 s on dev.
- **Switch subscriber** with `fetch('/api/auth/csrf')` → `POST /api/auth/signout` inside the page, then the login page.
- Batch 4–5 subscribers per `browser_run_code_unsafe` call; after each, `truth.mjs` in Bash.
- Read counts from the button itself (`button[aria-label="أعجبني"]` holds `<span>N</span>`); two buttons in one bar concatenate their text in the parent.
- Share buttons: patch `navigator.share` / `fetch` in the page first to see what a share really calls.
- In Git Bash prefix `note.mjs add` with `MSYS_NO_PATHCONV=1`, or `--page /users/login` is stored as `C:/Program Files/Git/users/login`.
- The extension blocks `file:` — serve `documents/qa/subscriber-journey/` over http (`python -m http.server 5056`).

## 3. Rules

- **Never** production. **Never** `browser_resize` / `setViewportSize` (it blurs Khalid's screen; memory `playwright-no-resize-extension`). One browser = one login at a time: subscribers take turns (login → act → logout).
- Measure, don't eyeball: every verdict carries a number from the page and a line from `truth.mjs`.
- Findings go to the board the moment they appear, with evidence. Fixing is a separate, agreed step — don't silently fix mid-test. A fix is verified by re-running the same step, then `note.mjs fix <id> --how "…"`.
- At the end: `invariants.mjs` again (compare with the baseline), then `cleanup.mjs` (dry run) → `cleanup.mjs --apply` only with Khalid's OK. Cleanup recounts the counters of everything the test users touched.
