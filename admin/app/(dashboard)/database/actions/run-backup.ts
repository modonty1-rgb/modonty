"use server";

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";

const MONGODUMP = "C:\\Program Files\\MongoDB\\Tools\\100\\bin\\mongodump.exe";
const BACKUP_DIR = "C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\backups";
const ENV_FILE = "C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\admin\\.env";

export async function runBackup(): Promise<{ success: boolean; message: string }> {
  // Only works locally
  if (process.env.NODE_ENV === "production") {
    return { success: false, message: "Backup only works on your local machine." };
  }

  if (!existsSync(MONGODUMP)) {
    return { success: false, message: "MongoDB Tools not found. Install from mongodb.com/try/download/database-tools" };
  }

  // Read DATABASE_URL from .env
  let uri = "";
  try {
    const env = readFileSync(ENV_FILE, "utf-8");
    const match = env.match(/^DATABASE_URL=["']?(.+?)["']?\s*$/m);
    if (match) uri = match[1];
  } catch {
    return { success: false, message: "Could not read .env file." };
  }

  if (!uri) {
    return { success: false, message: "DATABASE_URL not found in .env" };
  }

  const timestamp = new Date().toISOString().replace(/[T:]/g, "-").slice(0, 16);
  const target = `${BACKUP_DIR}\\backup-${timestamp}`;

  try {
    execSync(`"${MONGODUMP}" --uri="${uri}" --out="${target}" --quiet`, { timeout: 120000 });

    // Count .bson files
    const output = execSync(`dir /s /b "${target}\\*.bson" 2>nul | find /c /v ""`, { encoding: "utf-8" }).trim();
    const collections = parseInt(output) || 0;

    return { success: true, message: `Backup saved — ${collections} collections at backup-${timestamp}` };
  } catch {
    return { success: false, message: "Backup failed. Check your database connection." };
  }
}
