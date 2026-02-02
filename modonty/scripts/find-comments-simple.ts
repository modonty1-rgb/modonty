import { db } from "../lib/db";

async function findComments() {
  try {
    console.log("Finding approved comments with article info...");

    const comments = await db.comment.findMany({
      where: {
        status: "APPROVED",
        parentId: null,
      },
      select: {
        id: true,
        content: true,
        article: {
          select: {
            title: true,
            slug: true,
            status: true,
          },
        },
      },
      take: 3,
    });

    console.log(`Found ${comments.length} comments:`);
    console.log("==========================================");
    
    comments.forEach((comment, index) => {
      console.log(`${index + 1}. Comment ID: ${comment.id}`);
      console.log(`   Content: ${comment.content.substring(0, 50)}...`);
      console.log(`   Article: "${comment.article.title}"`);
      console.log(`   Slug: ${comment.article.slug}`);
      console.log(`   Status: ${comment.article.status}`);
      console.log(`   URL: http://localhost:3000/articles/${comment.article.slug}`);
      console.log("------------------------------------------");
    });

    await db.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    await db.$disconnect();
    process.exit(1);
  }
}

findComments();
