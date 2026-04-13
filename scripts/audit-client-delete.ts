// Audit script: show everything linked to a client before deletion
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const CLIENT_ID = "69d02101be4b3c3ed2425d1c";

async function main() {
  const client = await db.client.findUnique({
    where: { id: CLIENT_ID },
    select: { id: true, name: true, slug: true, email: true },
  });

  if (!client) {
    console.log("❌ Client not found:", CLIENT_ID);
    return;
  }

  console.log("🎯 Client:", client.name, `(${client.slug})`);
  console.log("   Email:", client.email);
  console.log("   ID:", client.id);
  console.log("");

  const [
    articles,
    media,
    clientViews,
    clientLikes,
    clientDislikes,
    clientFavorites,
    clientComments,
    seoIntake,
    competitors,
    keywords,
    subscriptionTier,
  ] = await Promise.all([
    db.article.count({ where: { clientId: CLIENT_ID } }),
    db.media.count({ where: { clientId: CLIENT_ID } }),
    db.clientView.count({ where: { clientId: CLIENT_ID } }),
    db.clientLike.count({ where: { clientId: CLIENT_ID } }),
    db.clientDislike.count({ where: { clientId: CLIENT_ID } }),
    db.clientFavorite.count({ where: { clientId: CLIENT_ID } }),
    db.clientComment.count({ where: { clientId: CLIENT_ID } }),
    db.seoIntake.count({ where: { clientId: CLIENT_ID } }),
    db.clientCompetitor.count({ where: { clientId: CLIENT_ID } }),
    db.clientKeyword.count({ where: { clientId: CLIENT_ID } }),
    db.subscriptionTierConfig.count({ where: { clients: { some: { id: CLIENT_ID } } } }),
  ]);

  console.log("📦 Everything that will be DELETED:");
  console.log(`   Articles          : ${articles}`);
  console.log(`   Media files       : ${media}`);
  console.log(`   Client views      : ${clientViews}`);
  console.log(`   Client likes      : ${clientLikes}`);
  console.log(`   Client dislikes   : ${clientDislikes}`);
  console.log(`   Client favorites  : ${clientFavorites}`);
  console.log(`   Client comments   : ${clientComments}`);
  console.log(`   SEO Intakes       : ${seoIntake}`);
  console.log(`   Competitors       : ${competitors}`);
  console.log(`   Keywords          : ${keywords}`);
  console.log(`   Subscription tiers: ${subscriptionTier}`);

  // Also count article-related data
  const articleIds = await db.article.findMany({
    where: { clientId: CLIENT_ID },
    select: { id: true, title: true },
  });

  if (articleIds.length > 0) {
    console.log("\n📰 Article titles:");
    articleIds.forEach((a, i) => console.log(`   ${i + 1}. ${a.title}`));

    const [comments, likes, dislikes, favorites, views, tags, media2] = await Promise.all([
      db.comment.count({ where: { articleId: { in: articleIds.map((a) => a.id) } } }),
      db.articleLike.count({ where: { articleId: { in: articleIds.map((a) => a.id) } } }),
      db.articleDislike.count({ where: { articleId: { in: articleIds.map((a) => a.id) } } }),
      db.articleFavorite.count({ where: { articleId: { in: articleIds.map((a) => a.id) } } }),
      db.articleView.count({ where: { articleId: { in: articleIds.map((a) => a.id) } } }),
      db.articleTag.count({ where: { articleId: { in: articleIds.map((a) => a.id) } } }),
      db.articleMedia.count({ where: { articleId: { in: articleIds.map((a) => a.id) } } }),
    ]);

    console.log("\n📎 Article-linked data:");
    console.log(`   Comments on articles : ${comments}`);
    console.log(`   Likes on articles    : ${likes}`);
    console.log(`   Dislikes on articles : ${dislikes}`);
    console.log(`   Favorites on articles: ${favorites}`);
    console.log(`   Views on articles    : ${views}`);
    console.log(`   Article tags         : ${tags}`);
    console.log(`   Article media links  : ${media2}`);
  }

  console.log("\n⚠️  Review above then run: node scripts/delete-client.ts");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
