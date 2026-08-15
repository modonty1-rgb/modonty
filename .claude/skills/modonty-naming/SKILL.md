---
name: modonty-naming
description: |
  Naming standard for folders and files inside a modonty route (modonty.com).
  Khalid's English is beginner/intermediate — every folder and file name must be
  a plain word he can recognise without translating. Use this skill whenever
  creating, moving, or renaming a folder/file under `modonty/app/**`, when
  splitting a page into per-section folders, or when reviewing a structure.
  Triggers: "folder structure", "اسم المجلد", "رتّب المجلدات", "colocation",
  "اعمل فولدر", "سمّي الملف".
---

# Naming and code rules for modonty route folders

## 🥇 GOLDEN RULES — these outrank everything else in this file

1. **Zero dead code. Ever.** A file with no consumer, an export nobody imports, a
   prop nobody passes, a `<Suspense>` that never suspends — delete it in the same
   pass that discovers it. Never leave it "just in case". Before finishing any
   task, grep every file you touched for its consumers and prove each one is used.
2. **KISS.** The simplest thing that works, wins. No abstraction until there are
   two real callers. No config object for one value. No wrapper that only forwards.
3. **SOLID, applied small.** One file = one job. A component renders; a helper
   reads data; they never do both. If you cannot name the file in two plain words,
   it is doing two jobs — split it.
4. **Comments: short, plain, and about WHY.** One line, max two. Explain the reason
   a reader cannot guess from the code. Never narrate what the line already says.
   ✅ `// Google indexes the mobile render, so this must not be desktop-only.`
   ❌ `// map over the array and return the items`
5. **No clever code.** If a teammate needs a minute to read it, rewrite it.
   No nested ternaries, no one-line chains longer than one screen, no regex where
   a `.startsWith()` does the job.
6. **Documentation saves time, it does not certify truth.** Read the route's
   `documentation/MAP.md` first — it is there so you stop re-scanning the repo.
   But every line in it is a claim you or another agent wrote, not evidence. It
   goes stale the moment someone edits without updating it. So:
   - Use it to orient: where things live, what was already measured, which traps
     were already hit.
   - **Re-verify anything you are about to act on** — a path, a flag, a number.
     One `grep`, one `curl`, one `git diff` is cheaper than a wrong change.
   - Never quote a documented number back to Khalid as a current fact. Say when
     it was measured, or measure it again.
   - This is not theoretical: a session log once stated "all four commits are
     unpushed"; `git rev-list` showed one of them was already on the remote.
   - Update the doc in the **same commit** as the change it describes. Stale
     documentation is worse than none, because it gets believed.

## The naming rule

**A folder is named after the thing you SEE on the page — not after the code pattern.**

Khalid opens a folder to fix something he just looked at on screen. If he has to
translate the name or remember an abstraction, the name failed.

## Word list — use these, not synonyms

| Use | Not |
|---|---|
| `card` | Panel, Widget, Tile, Block, Module |
| `list` | Feed, Stream, Collection, Grid |
| `bar` | Dock, Strip, Toolbar, Rail |
| `sidebar` | Aside, Rail, Column |
| `button` | Trigger, CTA, Action, Popover |
| `sheet` | Drawer, Overlay, Modal |
| `layout` | Shell, Container, Wrapper, Frame |
| `mobile` suffix | Responsive, Small, Compact, Sm |

Avoid entirely: `Deferred`, `Gateway`, `Carousel`, `Infinite`, `Prompt`,
`Preview`, `Section`, `Enhanced`, `V2`, `Manager`, `Provider` (unless it really
is a React context provider).

## Shape

```
app/(<page>)/
  page.tsx
  loading.tsx
  TASK.md             open work for THIS route, ordered by priority
  api/                public endpoints for external clients (mobile)
  data/               anything that brings data from the server to the UI
  helpers/            small utilities only — format, convert, calculate
  documentation/      API contracts, data flow, architecture decisions
  components/
    page-layout/      the columns/frame of the page
    <thing>-card/     one visible card
    <thing>-list/     one visible list
    mobile-bottom-bar/ a bar that only shows on phones
    shared/           pieces used by TWO OR MORE cards on this page
```

### `data/` vs `helpers/` — split by purpose, not by mechanism

Khalid's rule (2026-08-15): **anything that brings data from the server to the UI
goes in `data/`.** It does not matter whether it is a plain async function, a
`"use server"` action, or a wrapper around a shared query — if the answer it
returns is data, it lives in `data/`.

`helpers/` is only for small utilities: formatting a date, converting a shape,
calculating a reading time.

**Keep the standard folders even when empty** (Khalid, 2026-08-15): `api/`,
`data/`, `helpers/`, `documentation/`, `components/` are present on every route, so nobody has to
remember the shape or invent a new place under time pressure. Git does not track
empty folders, so an empty one carries a `.gitkeep` explaining what belongs in it
— otherwise the standard silently disappears on the next clone.

This is the one exception to the zero-dead-code rule: an empty folder is
scaffolding, not code. It ships nothing to the browser.

Do not name the data folder `actions/`. In Next.js "action" means Server Action
specifically, and most fetching here is not a Server Action — the name would lie.

### `documentation/` — written for the agent first

Every route carries a `documentation/` folder. Its primary reader is the agent,
not a human: it exists so a session starts by opening one file instead of
scanning dozens. Standard contents:

| File | Holds |
|---|---|
| `MAP.md` | one line per file (what it renders, is it a client component) · measured facts with their evidence and date · traps already hit on this route |
| `api-*.md` | the full contract of each endpoint: inputs, output shape, status codes, notes for the mobile client |
| `data-flow.md` | which function feeds which visible section |

Rules for these files:

- **Generate the file list from the code**, never from memory. A wrong map costs
  more than no map.
- **Every fact carries its evidence and its date.** "The page is partially static"
  is worthless; "`prerender-manifest.json` → `/ : PARTIALLY_STATIC`, 2026-08-15"
  is usable.
- The traps section is the highest-value part — write down what you actually got
  wrong, not what you think someone might get wrong.
- Open work does **not** live here. It lives in `TASK.md` at the route root.

### The data function is shared, the doors are thin

One function per piece of data. It is called by:

- the Server Component directly (the web — no HTTP hop),
- a `route.ts` in `api/` (the mobile app and any external client),
- a `"use server"` action, only when the UI is **writing** something.

Doors never call each other. They all call the same function, so the logic is
written once. Official basis: Route Handlers are public HTTP endpoints any client
can reach; Server Actions are queued and meant for mutations; and Server
Components must not call Route Handlers (it adds a needless server request).

- Folder names: **kebab-case**, two words max (`reels-card`, `industries-card`).
- Component file names: **PascalCase**, matching the folder (`reels-card/ReelsCard.tsx`).
- The mobile twin of a card sits **in the same folder**, suffixed `Mobile`
  (`clients-card/ClientsCardMobile.tsx`) — never in a separate `mobile/` tree.

## Homepage — the reference map

| Folder | What Khalid sees |
|---|---|
| `page-layout/` | the three columns |
| `left-sidebar/` · `right-sidebar/` | the two side columns |
| `ask-modo/` | «مساعدة Modo» |
| `user-card/` | بطاقة المستخدم |
| `reels-card/` | «طلة جديدة» |
| `industries-card/` | «استكشف المجالات» |
| `articles-list/` | «آخر المقالات» |
| `modonty-card/` | بطاقة «مدونتي» |
| `services-card/` | «ماذا تريد أن تفعل اليوم؟» |
| `clients-card/` | «عملاء موثوقون» |
| `mobile-bottom-bar/` | الشريط السفلي في الجوّال |
| `scroll-buttons/` | شريط التقدّم + زر العودة للأعلى |
| `shared/` | قطع تستخدمها أكثر من بطاقة |

## Checks before you commit a name

1. Say the name out loud in English. Would a first-year student know the word?
2. Can Khalid point at it on the screen? If not, the folder is probably wrong,
   not just its name.
3. Two words maximum. If you need three, the folder is doing two jobs — split it.
4. No name may describe a React technique (`Suspense`, `Deferred`, `Infinite`).
   Describe the thing, not how it is built.

## Loading states

One `loading.tsx` per route covers the whole page. Do **not** add
`<Suspense>` skeletons around components that receive their data as props —
they never suspend, so the skeleton never renders and the file is dead code.
Add a `<Suspense>` only around a component that does its own `await`.
