import { db } from "../lib/db";

async function createTestComment() {
  try {
    // Find the article by slug
    const articleSlug = "شاهد-شبيه-بلاكبيري-يعود-بعد-سنوات-لمواجهة-التشتت-الرقمي-61";
    
    console.log("Finding article...");
    const article = await db.article.findFirst({
      where: { slug: articleSlug },
      select: { id: true, title: true },
    });

    if (!article) {
      console.log("❌ Article not found");
      process.exit(1);
    }

    console.log(`✅ Found article: "${article.title}"`);

    // Find test user
    console.log("Finding test user...");
    const testUser = await db.user.findUnique({
      where: { email: "test@modonty.com" },
      select: { id: true, name: true },
    });

    if (!testUser) {
      console.log("❌ Test user not found. Creating one...");
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash("Test123456!", 10);
      
      const newUser = await db.user.create({
        data: {
          email: "test@modonty.com",
          name: "Test User",
          password: hashedPassword,
          role: "CLIENT",
          emailVerified: new Date(),
        },
      });
      console.log(`✅ Created test user: ${newUser.name} (ID: ${newUser.id})`);
    } else {
      console.log(`✅ Found test user: ${testUser.name}`);
    }

    // Create test comment
    console.log("Creating test comment...");
    const comment = await db.comment.create({
      data: {
        content: "This is a test comment to test the like functionality. Great article!",
        articleId: article.id,
        authorId: testUser?.id || (await db.user.findUnique({ where: { email: "test@modonty.com" } }))!.id,
        status: "APPROVED", // Approve it immediately for testing
      },
    });

    console.log("==========================================");
    console.log("✅ TEST COMMENT CREATED SUCCESSFULLY!");
    console.log("==========================================");
    console.log(`Comment ID: ${comment.id}`);
    console.log(`Article: ${article.title}`);
    console.log(`URL: http://localhost:3000/articles/${articleSlug}`);
    console.log("==========================================");
    console.log("Now you can test the like button on this comment!");

    await db.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await db.$disconnect();
    process.exit(1);
  }
}

createTestComment();
