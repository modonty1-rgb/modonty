# Repository Structure

**Generated**: March 28, 2026
**Monorepo**: MODONTY (pnpm workspace)

## Quick Navigation

- **Public site**: `modonty/`
- **Admin CMS**: `admin/`
- **Partner dashboard**: `console/`
- **Database**: `dataLayer/`
- **Root workspace**: `package.json` (dev/build scripts, Prisma shortcuts)

## Key Directories

```
.
├── modonty/                          # Public website (Next.js App Router)
│   ├── app/
│   │   ├── (auth)/                   # Auth routes (login, register)
│   │   ├── (main)/                   # Main routes (home, articles, clients)
│   │   ├── api/                      # REST API routes
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   ├── components/                   # Shared UI components
│   ├── lib/                          # Utilities, helpers, types
│   └── public/                       # Static assets
│
├── admin/                            # Admin CMS (Next.js App Router)
│   ├── app/
│   │   ├── (auth)/                   # Login, register, password reset
│   │   └── (dashboard)/              # Protected admin routes
│   │       ├── articles/             # Article CRUD
│   │       ├── clients/              # Client CRUD
│   │       ├── media/                # Media upload/management
│   │       ├── users/                # User management
│   │       └── settings/             # Platform settings
│   ├── components/                   # Admin UI components
│   ├── lib/                          # Admin utilities, types, actions
│   └── public/                       # Static assets
│
├── console/                          # Partner dashboard (Next.js App Router)
│   ├── app/
│   │   ├── (auth)/                   # Login
│   │   └── (dashboard)/              # Protected dashboard routes
│   │       ├── analytics/            # Analytics/reports
│   │       ├── content/              # Content management
│   │       └── seo/                  # SEO tools
│   ├── components/
│   ├── lib/
│   └── public/
│
├── dataLayer/                        # Shared database package
│   ├── prisma/
│   │   ├── schema/
│   │   │   └── schema.prisma         # Prisma schema (authoritative DB)
│   │   └── seed.ts                   # Database seeding
│   ├── index.ts                      # Exports Prisma client
│   └── package.json
│
├── package.json                      # Root workspace config
├── pnpm-workspace.yaml               # Workspace definition
├── .env.local                        # Environment variables
└── README.md
```

## App Structure Patterns

### File Organization by Feature

```
app/
├── (auth)/
│   ├── login/
│   │   ├── page.tsx                  # Login page
│   │   ├── components/
│   │   │   └── login-form.tsx        # Login form
│   │   └── actions/
│   │       └── login-actions.ts      # Server actions
│   └── register/
│       ├── page.tsx
│       ├── components/
│       └── actions/
│
├── (dashboard)/
│   ├── articles/
│   │   ├── page.tsx                  # Articles list
│   │   ├── [id]/
│   │   │   ├── page.tsx              # Article detail
│   │   │   ├── edit/
│   │   │   │   └── page.tsx          # Article edit
│   │   │   └── components/           # Article-specific components
│   │   ├── components/               # Articles list components
│   │   └── actions/
│   │       └── articles-actions.ts   # Server actions
│   │
│   └── [other features]/
│
└── layout.tsx                        # Layout for auth/dashboard
```

### API Route Pattern

```
app/api/
├── auth/
│   └── [...nextauth]/
│       └── route.ts                  # NextAuth handler
│
├── articles/
│   ├── route.ts                      # GET /api/articles
│   └── [slug]/
│       ├── view/
│       │   └── route.ts              # POST /api/articles/[slug]/view
│       ├── like/
│       │   └── route.ts              # POST /api/articles/[slug]/like
│       └── [other actions]/
│
└── [other resources]/
```

## Database Schema Structure

```
dataLayer/prisma/schema/
├── schema.prisma                     # Main schema file (all models)
└── [split into sections]
    ├── articles.prisma               # Article models
    ├── clients.prisma                # Client models
    ├── users.prisma                  # User models
    ├── categories.prisma             # Category models
    ├── enums.prisma                  # Enum definitions
    └── settings.prisma               # Settings model
```

## Key Files Across Apps

| Purpose | File |
|---------|------|
| Root layout (modonty) | `modonty/app/layout.tsx` |
| Global styles | `modonty/app/globals.css` |
| API helpers | `modonty/app/api/helpers/` |
| Shared types | `dataLayer/` (Prisma client) |
| Environment config | `.env.local` |
| Workspace config | `pnpm-workspace.yaml` |
| Prisma schema | `dataLayer/prisma/schema/schema.prisma` |
| Seeding | `dataLayer/prisma/seed.ts` |

## Scripts (Root package.json)

```bash
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all apps
pnpm build:modonty    # Build modonty only
pnpm build:admin      # Build admin only
pnpm build:console    # Build console only
pnpm start            # Start production server
pnpm lint             # Lint all code
pnpm type-check       # TypeScript check
pnpm db:push          # Push Prisma schema to DB
pnpm db:generate      # Generate Prisma client
pnpm db:seed          # Seed database
```

## Access Patterns

- **Modonty imports from dataLayer**: `import { db } from "@modonty/database"`
- **Admin imports from dataLayer**: `import { db } from "@modonty/database"`
- **Console imports from dataLayer**: `import { db } from "@modonty/database"`
- **Shared components**: Not yet extracted; each app has own components

## Deployment Structure

- **Modonty**: Deployed to `modonty.com` (public site)
- **Admin**: Deployed to `admin.modonty.com` (internal CMS)
- **Console**: Deployed to `console.modonty.com` (partner dashboard)
- **Database**: Shared MongoDB instance
