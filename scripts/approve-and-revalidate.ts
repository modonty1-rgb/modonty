import { db } from "../modonty/lib/db";

async function approveAndRevalidate() {
  try {
    console.log("=================================================");
    console.log("✅ APPROVE COMMENTS & AUTO-REVALIDATE");
    console.log("=================================================\n");

    console.log("Finding pending comments...");
    
    const pendingComments = await db.comment.findMany({
      where: { status: "PENDING" },
      include: {
        article: {
          select: {
            id: true,
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

    console.log(`Found ${pendingComments.length} pending comments\n`);

    if (pendingComments.length === 0) {
      console.log("✅ No pending comments to approve");
      return;
    }

    console.log("Pending comments to approve:");
    pendingComments.forEach((comment, index) => {
      console.log(`${index + 1}. "${comment.content.substring(0, 60)}..."`);
      console.log(`   Article: ${comment.article.title}`);
      console.log(`   Author: ${comment.author?.name || "Anonymous"}`);
      console.log(`   Created: ${comment.createdAt.toLocaleString()}\n`);
    });

    console.log("-------------------------------------------------");
    console.log("Approving comments...");
    
    const result = await db.comment.updateMany({
      where: { status: "PENDING" },
      data: { status: "APPROVED" },
    });

    console.log(`✅ Approved ${result.count} comments!\n`);

    const uniqueSlugs = Array.from(new Set(pendingComments.map(c => c.article.slug)));
    
    console.log("-------------------------------------------------");
    console.log(`📝 Revalidating ${uniqueSlugs.size} article page(s)...`);
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const revalidationSecret = process.env.REVALIDATION_SECRET || "dev-secret-key";
    const revalidationResults: { slug: string; success: boolean; error?: string }[] = [];

    for (const slug of uniqueSlugs) {
      try {
        console.log(`   Revalidating: /articles/${slug}`);
        
        const response = await fetch(`${baseUrl}/api/revalidate/article`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-revalidation-secret": revalidationSecret,
          },
          body: JSON.stringify({ slug, secret: revalidationSecret }),
        });

        if (response.ok) {
          revalidationResults.push({ slug, success: true });
          console.log(`   ✅ Success: ${slug}`);
        } else {
          const errorText = await response.text();
          revalidationResults.push({ slug, success: false, error: errorText });
          console.log(`   ❌ Failed: ${slug} - ${response.status} ${errorText}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        revalidationResults.push({ slug, success: false, error: errorMsg });
        console.log(`   ❌ Error: ${slug} - ${errorMsg}`);
      }
    }

    console.log("\n=================================================");
    console.log("📊 SUMMARY");
    console.log("=================================================");
    console.log(`Comments approved: ${result.count}`);
    console.log(`Articles affected: ${uniqueSlugs.size}`);
    
    const successfulRevalidations = revalidationResults.filter(r => r.success).length;
    const failedRevalidations = revalidationResults.filter(r => !r.success).length;
    
    console.log(`Revalidations successful: ${successfulRevalidations}`);
    console.log(`Revalidations failed: ${failedRevalidations}`);

    if (failedRevalidations > 0) {
      console.log("\n⚠️  Some revalidations failed. Manual cache clear options:");
      console.log("   1. Wait 5 minutes for automatic ISR cache expiration");
      console.log("   2. Manually trigger revalidation:");
      revalidationResults.filter(r => !r.success).forEach(result => {
        console.log(`      curl -X POST ${baseUrl}/api/revalidate/article -H "Content-Type: application/json" -d '{"slug":"${result.slug}"}'`);
      });
    }

    console.log("\n✅ Done! Comments should now be visible on the affected articles.");
    console.log("   Visit the articles to verify:");
    uniqueSlugs.forEach(slug => {
      console.log(`   - ${baseUrl}/articles/${slug}`);
    });
    console.log("\n=================================================\n");

  } catch (error) {
    console.error("❌ Error approving comments:", error);
  } finally {
    await db.$disconnect();
  }
}

approveAndRevalidate();
