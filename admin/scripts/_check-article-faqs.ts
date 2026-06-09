/** TEMP read-only — inspect FAQ status/answers for the lab test article (modonty_dev only). */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
for (const envPath of [resolve(__dirname, "../../.env.shared"), resolve(__dirname, "../.env")]) {
  try {
    const f = readFileSync(envPath, "utf-8");
    f.split("\n").forEach((l) => {
      if (l.trim().startsWith("#") || !l.includes("=")) return;
      const [k, ...v] = l.split("=");
      const key = k.trim();
      const val = v.join("=").trim().replace(/^["']|["']$/g, "");
      if (!process.env[key] || key === "DATABASE_URL") process.env[key] = val;
    });
  } catch {}
}

const ARTICLE_ID = "69d74957bcbae09689d031ac";
const PUBLISH = process.argv.includes("--publish");
const db = new PrismaClient();

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  console.log("DB:", url.replace(/(mongodb\+srv:\/\/)[^@]+@/, "$1***:***@"));
  if (!url.includes("modonty_dev")) { console.error("❌ ABORT — not modonty_dev"); process.exit(1); }

  const faqs = await db.articleFAQ.findMany({
    where: { articleId: ARTICLE_ID },
    select: { id: true, question: true, answer: true, status: true, source: true, submittedByEmail: true },
  });
  console.log(`\nFAQs for article ${ARTICLE_ID}: ${faqs.length}`);
  faqs.forEach((f, i) =>
    console.log(`  ${i + 1}. [${f.status}] source=${JSON.stringify(f.source)} submitter=${f.submittedByEmail ? "yes" : "no"} answer:${(f.answer ?? "").trim().length}ch · Q: ${f.question.slice(0, 45)}`)
  );

  // ── Empirical leak check across the WHOLE DB (read-only) ──
  const [manual, user, chatbot, srcNull, misroutedReader, readerTagged] = await Promise.all([
    db.articleFAQ.count({ where: { source: "manual" } }),
    db.articleFAQ.count({ where: { source: "user" } }),
    db.articleFAQ.count({ where: { source: "chatbot" } }),
    db.articleFAQ.count({ where: { source: null } }),
    // reader submission (has submitter email) that LANDED as manual = misrouted (the bug)
    db.articleFAQ.count({ where: { source: "manual", submittedByEmail: { not: null } } }),
    db.articleFAQ.count({ where: { OR: [{ source: "user" }, { source: "chatbot" }] } }),
  ]);
  console.log(`\n── source distribution (all FAQs) ──`);
  console.log(`  manual=${manual} · user=${user} · chatbot=${chatbot} · null=${srcNull}`);
  console.log(`  reader-tagged (user|chatbot, shows in console inbox) = ${readerTagged}`);
  console.log(`  🔴 MISROUTED reader questions (source=manual BUT has submitter) = ${misroutedReader}`);

  if (PUBLISH) {
    const res = await db.articleFAQ.updateMany({
      where: { articleId: ARTICLE_ID, status: "PENDING", AND: [{ answer: { not: null } }, { answer: { not: "" } }] },
      data: { status: "PUBLISHED" },
    });
    console.log(`\n✅ Published ${res.count} answered FAQ(s) (PENDING → PUBLISHED).`);
  } else {
    console.log("\n🔎 DRY RUN — pass --publish to set answered PENDING FAQs → PUBLISHED.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
