import { db } from "../modonty/lib/db";

const commentId = process.argv[2];

if (!commentId) {
  console.error("Usage: pnpm tsx scripts/approve-comment-by-id.ts <commentId>");
  process.exit(1);
}

async function approveComment() {
  try {
    const comment = await db.comment.update({
      where: { id: commentId },
      data: { status: "APPROVED" },
      include: {
        article: { select: { title: true, slug: true } },
        author: { select: { name: true } },
      },
    });

    console.log(`✓ Comment approved!`);
    console.log(`Article: ${comment.article.title}`);
    console.log(`URL: /articles/${comment.article.slug}#comment-${comment.id}`);
    
    console.log(`\n📝 To clear cache immediately, run:`);
    console.log(`  curl -X POST http://localhost:3000/api/revalidate/article -H "Content-Type: application/json" -d '{"slug":"${comment.article.slug}"}'`);
    console.log(`\nOr wait 5 minutes for automatic cache expiration.`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.$disconnect();
  }
}

approveComment();
