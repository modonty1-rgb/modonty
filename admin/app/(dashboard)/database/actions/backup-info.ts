"use server";

import fs from "node:fs/promises";
import path from "node:path";

export interface BackupInfo {
  lastBackup: { timestamp: Date; collections: number; sizeRaw: string } | null;
  totalCount: number;
  rotationLimit: number;
}

// Format from `backups/backup-log.txt`: "YYYY-MM-DD_HH-MM | NN collections | XX.XM"
function parseLogLine(line: string) {
  const parts = line.split("|").map((p) => p.trim());
  if (parts.length < 3) return null;
  const [stamp, collParts, size] = parts;
  // Convert "2026-05-21_23-59" → "2026-05-21T23:59:00"
  const [d, t] = stamp.split("_");
  if (!d || !t) return null;
  const [hh, mm] = t.split("-");
  const iso = `${d}T${hh}:${mm}:00`;
  const ts = new Date(iso);
  if (Number.isNaN(ts.getTime())) return null;
  const collections = parseInt(collParts.split(" ")[0], 10) || 0;
  return { timestamp: ts, collections, sizeRaw: size };
}

export async function getBackupInfo(): Promise<BackupInfo> {
  try {
    // Repo root is two levels above admin
    const root = path.resolve(process.cwd(), "..");
    const logPath = path.join(root, "backups", "backup-log.txt");
    const text = await fs.readFile(logPath, "utf-8");
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return { lastBackup: null, totalCount: 0, rotationLimit: 10 };
    const last = parseLogLine(lines[lines.length - 1]);
    return { lastBackup: last, totalCount: lines.length, rotationLimit: 10 };
  } catch {
    return { lastBackup: null, totalCount: 0, rotationLimit: 10 };
  }
}
