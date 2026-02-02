import { db } from "../modonty/lib/db";

async function diagnoseArticleComments() {
  const articleSlug = process.argv[2];

  if (!articleSlug) {
    console.log("Usage: npm run diagnose-article-comments -- <article-slug>");
    console.log("Example: npm run diagnose-article-comments -- my-article");
    process.exit(1);
  }

  try {
    console.log("=================================================");
    console.log(`📊 ARTICLE COMMENTS DIAGNOSTICS: ${articleSlug}`);
    console.log("=================================================\n");

    const article = await db.article.findFirst({
      where: { slug: articleSlug },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!article) {
      console.log(`❌ Article not found: ${articleSlug}`);
      process.exit(1);
    }

    console.log("📄 ARTICLE INFO");
    console.log("-------------------------------------------------");
    console.log(`Title: ${article.title}`);
    console.log(`Slug: ${article.slug}`);
    console.log(`Status: ${article.status}`);
    console.log(`Article ID: ${article.id}`);
    console.log(`_count.comments: ${article._count.comments}\n`);

    console.log("📊 COMMENT BREAKDOWN BY STATUS");
    console.log("-------------------------------------------------");

    const commentsByStatus = await db.comment.groupBy({
      by: ["status"],
      where: { articleId: article.id },
      _count: true,
    });

    if (commentsByStatus.length === 0) {
      console.log("⚠️  No comments found for this article\n");
    } else {
      commentsByStatus.forEach((group) => {
        console.log(`  ${group.status}: ${group._count}`);
      });
      console.log("");
    }

    console.log("📊 COMMENT BREAKDOWN BY PARENT ID");
    console.log("-------------------------------------------------");

    const topLevel = await db.comment.count({
      where: { articleId: article.id, parentId: null },
    });

    const replies = await db.comment.count({
      where: { articleId: article.id, parentId: { not: null } },
    });

    console.log(`  Top-level comments (parentId = null): ${topLevel}`);
    console.log(`  Replies (parentId != null): ${replies}\n`);

    console.log("📊 APPROVED TOP-LEVEL COMMENTS (What Page Query Gets)");
    console.log("-------------------------------------------------");

    const approvedTopLevel = await db.comment.findMany({
      where: {
        articleId: article.id,
        status: "APPROVED",
        parentId: null,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        status: true,
        parentId: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    console.log(`Found: ${approvedTopLevel.length} comments`);
    console.log("(This is what the article page query returns)\n");

    if (approvedTopLevel.length > 0) {
      console.log("Comments:");
      approvedTopLevel.forEach((comment, index) => {
        console.log(`${index + 1}. [${comment.status}] "${comment.content.substring(0, 60)}..."`);
        console.log(`   Author: ${comment.author?.name || "Anonymous"}`);
        console.log(`   Created: ${comment.createdAt.toLocaleString()}`);
        console.log(`   Parent ID: ${comment.parentId || "null (top-level)"}`);
        console.log(`   Comment ID: ${comment.id}\n`);
      });
    }

    console.log("📊 ALL COMMENTS (Unfiltered)");
    console.log("-------------------------------------------------");

    const allComments = await db.comment.findMany({
      where: { articleId: article.id },
      select: {
        id: true,
        status: true,
        parentId: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Total: ${allComments.length} comments\n`);

    if (allComments.length > 0) {
      console.log("Breakdown:");
      allComments.forEach((comment, index) => {
        console.log(`${index + 1}. [${comment.status}] ${comment.parentId ? "(REPLY)" : "(TOP-LEVEL)"}`);
        console.log(`   "${comment.content.substring(0, 50)}..."`);
        console.log(`   Author: ${comment.author?.name || "Anonymous"}`);
        console.log(`   ID: ${comment.id}\n`);
      });
    }

    console.log("=================================================");
    console.log("📋 DIAGNOSIS SUMMARY");
    console.log("=================================================\n");

    const pendingCount = commentsByStatus.find((g) => g.status === "PENDING")?._count || 0;
    const approvedCount = commentsByStatus.find((g) => g.status === "APPROVED")?._count || 0;
    const rejectedCount = commentsByStatus.find((g) => g.status === "REJECTED")?._count || 0;

    console.log(`Total comments (_count): ${article._count.comments}`);
    console.log(`PENDING: ${pendingCount}`);
    console.log(`APPROVED: ${approvedCount}`);
    console.log(`REJECTED: ${rejectedCount}`);
    console.log(`Top-level APPROVED: ${approvedTopLevel.length}`);
    console.log(`Article page displays: ${approvedTopLevel.length} comments\n`);

    if (approvedTopLevel.length === 0 && article._count.comments > 0) {
      console.log("❌ MISMATCH DETECTED");
      console.log("-------------------------------------------------");
      console.log(`Counter shows: ${article._count.comments} comments`);
      console.log(`Page displays: 0 comments`);
      console.log("");

      if (pendingCount > 0) {
        console.log(`⚠️  ${pendingCount} comments are PENDING approval`);
        console.log("Action: Run 'npm run approve-comments' to approve them");
      }

      if (approvedCount > 0 && approvedTopLevel.length === 0) {
        console.log(`⚠️  ${approvedCount} APPROVED comments exist but have parentId set (they are replies)`);
        console.log("Action: Check if approved comments should be top-level");
      }
    } else if (approvedTopLevel.length > 0) {
      console.log("✅ WORKING CORRECTLY");
      console.log("-------------------------------------------------");
      console.log(`${approvedTopLevel.length} approved top-level comments found`);
      console.log("These should display on the article page");
    } else {
      console.log("⚠️  NO COMMENTS");
      console.log("-------------------------------------------------");
      console.log("No comments exist for this article yet");
      console.log("Action: Create test comment with 'npm run create-test-comment'");
    }

    console.log("\n=================================================\n");
  } catch (error) {
    console.error("❌ Error during diagnosis:", error);
  } finally {
    await db.$disconnect();
  }
}

diagnoseArticleComments();
