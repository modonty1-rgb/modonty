# Monorepo + Vercel — Settings Reference

**Real configs from this repo. Use as checklist when adding a new app.**

## Workspace

### `pnpm-workspace.yaml` (root)

```yaml
packages:
  - 'admin'
  - 'modonty'
  - 'console'
  - 'dataLayer'
```

**For new app**: Add folder name to `packages`.

### Root `package.json`

```json
{
  "name": "@modonty/monorepo",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@10.12.3",
  "scripts": {
    "dev:<app>": "pnpm --filter @modonty/<app> dev",
    "build:<app>": "pnpm --filter @modonty/<app> build",
    "build:all": "pnpm build:admin && pnpm build:modonty && pnpm build:console",
    "prisma:generate": "pnpm --filter @modonty/database prisma:generate",
    "prisma:studio": "pnpm --filter @modonty/database prisma:studio"
  }
}
```

**For new app**: Add `dev:<app>`, `build:<app>`, and include `build:<app>` in `build:all`. Use `@modonty/<app>` as package name.

## Shared DB: `dataLayer`

### `dataLayer/package.json`

```json
{
  "name": "@modonty/database",
  "version": "0.1.0",
  "private": true,
  "main": "./index.ts",
  "types": "./index.ts",
  "scripts": {
    "prisma:generate": "prisma generate --schema=./prisma/schema/schema.prisma",
    "prisma:push": "prisma db push --schema=./prisma/schema/schema.prisma",
    "prisma:studio": "prisma studio --schema=./prisma/schema/schema.prisma",
    "seed": "tsx prisma/seed.ts",
    "seed:clear": "tsx prisma/seed.ts --clear"
  }
}
```

### `dataLayer/prisma/schema/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

**For new app**: No change in dataLayer. Apps point to `../dataLayer/prisma/schema/schema.prisma`.

## Next.js App Pattern (admin / modonty / console)

### App `package.json`

```json
{
  "name": "@modonty/admin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "^16.0.0",
    "@modonty/database": "workspace:*"
  }
}
```

**For new app**: Change package name, port, and add `@modonty/database` to dependencies.

### App `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: "./tsconfig.json"
  }
};

export default nextConfig;
```

### App `tsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  },
  "extends": "next/tsconfig"
}
```

### App `.env.local`

```env
# Prisma
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/dbname

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3001

# OAuth (if needed)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Vercel Deployment

### Vercel `vercel.json`

```json
{
  "buildCommand": "pnpm build:admin",
  "outputDirectory": "admin/.next"
}
```

**For each app**:
- **Admin**: `pnpm build:admin` → `admin/.next`
- **Modonty**: `pnpm build:modonty` → `modonty/.next`
- **Console**: `pnpm build:console` → `console/.next`

### Environment Variables on Vercel

Set in Vercel dashboard for each project:
```
DATABASE_URL=mongodb+srv://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://admin.modonty.com
```

## Importing Shared Database

In any app (admin, modonty, console):

```typescript
import { db } from "@modonty/database";

// Use it
const articles = await db.article.findMany();
```

## Checklist: Adding a New App

1. [ ] Add folder name to `pnpm-workspace.yaml`
2. [ ] Create `<app>/package.json` with `@modonty/<app>` name
3. [ ] Add `dev:<app>` and `build:<app>` scripts to root `package.json`
4. [ ] Add `@modonty/database` to app dependencies
5. [ ] Create `<app>/tsconfig.json` extending `next/tsconfig`
6. [ ] Create `<app>/next.config.ts`
7. [ ] Create `<app>/.env.local` with required variables
8. [ ] Run `pnpm install` from root
9. [ ] Run `pnpm prisma:generate`
10. [ ] Test with `pnpm dev:<app>`
11. [ ] Test build with `pnpm build:<app>`
12. [ ] Create Vercel project and set environment variables
13. [ ] Deploy and verify
