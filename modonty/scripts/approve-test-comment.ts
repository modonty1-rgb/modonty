import { db } from "../lib/db";

async function approveTestComment() {
  try {
    const comment = await db.comment.findFirst({
      where: {
        content: {
          contains: "test comment",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (comment) {
      await db.comment.update({
        where: { id: comment.id },
        data: { status: "APPROVED" },
      });
      console.log("✅ Comment approved:", comment.id);
      console.log("Content:", comment.content.substring(0, 50));
    } else {
      console.log("❌ No test comment found");
      
      const allComments = await db.comment.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          content: true,
          status: true,
          createdAt: true,
        },
      });
      
      console.log("\nRecent comments:");
      allComments.forEach((c, i) => {
        console.log(`${i + 1}. [${c.status}] ${c.content.substring(0, 40)}... (${c.id})`);
      });
    }

    await db.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    await db.$disconnect();
    process.exit(1);
  }
}

approveTestComment();
