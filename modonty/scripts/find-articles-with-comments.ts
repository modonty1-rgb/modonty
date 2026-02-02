import { db } from "../lib/db";

async function findArticlesWithComments() {
  try {
    console.log("Searching for articles with approved comments...");

    const articlesWithComments = await db.article.findMany({
      where: {
        status: "PUBLISHED",
        comments: {
          some: {
            status: "APPROVED",
            parentId: null, // Top-level comments only
          },
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
      take: 5,
    });

    if (articlesWithComments.length === 0) {
      console.log("❌ No articles found with approved comments");
      console.log("Let me check all comments regardless of status...");

      const allCommentsCount = await db.comment.count();
      const approvedCommentsCount = await db.comment.count({
        where: { status: "APPROVED" },
      });

      console.log(`Total comments: ${allCommentsCount}`);
      console.log(`Approved comments: ${approvedCommentsCount}`);
    } else {
      console.log(`✅ Found ${articlesWithComments.length} articles with comments:`);
      console.log("==========================================");
      articlesWithComments.forEach((article, index) => {
        console.log(`${index + 1}. "${article.title}"`);
        console.log(`   Slug: ${article.slug}`);
        console.log(`   URL: http://localhost:3000/articles/${article.slug}`);
        console.log(`   Comments: ${article._count.comments}`);
        console.log("------------------------------------------");
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.$disconnect();
  }
}

findArticlesWithComments();
