# Monorepo Setup Guide

**Complete guide for working with the MODONTY monorepo project.**

## Quick Reference

### Essential Commands

```bash
cd MODONTY                    # Start at root

# Package management
pnpm install                  # Install dependencies (root only)
pnpm prisma:generate          # Generate Prisma Client after schema changes

# Development
pnpm dev:admin                # Run admin app
pnpm dev:modonty              # Run modonty app
pnpm dev:console              # Run console app

# Build & Test
pnpm build:admin              # Build admin
pnpm build:modonty            # Build modonty
pnpm build:console            # Build console
pnpm build:all                # Build all

# Git
git pull origin main          # Get latest
git add .                     # Stage
git commit -m "message"       # Save
git push origin main          # Upload
```

### Core Rules

1. ✅ **Always work from root** (`MODONTY/`)
2. ✅ **One schema file**: `dataLayer/prisma/schema.prisma` (ONLY edit this)
3. ✅ **One lockfile**: Only root has `pnpm-lock.yaml`
4. ✅ **Always commit from root**
5. ✅ **Generate Prisma** after schema changes: `pnpm prisma:generate`
6. ✅ **Test locally** before pushing: `pnpm build:all`

## Project Structure

```
MODONTY/                      ← Root (monorepo)
│
├── pnpm-lock.yaml            ← ONLY lockfile (root only)
├── pnpm-workspace.yaml       ← Workspace config
├── package.json              ← Root package with scripts
│
├── admin/                    ← Admin app
│   ├── package.json
│   └── ...
│
├── modonty/                  ← Modonty platform app
│   ├── package.json
│   └── ...
│
├── console/                  ← Console app
│   ├── package.json
│   └── ...
│
└── dataLayer/                ← Shared database
    └── prisma/
        └── schema.prisma     ← Database schema (ONLY edit)
```

### Important Rules

- **One Git repository** = All apps together
- **One database schema** = All apps share the same database
- **3 Vercel projects** = Each app deploys separately
- **One lockfile** = Only root has `pnpm-lock.yaml`

## Daily Workflow

### Starting Work

```bash
cd MODONTY
git pull origin main          # Get latest changes
pnpm install                  # Install dependencies
pnpm prisma:generate          # Regenerate Prisma Client
pnpm dev:admin                # Start admin app
# In another terminal:
pnpm dev:modonty              # Start modonty app
```

### Making Changes

1. Edit files in `admin/`, `modonty/`, `console/`, or `dataLayer/`
2. If editing schema: Run `pnpm prisma:generate`
3. Test locally: `pnpm build:all`
4. Commit from root: `git add .` → `git commit` → `git push`

### Database (Prisma)

```bash
# After schema.prisma changes
pnpm prisma:generate         # Generate Prisma Client
pnpm db:push                  # Push changes to database
pnpm db:seed                  # Seed database (if seeding)

# View database
pnpm db:studio                # Open Prisma Studio (localhost:5555)
```

### Deployment (Vercel)

- **Admin**: `admin.modonty.com`
- **Modonty**: `modonty.com`
- **Console**: `console.modonty.com`

Each app deploys independently to Vercel.

## Troubleshooting

### Issue: Prisma client not found

```bash
cd dataLayer
pnpm prisma:generate
cd ..
pnpm install
```

### Issue: Lockfile conflicts

**Never edit `pnpm-lock.yaml` manually.**

```bash
rm pnpm-lock.yaml
pnpm install
```

### Issue: Build fails in app

```bash
# Regenerate Prisma in all apps
pnpm prisma:generate

# Rebuild
pnpm build:all
```

### Issue: Port conflicts

- Admin: `localhost:3001`
- Modonty: `localhost:3000`
- Console: `localhost:3002`

Adjust in each app's `package.json` dev script.

## Checklists

### Before Pushing to GitHub

- [ ] `pnpm install` (root)
- [ ] `pnpm prisma:generate`
- [ ] `pnpm build:all`
- [ ] Test all apps locally
- [ ] No console errors
- [ ] Git status clean

### Merging to Main

- [ ] All builds pass
- [ ] All tests pass (if applicable)
- [ ] Database schema consistent
- [ ] Reviewed by team member
- [ ] Ready for production
