import { timingSafeEqual } from "node:crypto";
import dns from "node:dns";
import dnsPromises from "node:dns/promises";
import { MongoClient } from "mongodb";
import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { runBillingAlert } from "@/lib/atlas/billing-alert";
import {
  readBunnyBackupConfig,
  uploadCollection,
  uploadManifest,
  listBunnyFolder,
  foldersToPrune,
  deleteBackupFolder,
  RETENTION,
  SKIP_COLLECTIONS,
  type BackupManifest,
  type BunnyBackupConfig,
} from "@modonty/shared/lib/backup";

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

/**
 * Delete the backup folders that retention no longer claims — after tonight's copy is
 * safely uploaded and its manifest written, never before.
 *
 * Four guards, because a scheduled delete that misbehaves destroys the very thing this job
 * exists to protect:
 *   1. It runs only on the success path, so a failed backup never shortens the archive.
 *   2. Today's folder is excluded by name, whatever the selection says.
 *   3. A folder with no `_manifest.json` is left alone — an incomplete upload is not a
 *      backup, and deleting around it would trust a copy that was never finished.
 *   4. At most MAX_PRUNE_PER_RUN folders go per night. If a bug ever widened the selection,
 *      the damage is bounded and visible in the Telegram message long before it compounds.
 *
 * Never throws: the backup already succeeded, and a cleanup problem must not turn a good
 * night into a reported failure.
 */
const MAX_PRUNE_PER_RUN = 3;

async function pruneOldBackups(
  config: BunnyBackupConfig,
  dbName: string,
  todayFolder: string,
): Promise<{ removed: string[]; files: number; skipped: string[] } | { error: string }> {
  try {
    const prefix = `daily/${dbName}`;
    const entries = await listBunnyFolder(config, prefix);
    const names = entries.map((e) => e.ObjectName);
    const doomed = foldersToPrune(names)
      .filter((f) => f !== todayFolder)
      .slice(0, MAX_PRUNE_PER_RUN);

    const removed: string[] = [];
    const skipped: string[] = [];
    let files = 0;
    for (const folder of doomed) {
      const inside = await listBunnyFolder(config, `${prefix}/${folder}`);
      if (!inside.some((f) => f.ObjectName === "_manifest.json")) {
        skipped.push(folder);
        continue;
      }
      const res = await deleteBackupFolder(config, `${prefix}/${folder}`);
      if (res.failed === 0) removed.push(folder);
      files += res.deleted;
    }
    return { removed, files, skipped };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/**
 * فحص الفوترة يركب على هذه الرحلة الليلية بدل كرون ثانٍ: جدولٌ واحد يُراقَب ويُصان،
 * وخطة Vercel المجّانية أصلاً تحدّ عدد الكرونات. ولا يعطّل النسخ أبداً — النسخة نجحت
 * أو فشلت قبل أن يُنادى، وخطؤه يُبتلع.
 */
async function checkBillingQuietly(): Promise<void> {
  try {
    await runBillingAlert(new Date(), notifyTelegram);
  } catch {
    // تنبيهٌ لم يُرسَل لا يُفشل نسخةً احتياطية تمّت.
  }
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

    // Cleanup runs only here — after the upload AND the manifest, so the archive is never
    // shortened on a night that failed to add to it.
    const prune = await pruneOldBackups(config, dbName, folder.split("/").pop() as string);
    const pruneLine =
      "error" in prune
        ? `🧹 التقليم تعثّر: ${prune.error}`
        : prune.removed.length === 0
          ? `🧹 لا شيء للتقليم (الاحتفاظ: ${RETENTION.daily} يومية · ${RETENTION.weekly} أسبوعية · ${RETENTION.monthly} شهرية)`
          : `🧹 حُذفت ${prune.removed.length} نسخة قديمة (${prune.files} ملفاً): ${prune.removed.join(" · ")}` +
            (prune.skipped.length ? ` · تُركت ${prune.skipped.length} بلا مانيفست` : "");

    // Real numbers, not a greeting — a message that changes daily still gets read after
    // a month, and its absence is the signal that something stopped.
    await notifyTelegram(
      [
        "✅ <b>نسخة احتياطية</b>",
        `🗄️ القاعدة: <code>${dbName}</code>`,
        `📦 ${collections.length} مجموعة · ${totalDocuments.toLocaleString("en-US")} وثيقة`,
        `💾 ${mb(totalBytes)} · ⏱️ ${Math.round(durationMs / 1000)} ثانية`,
        `📁 <code>${folder}</code>`,
        pruneLine,
        `🕐 ${riyadhTime(finishedAt)}`,
      ].join("\n"),
    );

    await checkBillingQuietly();

    return Response.json({
      ok: true,
      dbName,
      folder,
      collections: collections.length,
      documents: totalDocuments,
      sizeBytes: totalBytes,
      durationMs,
      prune,
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

    // حتى في ليلةٍ فشلت فيها النسخة: فشل الخصم مستقلٌّ عنها، وإسكاته لأن شيئاً آخر
    // تعطّل هو بالضبط كيف تمرّ فاتورة مرفوضة شهراً كاملاً.
    await checkBillingQuietly();

    return Response.json({ ok: false, error: message }, { status: 500 });
  } finally {
    await client.close().catch(() => {});
  }
}

// Vercel Cron issues GET. Same handler, same gate.
export async function GET(request: NextRequest) {
  return POST(request);
}
