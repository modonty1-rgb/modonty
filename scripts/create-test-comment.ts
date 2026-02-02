import { db } from "../modonty/lib/db";

async function createTestComment() {
  try {
    console.log("=================================================");
    console.log("🧪 CREATE TEST COMMENT");
    console.log("=================================================\n");

    console.log("Finding a published article...");
    
    const article = await db.article.findFirst({
      where: {
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    if (!article) {
      console.log("❌ No published articles found. Please create an article first.");
      return;
    }

    console.log(`✅ Found article: "${article.title}"`);
    console.log(`   Slug: ${article.slug}\n`);

    console.log("Finding a test user...");
    
    let user = await db.user.findFirst({
      where: {
        email: "test@example.com",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      console.log("⚠️  Test user not found. Creating one...");
      
      user = await db.user.create({
        data: {
          email: "test@example.com",
          name: "Test User",
          role: "EDITOR",
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      
      console.log(`✅ Created test user: ${user.name} (${user.email})`);
    } else {
      console.log(`✅ Found test user: ${user.name} (${user.email})`);
    }

    console.log("\nCreating test comment...");
    
    const testComments = [
      "هذا تعليق تجريبي رائع! المحتوى مفيد جداً.",
      "شكراً على هذا المقال المميز.",
      "معلومات قيمة ومفيدة. أتمنى المزيد من هذا المحتوى.",
      "مقال رائع! استفدت منه كثيراً.",
    ];

    const randomComment = testComments[Math.floor(Math.random() * testComments.length)];

    const comment = await db.comment.create({
      data: {
        articleId: article.id,
        authorId: user.id,
        content: randomComment,
        status: "PENDING",
      },
      select: {
        id: true,
        content: true,
        status: true,
        createdAt: true,
      },
    });

    console.log("\n=================================================");
    console.log("✅ TEST COMMENT CREATED");
    console.log("=================================================");
    console.log(`Comment ID: ${comment.id}`);
    console.log(`Content: "${comment.content}"`);
    console.log(`Status: ${comment.status}`);
    console.log(`Created: ${comment.createdAt.toLocaleString()}`);
    console.log(`Article: ${article.title}`);
    console.log(`Article URL: /articles/${article.slug}`);
    
    console.log("\n📝 Next Steps:");
    console.log("1. Check database:");
    console.log("   npm run diagnose-comments");
    console.log("\n2. Approve the comment:");
    console.log("   npm run approve-comments");
    console.log("\n3. View the article:");
    console.log(`   http://localhost:3000/articles/${article.slug}`);
    console.log("\n=================================================\n");

  } catch (error) {
    console.error("❌ Error creating test comment:", error);
  } finally {
    await db.$disconnect();
  }
}

createTestComment();
