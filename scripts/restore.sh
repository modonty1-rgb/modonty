#!/bin/bash
# ═══════════════════════════════════════════
# MODONTY Database Restore Script
# Run: bash scripts/restore.sh
# ═══════════════════════════════════════════

MONGORESTORE="/c/Program Files/MongoDB/Tools/100/bin/mongorestore.exe"
BACKUP_DIR="c:/Users/w2nad/Desktop/dreamToApp/MODONTY/backups"

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
echo "  MODONTY Restore"
echo "═══════════════════════════════════════════"
echo ""

# List available backups
echo "Available backups:"
echo ""
BACKUPS=($(ls -d "$BACKUP_DIR"/backup-*/ 2>/dev/null | sort -r))

if [ ${#BACKUPS[@]} -eq 0 ]; then
  echo "  No backups found."
  exit 1
fi

for i in "${!BACKUPS[@]}"; do
  BNAME=$(basename "${BACKUPS[$i]}")
  BSIZE=$(du -sh "${BACKUPS[$i]}" 2>/dev/null | cut -f1)
  BCOUNT=$(find "${BACKUPS[$i]}" -name "*.bson" 2>/dev/null | wc -l)
  echo "  [$i] $BNAME ($BCOUNT collections, $BSIZE)"
done

echo ""
read -p "Enter backup number to restore (or 'q' to quit): " CHOICE

if [ "$CHOICE" = "q" ]; then
  echo "Cancelled."
  exit 0
fi

if ! [[ "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -ge ${#BACKUPS[@]} ]; then
  echo "Invalid choice."
  exit 1
fi

SELECTED="${BACKUPS[$CHOICE]}"
SELECTED_NAME=$(basename "$SELECTED")

echo ""
echo "══════════════════════════════════════════════════"
echo "  ⚠ WARNING: This will REPLACE all current data"
echo "  with backup: $SELECTED_NAME"
echo "══════════════════════════════════════════════════"
echo ""

# Step 1: Confirm
read -p "Type RESTORE to confirm: " CONFIRM
if [ "$CONFIRM" != "RESTORE" ]; then
  echo "Cancelled."
  exit 0
fi

# Step 2: Auto-backup current data before restoring
echo ""
echo "→ Backing up current data first (safety net)..."
PRE_RESTORE_DIR="$BACKUP_DIR/pre-restore-$SELECTED_NAME"
mkdir -p "$PRE_RESTORE_DIR"
"/c/Program Files/MongoDB/Tools/100/bin/mongodump.exe" --uri="$URI" --out="$PRE_RESTORE_DIR" --quiet

if [ $? -ne 0 ]; then
  echo "✗ Could not backup current data. Aborting restore for safety."
  exit 1
fi
echo "✓ Current data backed up to: pre-restore-$SELECTED_NAME"

# Step 3: Restore
echo ""
echo "→ Restoring from $SELECTED_NAME..."
"$MONGORESTORE" --uri="$URI" --dir="$SELECTED/modonty" --nsInclude="modonty.*" --drop --quiet

if [ $? -eq 0 ]; then
  echo ""
  echo "✓ Restore successful!"
  echo "  Database is now: $SELECTED_NAME"
  echo "  Safety backup at: pre-restore-$SELECTED_NAME"
else
  echo ""
  echo "✗ Restore FAILED! Your pre-restore backup is safe at:"
  echo "  $PRE_RESTORE_DIR"
  exit 1
fi
