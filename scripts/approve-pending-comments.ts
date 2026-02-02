import { db } from "../modonty/lib/db";

async function approvePendingComments() {
  try {
    console.log("Finding pending comments...");
    
    const pendingComments = await db.comment.findMany({
      where: { status: "PENDING" },
      include: {
        article: {
          select: {
            title: true,
            slug: true,
          },
        },
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`Found ${pendingComments.length} pending comments`);

    if (pendingComments.length === 0) {
      console.log("No pending comments to approve");
      return;
    }

    const result = await db.comment.updateMany({
      where: { status: "PENDING" },
      data: { status: "APPROVED" },
    });

    console.log(`\nApproved ${result.count} comments!\n`);

    const uniqueSlugs = new Set(pendingComments.map(c => c.article.slug));
    console.log(`\n📝 Note: ${uniqueSlugs.size} article page(s) need cache clearing.`);
    console.log(`Run this to clear cache immediately:\n`);
    uniqueSlugs.forEach(slug => {
      console.log(`  curl -X POST http://localhost:3000/api/revalidate/article -H "Content-Type: application/json" -d '{"slug":"${slug}"}'`);
    });
    console.log(`\nOr wait 5 minutes for automatic cache expiration.\n`);

    console.log("\nApproved Comments:");
    pendingComments.forEach((comment, index) => {
      console.log(`${index + 1}. "${comment.content.substring(0, 50)}..."`);
      console.log(`   Article: ${comment.article.title}`);
      console.log(`   Author: ${comment.author?.name || "Anonymous"}`);
      console.log(`   URL: /articles/${comment.article.slug}#comment-${comment.id}\n`);
    });

  } catch (error) {
    console.error("Error approving comments:", error);
  } finally {
    await db.$disconnect();
  }
}

approvePendingComments();
