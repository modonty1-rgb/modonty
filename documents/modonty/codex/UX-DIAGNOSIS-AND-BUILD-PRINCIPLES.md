# Modonty UX Diagnosis & Build Principles

**Status:** Superseded as the controlling reference by `Document/MODONTY-PRODUCT-UX-MASTER-REPORT.md`.

> This file is retained as the preliminary diagnosis for traceability. Use the master report for the final business model, information architecture, route blueprints, terminology, API-first architecture, measurement plan, research gates, and owner decisions D01–D12.

**Audience:** Arabic-first users in Saudi Arabia and Egypt, across desktop, mobile web, and future native apps.

## What we know

The reported product problem is clear: a new Arabic user can enter Modonty and wander without reaching useful information quickly. That makes the first session weak, gives little reason to subscribe, and reduces return visits.

This is a product-flow problem before it is a visual-design problem.

## Current-state observations

The current home route is structurally a dense content portal:

- The primary experience combines articles, categories, industries, tags, partners, a desktop three-column layout, a mobile bottom bar, search, a menu, and help-related paths.
- The content feed mixes platform/editorial content and partner content without making their different purposes immediately obvious.
- The existing home shell is composed from global `components/feed`, `components/layout`, and `components/navigatore` areas, which makes a route-focused redesign harder to reason about.
- On mobile, navigation has several competing permanent or near-permanent destinations; a first-time user needs orientation before breadth.
- A subscription prompt currently has to compete with discovery controls, rather than being earned after a user sees a concrete benefit.

These are implementation observations, not quantified usability-test findings. We must validate them with real Saudi and Egyptian participants before treating them as measured facts.

## Root-cause hypotheses

| Hypothesis | Why it can cause low retention | Design response to validate |
| --- | --- | --- |
| The product purpose is not obvious in the first few seconds. | A visitor cannot decide whether to read, find a specialist, follow a topic, or subscribe. | Make one clear value proposition and one primary next step per entry context. |
| Too many top-level choices compete at once. | More scanning and less confident action, especially on a small screen. | Use a small, stable set of top-level destinations; disclose secondary routes contextually. |
| Editorial Modonty and partner clients look conceptually similar. | Users cannot predict what value each profile gives them. | Treat Modonty as a visibly distinct core editorial client; give business clients a service-and-expertise profile. |
| Subscription arrives before a meaningful value moment. | “Subscribe” feels like a request, not a benefit. | Show the benefit first: personalized interests, saved items, followed sources, and useful updates. |
| Search, Modo, categories, tags, and industries overlap as discovery tools. | Users do not know which tool is appropriate for their question. | Give each mechanism a single job and a clear label; Modo guides, search retrieves, filters narrow. |

## Product principles for the refactor

### 1. Orient before asking users to explore

Every important route must answer three questions immediately:

1. What is this page or space?
2. What can I get from it?
3. What is the best next action?

The first home-screen action should be one of: continue a useful feed, pick interests, search for a known need, or ask Modo. It must not be several equal calls to action.

### 2. Stable navigation, limited destinations

Use the same meaning, label, icon, and relative order for repeated navigation. On mobile, keep the persistent primary navigation to **three to five equal-priority destinations**. On desktop, the same information architecture may use a sidebar or top navigation, but it must preserve destination names and active state.

Provisional top-level model for validation:

- Home — personalized/continuing feed
- Explore — search, topics, and partners
- Reels — short visual learning/discovery
- Saved — retained value for a subscriber
- Profile — account and preferences

This is a testable working model, not a final decision. Actions such as “subscribe”, “create”, “filter”, or “ask Modo” are **not** primary navigation destinations.

### 3. Give each discovery mechanism one job

| Mechanism | Single job |
| --- | --- |
| Search | Retrieve a known article, subject, client, or answer. |
| Modo | Help an uncertain user express a need and choose a useful path. |
| Interests | Set and refine what the feed prioritizes. |
| Categories / industries / tags | Narrow a browse context after the user has chosen to explore. |
| Trending | Offer a curated “what matters now” entry point. |

Modo must never hide or replace standard search. It is a guided assistant, not a second ambiguous search box.

### 4. Create a value loop before subscription

The subscriber proposition must be specific and visible:

`interest chosen → useful content found → save/follow/continue → subscribe for continuity and updates → return to a relevant feed`

The design must tell the user what subscription unlocks. A generic “Subscribe” button is insufficient.

### 5. Differentiate the two content identities

| Identity | Purpose | Expected user outcome |
| --- | --- | --- |
| **Modonty core client** | Editorial, useful, educational, and potentially viral content across interests. | Learn, discover, save, return. |
| **Partner / business client** | Expertise, business activity, services, and business-specific content. | Build trust, understand the offer, contact/book/follow. |

The UI must not describe Modonty as an individual personal profile. It is the platform’s editorial source.

### 6. Arabic RTL is product behavior, not a cosmetic flip

- Set the page base direction with semantic HTML `dir="rtl"`.
- Use Tailwind logical utilities and CSS logical properties (`start/end`, `ms/me`, `ps/pe`) instead of hard-coded left/right positioning.
- Apply `dir="auto"` to user-generated, mixed Arabic/English text such as names, search text, URLs, and chat messages.
- Preserve readable Arabic hierarchy: short headings, clear labels, comfortable line height, and no icon-only critical actions.
- Test mixed-direction details: numbers, dates, URLs, product names, and English medical/technical terms.

### 7. Build mobile web as the product blueprint for native apps

Mobile web is not a reduced desktop page. It defines the future Android/iOS information architecture, interaction states, API contracts, empty states, and content models. The visual layer may later become native, but the behavior and data vocabulary must remain shared.

## Non-negotiable implementation constraints

- API-first for all behavior needed by Web and future Android/iOS clients.
- Route-specific UI and orchestration stay inside the route; cross-route UI and utility contracts belong in `dataLayer`.
- A route uses server-rendered data for its initial view; small client islands only own interaction.
- No fabricated statistics, audio duration, verification, partner status, or content state.
- Every state is designed: loading, empty, error, unauthenticated, authenticated, and unavailable.
- Every decision remains transferable to the main project under the production-transfer golden rule.

## Evidence to apply

- [W3C: consistent navigation](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html) requires repeated navigation to stay in the same relative order, supporting predictable discovery.
- [W3C: navigating and finding](https://www.w3.org/WAI/people-use-web/tools-techniques/navigation/) recommends clear labels, visual orientation cues, and more than one way to find content, including search.
- [W3C: consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification) requires functions with the same purpose to be identified consistently.
- [W3C: Arabic and bidi markup](https://www.w3.org/International/tutorials/bidi-xhtml/) recommends `dir` for base direction and `dir="auto"` for form fields and inserted text where direction is unknown.
- [MDN: logical CSS properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values) documents direction-relative layout properties needed for robust Arabic RTL behavior.
- [Material Design: navigation hierarchy](https://m2.material.io/design/navigation/understanding-navigation.html) describes bottom navigation as a mobile pattern for three to five top-level destinations.
- [Apple HIG: tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) distinguishes persistent top-level navigation from contextual actions and recommends preserving users’ orientation.

## Validation before and during build

We will test prototypes with Saudi and Egyptian Arabic speakers before locking the information architecture.

### Core task test

Ask a new visitor to complete these tasks without guidance:

1. Find a reliable article about a topic they care about.
2. Find a specialist or partner related to a concrete need.
3. Explain what Modonty is versus what a partner page is.
4. Save something they want to return to.
5. Explain why they would—or would not—subscribe.

### Success signals

- The user can state the product purpose and next step without prompting.
- The user reaches the requested information using a confident, direct path.
- The user distinguishes Modonty editorial content from partner content.
- The subscriber value proposition is understood before the subscription prompt is accepted.
- The same top-level destination names and meanings work on desktop, mobile web, and the future native app.

## Decision gate

Do not begin visual implementation of Home until this document’s principles are accepted. Then implement **Home (`/`)** as the first reusable pattern and test it before applying the system to Client and Article routes.
