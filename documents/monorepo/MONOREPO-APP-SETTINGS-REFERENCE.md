# Monorepo + Vercel — Settings Reference

Real configs from this repo. Use as a checklist when adding a **new app** so it builds and deploys on Vercel like `admin`, `modonty`, `console`.

---

## 1. Workspace

### `pnpm-workspace.yaml` (root)

```yaml
packages:
  - 'admin'
  - 'modonty'
  - 'console'
  - 'dataLayer'
```

**New app:** Add your app folder name to `packages`.

---

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
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^2.8.0"
  }
}
```

**New app:** Add `dev:<app>`, `build:<app>`, and include `build:<app>` in `build:all`. Use `@modonty/<app>` as the package name.

---

## 2. Shared DB: `dataLayer`

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
  },
  "dependencies": {
    "@prisma/client": "^6.19.1",
    "mongodb": "^6.0.0"
  },
  "devDependencies": {
    "prisma": "^6.19.1",
    "tsx": "^4.7.0",
    "typescript": "^5"
  }
}
```

### `dataLayer/prisma/schema/schema.prisma` (head)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

**New app:** No change in dataLayer. Apps point to `../dataLayer/prisma/schema/schema.prisma`.

---

## 3. Next.js app (admin / modonty / console)

### App `package.json` (pattern)

| Field | Value |
|-------|--------|
| `name` | `@modonty/<app>` |
| `prisma.schema` | `"../dataLayer/prisma/schema/schema.prisma"` |
| `scripts.dev` | `"next dev"` |
| `scripts.build` | `"prisma generate && next build"` |
| `scripts.start` | `"next start"` |
| `scripts.lint` | `"next lint"` |
| `scripts.postinstall` | `"npx prisma generate"` |

**Dependencies (min for Prisma + Next):**

- `@modonty/database`: `"workspace:*"`
- `@prisma/client`: `"^6.19.1"`
- `next`: `"^16.1.1"`
- `react`, `react-dom`: `"^19.2.0"`
- `class-variance-authority`, `clsx`, `lucide-react`, `tailwind-merge`, `tailwindcss-animate`

**DevDependencies (min):**

- `prisma`: `"^6.19.1"`
- `@types/node`: `"^20"`, `@types/react`: `"^19"`, `@types/react-dom`: `"^19"`
- `autoprefixer`, `postcss`, `tailwindcss`, `eslint`, `eslint-config-next`, `typescript`

**New app:** Copy an existing app `package.json`, set `name` to `@modonty/<app>`, keep `prisma`, `build`, `postinstall`, and `@modonty/database`.

---

### App `vercel.json`

All three apps use the same shape:

```json
{
  "buildCommand": "pnpm --filter @modonty/<APP> build",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

| App | `buildCommand` |
|-----|----------------|
| admin | `pnpm --filter @modonty/admin build` |
| modonty | `pnpm --filter @modonty/modonty build` |
| console | `pnpm --filter @modonty/console build` |

**New app:** Add `vercel.json` in the app folder with `buildCommand`: `pnpm --filter @modonty/<app> build`, `installCommand`: `pnpm install`, `framework`: `nextjs`.

---

### App `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**New app:** Reuse this; adjust `include` if you drop `.next/dev/types`.

---

### App `next.config.ts` (minimal)

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

**Optional (e.g. admin):** `images.remotePatterns` for Cloudinary, Unsplash, etc.

---

## 4. Vercel project settings (dashboard)

For each app (one Vercel project per app):

| Setting | Value |
|---------|--------|
| **Root Directory** | `<app>` (e.g. `admin`, `modonty`, `console`) |
| **Install Command** | `pnpm install` (or leave default; `vercel.json` overrides) |
| **Build Command** | `pnpm --filter @modonty/<app> build` (or from `vercel.json`) |
| **Framework** | Next.js |

- `pnpm install` and `pnpm --filter ...` are run from the app dir; pnpm finds the workspace root and runs in the monorepo.
- Env: `DATABASE_URL` (and any app-specific vars) in Vercel.

---

## 5. `.gitignore` (relevant)

```
node_modules/
**/pnpm-lock.yaml
!pnpm-lock.yaml
.next/
.env
.env*.local
.env.production
.vercel/
node_modules/.prisma/
```

---

## 6. New app checklist

1. **Workspace:** Add app to `pnpm-workspace.yaml`.
2. **Root scripts:** Add `dev:<app>`, `build:<app>` and extend `build:all` in root `package.json`.
3. **App folder:** Create `package.json` with:
   - `name`: `@modonty/<app>`
   - `prisma.schema`: `../dataLayer/prisma/schema/schema.prisma`
   - `build`: `prisma generate && next build`
   - `postinstall`: `npx prisma generate`
   - `@modonty/database`: `workspace:*`, `@prisma/client`, Next, React, Tailwind, ESLint, Prisma, TypeScript.
4. **App `vercel.json`:**  
   `buildCommand`: `pnpm --filter @modonty/<app> build`,  
   `installCommand`: `pnpm install`,  
   `framework`: `nextjs`.
5. **App `tsconfig.json`:** Same as above (paths `@/*`, Next plugin).
6. **App `next.config.ts`:** Minimal or with `images.remotePatterns` if needed.
7. **Vercel:** New project, Root Directory = `<app>`, set `DATABASE_URL` (and others).
8. **Install:** From repo root: `pnpm install`, `pnpm prisma:generate` (or `pnpm run prisma:generate`).

---

## 7. Commands (from repo root)

```bash
pnpm install
pnpm prisma:generate
pnpm dev:<app>
pnpm build:<app>
pnpm build:all
```

---

*From real configs in this repo. Update when you change structure or versions.*
