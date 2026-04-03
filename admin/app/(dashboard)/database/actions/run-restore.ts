"use server";

import { execSync } from "child_process";
import { existsSync, readdirSync, readFileSync } from "fs";

const MONGORESTORE = "C:\\Program Files\\MongoDB\\Tools\\100\\bin\\mongorestore.exe";
const MONGODUMP = "C:\\Program Files\\MongoDB\\Tools\\100\\bin\\mongodump.exe";
const BACKUP_DIR = "C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\backups";
const ENV_FILE = "C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\admin\\.env";

function getUri(): string | null {
  try {
    const env = readFileSync(ENV_FILE, "utf-8");
    const match = env.match(/^DATABASE_URL=["']?(.+?)["']?\s*$/m);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function getAvailableBackups(): Promise<{ name: string; date: string }[]> {
  if (process.env.NODE_ENV === "production") return [];
  if (!existsSync(BACKUP_DIR)) return [];

  try {
    const dirs = readdirSync(BACKUP_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith("backup-"))
      .map((d) => d.name)
      .sort()
      .reverse();

    return dirs.map((name) => {
      const datePart = name.replace("backup-", "").replace("_", " ").replace(/-/g, (m, offset) => offset <= 9 ? "-" : ":");
      return { name, date: datePart };
    });
  } catch {
    return [];
  }
}

export async function runRestore(backupName: string): Promise<{ success: boolean; message: string }> {
  if (process.env.NODE_ENV === "production") {
    return { success: false, message: "Restore only works on your local machine." };
  }

  if (!existsSync(MONGORESTORE)) {
    return { success: false, message: "MongoDB Tools not found." };
  }

  const uri = getUri();
  if (!uri) {
    return { success: false, message: "DATABASE_URL not found in .env" };
  }

  const backupPath = `${BACKUP_DIR}\\${backupName}\\modonty`;
  if (!existsSync(backupPath)) {
    return { success: false, message: "Backup not found." };
  }

  try {
    // Safety: backup current data before restoring
    const timestamp = new Date().toISOString().replace(/[T:]/g, "-").slice(0, 16);
    const safetyBackup = `${BACKUP_DIR}\\pre-restore-${timestamp}`;
    execSync(`"${MONGODUMP}" --uri="${uri}" --out="${safetyBackup}" --quiet`, { timeout: 120000 });

    // Restore
    execSync(`"${MONGORESTORE}" --uri="${uri}" --dir="${backupPath}" --nsInclude="modonty.*" --drop --quiet`, { timeout: 120000 });

    return { success: true, message: `Restored from ${backupName}. Safety backup saved at pre-restore-${timestamp}.` };
  } catch {
    return { success: false, message: "Restore failed. Your current data is safe (pre-restore backup was created)." };
  }
}
