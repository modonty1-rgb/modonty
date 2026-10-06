# Console Mobile — Session Record

Updated: 2026-08-27

## Non-negotiable boundaries

- Work for this project is scoped to `console-mobile` and its dedicated mobile API only.
- Do not modify `admin`, `modonty` public site, shared branding components, or existing console UI/routes without a new explicit request.
- The client mobile app never receives or submits a `clientId`. The server derives it from the authenticated mobile token.
- Existing web console flows must stay operational. Mobile uses its own HTTP API; web continues to use Server Actions.
- User-facing documentation is HTML. This MD file is internal session memory for implementation continuity.

## Approved mobile product scope

Bottom navigation, RTL order:

1. Home
2. Articles
3. Videos
4. Audience
5. Notifications

Account is the header avatar. Hamburger is secondary. Use Modonty branding icons only in active mobile UI. Safe areas, compact typography, RTL, visible 48dp overlay close control, and approved visual reference are mandatory.

## Article approval workflow (real system behavior)

`WRITING → DRAFT → AWAITING_APPROVAL → [SCHEDULED | NEEDS_REVISION] → PUBLISHED`

- Admin moves a technically-ready article from `DRAFT` to `AWAITING_APPROVAL`.
- The client sees: **"مقال يحتاج موافقتك"** — not a generic review label.
- Client approval sets `SCHEDULED`, stamps `lastReviewed` and `ogArticleModifiedTime`; it does **not** publish.
- Client change request requires a non-empty note, sets `NEEDS_REVISION`, and persists it in `revisionNotes`.
- Admin sees the note in its revision queue, edits, returns the article to `DRAFT`, and sends it again for client approval.
- Both client decisions notify the assigned editor/content team. The current delivery is Telegram; decision persistence must never depend on Telegram succeeding.

## Mobile API introduced

New, isolated namespace in the existing console server:

`console/app/api/mobile/v1`

Implemented endpoints:

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login` | Email/password login; returns mobile bearer token |
| POST | `/auth/refresh` | Issues a fresh mobile bearer token |
| POST | `/auth/logout` | Stateless logout acknowledgement; app deletes local token |
| GET | `/me` | Authenticated client profile and preferences |
| GET | `/dashboard` | Mobile summary counts and latest articles |
| GET | `/articles` | Client-owned article list; optional status filter |
| GET | `/articles/:articleId` | Client-owned article detail/preview payload |
| POST | `/articles/:articleId/approve` | `AWAITING_APPROVAL → SCHEDULED` |
| POST | `/articles/:articleId/request-changes` | Requires feedback; `AWAITING_APPROVAL → NEEDS_REVISION` |
| GET | `/notifications` | Existing client-scoped inbox records |
| GET | `/videos` | Client-owned reel/video list |
| GET | `/audience` | Client-owned visitor questions and article comments |

### Mobile authentication

- Authorization header: `Bearer <token>`.
- Token is encrypted with the console's server secret using the installed NextAuth JWT encoder, with a **different salt** from browser sessions.
- It is a mobile-only token (`tokenUse: mobile-api`), not a web cookie and not an admin token.
- TTL: 30 days. Refresh only succeeds with a valid mobile bearer token.
- Do not put secrets, database credentials, or provider keys in the mobile app.

### Shared decision logic

- `console/lib/mobile-api/article-decisions.ts` owns the state transition and ownership check.
- Existing console Server Actions now call this service as well, preserving their existing routes, revalidation, user messages, and Telegram event behavior.
- Do not duplicate article approval state transitions in new routes.

## Verification completed

- `pnpm --filter @modonty/console exec tsc --noEmit` passed after the API addition.
- `pnpm --filter @modonty/console build` completed through Prisma generation and Next production build output.
- No Prisma schema change, migration, existing API route modification, admin change, or public-site change was made.

### 2026-08-27 database note — required follow-up

- This statement above is superseded for the Push implementation: `prisma db push` was run against `modonty_dev` to create `mobile_devices` and its two indexes.
- Prisma also detected pre-existing schema/index drift and changed unrelated development indexes: removed three legacy TTL indexes (`expires_ttl` / `expiresAt_ttl`) and added five indexes already declared in the Prisma schema. No documents were deleted.
- This was broader than the intended collection-only change. Do **not** run `prisma db push` again for a narrow index change. The repository already contains an admin script whose comment explicitly says it bypasses `db push` to avoid this exact TTL-index risk.
- Before the next DB/index operation, inspect current indexes and use a targeted Mongo/index migration script. Restoration of the legacy TTL indexes must be deliberate; their exact collection/expiry settings were not available in the Prisma schema.

## Explicitly not yet implemented

1. **Remaining Expo Push events**: public booking and WhatsApp-contact delivery are wired. Add the same minimal-payload policy for audience questions/comments, video review outcomes, support replies, booking lifecycle changes, and contact-form leads as their real event sources are connected.
2. **Video upload mutation endpoints**: the existing browser flow creates Bunny TUS tickets, finalizes metadata, polls encoding, and manages covers/deletion. Expose these only through the same ownership/service layer—not by making Bunny credentials available to the app.
3. **Audience mutation endpoints**: replying/rejecting/restoring questions and moderating comments must be added with the existing ownership rules when those screens are connected to real data.
4. **Mobile app integration**: UI remains on schema-shaped dummy fixtures until the approved UI is complete; swap its repository layer to these endpoints afterward.

## Push-notification architecture

- Expo Push is the chosen provider. The server sends an HTTPS payload to Expo; Expo then hands it to FCM/APNs.
- `MobileDevice` is a dedicated device-token record. A single client may register several devices.
- The API upserts a device token only for the authenticated client. It never accepts a client ID from the app.
- On `DeviceNotRegistered`, delivery is disabled for that token. Expo recommends checking delayed receipts and retrying temporary 429/5xx errors with backoff; receipt polling is a follow-up worker task.
- A Push receipt means the provider accepted the delivery request; it does not prove the person saw the notification.

## Next resume order

1. Finish/approve mobile UI screens using realistic fixture data.
2. Add the remaining write APIs by extracting existing console business rules into services.
3. Add delayed Expo receipt handling and the remaining event sources.
4. Replace dummy repositories in `console-mobile` with the documented mobile API endpoints.

## Development end-to-end test client

- Selected client: **كيما زون** (`كيما-زون`), not Dream to App. Read-only verification on 2026-08-27 found an existing password, 4 published articles, 12 booking leads (10 WhatsApp + 2 form), 20 pending article FAQs, and 5 comments (4 pending + 1 approved).
- It is the correct full-flow fixture. Dream to App has valid login but only one article and no lead/audience data, so it is a fallback login-only fixture.
- Full checklist: `documentation/html/KIMAZONE-END-TO-END-TEST-FLOW.html`.
- Important gap: the mobile namespace currently lacks a bookings/leads endpoint, so the app cannot yet show the existing WhatsApp/form leads. Add a client-scoped `GET /bookings` and lead-status mutation before claiming the live Leads screen is complete. Video upload and audience mutations also remain pending.
- 2026-08-27 live API smoke test passed for KiMa Zone: login, `/me`, `/dashboard`, `/articles`, `/videos`, `/audience`, and `/notifications` each returned HTTP 200 from the local Console server. The Expo app login route now calls the real mobile login endpoint and shows an Arabic failure state; its remaining screens are still fixture-backed until their repositories are swapped one by one. Credentials were not written to this file or source code.
- 2026-08-27: `/me` now exposes the existing client `logoMedia` projection. After a real login, Console Mobile uses KiMa Zone's actual logo in the header avatar and Account profile, and uses the real name/email/plan in Account. Mobile TypeScript passed. The dashboard/articles/audience/video list content remains the next fixture-to-live migration work.
- 2026-08-27: at the user's explicit request, the local Expo development login screen pre-fills the KiMa Zone test account. It is gated by `__DEV__` and must be removed after the local test cycle; it is not enabled in production builds.
- 2026-08-27: Home is now dashboard-backed after a real login. It receives the live dashboard summary and recent articles, replacing the fixture action card/counts with actual article-approval, question, comment, and video counts. TypeScript passed. The next migrations are the article, audience, and video list/detail repositories.

## Automatic session rule

- Every critical decision, state-changing command, verified result, limitation, or unexpected side effect is recorded in this file automatically during the session.
- 2026-08-27: user explicitly approved Expo Push delivery. Public booking and WhatsApp leads now dispatch only the Expo token, generic Arabic title/body, event type, and article ID where present—never phone, email, visitor name, message text, IP, or booking ID. CTA inventory: `documentation/html/ARTICLE-CLIENT-CTA-INVENTORY.html`.
- 2026-08-27: `pnpm --filter @modonty/modonty exec tsc --noEmit` passed after this public-lead Push wiring.
