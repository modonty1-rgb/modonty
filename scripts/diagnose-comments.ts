import { db } from "../modonty/lib/db";

async function diagnoseComments() {
  try {
    console.log("=================================================");
    console.log("📊 COMMENT DIAGNOSTICS");
    console.log("=================================================\n");

    console.log("1️⃣ Overall Comment Statistics");
    console.log("-------------------------------------------------");
    
    const totalComments = await db.comment.count();
    console.log(`Total comments in database: ${totalComments}`);

    const byStatus = await db.comment.groupBy({
      by: ["status"],
      _count: true,
    });

    console.log("\nComments by status:");
    byStatus.forEach((group) => {
      console.log(`  ${group.status}: ${group._count}`);
    });

    const topLevelComments = await db.comment.count({
      where: { parentId: null },
    });
    console.log(`\nTop-level comments (parentId = null): ${topLevelComments}`);

    const replies = await db.comment.count({
      where: { parentId: { not: null } },
    });
    console.log(`Replies (parentId != null): ${replies}`);

    console.log("\n2️⃣ Comments by Article");
    console.log("-------------------------------------------------");
    
    const commentsByArticle = await db.article.findMany({
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
      where: {
        comments: {
          some: {},
        },
      },
      orderBy: {
        comments: {
          _count: "desc",
        },
      },
      take: 10,
    });

    if (commentsByArticle.length === 0) {
      console.log("⚠️  No articles have comments");
    } else {
      console.log(`Top ${commentsByArticle.length} articles with comments:\n`);
      commentsByArticle.forEach((article, index) => {
        console.log(`${index + 1}. "${article.title}"`);
        console.log(`   Slug: ${article.slug}`);
        console.log(`   Total comments: ${article._count.comments}`);
        console.log(`   URL: /articles/${article.slug}\n`);
      });
    }

    console.log("\n3️⃣ Recent Comments (Last 10)");
    console.log("-------------------------------------------------");
    
    const recentComments = await db.comment.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        article: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    if (recentComments.length === 0) {
      console.log("⚠️  No comments found in database");
    } else {
      recentComments.forEach((comment, index) => {
        console.log(`${index + 1}. [${comment.status}] "${comment.content.substring(0, 60)}..."`);
        console.log(`   Article: ${comment.article.title}`);
        console.log(`   Author: ${comment.author?.name || "Anonymous"} (${comment.author?.email || "N/A"})`);
        console.log(`   Created: ${comment.createdAt.toLocaleString()}`);
        console.log(`   Parent ID: ${comment.parentId || "None (top-level)"}`);
        console.log(`   URL: /articles/${comment.article.slug}#comment-${comment.id}\n`);
      });
    }

    console.log("\n4️⃣ Pending Comments Requiring Approval");
    console.log("-------------------------------------------------");
    
    const pendingComments = await db.comment.findMany({
      where: { status: "PENDING" },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        article: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (pendingComments.length === 0) {
      console.log("✅ No pending comments");
    } else {
      console.log(`⚠️  ${pendingComments.length} comments awaiting approval:\n`);
      pendingComments.forEach((comment, index) => {
        console.log(`${index + 1}. "${comment.content.substring(0, 60)}..."`);
        console.log(`   Article: ${comment.article.title}`);
        console.log(`   Author: ${comment.author?.name || "Anonymous"}`);
        console.log(`   Created: ${comment.createdAt.toLocaleString()}`);
        console.log(`   Comment ID: ${comment.id}\n`);
      });

      console.log("💡 To approve pending comments, run:");
      console.log("   npm run approve-comments");
      console.log("   or: node scripts/approve-pending-comments.ts\n");
    }

    console.log("\n5️⃣ Approved Comments (Visible on Site)");
    console.log("-------------------------------------------------");
    
    const approvedComments = await db.comment.count({
      where: { status: "APPROVED" },
    });

    console.log(`Total APPROVED comments: ${approvedComments}`);

    const approvedTopLevel = await db.comment.count({
      where: { 
        status: "APPROVED",
        parentId: null,
      },
    });

    console.log(`APPROVED top-level comments: ${approvedTopLevel}`);

    if (approvedComments > 0) {
      const recentApproved = await db.comment.findMany({
        where: { status: "APPROVED" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          article: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      });

      console.log("\nRecent approved comments:");
      recentApproved.forEach((comment, index) => {
        console.log(`${index + 1}. "${comment.content.substring(0, 50)}..."`);
        console.log(`   Article: ${comment.article.title}`);
        console.log(`   URL: /articles/${comment.article.slug}\n`);
      });
    }

    console.log("\n=================================================");
    console.log("📋 DIAGNOSIS SUMMARY");
    console.log("=================================================");

    if (totalComments === 0) {
      console.log("❌ NO COMMENTS IN DATABASE");
      console.log("   → Comments aren't showing because none exist");
      console.log("   → Create a test comment to verify the system works");
    } else if (approvedComments === 0) {
      console.log("⚠️  COMMENTS EXIST BUT NONE ARE APPROVED");
      console.log("   → Comments won't show until approved");
      console.log("   → Run: npm run approve-comments");
    } else if (approvedTopLevel === 0) {
      console.log("⚠️  APPROVED COMMENTS ARE ALL REPLIES");
      console.log("   → Only top-level comments show in the list");
      console.log("   → Check if approved comments have parentId set");
    } else {
      console.log("✅ APPROVED COMMENTS EXIST");
      console.log(`   → ${approvedTopLevel} approved top-level comments found`);
      console.log("   → If not visible, check:");
      console.log("     1. ISR cache (wait 5 minutes or revalidate)");
      console.log("     2. Article page query is working");
      console.log("     3. Component rendering logic");
    }

    console.log("\n=================================================\n");

  } catch (error) {
    console.error("❌ Error during diagnosis:", error);
  } finally {
    await db.$disconnect();
  }
}

diagnoseComments();
