import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export interface Snapshot<T> {
  data: T | null;
  fetchedAt: Date | null;
}

/**
 * The last copy of an external source, refreshed only when it is older than `maxAgeMs`.
 *
 * This is what keeps a quota-limited source inside its quota. `use cache` lives in each
 * server instance's memory («Cache not persisting across requests or server restarts» —
 * Next 16.3.4 docs, use-cache-remote.md), so on Vercel every instance would ask the source
 * for itself. The row in `feed_snapshots` is one copy for the whole site.
 *
 * Two instances that find the same stale row race to claim it: the claim moves `fetchedAt`
 * forward only if it still holds the value that was read, so exactly one of them calls the
 * source and the other keeps serving the old copy. A failed call keeps the old copy too and
 * records why in `lastError` — a stale table is better than an empty page.
 *
 * `maxAgeMs` receives the previous payload so the age can depend on it: a day with a match
 * in progress goes stale in minutes, a finished day in hours.
 */
export async function readSnapshot<T>(
  key: string,
  maxAgeMs: (previous: T | null) => number,
  load: () => Promise<T>,
): Promise<Snapshot<T>> {
  const row = await db.feedSnapshot.findUnique({
    where: { key },
    select: { payload: true, fetchedAt: true },
  });
  const previous = (row?.payload ?? null) as T | null;
  const now = new Date();

  if (row && now.getTime() - row.fetchedAt.getTime() < maxAgeMs(previous)) {
    return { data: previous, fetchedAt: row.fetchedAt };
  }

  if (row) {
    const claimed = await db.feedSnapshot.updateMany({
      where: { key, fetchedAt: row.fetchedAt },
      data: { fetchedAt: now },
    });
    if (claimed.count === 0) return { data: previous, fetchedAt: row.fetchedAt };
  }

  try {
    const data = await load();
    const payload = data as unknown as Prisma.InputJsonValue;
    await db.feedSnapshot.upsert({
      where: { key },
      create: { key, payload, fetchedAt: now },
      update: { payload, fetchedAt: now, lastError: null },
    });
    return { data, fetchedAt: now };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 300) : "load failed";
    console.error(`[feed-snapshot] ${key}:`, message);
    if (row) {
      await db.feedSnapshot.update({ where: { key }, data: { lastError: message } }).catch(() => {});
    }
    return { data: previous, fetchedAt: row?.fetchedAt ?? null };
  }
}
