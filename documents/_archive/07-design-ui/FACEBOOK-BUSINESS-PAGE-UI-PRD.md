## Product Requirements Document (PRD)
### Feature: Facebook‑Style Client Page UI (Elmazny Marketing Agency as Reference)
### Owner: Product / Design / Frontend
### Status: Draft

---

## 1. Objective

Design and implement a **client detail UI** that visually and structurally simulates a modern **Facebook Business Page** (using Elmazny Marketing Agency as reference), while:

- Staying within Modonty’s design system (colors, typography, spacing).
- Reusing the existing client detail route (`/clients/[slug]`) and data model.
- Focusing on **hero**, **tabs**, and **first fold content** to feel familiar to users coming from Facebook.

This PRD is **UI‑only**; SEO/meta behavior is covered in `FACEBOOK-BUSINESS-PAGE-SIMULATION-PRD.md`.

---

## 2. Scope & Non‑Scope

### In Scope

- Layout and styling of:
  - Hero section (cover + avatar + basic info + CTAs + stats).
  - Primary navigation tabs (Overview / Posts / About analogue).
  - Above‑the‑fold structure on desktop and mobile.
- Use of existing Modonty components:
  - `client-hero.tsx`, `client-tabs-wrapper.tsx`, `client-about.tsx`, `client-contact.tsx`, `client-stats.ts`, article list components.
- Responsive behavior (mobile / tablet / desktop).

### Out of Scope

- New backend models or API changes.
- New tabs/routes beyond what currently exists (no Reviews/Photos tabs in this phase).
- Copywriting for final Arabic text (use placeholders where needed).
- Any change to global theme tokens or Tailwind config.

---

## 3. Reference UI (Elmazny Facebook Page)

From the Elmazny Facebook screenshot, the key visual cues we want to simulate:

- **Large cover image** spanning the top, with brand card elements (phone, site, Instagram handle).
- **Circular profile avatar** overlapping the cover’s bottom area.
- **Brand name + category** (e.g., “Marketing Agency”) aligned horizontally next to avatar.
- **Primary actions** (`Like`, `Search`) near the name area.
- **Stats / social proof** (e.g., followers) directly associated with the brand.
- **Horizontal tab bar** under hero: `All`, `About`, `Photos`, `Followers`, `Mentions`…

We do **not** replicate Facebook’s exact visual style, but we preserve **layout hierarchy**:

1. Cover.
2. Avatar + title row.
3. Actions + stats.
4. Tabs.
5. Content.

---

## 4. Target Layout in Modonty

### 4.1 Overall Structure

Route: `/clients/[slug]`

High‑level layout (desktop):

1. **Cover Area**
   - Full‑width cover image (`ogImageMedia` fallback to gradient).
   - Fixed height with responsive variations.
2. **Profile Row**
   - Left: circular avatar (from `logoMedia`).
   - Center: client name, category (e.g., “Marketing Agency”), short tagline.
   - Right: CTAs (`Visit Website`, `Follow`, `Share`) and key stats.
3. **Tabs Row**
   - Sticky or anchored tab bar: `نظرة عامة` (Overview), `المقالات` (Posts analogue), `معلومات` (About).
4. **Tab Content**
   - Overview = summary + key cards.
   - Articles = list/grid of posts.
   - About = detailed info + contact.

Mobile:

- Same order but stacked:
  - Cover.
  - Avatar centered or left‑aligned.
  - Name + category + short info.
  - Primary CTA (Visit Website) as a large button.
  - Secondary actions (Follow/Share) in a compact row.
  - Tabs in a horizontal scrollable bar.
  - Content stacked.

---

## 5. Detailed UI Requirements

### 5.1 Hero / Cover

**Data Inputs**

- Cover image URL: `client.ogImageMedia.url` (fallback to gradient background).
- Avatar URL: `client.logoMedia.url`.
- Name: `client.name`.
- Category: `client.industry.name` or static label “Marketing Agency” when configured.
- Short tagline: derived from `seoDescription` or `businessBrief` (first sentence).

**Layout (Desktop)**

- Container max width ~1128px (aligned with existing design).
- Cover:
  - Height: `h-56` mobile, `h-64` tablet, `h-80` desktop (approx).
  - Image covers area with `object-cover`.
  - Optional dark overlay for text readability on top edge if we place text.
- Avatar:
  - Positioned using negative margin to overlap cover bottom.
  - Size: `w-32 h-32` desktop, `w-24 h-24` mobile.
  - Border ring using theme colors to stand out from cover.
- Name & Meta:
  - `client.name` in bold, large type (e.g., `text-2xl md:text-3xl`).
  - Category + follower count below in muted foreground.
- CTAs:
  - Primary: `Visit Website` (icon + label).
  - Secondary: `Follow`, `Share` (ghost/outline variants).
  - On desktop: aligned right; on mobile: stacked under name.

**States**

- **No cover image**: show gradient background using theme tokens; avatar still overlaps.
- **No logo**: show initials in circular placeholder.
- **No website URL**: hide Visit Website CTA; keep Follow/Share.

### 5.2 Stats Bar (Social Proof)

**Inputs**

- Followers count: from `client-stats.ts` (ClientLike).
- Total views: from `client-stats.ts` (ClientView).
- Articles count: number of `Article` records for client.

**UI**

- Row of compact stat items under name:
  - `147K متابع` style count if possible.
  - `X مقالة` and `Y مشاهدة`.
- Use icons (e.g., users, file-text, eye) with subtle color.

**Behavior**

- On small devices, stats may wrap into two lines but keep near hero.

### 5.3 Tabs / Navigation

**Tabs**

- `نظرة عامة` (Overview)
- `المقالات` (Posts analogue)
- `معلومات` (About)

**Requirements**

- Tabs look like Facebook’s section bar:
  - Horizontal list, equal widths on desktop, scrollable on mobile.
  - Active tab: bold + underline or pill background.
- Optionally sticky under hero on scroll for better navigation.

**Content Mapping**

- **Overview**:
  - Brief about card (1–3 key bullet points).
  - Highlighted contact card (phone, email, website).
  - Featured articles/posts (top 3).
  - Related clients carousel (optional, if already implemented).
- **Articles**:
  - List or grid of articles:
    - Thumbnail, title, publication date, short excerpt.
    - Sorting controls (newest/oldest/alphabetical) if already available.
- **About**:
  - Structured info:
    - Description.
    - Services / content priorities (bulleted).
    - Contact info.
    - Address/location.
    - Legal info (registration number, VAT ID, etc.) where present.

### 5.4 Social & Contact Strip

Under (or inside) Overview / About:

- Contact icons:
  - Phone (tap to call on mobile).
  - Email (mailto).
  - Website link (opens in new tab).
- Social icons row:
  - Facebook, Instagram, X, LinkedIn (from `sameAs` URLs).
  - Icons styled with neutral colors; hover states with primary tint.

---

## 6. Visual & Interaction Guidelines

- **Theme Alignment**
  - Use existing Tailwind theme tokens: `bg-background`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary`, etc.
  - No hard‑coded hex colors.
- **Typography**
  - Titles: same scale as other top‑level pages (e.g., `text-2xl/3xl`).
  - Body: reuse base text styles; no custom fonts.
- **Spacing**
  - Consistent vertical rhythm (`space-y-4/6/8`).
  - Enough padding around avatar and stats to avoid clutter.
- **Interactions**
  - Hover states on CTAs and cards (subtle scale or background change).
  - Buttons must have clear focus states for accessibility.
- **Accessibility**
  - Proper alt text for logo and cover.
  - Sufficient color contrast for text on cover overlay.
  - Landmarks: hero section, nav tabs, main content.

---

## 7. Responsive Requirements

### Mobile (< 768px)

- Cover: full width, reduced height.
- Avatar centered or left‑aligned; name under avatar.
- Primary CTA (`Visit Website`) as full‑width button below name.
- Tabs: horizontal scroll; keep active tab centered if possible.
- Content: single column.

### Tablet (768–1024px)

- Similar to desktop but with smaller avatar and more compact CTAs.
- Tabs full width, may wrap to 2 rows only if necessary.

### Desktop (≥ 1024px)

- Avatar + name on left, CTAs + stats on right in one row.
- Tabs under hero spanning full container width.

---

## 8. Technical Notes (Implementation Constraints)

- Implement as enhancements to existing client route components:
  - Prefer updating `client-hero.tsx`, `client-tabs-wrapper.tsx`, and content sections.
- Maintain current props/API where possible:
  - If new props are strictly needed (e.g., explicit category label), add them in a backward‑compatible way.
- No new global styles; all styling via Tailwind utility classes in the route components.

---

## 9. Acceptance Criteria (UI)

1. **Hero & Layout**
   - [ ] Desktop hero shows cover, overlapping circular avatar, name, category, short tagline, CTAs, and stats in a single cohesive area.
   - [ ] Mobile hero stacks these elements in a usable way without overflow or clipping.
   - [ ] With Elmazny data configured, the hero visually resembles the provided Facebook screenshot (within Modonty’s style).

2. **Tabs & Content**
   - [ ] Tabs are clearly visible, accessible, and usable on mobile and desktop.
   - [ ] Overview tab presents a concise, Facebook‑like home section (summary + key info).
   - [ ] Articles tab surfaces the client’s posts in a Facebook‑like feed/list.
   - [ ] About tab organizes profile details clearly (similar to Facebook’s About).

3. **Social & Contact**
   - [ ] Contact methods (phone, email, website) are visible and tappable.
   - [ ] Social icons appear when `sameAs` entries exist, including the Facebook Page URL.

4. **Polish**
   - [ ] No layout breaks at common widths (mobile, tablet, desktop).
   - [ ] No new console errors, and lighthouse/CLS not significantly worse than current page.
   - [ ] All core interactions keyboard‑navigable.

---
