"use server";

import { db } from "@/lib/db";

/**
 * Reads the `BackupRun` log — the daily cron's own record of itself.
 *
 * Separate from `backup-info.ts`, which parses a text file inside the repo and therefore
 * only ever sees backups taken on Khalid's machine. This one works in production, where
 * the cron actually runs and where the answer matters.
 *
 * Decisions: documents/tasks/BACKUP-STRATEGY-v1.html (ق5 · ق6)
 */

export type BackupHealth = "ok" | "late" | "missing" | "never";

export interface BackupRunRow {
  id: string;
  source: string;
  dbName: string;
  status: string;
  collections: number | null;
  documents: number | null;
  sizeBytes: number | null;
  bunnyPath: string | null;
  errorText: string | null;
  startedAt: Date;
  finishedAt: Date | null;
  durationMs: number | null;
}

export interface BackupRunsReport {
  runs: BackupRunRow[];
  lastSuccess: BackupRunRow | null;
  hoursSinceSuccess: number | null;
  health: BackupHealth;
  failedSinceSuccess: number;
}

/** Yellow at 24h, red at 48h — the alarm fires on absence, never on success. */
function grade(hours: number | null): BackupHealth {
  if (hours === null) return "never";
  if (hours >= 48) return "missing";
  if (hours >= 24) return "late";
  return "ok";
}

export async function getBackupRuns(): Promise<BackupRunsReport> {
  const runs = await db.backupRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 10,
    select: {
      id: true,
      source: true,
      dbName: true,
      status: true,
      collections: true,
      documents: true,
      sizeBytes: true,
      bunnyPath: true,
      errorText: true,
      startedAt: true,
      finishedAt: true,
      durationMs: true,
    },
  });

  // Health is judged on the guaranteed layer only. A local dump succeeding while the cron
  // is down must not paint the card green — the machine may simply have been on that day.
  const lastSuccess = await db.backupRun.findFirst({
    where: { status: "SUCCESS", source: "VERCEL_CRON" },
    orderBy: { finishedAt: "desc" },
    select: {
      id: true,
      source: true,
      dbName: true,
      status: true,
      collections: true,
      documents: true,
      sizeBytes: true,
      bunnyPath: true,
      errorText: true,
      startedAt: true,
      finishedAt: true,
      durationMs: true,
    },
  });

  const hoursSinceSuccess = lastSuccess?.finishedAt
    ? Math.floor((Date.now() - lastSuccess.finishedAt.getTime()) / 3_600_000)
    : null;

  const failedSinceSuccess = await db.backupRun.count({
    where: {
      status: "FAILED",
      ...(lastSuccess?.finishedAt ? { startedAt: { gt: lastSuccess.finishedAt } } : {}),
    },
  });

  return {
    runs,
    lastSuccess,
    hoursSinceSuccess,
    health: grade(hoursSinceSuccess),
    failedSinceSuccess,
  };
}
