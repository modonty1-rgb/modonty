import { timingSafeEqual } from "node:crypto";
import dns from "node:dns";
import dnsPromises from "node:dns/promises";
import { MongoClient } from "mongodb";
import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import {
  readBunnyBackupConfig,
  uploadCollection,
  uploadManifest,
  SKIP_COLLECTIONS,
  type BackupManifest,
} from "@modonty/database/lib/backup";

/**
 * Daily database backup → private Bunny zone.
 *
 * Runs on a Vercel Cron rather than on a machine, because the previous scheduled backup
 * lived on Windows and never ran once without anyone noticing. A backup that depends on a
 * laptop being awake is a backup that stops the first quiet week.
 *
 * Writes one gzipped Extended-JSON file per collection plus a manifest, records the run in
 * `BackupRun`, and sends a Telegram message either way. Decisions and their reasoning:
 * documents/tasks/BACKUP-STRATEGY-v1.html
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 800;

const TELEGRAM_API = "https://api.telegram.org";

/** The only database this job is meant to archive. Anything else needs an explicit opt-in. */
const PRODUCTION_DB = "modonty";

/** Constant-time compare so the secret cannot be recovered byte by byte from response timing. */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function notifyTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch {
    // A failed notification must never fail the backup that already succeeded.
  }
}

/**
 * Some Windows setups leave Node's resolver pointed at 127.0.0.1, where nothing listens,
 * so the SRV lookup behind `mongodb+srv://` fails even though the OS resolver works fine.
 * `node:dns` and `node:dns/promises` keep separate server lists and the driver uses the
 * promises one, so both must be set. Only touched when the resolver is actually loopback,
 * which never happens on Vercel.
 */
function ensureResolvableDns(): void {
  const isLoopback = (s: string) => s.startsWith("127.") || s === "::1";
  if (dns.getServers().some(isLoopback)) dns.setServers(["1.1.1.1", "8.8.8.8"]);
  if (dnsPromises.getServers().some(isLoopback)) dnsPromises.setServers(["1.1.1.1", "8.8.8.8"]);
}

function riyadhTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function mb(bytes: number): string {
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export async function POST(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  const provided = request.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  if (!secretMatches(provided, expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // A second run starting while the first is mid-flight would double the write load and
  // interleave two folders. One at a time.
  const inFlight = await db.backupRun.findFirst({
    where: { status: "RUNNING", source: "VERCEL_CRON" },
    select: { id: true, startedAt: true },
  });
  if (inFlight) {
    return Response.json(
      { skipped: true, reason: "A backup is already running", since: inFlight.startedAt },
      { status: 409 },
    );
  }

  const uri = process.env.DATABASE_URL;
  if (!uri) {
    return Response.json({ error: "DATABASE_URL is not set" }, { status: 500 });
  }
  const dbName = uri.match(/\/([^/?]+)\?/)?.[1] ?? "unknown";

  // This job exists to protect the live database. Run it anywhere else — a laptop, a
  // preview deployment — and it would happily archive test data. Refuse by default and
  // make the caller say so out loud, because the earlier failure in this project was
  // exactly a backup that copied the wrong database while reporting success.
  if (dbName !== PRODUCTION_DB && request.nextUrl.searchParams.get("allowNonProd") !== "1") {
    return Response.json(
      {
        error: `Refusing to run against '${dbName}' — this job backs up '${PRODUCTION_DB}'.`,
        hint: "Append ?allowNonProd=1 to archive a non-production database deliberately.",
      },
      { status: 400 },
    );
  }

  const startedAt = new Date();
  // The database name is part of the path, so a non-production run can never overwrite a
  // production archive for the same day. Without it, one stray local call silently
  // replaces the live backup with test data.
  const folder = `daily/${dbName}/${startedAt.toISOString().slice(0, 10)}`;

  const run = await db.backupRun.create({
    data: { source: "VERCEL_CRON", dbName, status: "RUNNING", bunnyPath: folder, startedAt },
    select: { id: true },
  });

  const client = new MongoClient(uri);

  try {
    const config = readBunnyBackupConfig();
    ensureResolvableDns();
    await client.connect();
    const source = client.db();

    const all = await source.listCollections().toArray();
    const names = all
      .filter((c) => !c.name.startsWith("system.") && c.type !== "view")
      .map((c) => c.name)
      .filter((name) => !SKIP_COLLECTIONS.has(name));

    const collections: BackupManifest["collections"] = [];
    let totalDocuments = 0;
    let totalBytes = 0;

    // One collection at a time: the whole database never sits in memory at once, and a
    // failure names the collection it happened on instead of losing the entire run.
    for (const name of names) {
      const docs = await source.collection(name).find({}).toArray();
      const bytes = await uploadCollection(config, folder, name, docs);
      collections.push({ name, documents: docs.length, bytes });
      totalDocuments += docs.length;
      totalBytes += bytes;
    }

    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();

    await uploadManifest(config, {
      dbName,
      folder,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      collections,
      totalDocuments,
      totalBytes,
    });

    await db.backupRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        collections: collections.length,
        documents: totalDocuments,
        sizeBytes: totalBytes,
        finishedAt,
        durationMs,
      },
    });

    // Real numbers, not a greeting — a message that changes daily still gets read after
    // a month, and its absence is the signal that something stopped.
    await notifyTelegram(
      [
        "✅ <b>نسخة احتياطية</b>",
        `🗄️ القاعدة: <code>${dbName}</code>`,
        `📦 ${collections.length} مجموعة · ${totalDocuments.toLocaleString("en-US")} وثيقة`,
        `💾 ${mb(totalBytes)} · ⏱️ ${Math.round(durationMs / 1000)} ثانية`,
        `📁 <code>${folder}</code>`,
        `🕐 ${riyadhTime(finishedAt)}`,
      ].join("\n"),
    );

    return Response.json({
      ok: true,
      dbName,
      folder,
      collections: collections.length,
      documents: totalDocuments,
      sizeBytes: totalBytes,
      durationMs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const finishedAt = new Date();

    await db.backupRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        errorText: message,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
      },
    });

    const lastGood = await db.backupRun.findFirst({
      where: { status: "SUCCESS", source: "VERCEL_CRON" },
      orderBy: { finishedAt: "desc" },
      select: { finishedAt: true },
    });
    const ageHours = lastGood?.finishedAt
      ? Math.round((finishedAt.getTime() - lastGood.finishedAt.getTime()) / 3_600_000)
      : null;

    await notifyTelegram(
      [
        "🔴🔴 <b>فشل النسخ الاحتياطي</b>",
        `🗄️ القاعدة: <code>${dbName}</code>`,
        `❌ ${message}`,
        ageHours === null
          ? "⚠️ لا توجد نسخة ناجحة سابقة على الإطلاق"
          : `⏳ آخر نسخة ناجحة: قبل ${ageHours} ساعة`,
        `🕐 ${riyadhTime(finishedAt)}`,
      ].join("\n"),
    );

    return Response.json({ ok: false, error: message }, { status: 500 });
  } finally {
    await client.close().catch(() => {});
  }
}

// Vercel Cron issues GET. Same handler, same gate.
export async function GET(request: NextRequest) {
  return POST(request);
}
