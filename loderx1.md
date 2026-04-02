# MODONTY Monorepo — Scope & Operating Rules

> Load this file at the start of every AI session. It defines the monorepo structure, scope boundaries, and mandatory operating behavior.

---

## Monorepo Map

```
MODONTY/
├── admin/          → CMS dashboard (content, SEO, clients, analytics)
│   ├── app/
│   │   ├── (auth)/         → Login, forgot/reset password
│   │   ├── (dashboard)/    → Protected admin routes
│   │   │   ├── articles/       → Article CRUD, preview, publish
│   │   │   ├── categories/     → Category CRUD, tree view
│   │   │   ├── clients/        → Client management, SEO intake
│   │   │   ├── authors/        → Author profiles (E-E-A-T)
│   │   │   ├── tags/           → Tag management
│   │   │   ├── analytics/      → Dashboard analytics
│   │   │   ├── seo-health/     → SEO monitoring tools
│   │   │   ├── users/          → User management
│   │   │   ├── subscribers/    → Subscriber management
│   │   │   ├── contact-messages/ → Message inbox
│   │   │   ├── media/          → Media library
│   │   │   ├── settings/       → Admin settings
│   │   │   ├── guidelines/     → Editorial guidelines
│   │   │   ├── industries/     → Industry management
│   │   │   ├── subscription-tiers/ → Tier config
│   │   │   └── export-data/    → Data export
│   │   └── api/            → Admin API routes
│   ├── components/         → shadcn/ui + admin components
│   ├── lib/                → Auth, DB, SEO (37 files), utils
│   ├── helpers/            → GTM, formatters, SEO score
│   └── hooks/              → React hooks
│
├── modonty/        → Public-facing blog platform (Arabic-first)
│   ├── app/
│   │   ├── articles/[slug]     → Article detail
│   │   ├── categories/         → Category listing & detail
│   │   ├── clients/[slug]      → Client profile (about, contact, followers, photos, reviews, reels)
│   │   ├── search/             → Global search
│   │   ├── trending/           → Trending articles
│   │   ├── users/              → Login, register, profile, settings, favorites
│   │   ├── contact/            → Contact form
│   │   ├── help/               → FAQ, feedback
│   │   ├── legal/              → Privacy, cookies, terms
│   │   ├── news/               → News & subscribe
│   │   └── api/                → 50+ public API routes
│   ├── components/         → Feed, chatbot, navigation, layout, media, UI
│   ├── lib/                → Auth, DB, SEO, RAG/chatbot, tracking
│   └── helpers/            → GTM, hooks
│
├── console/        → Client analytics dashboard
│   ├── app/
│   │   ├── (auth)/login/       → Console login
│   │   └── (dashboard)/        → Analytics & reporting
│   ├── components/
│   └── lib/
│
├── dataLayer/      → SHARED Prisma schema + MongoDB ORM (70+ models)
│   ├── prisma/schema/schema.prisma
│   ├── lib/db.ts
│   └── scripts/
│
├── documents/      → Project docs, TODOs, plans
├── scripts/        → Root-level utility scripts
├── CLAUDE.md       → AI rules & gatekeeper
└── pnpm-workspace.yaml
```

---

## Startup Behavior (MANDATORY)

Before doing anything, you **MUST** ask the user two questions **in this order**:

### Question 1: Which app?

| App | When to choose |
|-----|---------------|
| `admin` | CMS features, article editor, SEO tools, client management, admin UI |
| `modonty` | Public blog, feed, chatbot, user profiles, visitor-facing pages |
| `console` | Client analytics dashboard, reporting |
| `dataLayer` | Prisma schema changes (affects ALL apps — requires explicit approval) |

### Question 2: Which section?

Ask for the **specific section** inside the chosen app. Examples:
- `admin → articles` or `admin → clients` or `admin → seo-health`
- `modonty → feed` or `modonty → chatbot` or `modonty → clients/[slug]`

**Do NOT assume scope. Do NOT touch code until both answers are confirmed.**

---

## Scope Rules (ABSOLUTE)

Once the user defines app + section:

1. **Study first** — read the codebase to understand structure and relationships
2. **Focus strictly** on the chosen section only
3. **Modify only** files that belong to the selected section
4. **Add new files only** inside that same section

### Scope Boundaries Per App

**admin/{section}** scope includes:
- `admin/app/(dashboard)/{section}/` — pages, actions, components, helpers
- `admin/components/` — only if adding/editing a shared component used by the section
- `admin/lib/` — only if the section's logic depends on it

**modonty/{section}** scope includes:
- `modonty/app/{section}/` — pages, actions, helpers
- `modonty/components/{section}/` — section-specific components
- `modonty/lib/` — only if the section's logic depends on it
- `modonty/app/api/{section}/` — related API routes

**console/{section}** scope includes:
- `console/app/(dashboard)/{section}/` — pages, components

---

## Forbidden Zones (DO NOT TOUCH)

| Zone | Why |
|------|-----|
| Any other app not selected | Cross-app changes break isolation |
| `dataLayer/prisma/schema/` | Schema changes affect ALL apps — ask first |
| `pnpm-workspace.yaml` | Monorepo config — never modify |
| Root `package.json` | Workspace root — never modify |
| `next.config.ts` (any app) | Build config — ask first |
| `lib/auth.ts` (any app) | Authentication — ask first |
| `middleware.ts` (any app) | Request middleware — ask first |
| `layout.tsx` (root level) | Root layout — ask first |
| `.env` / `.env.local` | Environment secrets — ask first |
| `globals.css` | Global styles — ask first |

---

## Exception Rule

If a change **outside** the allowed scope is genuinely necessary:

1. **STOP** — do not proceed
2. **Explain** why the out-of-scope change is needed
3. **Propose** an alternative that stays within scope
4. **Ask** for explicit permission
5. **Wait** for approval before touching anything

---

## Operating Mode

- **Surgical, minimal changes only** — no broad refactors
- **Stay within the user-defined scope** at all times
- **Read before edit** — understand existing patterns first
- **Match existing code style** — don't introduce new conventions
- **One section per task** — finish current scope before moving to another

---

## Golden Rules

1. Ask first. Act second.
2. Stay inside the box.
3. When in doubt → **ask**, don't assume.
4. Precision over speed. Safety over convenience.
5. This is a **live production app** — zero-risk changes only.
