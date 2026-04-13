# Database Backup & Restore Guide

> Universal guide for MongoDB Atlas (Free Tier M0) projects.
> Copy this system to any project that uses MongoDB Atlas without paid backup.

---

## Why This Exists

MongoDB Atlas Free Tier (M0) has **ZERO automatic backups**. If your data is lost, deleted, or corrupted — there is no recovery. This guide sets up a local backup system using `mongodump` / `mongorestore` (official MongoDB tools).

---

## Prerequisites

### 1. Install MongoDB Database Tools (one time)

- Download: https://www.mongodb.com/try/download/database-tools
- Choose: **Windows x86_64 → MSI**
- Install and verify:

```bash
"C:\Program Files\MongoDB\Tools\100\bin\mongodump.exe" --version
```

### 2. Project Structure

```
project-root/
├── backups/              ← backup files (gitignored)
│   ├── backup-2026-04-03_14-39/
│   ├── auto-2026-04-03_03-00/
│   └── backup-log.txt
├── scripts/
│   ├── backup.sh         ← manual backup (bash)
│   ├── restore.sh         ← manual restore (bash)
│   ├── backup-auto.bat    ← auto daily backup (Windows)
│   └── setup-daily-backup.bat ← register daily task (run once as admin)
├── admin/.env             ← contains DATABASE_URL
└── .gitignore             ← must include: backups/
```

### 3. .gitignore

Add this line to prevent backups and credentials from being pushed to git:

```
backups/
```

---

## How It Works

### Architecture

```
┌──────────────────────────────────────────────────┐
│                 MongoDB Atlas (M0)                │
│              Your production database             │
└───────────────────┬──────────────────────────────┘
                    │
        mongodump (download) / mongorestore (upload)
                    │
┌───────────────────▼──────────────────────────────┐
│              Your Local Machine                   │
│                                                   │
│  backups/                                         │
│  ├── backup-YYYY-MM-DD_HH-MM/  (manual)         │
│  ├── auto-YYYY-MM-DD_HH-MM/    (daily auto)     │
│  └── pre-restore-*/             (safety copies)  │
└──────────────────────────────────────────────────┘
```

### Security Rules

- **NEVER** hardcode `DATABASE_URL` in scripts — always read from `.env`
- **NEVER** push `backups/` to git — always gitignore
- **NEVER** push `.env` to git — always gitignore
- Scripts are safe to commit (they contain no secrets)

---

## Scripts

### 1. Manual Backup (`scripts/backup.sh`)

**When to run:**
- Before every `git push`
- Before any database schema change
- Before any risky operation

**What it does:**
1. Reads `DATABASE_URL` from `.env`
2. Runs `mongodump` to create a full binary copy
3. Saves to `backups/backup-YYYY-MM-DD_HH-MM/`
4. Logs to `backups/backup-log.txt`
5. Keeps last 10 manual backups, deletes oldest

**Command:**

```bash
bash scripts/backup.sh
```

**Script template:**

```bash
#!/bin/bash
MONGODUMP="/c/Program Files/MongoDB/Tools/100/bin/mongodump.exe"
BACKUP_DIR="<PROJECT_ROOT>/backups"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M)
TARGET="$BACKUP_DIR/backup-$TIMESTAMP"

# Read DATABASE_URL from .env (NEVER hardcode)
ENV_FILE="<PROJECT_ROOT>/<app-folder>/.env"
URI=$(grep "^DATABASE_URL=" "$ENV_FILE" | head -1 | sed 's/DATABASE_URL=//' | tr -d '"' | tr -d "'" | tr -d '\r')

mkdir -p "$TARGET"
"$MONGODUMP" --uri="$URI" --out="$TARGET" --quiet

# Log result
if [ $? -eq 0 ]; then
  FILE_COUNT=$(find "$TARGET" -name "*.bson" | wc -l)
  BACKUP_SIZE=$(du -sh "$TARGET" | cut -f1)
  echo "$TIMESTAMP | $FILE_COUNT collections | $BACKUP_SIZE" >> "$BACKUP_DIR/backup-log.txt"
fi

# Keep only last 10 backups
BACKUP_COUNT=$(ls -d "$BACKUP_DIR"/backup-*/ 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 10 ]; then
  OLDEST=$(ls -d "$BACKUP_DIR"/backup-*/ | head -1)
  rm -rf "$OLDEST"
fi
```

---

### 2. Manual Restore (`scripts/restore.sh`)

**When to run:**
- When you need to recover lost data
- When you want to rollback to a previous state

**What it does:**
1. Lists all available backups with sizes
2. You pick which one to restore
3. **Safety: backs up current data BEFORE restoring** (to `pre-restore-*`)
4. Requires typing "RESTORE" to confirm
5. Replaces database with selected backup

**Command:**

```bash
bash scripts/restore.sh
```

**Safety flow:**

```
User picks backup → Script saves current DB first → Then restores selected backup
                     ↓
              pre-restore-* (safety net — you can always go back)
```

**Script template:**

```bash
#!/bin/bash
MONGORESTORE="/c/Program Files/MongoDB/Tools/100/bin/mongorestore.exe"
MONGODUMP="/c/Program Files/MongoDB/Tools/100/bin/mongodump.exe"
BACKUP_DIR="<PROJECT_ROOT>/backups"

# Read DATABASE_URL from .env
ENV_FILE="<PROJECT_ROOT>/<app-folder>/.env"
URI=$(grep "^DATABASE_URL=" "$ENV_FILE" | head -1 | sed 's/DATABASE_URL=//' | tr -d '"' | tr -d "'" | tr -d '\r')

# List backups, let user choose
# ...

# ALWAYS backup current data before restoring
PRE_RESTORE="$BACKUP_DIR/pre-restore-$(date +%Y-%m-%d_%H-%M)"
"$MONGODUMP" --uri="$URI" --out="$PRE_RESTORE" --quiet

# Require typing RESTORE to confirm
# ...

# Restore
"$MONGORESTORE" --uri="$URI" --dir="$SELECTED/modonty" --nsInclude="<db-name>.*" --drop --quiet
```

---

### 3. Auto Daily Backup (`scripts/backup-auto.bat`)

**What it does:**
- Runs automatically every day at 3:00 AM via Windows Task Scheduler
- Creates backups in `backups/auto-YYYY-MM-DD_HH-MM/`
- Logs to `backups/backup-log.txt`

**Setup (one time — run as Administrator):**

```
Right-click scripts/setup-daily-backup.bat → Run as administrator
```

**`setup-daily-backup.bat` template:**

```bat
@echo off
schtasks /create /tn "<PROJECT>-DailyBackup" /tr "<PATH>\scripts\backup-auto.bat" /sc daily /st 03:00 /f
```

**Manage the scheduled task:**

```bash
# Check if it's registered
schtasks /query /tn "<PROJECT>-DailyBackup"

# Run it manually
schtasks /run /tn "<PROJECT>-DailyBackup"

# Remove it
schtasks /delete /tn "<PROJECT>-DailyBackup" /f
```

---

### 4. Admin Dashboard (Optional)

If the project has an admin panel (Next.js), add a Database Overview page:

**Server action (`run-backup.ts`):**
- Check `process.env.NODE_ENV !== "production"` — only works on localhost
- Read `DATABASE_URL` from `.env` using `fs.readFileSync`
- Run `mongodump` using `child_process.execSync`
- Return success/failure message

**Server action (`run-restore.ts`):**
- Same localhost check
- List available backups from `backups/` directory
- Auto-backup current data before restoring
- Run `mongorestore`

**UI:**
- "Backup Now" button — visible only on localhost
- "Restore" button — opens dialog with backup list + RESTORE confirmation
- On production: shows "only available from localhost" message
- Record counts per table for data health monitoring

---

## When to Backup

| Event | Action |
|-------|--------|
| Before `git push` | `bash scripts/backup.sh` |
| Before schema changes (`prisma db push`) | `bash scripts/backup.sh` |
| Before any risky operation | `bash scripts/backup.sh` |
| Daily at 3 AM | Automatic (Windows Task Scheduler) |
| Before restore | Automatic (restore script does it) |

---

## When to Restore

| Situation | Action |
|-----------|--------|
| Data accidentally deleted | `bash scripts/restore.sh` |
| Bad deployment corrupted data | `bash scripts/restore.sh` |
| Atlas issue / data loss | `bash scripts/restore.sh` |
| Want to rollback to previous state | `bash scripts/restore.sh` |

---

## Adapting to a New Project

1. Copy `scripts/backup.sh`, `scripts/restore.sh`, `scripts/backup-auto.bat`, `scripts/setup-daily-backup.bat`
2. Update paths in each script:
   - `BACKUP_DIR` → your project's backup folder
   - `ENV_FILE` → your project's `.env` location
   - `--nsInclude` in restore → your database name
3. Add `backups/` to `.gitignore`
4. Run `setup-daily-backup.bat` as Administrator
5. (Optional) Add Database Overview page to admin panel

---

## Moving to Paid Plan (M10+)

When you upgrade to a paid MongoDB Atlas tier:

- **M2/M5**: Daily snapshots — supplement with this local backup
- **M10+**: Continuous backup + Point-in-time restore — this local system becomes secondary safety
- Atlas Backup API can be integrated into the admin dashboard for remote backup management

**Until then, this local system is your only protection.**
