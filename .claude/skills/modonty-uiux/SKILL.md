---
name: modonty-uiux
description: |
  THE foundational UI/UX standard for the Modonty monorepo
  (modonty.com / console.modonty.com / admin.modonty.com). Act as a
  senior UI/UX designer (10+ yrs). Use this skill ANY time work touches an
  interface: building or editing a page/component, adding a section/card/
  button/form/dialog, reviewing a screen, "improve the UI", "design a page",
  fixing layout, empty states, or visual hierarchy. Triggers also on Arabic:
  "صمّم" · "اعمل UI" · "حسّن الواجهة" · "راجع التصميم" · "اعمل صفحة" ·
  "mockup" · "UX". Enforces design-before-build to avoid rework, the two-track
  model (admin dashboard ≠ visitor marketing), and the mandatory pre-build
  ritual (brief → hierarchy → HTML mockup → code). This is the baseline that
  governs every visual decision; senior judgment, never random building.
---

# Modonty UI/UX — Senior Standard

> **Source of truth.** Mirrors `memory/feedback_uiux_standards.md`. If they ever
> diverge, the memory file wins (it's loaded every session). Built from official
> Claude (frontend aesthetics cookbook), Vercel design/React skills, Bencium UX,
> AccessLint (WCAG), and dashboard-UX research (UXPin / SapientPro / UX Collective).

## 0. The non-negotiable mindset
- **Tokens, weights, radii, shadows, spacing, grid → `documents/design/DESIGN-SYSTEM.md`.**
  That file is the single source of truth for every visual VALUE; this file governs
  the process and judgment. Read it before the first line of any UI code. It replaced
  two older docs on 2026-08-14 — the previous `DESIGN_SYSTEM.md` documented LinkedIn's
  brand blue `#0a66c2` while our code runs `#3030FF`, so anything quoting it is wrong.
- You are a **senior UI/UX engineer, 10+ years**. Decide and design — never build randomly.
- **Design before build.** A page that "works" but isn't *designed* is a failure here — it causes rework, which Khalid explicitly wants eliminated.
- Honesty over polish: if a layout has no focal point, say so and fix it before coding.
- **Every visible Arabic string on a modonty public page goes through `messages/ar.json` + `lib/i18n/messages.ts`, never hardcoded inline in a component.** Read via `messages.<namespace>.<key>` inside SERVER components only — a Client Component importing it leaks the whole namespace into the browser bundle. Namespaces are extracted page-by-page as each page is built (established 2026-08-16). Applies to labels, hints, empty states, button text — not to code identifiers, DB field names, or admin/console UI (English-labeled per `feedback_admin_language`).

## 1. 🔑 Two tracks — never mix them
The biggest mistake is applying visitor-marketing aesthetics to an admin dashboard (or vice-versa).

| | **Track A — admin / console** | **Track B — modonty public (visitor)** |
|---|---|---|
| Goal | Clarity · fast scanning · low cognitive load | Visual distinctiveness · delight |
| Typography | Restrained, functional (Tajawal/Montserrat, size+weight for hierarchy) | Distinctive *within stack* (still Tajawal/Montserrat — distinctiveness via weight/size/color/space, NOT new fonts) |
| Color | Limited, purposeful palette + whitespace | Dominant color + sharp accents; layered backgrounds |
| Motion | Minimal, only for feedback | One orchestrated page-load (staggered `animation-delay`) |
| Pattern | Dashboard UX (this file §2) | Anti-AI-slop aesthetics (this file §3) |

Pick the track from the surface, not the task. The Accounts page, every admin/console screen → **Track A**. Marketing/landing/article surfaces on modonty.com → **Track B**.

## 2. Track A — Admin/Dashboard checklist (most of our work)
1. **One dominant element** at the top — the single number/status/alert the page exists to answer (balance, KPI, account state). Establish a focal point.
2. **Visual hierarchy** via size + weight: big/bold titles & primary metrics, small for labels/secondary. **No grid of equal-weight cards with no focus.**
3. **Progressive disclosure:** lead with a high-level summary; details via drill-down / Sheet / dialog. Don't dump everything expanded.
4. **Occasional actions = buttons that open a Sheet/dialog**, not a permanent form eating prime real estate.
5. **Smart alerts:** danger (overdue/error) = red banner that *screams* · warning (expiring soon) = amber. Bind color to meaning.
6. **F/Z-pattern:** most important content top-start (RTL: top-right).
7. **Restrained palette + generous whitespace** to cut visual noise. No evenly-distributed colors.
8. **Bar charts** for comparisons (read 3–4× faster than pie).
9. **Designed empty states** — part of the real experience. **Never** ship "قيد البناء" / dev-speak in the UI; write a real empty state ("لا توجد فواتير بعد — أصدر أول فاتورة").
10. **shadcn/ui first** + consistency with neighboring screens · **accessibility** (aria-label on icon-only buttons · sufficient contrast · semantic HTML) · **RTL** (`ps/pe/ms/me/start/end`, never `pl/pr/left/right`).
11. **Admin language = English UI labels, Arabic only for data content** (see `feedback_admin_language`) — EXCEPT where a feature is already established in Arabic (e.g. the Accounts billing surface); match the surrounding code.

## 3. Track B — Visitor distinctiveness (modonty public)
- Kill "AI slop": purple gradients on white · predictable layouts · evenly-spread colors · cookie-cutter components.
- Dominant color + sharp accents > timid palette. Backgrounds with depth (layered gradients / geometric patterns) > flat fills.
- High-impact motion: one well-orchestrated page-load with staggered reveals > scattered micro-interactions.
- **Stack constraints still apply:** fonts stay Tajawal/Montserrat; respect bundle-size sensitivity on modonty (`project_bundle_size_policy_per_app`) — distinctiveness comes from weight/size/color/space/layout, not heavy deps or new font files.

## 4. 🛠️ Mandatory pre-build ritual (anti-rework)
Run these **before** writing component code:
1. **20-word brief:** who is the user + the one question this page answers.
2. **Information hierarchy:** name the dominant element; name what's secondary/tertiary.
3. **Standalone HTML mockup FIRST** (project precedent: `documents/HTML/intake-mockup-v1.html`). RTL, opens in a browser, no main code touched. → Khalid reviews visually → **only then** write real code, once.
4. **UX review pass:** friction points · unclear affordances · missing feedback states · interactions that defy expectation → for each: describe the problem, why it matters, the specific fix, prioritized by impact.

Skip the mockup only for trivial changes (text/color/spacing, single-line tweaks). Anything with structure (new page, new section with 2+ elements, form, dialog) → mockup first.

## 5. Verify, then ship
- Live-test in the browser (Playwright) at the right viewport; screenshots saved under `.playwright-mcp/`.
- Check both desktop + mobile (RTL intact, no overflow, no horizontal scrollbar).
- **Don't review from memory — invoke the installed Vercel skills.** They were mirrored into
  `.claude/skills/` on 2026-08-14 from `vercel-labs/agent-skills` (302 files, official):
  | Skill | Use it for |
  |---|---|
  | `web-design-guidelines` | a11y · semantics · forms · touch targets · perf (rules in its `rules.md`) |
  | `react-best-practices` | 70 rules, 8 priority tiers — waterfalls, bundle, barrels, caching |
  | `composition-patterns` | 8 rules — boolean-prop sprawl → compound components |
  | `react-native-skills` | 38 rules — for the planned React Native build of modonty |
  | `react-view-transitions` | page/route transitions without a third-party animation lib |

## 6. Sources (adopted)
- Claude Cookbook — *Prompting for frontend aesthetics* (Anthropic official)
- `vercel-labs/agent-skills` — installed locally (see §5), not merely cited
- Bencium UX · AccessLint (WCAG 2.1/2.2)
- Dashboard UX research: UXPin · SapientPro · UX Collective (B2B dashboards)

## Related memory
`feedback_uiux_standards` · `feedback_admin_ui_business_focus` · `feedback_admin_language` · `project_bundle_size_policy_per_app` · `feedback_playwright_screenshots_location` · `feedback_human_writing_tone` (Arabic UI copy).
