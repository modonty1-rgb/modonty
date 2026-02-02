import { db } from "../lib/db";

async function testCommentLike() {
  try {
    // Get the user
    const user = await db.user.findUnique({
      where: { email: "nadish@gmail.com" },
      select: { id: true, name: true },
    });

    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }

    // Get the comment we just created
    const comment = await db.comment.findFirst({
      where: {
        authorId: user.id,
        status: "APPROVED",
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, content: true, article: { select: { title: true } } },
    });

    if (!comment) {
      console.log("❌ No comment found");
      process.exit(1);
    }

    console.log(`Found comment: ${comment.content.substring(0, 40)}...`);
    console.log(`Article: ${comment.article.title}`);

    // Check if user already liked this comment
    const existingLike = await db.commentLike.findFirst({
      where: {
        commentId: comment.id,
        userId: user.id,
      },
    });

    if (existingLike) {
      console.log("✅ User already liked this comment");
      console.log(`Like ID: ${existingLike.id}`);
    } else {
      // Create a like
      const like = await db.commentLike.create({
        data: {
          commentId: comment.id,
          userId: user.id,
        },
      });

      console.log("==========================================");
      console.log("✅ COMMENT LIKE CREATED!");
      console.log("==========================================");
      console.log(`Like ID: ${like.id}`);
      console.log(`Comment ID: ${comment.id}`);
      console.log(`User ID: ${user.id}`);
    }

    // Get stats
    const [commentLikesCount, articleLikesCount] = await Promise.all([
      db.commentLike.count({ where: { userId: user.id } }),
      db.articleLike.count({ where: { userId: user.id } }),
    ]);

    console.log("==========================================");
    console.log("📊 USER STATS:");
    console.log("==========================================");
    console.log(`Comment Likes: ${commentLikesCount}`);
    console.log(`Article Likes: ${articleLikesCount}`);
    console.log("==========================================");
    console.log("✅ Visit http://localhost:3000/profile to verify!");

    await db.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await db.$disconnect();
    process.exit(1);
  }
}

testCommentLike();
