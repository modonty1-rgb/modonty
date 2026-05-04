/**
 * Fix remaining errors on test article + regenerate JSON-LD:
 *   1. Add a 2nd internal link to content
 *   2. Set datePublished (will be required by gate anyway)
 *   3. Regenerate JSON-LD cache + validation report
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load both .env.shared (root) and admin/.env so AUTH_SECRET + DATABASE_URL etc.
for (const envPath of [resolve(__dirname, "../../.env.shared"), resolve(__dirname, "../.env")]) {
  try {
    const envFile = readFileSync(envPath, "utf-8");
    envFile.split("\n").forEach((line) => {
      if (line.trim().startsWith("#") || !line.includes("=")) return;
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        const k = key.trim();
        const v = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        if (!process.env[k] || k === "DATABASE_URL") process.env[k] = v;
      }
    });
  } catch {}
}

const ARTICLE_ID = "69d6830820251ee8497527b4";
const db = new PrismaClient();

async function main() {
  if (!(process.env.DATABASE_URL ?? "").includes("modonty_dev")) {
    console.error("❌ ABORT — DB is not modonty_dev");
    process.exit(1);
  }

  // Step 1 — Read current content
  const article = await db.article.findUnique({
    where: { id: ARTICLE_ID },
    select: { content: true, datePublished: true },
  });
  if (!article) { console.error("Not found"); return; }

  // Step 2 — Add a 2nd internal link to content (only if not already added)
  let newContent = article.content;
  const additionalLink = `<p><a href="/categories/seo">اقرأ المزيد عن SEO في فئة SEO</a></p>`;
  if (!newContent.includes('href="/categories/seo"')) {
    newContent = newContent + "\n" + additionalLink;
  }

  // Step 3 — Set datePublished if missing (required by JSON-LD generator)
  const datePublished = article.datePublished ?? new Date();

  // Step 4 — Update article (this bumps dateModified)
  await db.article.update({
    where: { id: ARTICLE_ID },
    data: {
      content: newContent,
      datePublished,
    },
  });

  console.log("✅ Content updated (added 2nd internal link)");
  console.log(`✅ datePublished set: ${datePublished.toISOString()}`);

  // Step 5 — Regenerate JSON-LD via the storage helper
  // We import dynamically because regenerateJsonLd uses other lib pieces
  const { regenerateJsonLd } = await import("../lib/seo/jsonld-storage");
  const result = await regenerateJsonLd(ARTICLE_ID);
  console.log("");
  console.log("JSON-LD regeneration:");
  console.log(`  success:  ${result.success}`);
  if (result.success) {
    const adobeErrors = result.validationReport?.adobe?.errors?.length ?? 0;
    const customErrors = result.validationReport?.custom?.errors?.length ?? 0;
    console.log(`  Adobe errors:    ${adobeErrors}`);
    console.log(`  Business errors: ${customErrors}`);
    if (customErrors > 0) {
      console.log(`  Errors:`);
      for (const e of result.validationReport!.custom!.errors!) {
        console.log(`    - ${e}`);
      }
    }
  } else {
    console.log(`  error: ${result.error}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
