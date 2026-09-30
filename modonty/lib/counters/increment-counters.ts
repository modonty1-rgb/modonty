import { db } from "@/lib/db";

type CounterCollection = "articles" | "media";

/**
 * Move cached counters with one atomic `$inc` on one document — no transaction.
 *
 * `db.article.update({ likesCount: { increment: 1 } })` runs inside a transaction, because
 * «Prisma ORM uses MongoDB transactions internally to avoid partial writes on nested queries»
 * (prisma.io/docs · MongoDB connector). Concurrent transactions on the same document abort on
 * a write conflict (mongodb.com/docs · transactions production considerations). Measured
 * 29 Sep 2026: 50 simultaneous likes on one article → P2034 ×370, stored=12 against 39 rows.
 *
 * MongoDB: «write operations are atomic on the single-document level» — a plain update command
 * with `$inc` queues behind the others instead of aborting, so every increment lands.
 * `$runCommandRaw` is Prisma's documented door to raw MongoDB commands.
 */
export async function incrementCounters(
  collection: CounterCollection,
  id: string,
  inc: Record<string, number>,
): Promise<void> {
  const changes = Object.fromEntries(Object.entries(inc).filter(([, n]) => n !== 0));
  if (Object.keys(changes).length === 0) return;
  await db.$runCommandRaw({
    update: collection,
    updates: [{ q: { _id: { $oid: id } }, u: { $inc: changes } }],
  });
}
