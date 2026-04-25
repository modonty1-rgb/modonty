/**
 * READ-ONLY script — investigates pending FAQs and comments source
 * Determines if entries are from real users, visitors, or seed/chatbot
 *
 * USAGE: pnpm tsx admin/scripts/check-engagement-source.ts
 */
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../.env.local"), override: true });

import { PrismaClient } from "@prisma/client";

async function main() {
  // Show which DB we're talking to
  const url = process.env.DATABASE_URL ?? "";
  const dbName = url.split("/").pop()?.split("?")[0] ?? "unknown";
  console.log(`\n🔌 DB: ${dbName}\n`);

  const db = new PrismaClient();

  try {
    // ── PENDING FAQs ────────────────────────────────────────────────
    console.log("═══ PENDING ARTICLE FAQs ═══");
    const totalFaqs = await db.articleFAQ.count({ where: { status: "PENDING" } });
    console.log(`Total pending FAQs: ${totalFaqs}\n`);

    // Group by source field
    const faqsBySource = await db.articleFAQ.groupBy({
      by: ["source"],
      where: { status: "PENDING" },
      _count: { _all: true },
    });
    console.log("By source:");
    for (const g of faqsBySource) {
      console.log(`  ${g.source ?? "null"} → ${g._count._all}`);
    }

    // Sample 5 FAQs with all author fields
    const sampleFaqs = await db.articleFAQ.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        question: true,
        source: true,
        submittedByName: true,
        submittedByEmail: true,
        createdAt: true,
        articleId: true,
      },
    });
    console.log("\nSample (5 most recent):");
    for (const f of sampleFaqs) {
      console.log("─".repeat(60));
      console.log(`  Question: ${f.question.slice(0, 80)}`);
      console.log(`  Source:   ${f.source ?? "null"}`);
      console.log(`  Name:     ${f.submittedByName ?? "(empty)"}`);
      console.log(`  Email:    ${f.submittedByEmail ?? "(empty)"}`);
      console.log(`  Date:     ${f.createdAt.toISOString().slice(0, 10)}`);
    }

    // ── PENDING COMMENTS ────────────────────────────────────────────
    console.log("\n\n═══ PENDING COMMENTS ═══");
    const totalComments = await db.comment.count({ where: { status: "PENDING" } });
    console.log(`Total pending comments: ${totalComments}\n`);

    const withAuthor = await db.comment.count({
      where: { status: "PENDING", authorId: { not: null } },
    });
    const anon = totalComments - withAuthor;
    console.log(`With registered user: ${withAuthor}`);
    console.log(`Anonymous:            ${anon}`);

    // Sample comments with author info
    const sampleComments = await db.comment.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        content: true,
        createdAt: true,
        authorId: true,
        author: { select: { name: true, email: true, role: true } },
      },
    });
    console.log("\nSample (5 most recent):");
    for (const c of sampleComments) {
      console.log("─".repeat(60));
      console.log(`  Content: ${c.content.slice(0, 80)}`);
      console.log(`  Author:  ${c.author?.name ?? "(anonymous)"}`);
      console.log(`  Email:   ${c.author?.email ?? "(no user)"}`);
      console.log(`  Role:    ${c.author?.role ?? "(no role)"}`);
      console.log(`  Date:    ${c.createdAt.toISOString().slice(0, 10)}`);
    }
  } catch (e) {
    console.error("\n❌ Error:", e);
  } finally {
    await db.$disconnect();
  }
}

main();
