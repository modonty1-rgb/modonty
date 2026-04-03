#!/bin/bash
# ═══════════════════════════════════════════
# MODONTY Database Backup Script
# Run: bash scripts/backup.sh
# ═══════════════════════════════════════════

MONGODUMP="/c/Program Files/MongoDB/Tools/100/bin/mongodump.exe"
BACKUP_DIR="c:/Users/w2nad/Desktop/dreamToApp/MODONTY/backups"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M)
TARGET="$BACKUP_DIR/backup-$TIMESTAMP"

# Read DATABASE_URL from admin .env (never hardcode credentials)
ENV_FILE="c:/Users/w2nad/Desktop/dreamToApp/MODONTY/admin/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "✗ Error: .env file not found at $ENV_FILE"
  exit 1
fi

URI=$(grep "^DATABASE_URL=" "$ENV_FILE" | head -1 | sed 's/DATABASE_URL=//' | tr -d '"' | tr -d "'" | tr -d '\r')
if [ -z "$URI" ]; then
  echo "✗ Error: DATABASE_URL not found in .env"
  exit 1
fi

echo "═══════════════════════════════════════════"
echo "  MODONTY Backup — $TIMESTAMP"
echo "═══════════════════════════════════════════"

# Create backup directory
mkdir -p "$TARGET"

# Run mongodump
echo ""
echo "→ Starting backup..."
"$MONGODUMP" --uri="$URI" --out="$TARGET" --quiet

if [ $? -eq 0 ]; then
  FILE_COUNT=$(find "$TARGET" -name "*.bson" | wc -l)
  BACKUP_SIZE=$(du -sh "$TARGET" | cut -f1)

  echo ""
  echo "✓ Backup successful!"
  echo "  Location: $TARGET"
  echo "  Collections: $FILE_COUNT"
  echo "  Size: $BACKUP_SIZE"
  echo ""

  # Save backup log
  echo "$TIMESTAMP | $FILE_COUNT collections | $BACKUP_SIZE" >> "$BACKUP_DIR/backup-log.txt"

  # Keep only last 10 backups
  BACKUP_COUNT=$(ls -d "$BACKUP_DIR"/backup-*/ 2>/dev/null | wc -l)
  if [ "$BACKUP_COUNT" -gt 10 ]; then
    OLDEST=$(ls -d "$BACKUP_DIR"/backup-*/ | head -1)
    echo "→ Cleaning old backup: $(basename $OLDEST)"
    rm -rf "$OLDEST"
  fi

  echo "═══════════════════════════════════════════"
  echo "  Total backups: $(ls -d "$BACKUP_DIR"/backup-*/ 2>/dev/null | wc -l)/10"
  echo "═══════════════════════════════════════════"
else
  echo ""
  echo "✗ Backup FAILED! Check your connection."
  exit 1
fi
