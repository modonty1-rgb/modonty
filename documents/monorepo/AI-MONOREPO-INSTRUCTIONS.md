# AI Monorepo Instructions - Complete Codebase Guide

**Comprehensive instructions for AI assistants to understand, navigate, and modify this monorepo codebase without introducing errors or bugs.**

---

## 📋 Table of Contents

1. [Quick Reference](#-quick-reference)
2. [Monorepo Overview](#-monorepo-overview)
3. [Package Structure](#-package-structure)
4. [Technology Stack](#-technology-stack)
5. [Database & Prisma](#-database--prisma)
6. [Authentication & Authorization](#-authentication--authorization)
7. [API Architecture](#-api-architecture)
8. [Component Architecture](#-component-architecture)
9. [Routing & Middleware](#-routing--middleware)
10. [Styling & UI](#-styling--ui)
11. [Build & Deployment](#-build--deployment)
12. [Critical Rules & Warnings](#-critical-rules--warnings)
13. [Common Patterns](#-common-patterns)
14. [Error Prevention Checklist](#-error-prevention-checklist)

---

## ⚡ Quick Reference

### Package Identification

| Path | Package | Purpose |
|------|---------|---------|
| `admin/` | `@modonty/admin` | Admin dashboard |
| `beta/` | `@modonty/beta` | Multi-client blog platform (Modonty) |
| `home/` | `@modonty/home` | Fresh Next.js application |
| `dataLayer/` | `@modonty/database` | Shared database |

### Critical File Locations

| File | Location | Purpose |
|------|----------|---------|
| Prisma Schema | `dataLayer/prisma/schema/` | **ONLY** schema directory |
| Admin Auth | `admin/auth.config.ts` | NextAuth config |
| Admin Middleware | `admin/proxy.ts` | Route protection |
| Admin DB Client | `admin/lib/prisma.ts` | Prisma client |
| Beta DB Client | `beta/lib/db.ts` | Prisma client |
| Home DB Client | `home/lib/db.ts` (if exists) | Prisma client |

### Essential Commands

```bash
# Install dependencies (from root only)
pnpm install

# Generate Prisma client
cd dataLayer && pnpm prisma:generate

# Run apps from root
pnpm dev:admin  # Run admin app
pnpm dev:beta   # Run beta app
pnpm dev:home   # Run home app

# Build all apps
pnpm build:all

# Build individual apps
cd admin && pnpm build
cd beta && pnpm build
cd home && pnpm build
```

---

## 🏗️ Monorepo Overview

### Structure

```
modonty-monorepo/
├── admin/              # Admin dashboard application (Next.js App Router)
├── beta/               # Multi-client blog platform (Next.js App Router)
├── home/               # Fresh Next.js application (minimal setup)
├── dataLayer/          # Shared Prisma schema and database package
├── pnpm-workspace.yaml # Workspace configuration
├── pnpm-lock.yaml      # ONLY lockfile (at root, NOT in packages)
└── package.json        # Root package.json (minimal, for workspace)
```

### Key Principles

1. **Single Database Schema**: All apps share `dataLayer/prisma/schema/` directory
2. **Separate Applications**: Admin, Beta, and Home are independent Next.js apps
3. **Shared Database Package**: `@modonty/database` workspace package
4. **One Lockfile**: Only root has `pnpm-lock.yaml` (critical rule)
5. **Independent Deployments**: Each app deploys separately on Vercel
6. **Package Scope**: All packages use `@modonty/*` namespace

---

## 📦 Package Structure

### 1. `admin/` - Admin Dashboard

**Package Name**: `@modonty/admin`

**Purpose**: **ALL admin tasks and management** happen in this package. Internal admin dashboard for managing the entire platform.

**Key Characteristics**:
- **ALL Admin Functionality**: Content management, user management, client management, article publishing, analytics
- **Authentication**: NextAuth v5 (beta) with credentials provider
- **Layout**: RTL (Arabic), dark mode, Tajawal font
- **Routes**: Protected by middleware with route-based permissions
- **Database**: Uses `@modonty/database` workspace package
- **Server Actions**: Primary data mutation method (direct database access)

**Critical Rule**: 
- ✅ **ALL admin tasks** must be in `admin/` package
- ❌ **NO admin functionality** in `beta/` or `home/` packages

**Important Files**:
- `auth.config.ts` - NextAuth configuration
- `proxy.ts` - Middleware for auth and route permissions
- `lib/auth.ts` - NextAuth instance export
- `lib/prisma.ts` - Prisma client singleton
- `app/layout.tsx` - Root layout with RTL support

**Routes Structure**:
```
admin/app/
├── login/              # Public login page
├── no-permissions/     # Shown when user has no route permissions
├── page.tsx            # Dashboard home (protected)
├── users/              # User management
├── applications/       # Job applications management
├── staff/              # Staff management
├── tasks/              # Task management
├── settings/           # Settings pages
└── api/                # API routes
```

### 2. `beta/` - Multi-Client Blog Platform (Modonty)

**Package Name**: `@modonty/beta`

**Purpose**: **End-user facing** multi-client blog platform where readers can browse, read articles, and interact with content. Public-facing application with user authentication for engagement features.

**Key Characteristics**:
- **End-User Focused**: No admin tasks or management features (all admin in `admin/` package)
- **Public Blog Platform**: Readers browse articles by clients and categories
- **User Authentication**: NextAuth with Google, Facebook, and Email/Password providers
- **User Features**: Profile management, comments, reactions (when logged in)
- **SEO Optimized**: Meta tags, structured data, clean URLs
- **REST API**: All data operations via API endpoints (mobile-ready)

**Important**: 
- ❌ **NO admin functionality** - All admin tasks are in `admin/` package
- ✅ **User authentication** - NextAuth with Google, Facebook, Email/Password
- ✅ **Public access** - Anonymous users can browse and read articles

**Routes Structure**:
```
beta/app/
├── page.tsx            # Home page (article feed)
├── categories/         # Categories page (browse by category)
├── clients/            # Clients page (browse by client)
├── articles/[slug]/    # Article detail pages (reading view)
├── profile/            # User profile page (authenticated)
├── api/auth/           # NextAuth API routes
└── api/                # REST API endpoints
```

**Authentication Providers**:
- Google OAuth
- Facebook OAuth
- Email/Password (credentials)

### 3. `home/` - Fresh Next.js Application

**Package Name**: `@modonty/home`

**Purpose**: Fresh, minimal Next.js application ready for new development.

**Key Characteristics**:
- **Minimal Setup**: Clean Next.js 16 with React 19
- **TypeScript**: Full TypeScript support
- **Tailwind CSS**: Pre-configured with shadcn/ui setup
- **Database**: Uses `@modonty/database` workspace package
- **Ready for Development**: Basic structure in place

**Routes Structure**:
```
home/app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page
└── globals.css         # Global styles
```

### 4. `dataLayer/` - Shared Database

**Package Name**: `@modonty/database`

**Purpose**: Centralized Prisma schema shared by all apps (admin, beta, home)

**Key Characteristics**:
- **Modular Schema**: Schema split into multiple files in `prisma/schema/` directory
- **MongoDB**: Uses MongoDB as database provider
- **Workspace Package**: Exported as `@modonty/database`

**Critical Rules**:
- ✅ **ONLY** edit files in `dataLayer/prisma/schema/`
- ❌ **NEVER** create schema files in `admin/`, `beta/`, or `home/`
- ✅ **ALWAYS** run `pnpm prisma:generate` after schema changes
- ✅ **ALWAYS** test all apps after schema changes

**Schema Location**:
```
dataLayer/
└── prisma/
    ├── schema/         # Schema modules directory
    │   ├── schema.prisma    # Main schema file (imports others)
    │   ├── analytics.prisma # Analytics models
    │   ├── auth.prisma      # Authentication models
    │   ├── author.prisma    # Author models
    │   ├── client.prisma    # Client models
    │   ├── content.prisma   # Content/Article models
    │   ├── enums.prisma     # Enum definitions
    │   ├── media.prisma     # Media models
    │   ├── newsletter.prisma # Newsletter models
    │   └── relations.prisma  # Relation definitions
    └── seed.ts         # Database seeding script
```

---

## 🛠️ Technology Stack

### Core Technologies

| Technology | Version | Usage |
|------------|---------|-------|
| **Next.js** | 16.0.10 | App Router for all apps |
| **React** | 19.2.3 | UI framework |
| **TypeScript** | 5.7.2 | Type safety |
| **Prisma** | 6.18.0 | Database ORM |
| **MongoDB** | - | Database provider |
| **NextAuth** | 5.0.0-beta.30 | Authentication (admin & beta) |
| **Tailwind CSS** | 3.4.17 | Styling |
| **shadcn/ui** | - | UI component library |
| **Zod** | 4.1.12 | Schema validation |
| **pnpm** | - | Package manager (monorepo) |

### UI Libraries

- **shadcn/ui**: Primary UI component library (all apps)
- **Radix UI**: Base components for shadcn/ui
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first CSS framework

---

## 🗄️ Database & Prisma

### Schema Location

**ONLY ONE SCHEMA DIRECTORY**: `dataLayer/prisma/schema/`

### Prisma Client Usage

**All apps use the same pattern**:

```typescript
// admin/lib/prisma.ts or beta/lib/db.ts or home/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Schema Change Workflow

**CRITICAL**: Follow this exact workflow:

1. **Edit schema**: `dataLayer/prisma/schema/` directory
2. **Generate client**: `cd dataLayer && pnpm prisma:generate`
3. **Test all apps**: `pnpm build:all` (from root)
4. **Commit**: Only if all apps build successfully

### Database Connection

- **Environment Variable**: `DATABASE_URL` (MongoDB connection string)
- **Provider**: MongoDB
- **Connection**: Shared between all apps

### Important Schema Rules

- ✅ Use `@id @default(auto()) @map("_id") @db.ObjectId` for MongoDB IDs
- ✅ Use `DateTime @default(now())` for timestamps
- ✅ Use `DateTime @updatedAt` for auto-updated timestamps
- ✅ Index frequently queried fields
- ✅ Use enums for status fields

---

## 🔐 Authentication & Authorization

### Admin App Authentication

**Technology**: NextAuth v5 (beta) with credentials provider

**Key Files**:
- `admin/auth.config.ts` - NextAuth configuration
- `admin/lib/auth.ts` - NextAuth instance
- `admin/proxy.ts` - Middleware for route protection

**Authentication Flow**:
1. User submits credentials on `/login`
2. `auth.config.ts` validates against database
3. JWT token created with user data (id, role, email, name)
4. Session stored in JWT (no database session)
5. Middleware (`proxy.ts`) checks session on protected routes
6. Route permissions checked via `UserRoutePermission` model

**Route Protection**:
- **Middleware**: `admin/proxy.ts` handles all route protection
- **Public Routes**: `/login`, `/no-permissions`, `/api/auth/*`
- **Protected Routes**: Everything else
- **Permission Check**: `hasRoutePermission(route, userId)` function

**Important Auth Rules**:
- ✅ Session uses JWT strategy (no database sessions)
- ✅ User must be `isActive: true` to login
- ✅ Last login timestamp updated on successful login

### Beta App Authentication

**NextAuth Implementation** - User authentication for engagement features

**Authentication Providers**:
- Google OAuth
- Facebook OAuth
- Email/Password (credentials)

**Authentication Flow**:
1. Users can browse articles anonymously (public access)
2. Users can sign in via Google, Facebook, or Email/Password
3. Authenticated users can: Update profile, comment on articles, react to articles, view personal activity

**Important**: 
- ✅ **User authentication** - For engagement features (comments, reactions)
- ❌ **NO admin authentication** - All admin tasks are in `admin/` package
- ✅ **Public access** - Anonymous users can browse and read articles

### Home App Authentication

**No authentication required** - Fresh application, ready for auth setup if needed

---

## 🔌 API Architecture

### API Strategy by App

**Admin App**:
- ✅ **Server Actions** (primary) - Direct database mutations
- ✅ **API Routes** (optional) - Only if specific API needs arise
- Direct Prisma access in server components/actions

**Beta App**:
- ✅ **REST API** (required) - All data operations via API endpoints
- ✅ **API Routes** in `app/api/` directory
- ✅ **Mobile-Ready** - Designed for future mobile app consumption
- Client components fetch from `/api/*` endpoints
- Standard REST conventions (GET, POST, PUT, DELETE)

**Home App**:
- ✅ **REST API** (required) - All data operations via API endpoints
- ✅ **API Routes** in `app/api/` directory
- ✅ **Mobile-Ready** - Designed for future mobile app consumption

### API Response Format

**Standard API Response**:
```typescript
// Success response
{
  success: true,
  data: { /* response data */ }
}

// Error response
{
  success: false,
  error: "Error message" | { /* error details */ }
}
```

### API Best Practices

1. ✅ **Consistent Response Format** - Always use `{ success, data, error }` structure
2. ✅ **Error Handling** - Proper HTTP status codes (200, 400, 401, 404, 500)
3. ✅ **Input Validation** - Use Zod schemas for request validation
4. ✅ **Type Safety** - TypeScript types for request/response
5. ✅ **Mobile Compatibility** - RESTful design, JSON responses

---

## 🛣️ Routing & Middleware

### Admin App Routing

**Middleware**: `admin/proxy.ts`

**Route Protection Logic**:
1. **Public Routes**: `/login`, `/no-permissions`, `/api/auth/*`
2. **Protected Routes**: Everything else
3. **Permission Check**: After authentication, checks `UserRoutePermission`
4. **Redirect Logic**:
   - Not authenticated → `/login?callbackUrl=/requested-route`
   - No permissions → `/no-permissions`
   - Has permissions → Allow access

### Beta App Routing

**Public Blog Routes**: End-user reading and engagement routes

**Structure**:
- `/` - Home page (article feed) - Public
- `/categories` - Categories page - Public
- `/clients` - Clients page - Public
- `/articles/[slug]` - Article detail pages - Public
- `/profile` - User profile page (authenticated)
- `/api/auth/*` - NextAuth API routes
- `/api/*` - REST API endpoints

**Language**: Arabic (RTL) by default

**Admin Routes** (NOT in beta, all in admin package):
- ❌ `/admin` - Admin dashboard (in `admin/` package)
- ❌ Content management routes (in `admin/` package)
- ❌ User management routes (in `admin/` package)

### Home App Routing

**Fresh Application**: Minimal routing structure

**Structure**:
- `/` - Home page
- `/api/*` - REST API endpoints (for client and mobile consumption)

---

## 🧩 Component Architecture

### Data Fetching Architecture

**Important**: Different apps use different data fetching strategies:

1. **Admin App**: 
   - ✅ **Server Actions** (primary) - Direct database access via server actions
   - ✅ **API Routes** (if needed) - For specific use cases
   - Direct Prisma access in server components/actions

2. **Beta App**:
   - ✅ **REST API** (primary) - All data fetching via API endpoints
   - ✅ **API Routes** in `app/api/` directory
   - Designed for future mobile app compatibility
   - Client components fetch from API endpoints

3. **Home App**:
   - ✅ **REST API** (primary) - All data fetching via API endpoints
   - ✅ **API Routes** in `app/api/` directory
   - Designed for future mobile app compatibility

### Component Types

1. **Server Components** (default):
   - No `"use client"` directive
   - Can access database directly (Admin only)
   - Can fetch from API (Beta/Home)
   - No hooks or browser APIs

2. **Client Components**:
   - Must have `"use client"` directive
   - Can use hooks, state, effects
   - Can handle user interactions
   - Fetch data from API endpoints (Beta/Home)

### Component Organization

- **UI Components** (`components/ui/`): shadcn/ui components
- **Feature Components** (`components/[feature]/`): Feature-specific components
- **Layout Components** (`components/layout/`): Layout wrappers
- **Common Components** (`components/common/`): Shared across features

### Import Patterns

**Path Aliases** (configured in `tsconfig.json`):
- `@/components` → `components/`
- `@/lib` → `lib/`
- `@/actions` → `actions/`
- `@/helpers` → `helpers/`
- `@/types` → `types/`

**Workspace Imports**:
- `@modonty/database` → `dataLayer` package (for Prisma types)

---

## 🎨 Styling & UI

### Tailwind CSS Configuration

**All apps use similar Tailwind config**:
- Dark mode: `class` strategy
- Font: Tajawal (Arabic font)
- Colors: HSL variables (shadcn/ui pattern)
- Brand colors: CSS variables

### shadcn/ui Components

**Configuration**:
- Style: `new-york`
- RSC: `true` (React Server Components)
- Base color: `neutral`
- CSS variables: `true`
- Icon library: `lucide`

### Styling Rules

1. ✅ **Always use Tailwind utilities** - No inline styles
2. ✅ **Use semantic color tokens** - `bg-primary`, `text-destructive`, etc.
3. ✅ **Use shadcn/ui components** - Don't create custom UI from scratch
4. ✅ **RTL Support** - Admin uses RTL (Arabic), Beta uses RTL (Arabic)
5. ✅ **Dark Mode** - All apps support dark mode
6. ❌ **Never hardcode colors** - Use CSS variables or Tailwind tokens

### Font Configuration

**Admin App**: Tajawal (Arabic), RTL, `lang="ar" dir="rtl"`  
**Beta App**: Tajawal (Arabic), RTL, Arabic by default  
**Home App**: Tajawal (supports Arabic and Latin), ready for locale-based direction

---

## 🚀 Build & Deployment

### Build Commands

**From Root (using workspace scripts)**:
```bash
pnpm build:admin  # Build admin app
pnpm build:beta   # Build beta app
pnpm build:home   # Build home app
pnpm build:all    # Build all apps
```

**From Package Directory**:
```bash
cd admin && pnpm build
cd beta && pnpm build
cd home && pnpm build
```

**Prisma Generate**:
```bash
cd dataLayer && pnpm prisma:generate
```

### Build Process

1. **Prisma Generate**: Must run before building apps
2. **Next.js Build**: Standard Next.js build process
3. **Type Checking**: TypeScript compilation
4. **Output**: `.next` directory in each app

### Deployment (Vercel)

**Three Separate Projects**:

1. **Admin Project**: Root Directory: `admin`
2. **Beta Project**: Root Directory: `beta`
3. **Home Project**: Root Directory: `home`

**Auto-Deployment**:
- Pushes to `main` branch trigger deployments
- Changes in `admin/` → Admin redeploys
- Changes in `beta/` → Beta redeploys
- Changes in `home/` → Home redeploys
- Changes in `dataLayer/` → All apps redeploy

### Environment Variables

**Admin App Required**:
- `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` (optional)

**Beta App Required**:
- `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`

**Home App Required**:
- `DATABASE_URL`

---

## ⚠️ Critical Rules & Warnings

### Monorepo Rules

1. **❌ NEVER run `pnpm install` in app folders**
   - ✅ Always run from root: `pnpm install`
   - ✅ Only root should have `pnpm-lock.yaml`

2. **❌ NEVER create schema files in apps**
   - ✅ Only edit: `dataLayer/prisma/schema/` directory
   - ✅ Never create: `admin/prisma/`, `beta/prisma/`, or `home/prisma/`

3. **✅ ALWAYS generate Prisma after schema changes**
   - Run: `cd dataLayer && pnpm prisma:generate`
   - Test all apps build successfully

4. **✅ ALWAYS test all apps after schema changes**
   - Run: `pnpm build:all` from root

5. **✅ ALWAYS commit from root folder**
   - Even if working in subfolder, commit from root
   - Use: `git add admin/` or `git add beta/` for specific packages

### Code Rules

1. ✅ **Use shadcn/ui components** - Don't create custom UI from scratch
2. ✅ **Admin: Use server actions** - For mutations, prefer server actions
3. ✅ **Beta/Home: Use REST API** - All data operations via API endpoints
4. ✅ **API Design for Mobile** - Beta/Home APIs should be mobile-friendly
5. ✅ **Use TypeScript strictly** - No `any`, use proper types
6. ✅ **Use semantic colors** - No hardcoded colors
7. ✅ **Follow file organization** - Put files in correct folders
8. ✅ **Use path aliases** - `@/components` not `../../components`

### Authentication Rules

1. **Admin App**: All routes except `/login` and `/no-permissions` are protected
2. **Beta App**: Public blog platform, optional authentication for engagement features
3. **Home App**: No authentication required (fresh app)

### Database Rules

1. ✅ **Single source of truth**: `dataLayer/prisma/schema/` directory
2. ✅ **Always generate after changes**: `pnpm prisma:generate`
3. ✅ **Test all apps**: After schema changes (admin, beta, home)
4. ✅ **Use Prisma client singleton**: Import from `@/lib/prisma` or `@/lib/db`

---

## 🔄 Common Patterns

### Admin App - Server Action Pattern

```typescript
// admin/actions/updateUser.ts
'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function updateUser(id: string, data: unknown) {
  const validated = updateUserSchema.parse(data);
  return await prisma.user.update({
    where: { id },
    data: validated,
  });
}
```

### Admin App - Client Component with Server Action

```typescript
// admin/components/UserForm.tsx
'use client';

import { useState } from 'react';
import { updateUser } from '@/actions/updateUser';

export function UserForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await updateUser(userId, {
        name: formData.get('name'),
        email: formData.get('email'),
      });
    } finally {
      setLoading(false);
    }
  }

  return <form action={handleSubmit}>...</form>;
}
```

### Beta/Home App - API Route Pattern

```typescript
// beta/app/api/articles/route.ts (or home/app/api/articles/route.ts)
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createArticleSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  clientId: z.string(),
});

export async function GET() {
  try {
    const articles = await db.article.findMany({
      where: { status: 'PUBLISHED' },
    });
    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createArticleSchema.parse(body);
    const article = await db.article.create({ data: validated });
    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
```

### Beta/Home App - Client Component with API Fetch

```typescript
// beta/components/ArticleList.tsx (or home/components/ArticleList.tsx)
'use client';

import { useState, useEffect } from 'react';

export function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      const res = await fetch('/api/articles');
      const data = await res.json();
      if (data.success) {
        setArticles(data.data);
      }
      setLoading(false);
    }
    fetchArticles();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{/* Render articles */}</div>;
}
```

---

## ✅ Error Prevention Checklist

### Before Making Changes

- [ ] **Identify which package** you're editing (admin/beta/home/dataLayer)
- [ ] **Check if file is shared** (schema files affect all apps)
- [ ] **Verify file path** is correct
- [ ] **Understand dependencies** (what imports this file?)
- [ ] **Check authentication** (is route protected?)
- [ ] **Review similar patterns** (how is this done elsewhere?)

### When Editing Schema

- [ ] **Only edit** files in `dataLayer/prisma/schema/` directory
- [ ] **Run** `pnpm prisma:generate` after changes
- [ ] **Test all apps**: `pnpm build:all` from root
- [ ] **Check for breaking changes** (removed fields, changed types)

### When Adding Components

- [ ] **Use shadcn/ui** if component exists
- [ ] **Place in correct folder** (ui/common/[feature]/layout)
- [ ] **Add "use client"** only if needed (state, hooks, events)
- [ ] **Use path aliases** (`@/components` not relative paths)
- [ ] **Follow naming conventions** (PascalCase for components)

### When Adding Routes

- [ ] **Admin**: Check if route needs protection (add to middleware)
- [ ] **Admin**: Check if route needs permissions (add to UserRoutePermission)
- [ ] **Beta**: Public routes (browse articles) - No auth needed; Protected routes (profile, comments) - Require authentication; NO admin routes (all admin in `admin/` package)
- [ ] **Home**: Fresh app, add routes as needed

### When Using Database

- [ ] **Import from** `@/lib/prisma` or `@/lib/db` (singleton pattern)
- [ ] **Use proper types** from `@prisma/client`
- [ ] **Handle errors** (try/catch, null checks)
- [ ] **Use transactions** for multiple operations

### Before Committing

- [ ] **Build succeeds** (all apps if schema changed)
- [ ] **No TypeScript errors**
- [ ] **No linting errors**
- [ ] **Test locally** (`pnpm dev:admin`, `pnpm dev:beta`, `pnpm dev:home`)
- [ ] **Check file paths** (correct package: admin/beta/home/dataLayer)
- [ ] **Verify imports** (path aliases, workspace imports)

---

## 📚 Additional Resources

### Key Documentation Files

- `MONOREPO-SETUP.md` - Setup and workflow guide
- `AI-BUSINESS-MODEL-GUIDE.md` - Business model and decision framework
- `doc/VERCEL-DEPLOYMENT-GUIDE.md` - Deployment guide

### Important Scripts

**Root**:
- `pnpm install` - Install all packages
- `pnpm dev:admin` - Run admin dev server
- `pnpm dev:beta` - Run beta dev server
- `pnpm dev:home` - Run home dev server
- `pnpm build:all` - Build all apps
- `pnpm prisma:generate` - Generate Prisma client

**DataLayer**:
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:studio` - Open Prisma Studio

---

## 🔍 Debugging Tips

### Common Issues

1. **Prisma Client not found**
   - Solution: Run `cd dataLayer && pnpm prisma:generate`

2. **Build fails after schema change**
   - Solution: Generate Prisma client, then rebuild all apps

3. **Type errors after schema change**
   - Solution: Restart TypeScript server, regenerate Prisma client

4. **Route not protected** (Admin)
   - Solution: Check `admin/proxy.ts` middleware configuration

5. **Permission denied** (Admin)
   - Solution: Check `UserRoutePermission` model, verify user has route assigned

6. **Import errors**
   - Solution: Check path aliases in `tsconfig.json`, use `@/` prefix

---

## 📝 Final Notes

This document should be your **first reference** when working with this codebase. Always:

1. ✅ **Read this document first** before making changes
2. ✅ **Follow the patterns** established in the codebase
3. ✅ **Test all apps** after schema changes (admin, beta, home)
4. ✅ **Use TypeScript strictly** - no `any` types
5. ✅ **Use shadcn/ui** for UI components
6. ✅ **Follow file organization** patterns
7. ✅ **Respect monorepo rules** - one lockfile, shared schema
8. ✅ **Identify correct package** - admin, beta, home, or dataLayer

**Remember**: This is a production monorepo with live users. Every change must be:
- ✅ **Surgical** - Only touch what's needed
- ✅ **Tested** - Build and test before committing
- ✅ **Safe** - No breaking changes without migration
- ✅ **Documented** - Clear commit messages

---

**Last Updated**: 2024  
**Version**: 2.0 - Refactored and summarized  
**Maintained By**: AI Assistant Instructions
