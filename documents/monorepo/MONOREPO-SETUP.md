# Monorepo Setup Guide

**Complete guide for working with the MODONTY monorepo project.**

---

## 📑 Table of Contents

1. [Quick Reference](#-quick-reference)
2. [Project Structure](#-project-structure)
3. [Daily Workflow](#-daily-workflow)
4. [Git Workflow](#-git-workflow)
5. [Database (Prisma)](#-database-prisma)
6. [Deployment (Vercel)](#-deployment-vercel)
7. [Troubleshooting](#-troubleshooting)
8. [Checklists](#-checklists)

---

## ⚡ Quick Reference

### Essential Commands

```bash
# Navigation & Setup
cd MODONTY                    # Always start at root

# Package Management
pnpm install                  # Install dependencies (root only)
pnpm prisma:generate          # Generate Prisma Client after schema changes

# Development
pnpm dev:admin                # Run admin app
pnpm dev:modonty              # Run modonty app
pnpm dev:console              # Run console app

# Build & Test
pnpm build:admin              # Build admin app
pnpm build:modonty            # Build modonty app
pnpm build:console            # Build console app
pnpm build:all                # Build all apps

# Git Workflow
git pull origin main          # Get latest changes
git add .                     # Stage changes
git commit -m "message"       # Save changes
git push origin main          # Upload to GitHub
```

### Core Rules

1. ✅ **Always work from root** (`MODONTY/`) for all commands
2. ✅ **One schema file**: `dataLayer/prisma/schema.prisma` (ONLY edit this)
3. ✅ **One lockfile**: Only root has `pnpm-lock.yaml` (apps should NOT)
4. ✅ **Always commit from root**, even if editing files in subfolders
5. ✅ **Generate Prisma** after schema changes: `pnpm prisma:generate`
6. ✅ **Test locally** before pushing: `pnpm build:all`

---

## 📦 Project Structure

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
        └── schema.prisma     ← Database schema (ONLY edit this)
```

### Important Rules

- **One Git repository** = All apps together
- **One database schema** = All apps share the same database
- **3 Vercel projects** = Each app deploys separately
- **One lockfile** = Only root has `pnpm-lock.yaml`

---

## 🔄 Daily Workflow

### Starting Work

```bash
cd MODONTY
git pull origin main          # Get latest changes
pnpm install                  # Install new packages (if any)
pnpm dev:admin                # Start working (or dev:modonty/dev:console)
```

### Making Changes

1. Edit files in the appropriate app folder (`admin/`, `modonty/`, or `console/`)
2. Test locally: `pnpm dev:admin` (or respective app)
3. Build to verify: `pnpm build:admin` (or `pnpm build:all`)
4. Commit from root: `git add .` → `git commit -m "message"` → `git push origin main`

### Complete Example

```bash
# 1. Start at root
cd MODONTY
git pull origin main

# 2. Work in app folder
cd admin                    # or modonty/console
# Make your changes...

# 3. Test from root
cd ..
pnpm dev:admin
pnpm build:admin

# 4. Commit from root
git add admin/
git commit -m "Add user profile feature"
git push origin main
```

---

## 🔄 Git Workflow

### First Time Setup

```bash
cd MODONTY
git status                   # Check if initialized

# If not initialized:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/MODONTY.git
git branch -M main
git push -u origin main
```

### Daily Git Workflow

```bash
# 1. Get latest code
git pull origin main

# 2. Make your changes
# (edit files, add features, fix bugs)

# 3. Save and upload
git add .                    # or git add admin/ for specific folder
git commit -m "Clear description"
git push origin main
```

### Git Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `git pull` | Download latest code | Start of day |
| `git add .` | Stage all changes | After making changes |
| `git add folder/` | Stage specific folder | When committing one app |
| `git commit -m "msg"` | Save changes | After `git add` |
| `git push` | Upload to GitHub | After `git commit` |
| `git status` | Check changes | Anytime |

### Commit Messages

✅ **Good**: `"Add user login page"`, `"Fix button not working"`, `"Schema: add email field"`  
❌ **Bad**: `"fix"`, `"update"`, `"changes"`

### ⚠️ Important: Always Commit from Root

- ✅ Edit files anywhere (`admin/`, `modonty/`, `console/`, `dataLayer/`)
- ✅ Commit from root folder (`MODONTY/`)
- ✅ This allows seeing all changes across apps

---

## 🗄️ Database (Prisma)

### Schema Location

```
dataLayer/prisma/schema.prisma  ← Edit ONLY this file
           ↓
    (Prisma generates code)
           ↓
    ┌──────┬──────┬──────┐
    ↓      ↓      ↓
admin/  modonty/ console/
```

### Updating Schema

```bash
# 1. Edit schema
# Open: dataLayer/prisma/schema.prisma

# 2. Generate Prisma Client (from root)
cd MODONTY
pnpm prisma:generate

# 3. Test all apps
pnpm build:all

# 4. Commit
git add dataLayer/prisma/schema.prisma
git commit -m "Schema: add user phone field"
git push origin main
```

### Prisma Commands

```bash
pnpm prisma:generate          # Generate Prisma Client (after schema changes)
pnpm prisma:studio            # Open database viewer
```

### Rules

- ✅ **ONLY edit**: `dataLayer/prisma/schema.prisma`
- ❌ **NEVER create** schema files in apps
- ✅ **Always run** `pnpm prisma:generate` after editing schema
- ✅ **Test all apps** before committing schema changes

---

## 🚀 Deployment (Vercel)

### Setup: 3 Separate Projects

Each app needs its own Vercel project (all connect to same GitHub repo):

1. **Admin App Project**
   - Project Name: `modonty-admin` (any name)
   - Root Directory: `admin` ⚠️
   - Build Command: `cd ../.. && pnpm install && pnpm build:admin`

2. **Modonty App Project**
   - Project Name: `modonty-platform` (any name)
   - Root Directory: `modonty` ⚠️
   - Build Command: `cd ../.. && pnpm install && pnpm build:modonty`

3. **Console App Project**
   - Project Name: `modonty-console` (any name)
   - Root Directory: `console` ⚠️
   - Build Command: `cd ../.. && pnpm install && pnpm build:console`

### Setup Steps (for each app)

1. Go to [vercel.com](https://vercel.com) → "Add New Project"
2. Connect GitHub → Select `MODONTY` repository
3. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: `admin`/`modonty`/`console` ⚠️
   - Build Command: (see above)
   - Output Directory: `.next`
   - Install Command: `pnpm install`
4. Add Environment Variables:
   - `DATABASE_URL` (required for all 3 projects)
   - Other vars (AUTH_SECRET, NEXTAUTH_URL, etc.)
5. Deploy

### Auto-Deployment

After setup:
- ✅ Pushing to GitHub triggers auto-deploy
- ✅ Changing `admin/` → only admin redeploys
- ✅ Changing `modonty/` → only modonty redeploys
- ✅ Changing `console/` → only console redeploys
- ✅ Changing `dataLayer/` → all apps redeploy

---

## 🔧 Troubleshooting

### Problem: `pnpm install` fails

```bash
# Clean and reinstall
rm -rf node_modules admin/node_modules modonty/node_modules console/node_modules dataLayer/node_modules
rm -f admin/pnpm-lock.yaml modonty/pnpm-lock.yaml console/pnpm-lock.yaml dataLayer/pnpm-lock.yaml
cd MODONTY
pnpm install
```

### Problem: Multiple lockfiles warning

**Warning**: `⚠ Warning: Next.js inferred your workspace root, but it may not be correct. We detected multiple lockfiles...`

**Cause**: Apps have their own `pnpm-lock.yaml` (should only be at root)

**Fix**:
```bash
rm -f admin/pnpm-lock.yaml modonty/pnpm-lock.yaml console/pnpm-lock.yaml
cd MODONTY
pnpm install
```

### Problem: Prisma Client not found

```bash
cd MODONTY
pnpm prisma:generate
```

### Problem: Vercel build fails

**Check**:
1. Root Directory matches folder name (`admin`, `modonty`, or `console`)
2. Environment variables are set (especially `DATABASE_URL`)
3. Local build works: `pnpm build:admin` (or respective app)

**Fix**: Test locally first, then verify Vercel settings match

### Problem: Git conflicts

```bash
git pull origin main

# If conflicts appear:
# 1. Open conflicted files
# 2. Remove conflict markers (<<<<<<<, =======, >>>>>>>)
# 3. Keep desired code
# 4. Save file

git add .
git commit -m "Resolve conflicts"
git push origin main
```

### Problem: Schema changes not working

```bash
cd MODONTY
pnpm prisma:generate          # Regenerate Prisma Client
pnpm build:all                # Test all apps
```

---

## ✅ Checklists

### Before Starting Work

- [ ] `git pull origin main`
- [ ] `pnpm install` (if new packages)
- [ ] Verify only root has `pnpm-lock.yaml`

### Before Committing

- [ ] Test locally: `pnpm dev:admin` (or respective app)
- [ ] Build works: `pnpm build:admin` (or `pnpm build:all`)
- [ ] Clear commit message written

### Before Pushing

- [ ] `git add .` (or specific folder)
- [ ] `git commit -m "clear message"`
- [ ] `git push origin main`

### When Changing Schema

- [ ] Edit `dataLayer/prisma/schema.prisma`
- [ ] Run `pnpm prisma:generate` (from root)
- [ ] Test all apps: `pnpm build:all`
- [ ] Commit and push

---

## 📚 Quick Q&A

**Q: Where do I edit the database structure?**  
A: Only in `dataLayer/prisma/schema.prisma`

**Q: How do I test my changes?**  
A: From root: `pnpm dev:admin` (or `dev:modonty`/`dev:console`)

**Q: How do I save my code?**  
A: From root: `git add .` → `git commit -m "message"` → `git push origin main`

**Q: Why 3 Vercel projects?**  
A: Each app (admin, modonty, console) needs its own deployment project

**Q: What happens when I push to GitHub?**  
A: Vercel auto-deploys apps based on which files changed

**Q: Can apps have their own lockfiles?**  
A: No! Only root should have `pnpm-lock.yaml`. Delete any in app folders.

**Q: How do I run scripts?**  
A: Always from root: `pnpm dev:admin`, `pnpm build:all`, etc.

---

## 🎓 Key Takeaways

1. **One Git repo** = All apps together
2. **One schema file** = `dataLayer/prisma/schema.prisma`
3. **One lockfile** = Only at root
4. **Always generate Prisma** after schema changes
5. **Test locally** before pushing
6. **Work from root** for all commands

---

**Last Updated**: 2024  
**Version**: 3.1 - Refactored and summarized
