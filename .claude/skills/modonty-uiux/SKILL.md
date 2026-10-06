---
name: modonty-uiux
description: |
  THE UI/UX standard for the Modonty monorepo (modonty.com · console · admin). Act as a senior
  UI/UX designer. Use it ANY time work touches an interface: building or editing a page or
  component, reviewing a screen, "improve the UI", spacing/layout/hierarchy fixes, empty states —
  and ALWAYS for the partner business profile (`/clients/[slug]`), which is core to the business
  model and must be 100% perfect on desktop and mobile. Arabic triggers: «صمّم» · «حسّن الواجهة» ·
  «راجع التصميم» · «اعمل صفحة» · «صفحة الشريك» · «البيزنس بروفايل» · «بيرفكت» · «UX». Gives the
  two-track model, the measurable audit protocol (viewports, numbers, a ready measuring script)
  and the partner-profile checklist. Judgement backed by measurement, never by impression.
---

# Modonty UI/UX — Senior Standard

**Values** (colours, weights, radii, shadows, spacing, grid, icon sizes) live in
`documents/design/DESIGN-SYSTEM.md` — the single source of truth. This file is the **process
and the bar**. Read the design system before the first line of UI code.

## 0. Mindset — five rules
1. **Decide, then build.** A page that works but has no focal point, rhythm or hierarchy is a fail.
2. **Measure, don't eyeball.** Every claim about spacing, size or overflow carries a number from
   the live page (§5). Unmeasured = «مؤشّر», never «خلص».
3. **Real data, full data.** Judge a partner page on a fully-filled partner — a sparse one hides
   half the sections (most partners show 6–9 sections; team · stats · reviews · video · trust
   were absent on all 8 partners measured, 4 Oct 2026).
4. **Both screens, every time:** 1280 (desktop reference) and 390 (phone), plus 360 for overflow.
5. **No HTML mockups unless Khalid asks** («show mockup» / «اعمل موكب»). Design is shown as a
   short text spec, or built directly and shown live (Khalid, 16 Aug 2026).

## 1. Two tracks — pick from the surface, never mix
| | **Track A — admin / console** | **Track B — modonty public (visitor, partner sites)** |
|---|---|---|
| Goal | Clarity · fast scanning · low load | Trust · distinctiveness · conversion |
| Type | Restrained; size + weight hierarchy | Same fonts (Tajawal), distinctiveness from weight/size/colour/space |
| Colour | Limited, meaning-bound (red = danger, amber = warning) | Partner colour as the accent on modonty's neutral system |
| Motion | Feedback only | Subtle, `motion-safe:` only — never required to understand the page |
| Copy | Partner-facing, plain | **Formal Arabic (فصحى)** on partner sites (Khalid, 4 Oct 2026) |

## 2. Track A — dashboard checklist
1. One dominant element at the top — the number/status the page exists for.
2. Hierarchy by size + weight; no grid of equal cards with no focus.
3. Progressive disclosure: summary first, details in a Sheet/dialog.
4. Occasional actions = a button that opens a Sheet, not a permanent form.
5. Designed empty states — never dev-speak («قيد البناء»).
6. shadcn/ui first · RTL logical properties (`ps/pe/ms/me/start/end`) · aria-label on icon buttons.
7. Tell the user the truth about saving: when it is live, say so; when it isn't, say why.

## 3. Track B — partner business profile: the 100% bar
The partner page is part of what partners pay for. Every page of it (home · about · services ·
photos · reviews · articles · faq · contact · book) must pass ALL of this at 1280 and 390:

**Layout & rhythm**
- Container `max-w-[1128px]` with 24px side padding; section rhythm 48px phone / 64px desktop,
  from `Section` only — a section never invents its own padding.
- Zero horizontal scroll at 360 · 390 · 430 · 768 · 1280 (`scrollWidth − innerWidth ≤ 0`).
- Columns follow the content count (1 · 2 · 3) — never a 3-column grid holding one card.
- Two muted bands never touch (Section handles it via `data-tone`).
- A grid's odd last item never sits alone on a phone row.

**Type**
- One `h1` per page and it names the partner. Headings in order (h1 → h2 → h3).
- Body ≥ 16px; nothing interactive or informative < 14px on a phone (12px only for fine meta).
- Line length ≤ ~65ch for paragraphs (`max-w-prose`/`max-w-2xl`). Arabic body leading 1.7–1.9.
- No orphan word on its own line in a heading on 360–430 (balance or rewrite).

**Touch & focus**
- Every interactive target ≥ 44×44 on phone (design system: 48 wrapper). Measure, don't assume.
- Visible focus ring on every link/button; nothing reachable only by hover.

**Images & media**
- Logos never cropped (`object-contain`); covers at their own ratio; no grey bars.
- Each image file ≤ ~2× its rendered width (`sizes` correct); hero/LCP image eager + high priority.
- Video box takes the file's ratio (portrait capped in width).
- Every image has alt text or is explicitly decorative.

**Honesty & behaviour**
- No dead control: a button without a destination is not drawn; preview links are inert.
- Promises match reality (no «نفس اليوم», no «في دقيقة»); badges only when true.
- Empty data → the section disappears; never an empty heading or placeholder box.
- Copy: formal Arabic, correct number agreement, «» quotes, Arabic-Indic digits consistent.
- `prefers-reduced-motion` respected (`motion-safe:`).

**Console parity**
- The console preview renders the same shared components with the same rules (colour, titles,
  hidden sections, «قيد التجهيز»). A difference between preview and site is a bug.

## 4. Before building (structure changes only)
1. 20-word brief: who the visitor is + the one question the page answers.
2. Name the dominant element, then secondary/tertiary.
3. Short text spec to Khalid (no HTML mockup unless asked), then build.
Trivial changes (text, colour, a spacing value) skip this.

## 5. The audit protocol — how a review is done
1. **Servers:** modonty (3000) + console (3002) only. One browser tab; close what a run leaves.
2. **Data:** a fully-filled test partner on `modonty_dev`, name starting «تجريبي —» so nobody
   mistakes it for a client (`fake-test-data-must-be-labelled`).
3. **Measure:** `scripts/audit-page.js` (this folder). `require` does not work inside
   `browser_run_code`, so: first call sets `page.context().__audit = { urls: [...], widths: [1280, 390, 360] }`
   (globalThis does not survive between calls),
   second call passes the script by `filename`. It reuses an open localhost tab and returns only
   findings: overflow, small text, small targets, h1 count, heading skips, missing alt, oversized
   images, orphan heading words, empty sections, page height — as numbers.
4. **Look:** a full-page screenshot per page per width, read at full size — spacing and balance
   are judged by eye only AFTER the numbers pass.
5. **Report:** one table — page · width · finding · measured value · file:line · fix. Severity:
   broken > dishonest > inconsistent > polish.
6. **Fix, re-measure, re-screenshot.** «Done» only with the after-numbers.
Never: a long single run with dialogs (beforeunload/confirm hang the harness), a new tab per
test, starting admin or extra servers.

## 6. Sources
- WCAG 2.2: 1.4.3 contrast 4.5:1 (3:1 large) · 1.4.11 non-text 3:1 · 2.5.8 target ≥ 24px (AA),
  2.5.5 ≥ 44px (AAA, our bar) · 2.4.7 focus visible · 1.3.1 heading structure.
- Apple HIG (44pt targets) · Material 3 (48dp targets).
- Google Search Central — structured data must match visible content (FAQ JSON-LD).
- `documents/design/DESIGN-SYSTEM.md` (values) · `.claude/skills/partner-site-templates` (template
  model) · `web-design-guidelines` · `react-best-practices` (installed Vercel skills).
