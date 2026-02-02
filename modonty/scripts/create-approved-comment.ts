import { db } from "../lib/db";

async function createApprovedComment() {
  try {
    // Get the article
    const article = await db.article.findFirst({
      where: {
        slug: "شاهد-شبيه-بلاكبيري-يعود-بعد-سنوات-لمواجهة-التشتت-الرقمي-61",
      },
      select: { id: true, title: true },
    });

    if (!article) {
      console.log("❌ Article not found");
      process.exit(1);
    }

    // Get current user (nadish)
    const user = await db.user.findUnique({
      where: { email: "nadish@gmail.com" },
      select: { id: true, name: true },
    });

    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }

    console.log(`Creating comment for article: ${article.title}`);
    console.log(`User: ${user.name} (${user.id})`);

    // Create approved comment
    const comment = await db.comment.create({
      data: {
        content: "Testing the like button functionality on comments! This should work correctly.",
        articleId: article.id,
        authorId: user.id,
        status: "APPROVED",
      },
    });

    console.log("==========================================");
    console.log("✅ APPROVED COMMENT CREATED!");
    console.log("==========================================");
    console.log(`Comment ID: ${comment.id}`);
    console.log(`Status: ${comment.status}`);
    console.log(`Content: ${comment.content}`);
    console.log("==========================================");
    console.log("Reload the article page to see it!");

    await db.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await db.$disconnect();
    process.exit(1);
  }
}

createApprovedComment();
