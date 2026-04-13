// Permanent delete: client + all related data
// Client: Test Media Client (69d632af4bd6276fac9b9a5b)

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const CLIENT_ID = "69d02101be4b3c3ed2425d1c";

async function main() {
  const client = await db.client.findUnique({
    where: { id: CLIENT_ID },
    select: { id: true, name: true },
  });

  if (!client) {
    console.log("❌ Client not found — already deleted?");
    return;
  }

  console.log(`🗑️  Deleting: ${client.name} (${CLIENT_ID})`);

  // 1. Get article IDs first (for cascade)
  const articles = await db.article.findMany({
    where: { clientId: CLIENT_ID },
    select: { id: true },
  });
  const articleIds = articles.map((a) => a.id);

  if (articleIds.length > 0) {
    // Delete article-linked data — replies first, then top-level comments
    await db.commentLike.deleteMany({ where: { comment: { articleId: { in: articleIds } } } });
    await db.commentDislike.deleteMany({ where: { comment: { articleId: { in: articleIds } } } });
    await db.comment.deleteMany({ where: { articleId: { in: articleIds }, parentId: { not: null } } });
    await db.comment.deleteMany({ where: { articleId: { in: articleIds } } });
    await db.articleLike.deleteMany({ where: { articleId: { in: articleIds } } });
    await db.articleDislike.deleteMany({ where: { articleId: { in: articleIds } } });
    await db.articleFavorite.deleteMany({ where: { articleId: { in: articleIds } } });
    await db.articleView.deleteMany({ where: { articleId: { in: articleIds } } });
    await db.articleTag.deleteMany({ where: { articleId: { in: articleIds } } });
    await db.articleMedia.deleteMany({ where: { articleId: { in: articleIds } } });
    await db.articleFAQ.deleteMany({ where: { articleId: { in: articleIds } } });
    await db.relatedArticle.deleteMany({ where: { articleId: { in: articleIds } } });
    await db.analytics.deleteMany({ where: { articleId: { in: articleIds } } });
    await db.article.deleteMany({ where: { clientId: CLIENT_ID } });
    console.log(`   ✅ Deleted ${articleIds.length} articles + linked data`);
  }

  // 2. Null out logo/heroImage references on the client before deleting media
  await db.client.update({
    where: { id: CLIENT_ID },
    data: { logoMediaId: null, heroImageMediaId: null },
  });

  // Delete client-direct data
  await db.media.deleteMany({ where: { clientId: CLIENT_ID } });
  await db.clientView.deleteMany({ where: { clientId: CLIENT_ID } });
  await db.clientLike.deleteMany({ where: { clientId: CLIENT_ID } });
  await db.clientDislike.deleteMany({ where: { clientId: CLIENT_ID } });
  await db.clientFavorite.deleteMany({ where: { clientId: CLIENT_ID } });
  await db.clientComment.deleteMany({ where: { clientId: CLIENT_ID } });
  await db.seoIntake.deleteMany({ where: { clientId: CLIENT_ID } });
  await db.clientCompetitor.deleteMany({ where: { clientId: CLIENT_ID } });
  await db.clientKeyword.deleteMany({ where: { clientId: CLIENT_ID } });
  await db.subscriber.deleteMany({ where: { clientId: CLIENT_ID } });
  console.log("   ✅ Deleted client-linked records");

  // 3. Delete the client itself
  await db.client.delete({ where: { id: CLIENT_ID } });
  console.log("   ✅ Client deleted");

  console.log("\n✅ DONE — Test Media Client fully removed from DB.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
