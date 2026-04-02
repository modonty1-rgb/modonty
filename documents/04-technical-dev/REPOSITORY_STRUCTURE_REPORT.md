# MODONTY Monorepo - Repository Structure

| Field | Value |
|-------|-------|
| Document | Repository structure and curated file inventory |
| Scope | `modonty/`, `console/`, `admin/`, `dataLayer/`, root workspace |
| Generated | 2026-03-29 |

**Convention**: Every curated path includes a **Job** line (what the file owns/does). This is not exhaustive.

## Executive Summary

MODONTY is a pnpm monorepo (`@modonty/monorepo`) with three Next.js applications and one shared database package.

- **`modonty`**: Public, Arabic (RTL) reader-facing site (feed, articles, clients, categories, auth, APIs)
- **`console`**: Partner/dashboard app (analytics, support, content, SEO, campaigns)
- **`admin`**: Internal CMS (articles, taxonomy, media, users, settings)
- **`dataLayer`**: Prisma schema, client, seeds - single source of truth for database access

## Monorepo Topology

| Package | Path | Stack | Job |
|---------|------|-------|-----|
| `@modonty/modonty` | `modonty/` | Next.js App Router | Public website + REST route handlers |
| `@modonty/console` | `console/` | Next.js App Router | Authenticated dashboard, login |
| `@modonty/admin` | `admin/` | Next.js App Router | Admin CMS: auth + dashboard CRUD |
| `@modonty/database` | `dataLayer/` | Prisma + MongoDB | Schema, client, seeds |
| Workspace root | `package.json` | pnpm + scripts | `dev:*`, `build:*`, Prisma shortcuts |

## Shared Data Layer (`dataLayer/`)

| File | Job |
|------|-----|
| `dataLayer/package.json` | Scripts: `prisma:generate`, `prisma:push`, `seed`, `dedupe-before-push` |
| `dataLayer/prisma/schema/schema.prisma` | Prisma schema — models, relations, enums (authoritative DB) |
| `dataLayer/prisma/seed.ts` | Database seeding |
| `dataLayer/index.ts` | Exports Prisma client for workspace |

## Application: `modonty/` (Public Site)

### Root Layout & Global Assets

| File | Job |
|------|-----|
| `modonty/app/layout.tsx` | Root HTML/body, fonts, TopNav, Footer, mobile footer, session provider |
| `modonty/app/globals.css` | Tailwind layers, CSS variables, utilities, focus/prose/skeleton rules |
| `modonty/app/page.tsx` | Home page — feed, sidebars, hero |
| `modonty/app/sitemap.ts` | Sitemap generation |
| `modonty/app/robots.ts` | Robots.txt rules |

### Routes by Domain

**Home & Discovery**:
| Route | File | Job |
|-------|------|-----|
| `/` | `app/page.tsx` | Home feed |
| `/trending` | `app/trending/page.tsx` | Trending articles |
| `/search` | `app/search/page.tsx` | Search results |
| `/subscribe` | `app/subscribe/page.tsx` | Newsletter signup |

**Articles**:
| Route | File |
|-------|------|
| `/articles/[slug]` | Single article, content, sidebar, comments |

**Clients**:
| Route | File |
|-------|------|
| `/clients` | Client directory |
| `/clients/[slug]` | Client hub (feed, hero) |
| `/clients/[slug]/about` | About section |
| `/clients/[slug]/contact` | Contact form |
| `/clients/[slug]/followers` | Followers list |
| `/clients/[slug]/photos` | Photo gallery |
| `/clients/[slug]/reels` | Reels listing |
| `/clients/[slug]/reviews` | Reviews list |
| `/clients/[slug]/likes` | Engagement stats |
| `/clients/[slug]/mentions` | Mentions section |

**Categories**:
| Route | File |
|-------|------|
| `/categories` | All categories |
| `/categories/[slug]` | Category articles |

**Users & Auth**:
| Route | File |
|-------|------|
| `/users/login` | Login |
| `/users/register` | Registration |
| `/users/profile` | My profile |
| `/users/profile/settings` | Settings tabs |
| `/users/profile/liked` | Liked items |
| `/users/profile/disliked` | Disliked items |
| `/users/profile/favorites` | Favorited articles |
| `/users/profile/following` | Followed clients |
| `/users/profile/comments` | User's comments |
| `/users/notifications` | Notifications |
| `/users/[id]` | Public profile |

**Legal & Marketing**:
| Route | File |
|-------|------|
| `/about` | About Modonty |
| `/contact` | Contact |
| `/help` | Help center |
| `/help/faq` | FAQ |
| `/help/feedback` | Feedback form |
| `/news` | Newsletter page |
| `/news/subscribe` | Newsletter signup |
| `/terms` | Terms |
| `/legal/privacy-policy` | Privacy |
| `/legal/cookie-policy` | Cookie policy |
| `/legal/copyright-policy` | Copyright |
| `/legal/user-agreement` | User agreement |

### API Routes

**Auth**:
| Path | Methods |
|------|---------|
| `/api/auth/[...nextauth]` | NextAuth session, OAuth, credentials |

**Articles**:
| Path | Methods |
|------|---------|
| `/api/articles` | GET (paginated) |
| `/api/articles/featured` | GET |
| `/api/articles/[slug]/view` | POST (record view) |
| `/api/articles/[slug]/like` | POST, DELETE |
| `/api/articles/[slug]/dislike` | POST, DELETE |
| `/api/articles/[slug]/favorite` | POST, DELETE |
| `/api/articles/[slug]/share` | POST |
| `/api/articles/[slug]/comments` | GET, POST |
| `/api/articles/[slug]/comments/[commentId]` | POST |
| `/api/articles/[slug]/chat` | POST |
| `/api/articles/[slug]/interactions` | GET |

**Comments**:
| Path | Methods |
|------|---------|
| `/api/comments/[id]/like` | POST |
| `/api/comments/[id]/dislike` | POST |

**Categories**:
| Path | Methods |
|------|---------|
| `/api/categories` | GET |
| `/api/categories/[slug]` | GET |
| `/api/categories/[slug]/analytics` | GET |

**Clients**:
| Path | Methods |
|------|---------|
| `/api/clients` | GET |
| `/api/clients/[slug]` | GET |
| `/api/clients/[slug]/view` | POST |
| `/api/clients/[slug]/follow` | GET, POST, DELETE |
| `/api/clients/[slug]/followers` | GET |
| `/api/clients/[slug]/share` | POST |

**Users**:
| Path | Methods |
|------|---------|
| `/api/users/profile` | GET (auth) |
| `/api/users/notifications` | GET, PATCH (auth) |

### Components

**Shared**:
- `modonty/components/` - Shared UI components (PostCard, Avatar, Button, etc.)

**Layout**:
- `modonty/components/layout/` - TopNav, Footer, Mobile footer

**Features**:
- `modonty/components/articles/` - Article-specific components
- `modonty/components/clients/` - Client-specific components
- `modonty/components/search/` - Search UI

### Helpers & Utilities

| Path | Job |
|------|-----|
| `modonty/lib/` | Utilities, constants, types |
| `modonty/app/api/helpers/` | Backend helpers, queries, types |

## Application: `admin/` (Internal CMS)

### Dashboard Routes

| Path | Job |
|------|-----|
| `admin/app/(dashboard)/` | Protected routes (require auth) |
| `admin/app/(dashboard)/articles/` | Article CRUD |
| `admin/app/(dashboard)/clients/` | Client CRUD |
| `admin/app/(dashboard)/media/` | Media upload/management |
| `admin/app/(dashboard)/users/` | User management |
| `admin/app/(dashboard)/settings/` | Platform settings |

## Application: `console/` (Partner Dashboard)

### Dashboard Routes

| Path | Job |
|------|-----|
| `console/app/(dashboard)/` | Partner analytics and reports |
| `console/app/(dashboard)/analytics/` | Traffic, engagement metrics |
| `console/app/(dashboard)/content/` | Content management |
| `console/app/(dashboard)/seo/` | SEO tools and audits |

## Shared Types & Utilities

| Path | Job |
|------|-----|
| Root `types/` | Shared TypeScript types across all apps |
| Root `lib/` | Shared utilities |
| `dataLayer/` | Prisma client and schema |
