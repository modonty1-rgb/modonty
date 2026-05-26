import "server-only";
import { db } from "@/lib/db";

const SINGLETON_KEY = "global" as const;

export const SETTINGS_SINGLETON_WHERE = { singletonKey: SINGLETON_KEY };

/**
 * Atomically resolves the singleton Settings doc id.
 *
 * Three paths:
 *   1. Fast path — doc exists with singletonKey="global" → return id.
 *   2. Legacy migration — pre-singletonKey doc exists → claim the OLDEST one,
 *      set singletonKey="global" on it, ignore any sibling duplicates.
 *   3. Fresh DB — atomic upsert creates the row with schema defaults.
 *
 * Callers MUST use this instead of `findFirst → if null create`.
 */
export async function ensureSettingsId(): Promise<string> {
  const keyed = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: { id: true },
  });
  if (keyed) return keyed.id;

  const legacy = await db.settings.findFirst({
    orderBy: { id: "asc" },
    select: { id: true },
  });
  if (legacy) {
    // Force-write singletonKey via $runCommandRaw. Prisma's @default("global")
    // fills the value on READ even when the BSON field is missing → a regular
    // Prisma .update() that compares against the "current" value may treat the
    // write as a no-op and skip it, leaving BSON un-touched and the next
    // findUnique returning null again (infinite legacy fallback loop).
    // Raw $set guarantees the field lands in MongoDB regardless of Prisma diffing.
    await db.$runCommandRaw({
      update: "settings",
      updates: [
        {
          q: { _id: { $oid: legacy.id } },
          u: { $set: { singletonKey: SINGLETON_KEY } },
        },
      ],
    });
    return legacy.id;
  }

  const created = await db.settings.upsert({
    where: SETTINGS_SINGLETON_WHERE,
    create: {},
    update: {},
    select: { id: true },
  });
  return created.id;
}
