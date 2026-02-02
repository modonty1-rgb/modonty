import { db } from "../lib/db";

const dryRun = process.argv.includes("--dry-run");

type DedupeRule = {
  collection: string;
  modelKey: keyof typeof db;
  keys: string[];
};

const DEDUPE_RULES: DedupeRule[] = [
  { collection: "article_likes", modelKey: "articleLike", keys: ["articleId", "userId"] },
  { collection: "article_likes", modelKey: "articleLike", keys: ["articleId", "sessionId"] },
  { collection: "article_dislikes", modelKey: "articleDislike", keys: ["articleId", "userId"] },
  { collection: "article_dislikes", modelKey: "articleDislike", keys: ["articleId", "sessionId"] },
  { collection: "comment_likes", modelKey: "commentLike", keys: ["commentId", "userId"] },
  { collection: "comment_likes", modelKey: "commentLike", keys: ["commentId", "sessionId"] },
  { collection: "comment_dislikes", modelKey: "commentDislike", keys: ["commentId", "userId"] },
  { collection: "comment_dislikes", modelKey: "commentDislike", keys: ["commentId", "sessionId"] },
  { collection: "client_likes", modelKey: "clientLike", keys: ["clientId", "userId"] },
  { collection: "client_likes", modelKey: "clientLike", keys: ["clientId", "sessionId"] },
  { collection: "client_dislikes", modelKey: "clientDislike", keys: ["clientId", "userId"] },
  { collection: "client_dislikes", modelKey: "clientDislike", keys: ["clientId", "sessionId"] },
  { collection: "client_comment_likes", modelKey: "clientCommentLike", keys: ["commentId", "userId"] },
  { collection: "client_comment_likes", modelKey: "clientCommentLike", keys: ["commentId", "sessionId"] },
  { collection: "client_comment_dislikes", modelKey: "clientCommentDislike", keys: ["commentId", "userId"] },
  { collection: "client_comment_dislikes", modelKey: "clientCommentDislike", keys: ["commentId", "sessionId"] },
  { collection: "campaign_tracking", modelKey: "campaignTracking", keys: ["campaignId", "sessionId"] },
  { collection: "lead_scoring", modelKey: "leadScoring", keys: ["userId", "clientId"] },
  { collection: "lead_scoring", modelKey: "leadScoring", keys: ["sessionId", "clientId"] },
  { collection: "faq_feedback", modelKey: "fAQFeedback", keys: ["faqId", "sessionId"] },
  { collection: "faq_feedback", modelKey: "fAQFeedback", keys: ["faqId", "userId"] },
];

function oidToString(oid: unknown): string {
  if (typeof oid === "string") return oid;
  if (oid && typeof oid === "object" && "$oid" in oid) return (oid as { $oid: string }).$oid;
  if (oid && typeof (oid as { toString?: () => string }).toString === "function")
    return (oid as { toString: () => string }).toString();
  return String(oid);
}

async function dedupeCollection(rule: DedupeRule): Promise<number> {
  const groupId = rule.keys.reduce(
    (acc, k) => ({ ...acc, [k]: `$${k}` }),
    {} as Record<string, string>
  );

  const raw = await db.$runCommandRaw({
    aggregate: rule.collection,
    pipeline: [
      { $group: { _id: groupId, ids: { $push: "$_id" }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      {
        $project: {
          idsToDelete: {
            $slice: ["$ids", 1, { $subtract: [{ $size: "$ids" }, 1] }],
          },
        },
      },
      { $unwind: "$idsToDelete" },
      { $group: { _id: null, ids: { $push: "$idsToDelete" } } },
    ],
    cursor: {},
  }) as { cursor?: { firstBatch?: { ids?: unknown[] }[] } };

  const batch = raw?.cursor?.firstBatch;
  const ids = Array.isArray(batch?.[0]?.ids) ? (batch[0].ids as unknown[]) : [];
  const toDelete = ids.map(oidToString);

  if (toDelete.length === 0) return 0;

  if (!dryRun) {
    const delegate = db[rule.modelKey] as { deleteMany: (args: { where: { id: { in: string[] } } }) => Promise<{ count: number }> };
    const result = await delegate.deleteMany({ where: { id: { in: toDelete } } });
    return result.count;
  }

  return toDelete.length;
}

async function main() {
  let totalDeleted = 0;

  try {
    for (const rule of DEDUPE_RULES) {
      const keyLabel = rule.keys.join(", ");
      const count = await dedupeCollection(rule);
      if (count > 0) {
        console.log(`${rule.collection} (${keyLabel}): ${count} duplicate(s) ${dryRun ? "would be removed" : "removed"}`);
        totalDeleted += count;
      }
    }

    if (totalDeleted === 0) {
      console.log("No duplicates found. You can run prisma db push.");
    } else if (dryRun) {
      console.log(`\nDry run — ${totalDeleted} row(s) would be deleted. Run without --dry-run to apply.`);
    } else {
      console.log(`\nDeleted ${totalDeleted} row(s). You can run prisma db push now.`);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
