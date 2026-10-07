import { timingSafeEqual } from "node:crypto";

import { db } from "@/lib/db";
import { fail, handle, ok } from "@/lib/mobile-api/http";
import { resolveNotificationTargets } from "@/lib/mobile-api/notification-targets";
import { notifyReader, type ReaderPush } from "@/lib/push/notify-reader";

export const maxDuration = 60;

const WINDOW_MS = 24 * 60 * 60 * 1000;
const BATCH = 200;
/** «لم يُعالَج» — null صراحةً **أو** غائب (صفوف ما قبل الحقل). `null` وحده لا يطابق الغائب في مونغو. */
const NOT_PUSHED = { OR: [{ pushedAt: null }, { pushedAt: { isSet: false } }] };

function authorized(request: Request, expected: string): boolean {
  const provided = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * N4 — GET /api/mobile/v1/internal/push-dispatch · Vercel Cron (`vercel.json`, every 5 minutes) ·
 * `Authorization: Bearer $CRON_SECRET` (Vercel sends it to cron paths). Fails closed when unset.
 *
 * Reader notifications are written by the console (comment / reel-comment approved, FAQ answered)
 * and the admin (contact reply) — code this package cannot change — so instead of a call at the
 * write site, this sweep pushes them: reader rows (`userId` set) from the last 24h not handled yet,
 * oldest first, ≤200 per run.
 *
 * 1. Each row is CLAIMED (`pushedAt = now`, conditional on still unset) — two overlapping runs never
 *    push the same row twice.
 * 2. Already read on the web → claimed and skipped (no push for something seen).
 * 3. The rest go through `notifyReader` with their deep link (`resolveNotificationTargets`, the inbox's
 *    own routing). A row whose Expo request failed is un-claimed, so the next run retries it.
 *
 * No actor is passed: `Notification` has no actor column, and every type it carries today is caused by
 * a partner or staff member, never by the reader who receives it.
 */
export const GET = handle("internal-push-dispatch", async (request: Request) => {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.error("[mobile-api:internal-push-dispatch] CRON_SECRET is not set — refusing to run");
    return fail("INTERNAL_ERROR", "CRON_SECRET is not configured");
  }
  if (!authorized(request, expected)) return fail("UNAUTHORIZED", "Unauthorized");

  const candidates = await db.notification.findMany({
    where: {
      userId: { not: null },
      createdAt: { gte: new Date(Date.now() - WINDOW_MS) },
      ...NOT_PUSHED,
    },
    orderBy: { createdAt: "asc" },
    take: BATCH,
    select: { id: true, userId: true, type: true, title: true, body: true, readAt: true, relatedId: true },
  });

  const now = new Date();
  const claims = await Promise.all(
    candidates.map((n) => db.notification.updateMany({ where: { id: n.id, ...NOT_PUSHED }, data: { pushedAt: now } })),
  );
  const claimed = candidates.filter((n, i) => claims[i].count === 1 && n.userId);
  const toSend = claimed.filter((n) => !n.readAt);

  const targets = await resolveNotificationTargets(toSend);
  const pushes: ReaderPush[] = toSend.map((n) => {
    const target = targets.get(n.id) ?? null;
    return {
      notificationId: n.id,
      userId: n.userId!,
      type: n.type,
      title: n.title,
      body: n.body,
      articleSlug: target?.kind === "article" ? target.slug : null,
      reelSlug: target?.kind === "reel" ? target.slug : null,
      actorUserId: null,
    };
  });
  const result = await notifyReader(pushes);

  const retry = toSend.filter((n) => !result.settled.has(n.id)).map((n) => n.id);
  if (retry.length) {
    await db.notification.updateMany({ where: { id: { in: retry } }, data: { pushedAt: null } });
  }

  return ok({
    candidates: candidates.length,
    claimed: claimed.length,
    skippedRead: claimed.length - toSend.length,
    sent: result.sent,
    retryLater: retry.length,
    disabledDevices: result.disabledDevices,
  });
});
