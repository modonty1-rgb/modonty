# AI Monorepo Instructions - Complete Codebase Guide

**Comprehensive instructions for AI assistants to understand, navigate, and modify this monorepo codebase.**

## Quick Reference

### Package Identification

| Path | Package | Purpose |
|------|---------|---------|
| `admin/` | `@modonty/admin` | Admin dashboard |
| `modonty/` | `@modonty/modonty` | Multi-client blog platform |
| `console/` | `@modonty/console` | Partner dashboard |
| `dataLayer/` | `@modonty/database` | Shared database |

### Critical File Locations

| File | Location | Purpose |
|------|----------|---------|
| Prisma Schema | `dataLayer/prisma/schema/` | **ONLY** schema directory |
| Admin Auth | `admin/auth.config.ts` | NextAuth config |
| Admin Middleware | `admin/proxy.ts` | Route protection |
| Admin DB Client | `admin/lib/prisma.ts` | Prisma client |
| Modonty DB Client | `modonty/lib/db.ts` | Prisma client |

### Essential Commands

```bash
# Install dependencies (from root only)
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Run apps from root
pnpm dev:admin
pnpm dev:modonty
pnpm dev:console

# Build all apps
pnpm build:all

# Build individual apps
cd admin && pnpm build
cd modonty && pnpm build
cd console && pnpm build
```

## Monorepo Overview

### Structure

```
modonty-monorepo/
├── admin/              # Admin dashboard (Next.js App Router)
├── modonty/            # Multi-client blog platform (Next.js App Router)
├── console/            # Partner dashboard (Next.js App Router)
├── dataLayer/          # Shared Prisma schema and database
├── pnpm-workspace.yaml # Workspace configuration
├── pnpm-lock.yaml      # ONLY lockfile (at root)
└── package.json        # Root package (workspace config only)
```

### Key Principles

1. **Single Database Schema**: All apps share `dataLayer/prisma/schema/`
2. **Separate Applications**: Admin, Modonty, and Console are independent Next.js apps
3. **Shared Database Package**: `@modonty/database` workspace package
4. **One Lockfile**: Only root has `pnpm-lock.yaml` (critical rule)
5. **Independent Deployments**: Each app deploys separately
6. **Package Scope**: All packages use `@modonty/*` namespace

## Package Structure

### Admin (`admin/`)

**Purpose**: Internal CMS for content management

**Key Directories**:
- `app/(auth)/` - Authentication (login, register, password reset)
- `app/(dashboard)/` - Protected dashboard routes
  - `articles/` - Article CRUD
  - `clients/` - Client CRUD
  - `media/` - Media management
  - `users/` - User management
  - `settings/` - Platform settings
- `components/` - Admin-specific UI components
- `lib/` - Admin utilities and types
- `auth.config.ts` - NextAuth configuration

**Key Features**:
- Role-based access control (RBAC)
- Article publishing workflow
- Media upload and management
- Analytics dashboard

### Modonty (`modonty/`)

**Purpose**: Public-facing multi-client blog platform

**Key Directories**:
- `app/(auth)/` - User authentication
- `app/(main)/` - Public routes
  - `articles/[slug]/` - Single article page
  - `clients/[slug]/` - Client hub pages
  - `categories/` - Category pages
  - `search/` - Search functionality
  - `trending/` - Trending articles
- `components/` - Shared public UI components
- `lib/` - Public site utilities
- `app/api/` - REST API routes

**Key Features**:
- Multi-client architecture
- Full-text search
- Article interactions (likes, comments, shares)
- Client profiles and analytics

### Console (`console/`)

**Purpose**: Partner/client dashboard for analytics and content

**Key Directories**:
- `app/(auth)/` - Authentication
- `app/(dashboard)/` - Protected dashboard
  - `analytics/` - Traffic and engagement analytics
  - `content/` - Content management
  - `seo/` - SEO tools and audits
- `components/` - Dashboard UI components

### DataLayer (`dataLayer/`)

**Purpose**: Shared database configuration and Prisma client

**Key Files**:
- `prisma/schema/schema.prisma` - Complete database schema (AUTHORITATIVE)
- `prisma/seed.ts` - Database seeding script
- `index.ts` - Exports Prisma client for all apps
- `package.json` - Database package config

**Important**: All database access across all apps goes through this shared Prisma client.

## Technology Stack

### Across All Apps

- **Framework**: Next.js 16+ with App Router
- **Database**: MongoDB with Prisma ORM
- **Auth**: NextAuth v5
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm (workspaces)
- **Language**: TypeScript
- **Deployment**: Vercel (independent projects per app)

### Additional Libraries

- **UI Components**: Radix UI, shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form, Zod validation
- **HTTP**: Axios (optional), Fetch API (preferred)
- **Analytics**: Custom implementation with database tracking
- **SEO**: Next.js built-in (`generateMetadata`, JSON-LD)

## Database & Prisma

### Schema Location (ONLY)

**File**: `dataLayer/prisma/schema/schema.prisma`

**Rule**: This is the single source of truth for all database models.

### Common Models

- **Article**: Blog posts with SEO, publishing status, client association
- **Client**: Multi-tenant clients/brands
- **User**: Users with authentication
- **Category**: Article categorization
- **Comment**: Article comments with moderation
- **Like/Dislike**: User interactions
- **Favorite**: Article favoriting
- **Analytics**: View tracking and metrics

### Accessing Database

**In any app**:
```typescript
import { db } from "@modonty/database"; // From dataLayer

// Use Prisma client
await db.article.findUnique({ where: { slug } });
await db.client.findMany();
// ... etc
```

**Regenerating Client**:
```bash
pnpm prisma:generate
```

After ANY schema changes, run this command from root.

## Authentication & Authorization

### Admin App Authentication

**Framework**: NextAuth v5 with credentials + OAuth

**Config File**: `admin/auth.config.ts`

**Roles**:
- **Admin**: Full platform access
- **Editor**: Article management only

**Protected Routes**: All routes under `admin/app/(dashboard)/` use middleware (`admin/proxy.ts`)

### Modonty App Authentication

**Framework**: NextAuth v5

**User Sessions**: Stored in database via Prisma

**Protected Routes**: User profile routes require authentication

### Console App Authentication

**Framework**: NextAuth v5

**Requires**: User session with appropriate permissions

## API Architecture

### Route Handlers

All REST API routes use Next.js Route Handlers (`app/api/**/route.ts`)

**Methods**: GET, POST, PATCH, DELETE

**Pattern**:
```typescript
export async function GET(request: Request) {
  // Implementation
}

export async function POST(request: Request) {
  // Implementation
}
```

### API Endpoints (Modonty)

**Articles**:
- `GET /api/articles` - List articles
- `POST /api/articles/[slug]/view` - Track view
- `POST /api/articles/[slug]/like` - Like article
- `GET /api/articles/[slug]/comments` - Get comments

**Clients**:
- `GET /api/clients` - List clients
- `GET /api/clients/[slug]` - Single client
- `POST /api/clients/[slug]/follow` - Follow client

**Categories**:
- `GET /api/categories` - List categories
- `GET /api/categories/[slug]` - Single category

### Error Handling

Consistent error responses:
```typescript
return Response.json(
  { error: "Error message", code: "ERROR_CODE" },
  { status: 400 }
);
```

## Component Architecture

### Server vs Client Components

**By default**: Use Server Components

**Client Only When**: Interactivity needed (hooks, state, events)

**Pattern**:
```typescript
// Server Component (default)
export default async function Page() {
  const data = await fetch(...);
  return <ClientComponent data={data} />;
}

// Client Component (when needed)
"use client";
export function ClientComponent({ data }) {
  const [state, setState] = useState();
  // ... client logic
}
```

### Shared Components

Located in each app's `components/` directory. No shared component library yet.

## Routing & Middleware

### Dynamic Routes

**Pattern**: `[paramName]` and `[[...catchAll]]`

**Example**: `/articles/[slug]/page.tsx` matches `/articles/any-slug`

### Route Groups

**Pattern**: `(groupName)` - doesn't appear in URL

**Example**: `(dashboard)` groups all admin dashboard routes

### Middleware

**File**: `middleware.ts` in app root or `proxy.ts` for auth

**Common Uses**:
- Authentication checks
- Authorization (role-based)
- Request logging
- Redirects

## Styling & UI

### Tailwind CSS

- Configured in root workspace
- Used by all apps
- CSS variables for theming in `globals.css`

### Component Libraries

- **shadcn/ui**: Copy-paste component library
- **Radix UI**: Headless primitives
- **Lucide React**: Icons

## Build & Deployment

### Local Build

```bash
pnpm build:all    # Build all apps
pnpm build:admin  # Build single app
```

### Deployment

Each app deploys independently to Vercel:
- **Admin**: `admin.modonty.com`
- **Modonty**: `modonty.com`
- **Console**: `console.modonty.com`

**Environment Variables**: Each app has separate `.env.local`

## Critical Rules & Warnings

### ❌ NEVER DO THIS

1. **Edit `pnpm-lock.yaml` manually** - Delete and regenerate with `pnpm install`
2. **Create `pnpm-lock.yaml` in app folders** - ONLY at root
3. **Import from other apps directly** - Use proper package names `@modonty/*`
4. **Edit Prisma schema in multiple places** - ONLY `dataLayer/prisma/schema/`
5. **Skip `pnpm prisma:generate`** - Run after EVERY schema change
6. **Deploy without testing** - Always `pnpm build:all` locally first
7. **Use relative imports** across apps - Use workspace package names

### ✅ ALWAYS DO THIS

1. **Work from root** for all commands
2. **Commit from root** even when editing app-specific files
3. **Test all apps** before pushing (`pnpm build:all`)
4. **Regenerate Prisma** after schema changes
5. **Use TypeScript** for type safety
6. **Validate data** with Zod or similar before database operations
7. **Handle errors** gracefully in API routes

## Common Patterns

### Creating a New Article

```typescript
// In admin app
const article = await db.article.create({
  data: {
    title: "Article Title",
    slug: "article-slug",
    excerpt: "Summary",
    content: "Full content",
    clientId: "client-id",
    authorId: "author-id",
    status: "PUBLISHED",
    datePublished: new Date(),
  },
});
```

### Fetching Articles in Modonty

```typescript
// In modonty app
const articles = await db.article.findMany({
  where: { status: "PUBLISHED" },
  include: { client: true, author: true },
  orderBy: { datePublished: "desc" },
});
```

### API Response Pattern

```typescript
export async function GET(request: Request) {
  try {
    const data = await db.article.findMany();
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
```

## Error Prevention Checklist

Before committing:

- [ ] All imports use correct paths (`@modonty/*` for packages)
- [ ] Schema changes regenerated: `pnpm prisma:generate`
- [ ] All apps build: `pnpm build:all`
- [ ] No TypeScript errors
- [ ] No console errors in dev mode
- [ ] Databases changes tested locally
- [ ] No direct imports between apps
- [ ] Environment variables set correctly
- [ ] API responses tested with actual requests
- [ ] Database queries use proper types from Prisma
