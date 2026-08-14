# Modonty UI/UX Refactor — To Do

> **Golden rule:** Every approved change in this mockup must be cleanly transferable to the main Modonty project without rebuilding the work.
>
> **Working model:** API-first. The same data contracts must support Web, Android, and iOS.
>
> **Master reference:** `Document/MODONTY-PRODUCT-UX-MASTER-REPORT.md`. No visual implementation starts before its D01–D12 decision gate is approved or amended by the project owner.

## Status legend

- [ ] Not started
- [~] In progress
- [x] Complete

## Phase 0 — Foundation

- [x] Create an exact local copy of the current Modonty project.
- [x] Run the local web application and verify RTL rendering.
- [x] Map the Prisma schema to the required UI read models.
- [x] Define route-local folders: `components`, `helpers`, and `actions`.
- [x] Define `dataLayer` as the home for shared components and reusable utilities.
- [x] Diagnose the discovery, retention, subscription, navigation, RTL, and cross-platform UX principles.
- [x] Complete the page-by-page live audit, business-model review, schema/API capability map, official-source research, and master product/UX report.
- [ ] Approve or amend decisions D01–D12 in `MODONTY-PRODUCT-UX-MASTER-REPORT.md`.
- [ ] Capture the analytics baseline and validate the proposed IA with Saudi and Egyptian users.
- [ ] Establish API contracts for every cross-platform read or mutation flow.
- [ ] Create the shared Modonty UI primitives and tokens with Tailwind + shadcn.
- [ ] Define the responsive RTL interaction rules for desktop and mobile web.
- [ ] Define and apply the component quality gate: SOLID, KISS, Server-first rendering, performance budgets, explicit side effects, and zero dead code.

## Phase 1 — Home (`/`)

- [ ] Refactor the LinkedIn-style shell: navigation, feed column, and contextual side panels.
- [ ] Make **Modonty** a distinguished core client, not a personal-profile substitute.
- [ ] Replace the body search entry point with **Modo**, the Modonty assistant.
- [ ] Design the interest selector and content discovery behavior.
- [ ] Build mixed feed cards: article, audio article, reel/video, and educational content.
- [ ] Design desktop and mobile layouts from the same responsive component system.
- [ ] Validate empty, loading, error, unauthenticated, and authenticated states.

## Phase 2 — Client / Partner (`/clients/[slug]`)

- [ ] Define the client profile hierarchy: identity, trust signals, service focus, and CTA.
- [ ] Create the core-client variation for Modonty editorial content.
- [ ] Create the business-client variation for partner services and activity.
- [ ] Define a capability-driven CTA contract: booking, shopping, contact, and website visit appear only when the client has the real capability.
- [ ] Apply the YMYL trust gate before booking or shopping conversion actions.
- [ ] Build content tabs or sections: articles, reels, about, reviews, contact, and booking when available.
- [ ] Support mobile-first navigation while preserving the desktop information hierarchy.
- [ ] Validate missing data and inactive/limited client states.

## Phase 3 — Article (`/articles/[slug]`)

- [ ] Build the reading experience: title, author/client, media, metadata, and body.
- [ ] Build the listening experience only when a real `audioUrl` exists.
- [ ] Add save, share, like, and comment states through reusable API contracts.
- [ ] Add related content and a relevant client CTA without interrupting reading.
- [ ] Support Arabic RTL typography, accessibility, and responsive media behavior.
- [ ] Validate article states: no audio, no media, unpublished, and not found.

## Phase 4 — Discovery

- [ ] Reels (`/reels`): vertical short-video feed and reel detail behavior.
- [ ] Search (`/search`): unified results for articles, clients, categories, and tags.
- [ ] Trending (`/trending`): ranking and content discovery.
- [ ] Clients (`/clients`): partner discovery and filters.
- [ ] Intent discovery: “احجز الآن”، “تسوّق”، “تواصل مع خبير”، and “زيارة موقع” listings with real-capability filtering and safe empty states.
- [ ] Categories, industries, and tags: browse and filtering patterns.

## Phase 5 — Account and Retention

- [ ] Authentication: login, register, verify email, reset password.
- [ ] Profile: saved, liked, followed, comments, bookings, and settings.
- [ ] Notifications: list, unread state, and mark-as-read behavior.
- [ ] Subscription and newsletter flows.

## Phase 6 — Supporting and Trust Pages

- [ ] About, story, contact, and help.
- [ ] Trust and legal pages.
- [ ] Accessibility, metadata, empty/error states, and performance pass.

## Phase 7 — Transfer Readiness

- [ ] Verify all shared behavior is exposed through stable API contracts.
- [ ] Verify no mockup-only data, routes, or hard-coded business logic remain.
- [ ] Verify no dead code, unused dependencies, speculative abstractions, hidden side effects, query waterfalls, or avoidable client-JavaScript remain.
- [ ] Desktop and mobile web QA for every completed route.
- [ ] Prepare a clean handoff checklist for applying the work to the main project.

## Current focus

- [ ] **Decision gate:** approve or amend D01–D12 in the master report.
- [ ] Then start Phase 0 contracts and prototype validation; do not begin the Home visual refactor before the gate passes.
