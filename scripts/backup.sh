#!/bin/bash
# ═══════════════════════════════════════════
# MODONTY Database Backup — manual / scheduled
#
#   bash scripts/backup.sh prod    → the LIVE database  (modonty)
#   bash scripts/backup.sh dev     → the test database  (modonty_dev)
#
# The target is REQUIRED. It used to be inferred from .env.shared, which points at
# modonty_dev — so every "backup" taken before 2026-08-04 was a copy of the TEST
# database while everyone believed production was protected. Nothing in the output
# named the database, so the mistake was invisible. Hence: explicit argument, and the
# resolved database name printed before a single byte is read.
#
# Decisions behind this file: documents/tasks/BACKUP-STRATEGY-v1.html (ق9)
# ═══════════════════════════════════════════

set -uo pipefail

MONGODUMP="/c/Program Files/MongoDB/Tools/100/bin/mongodump.exe"
ROOT="c:/Users/w2nad/Desktop/dreamToApp/MODONTY"
BACKUP_DIR="$ROOT/backups"
ENV_FILE="$ROOT/.env.shared"
KEEP=10   # per target — dev backups never evict prod ones

TARGET_ENV="${1:-}"

usage() {
  echo "✗ Missing target."
  echo ""
  echo "  Usage: bash scripts/backup.sh prod|dev"
  echo ""
  echo "    prod  → modonty      (LIVE data)"
  echo "    dev   → modonty_dev  (test data)"
  echo ""
  echo "  No default on purpose: guessing the target is what made every"
  echo "  earlier backup silently copy the test database."
  exit 1
}

case "$TARGET_ENV" in
  prod) DB_NAME="modonty";     PREFIX="PROD" ;;
  dev)  DB_NAME="modonty_dev"; PREFIX="DEV"  ;;
  *)    usage ;;
esac

[ -f "$ENV_FILE" ] || { echo "✗ .env.shared not found at $ENV_FILE"; exit 1; }

BASE_URI=$(grep "^DATABASE_URL=" "$ENV_FILE" | head -1 | sed 's/DATABASE_URL=//' | tr -d '"' | tr -d "'" | tr -d '\r')
[ -n "$BASE_URI" ] || { echo "✗ DATABASE_URL not found in .env.shared"; exit 1; }

# Swap whatever database the shared URI names for the one this run explicitly asked for.
URI=$(echo "$BASE_URI" | sed -E "s#(mongodb\+srv://[^/]+)/[^?]*#\1/$DB_NAME#")

# Confirm the swap actually produced the requested database — never dump on an assumption.
RESOLVED_DB=$(echo "$URI" | sed -E 's#.*/([^/?]+)\?.*#\1#')
if [ "$RESOLVED_DB" != "$DB_NAME" ]; then
  echo "✗ Refusing to run — resolved database '$RESOLVED_DB' does not match requested '$DB_NAME'."
  echo "  The DATABASE_URL in .env.shared may have an unexpected shape."
  exit 1
fi

TIMESTAMP=$(date +%Y-%m-%d_%H-%M)
TARGET="$BACKUP_DIR/$PREFIX-$TIMESTAMP"

echo "═══════════════════════════════════════════"
echo "  MODONTY Backup"
echo "  Database : $RESOLVED_DB   <-- verify this line"
echo "  Target   : $PREFIX"
echo "  Output   : $TARGET"
echo "═══════════════════════════════════════════"

mkdir -p "$TARGET"

echo ""
echo "→ Dumping..."
"$MONGODUMP" --uri="$URI" --out="$TARGET" --quiet
DUMP_STATUS=$?

if [ $DUMP_STATUS -ne 0 ]; then
  echo ""
  echo "✗ Backup FAILED (mongodump exit $DUMP_STATUS)."
  rmdir "$TARGET" 2>/dev/null
  exit 1
fi

FILE_COUNT=$(find "$TARGET" -name "*.bson" | wc -l)
BACKUP_SIZE=$(du -sh "$TARGET" | cut -f1)

# An empty dump exits 0. Treat "no collections" as a failure rather than a green tick.
if [ "$FILE_COUNT" -eq 0 ]; then
  echo ""
  echo "✗ Backup produced ZERO collections — treating as failure."
  echo "  Check credentials and that '$RESOLVED_DB' is the right database name."
  exit 1
fi

echo ""
echo "✓ Backup successful"
echo "  Database   : $RESOLVED_DB"
echo "  Collections: $FILE_COUNT"
echo "  Size       : $BACKUP_SIZE"
echo ""

echo "$TIMESTAMP | $PREFIX | db=$RESOLVED_DB | $FILE_COUNT collections | $BACKUP_SIZE" >> "$BACKUP_DIR/backup-log.txt"

# Retention is per target: 10 prod + 10 dev, so a run of dev backups can never
# push the last production copy off the end.
BACKUP_COUNT=$(ls -d "$BACKUP_DIR"/$PREFIX-*/ 2>/dev/null | wc -l)
while [ "$BACKUP_COUNT" -gt "$KEEP" ]; do
  OLDEST=$(ls -d "$BACKUP_DIR"/$PREFIX-*/ | head -1)
  echo "→ Removing old backup: $(basename "$OLDEST")"
  rm -rf "$OLDEST"
  BACKUP_COUNT=$((BACKUP_COUNT - 1))
done

echo "═══════════════════════════════════════════"
echo "  $PREFIX backups kept: $(ls -d "$BACKUP_DIR"/$PREFIX-*/ 2>/dev/null | wc -l)/$KEEP"
echo "═══════════════════════════════════════════"
