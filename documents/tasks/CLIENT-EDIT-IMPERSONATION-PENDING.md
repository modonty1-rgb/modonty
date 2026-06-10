# Pending — Client Edit Redesign + Admin→Console Impersonation

**Last Updated:** 2026-06-10
**Context:** Pre-push work-list. Everything below is uncommitted on `main`. Source = adversarial code review (3 agents + independent verification) + deferred decisions from the session. Work through A → E, then push.

**State that's already DONE + verified (do NOT redo):** edit-form 5-zone workspace · fixed-footer save bar · logo+hero on preview (click-to-change + pencil) · removed 16 amber hints · impersonation happy-path (live e2e: handoff → console as client → banner → exit) · token security 6/6 (forge/expiry/tamper rejected) · tsc 0 on all 3 apps · save round-trip · create-mode unaffected.

---

## A. MUST FIX before push (confirmed real)

- [x] **A1 — 🔴 Impersonation: enforce ADMIN role on mint** ✅ DONE 2026-06-10
  - Fix applied in `open-client-console.ts`: session carries id/email but not role, so it fetches `db.user.findUnique({ id }).role` and rejects anything other than `ADMIN` (fail-closed on missing user / lookup error). tsc 0. Live-verified: ADMIN user → button still mints + opens (happy path intact); non-ADMIN is rejected by the fail-closed check.

- [ ] **A2 — 🟠 Impersonation: single-use ticket + keep token OUT of the URL** (security · HIGH)
  - Where: `admin/lib/console-access.ts` (URL) · `console/lib/admin-access.ts` (verify) · `console/app/admin-access/page.tsx` (public GET)
  - Problem: token rides in a GET query param + no single-use → leaks via history/Referer/proxy-CDN-Vercel logs; replay within 60s mints a fresh **30-day** session.
  - Fix (proper): admin stores the signed ticket server-side keyed by a random `handoffId` (small DB model, TTL); URL carries only `?h=<handoffId>`; console exchanges it once and **deletes it (single-use)**. Kills both replay + URL-leak. (Needs a Prisma model → kill node → prisma generate → restart.)

- [x] **A3 — 🟠 Save: clearing a field silently doesn't persist** ✅ DONE 2026-06-10
  - Fix applied: `update-client.ts` now always invokes every grouped writer (removed the `hasGroupData` gate + its import); each writer already no-ops on an empty diff, so a CLEAR (old value → null) now persists. tsc 0. Live-verified: cleared `seoTitle` (whole seo group empty) → persisted empty after reload (before the fix it stayed). Test client restored clean.

---

## B. SHOULD FIX (real, smaller)

- [ ] **B1 — `organizationType` double-listed** in `required` + `seo` config groups → potential double-write race (`client-form-config.ts:64` + `:146`). Verify, then keep it only in `seo` (which normalizes it); drop from `required`. *(Review flagged HIGH; independent verifier did NOT confirm as exploitable — re-check before changing.)*
- [ ] **B2 — SEO bundle reads `findFirst` not the Settings singleton** → SEO drift if a duplicate settings row exists. Where: `dataLayer/lib/seo/generate-client-seo-bundle.ts:155`. Fix: `findUnique({ where: singletonKey })` (or `orderBy id asc`).
- [ ] **B3 — Impersonation: permanent DB audit trail** (currently `console.log` only). Persist `{ adminId, adminEmail, clientId, at }` on mint + on successful impersonated login.
- [ ] **B4 — SEO Title cap mismatch**: input `maxLength=51` but the CharacterCounter guidance says 50–60. Fix the counter copy to reflect the real 51 ceiling (`- مودونتي` is appended). Where: `client-edit-workspace.tsx` SEO zone.
- [ ] **B5 — `baselineRef` staleness** on the stay-mounted success path (SEO-warning save keeps the form mounted → false "Unsaved changes"). Re-sync `baselineRef` + `setIsDirty(false)` on a successful in-place save. (Mostly moot today — saves navigate to `/clients`.)

---

## C. Nits / hygiene

- [ ] **C1 — Dead code** in `form-sections/basic-info-section.tsx:53-61`: unused `watch()` calls (legalName/foundingDate/numberOfEmployees/commercialRegistrationNumber/alternateName) + the `void(...)` suppressor. Remove.
- [ ] **C2 — Type augmentation**: add `impersonated?: boolean` to `console/types/next-auth.d.ts` (Session + JWT), then drop the inline `as { impersonated }` casts.
- [ ] **C3 — Impersonation authorize over-fetch**: `console/auth.config.ts` admin-impersonation provider fetches the full client row; use `select` (id/email/name/slug).
- [ ] **C4 — `subscription` config group is dead** (no writer, not rendered). Add a clear comment that it's intentionally never dispatched (Accounts/invoice-owned), or remove.

---

## D. Deferred product decisions (need Khalid's call)

- [ ] **D1 — Verification treatment** in the edit form (zone ③). Deferred earlier ("لما نوصل له"). Decide its final UX.
- [ ] **D2 — Dual-write ownership**: `url · phone · contactType · sameAs · addressCountry · legalForm · industryId · organizationType` are written by BOTH admin AND the console profile. Decide the single owner per field (or accept last-write-wins).
- [ ] **D3 — Post-save UX**: edit-save currently navigates to `/clients`. Decide: keep, or stay on the page + clear dirty (more typical for a dirty-bar pattern).

---

## E. Pre-push mechanics (when A–C are green)

- [ ] **E1 — Re-run the full check**: tsc all 3 apps + live sweep + re-run the adversarial review.
- [ ] **E2 — Version bump** (admin + console `package.json`) + DB changelog entry.
- [ ] **E3 — Backup** (`bash scripts/backup.sh` — note: mongodump may be missing; code-only push acceptable).
- [ ] **E4 — Push** (only on Khalid's explicit "push").
- [ ] **E5 — PROD env**: add `ADMIN_CONSOLE_ACCESS_SECRET` to Vercel on BOTH admin + console projects (same value) before impersonation works in prod. `CONSOLE_BASE_URL` defaults to `https://console.modonty.com` (no action needed).

---

## ✅ Done
*(move items here as they're completed)*
