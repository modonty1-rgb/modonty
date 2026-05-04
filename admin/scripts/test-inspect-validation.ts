/**
 * Inspect business rules errors + content for the test article.
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
try {
  const envFile = readFileSync(resolve(__dirname, "../../.env.shared"), "utf-8");
  envFile.split("\n").forEach((line) => {
    if (line.trim().startsWith("#") || !line.includes("=")) return;
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
    }
  });
} catch {}

const ARTICLE_ID = "69d6830820251ee8497527b4";
const db = new PrismaClient();

async function main() {
  const article = await db.article.findUnique({
    where: { id: ARTICLE_ID },
    select: {
      content: true,
      jsonLdValidationReport: true,
      jsonLdLastGenerated: true,
      dateModified: true,
    },
  });
  if (!article) return;

  // Extract <a> tags from content
  const links = [...(article.content.matchAll(/<a\b([^>]*?)>([\s\S]*?)<\/a>/gi))];
  console.log(`Total <a> in content: ${links.length}`);
  for (const m of links.slice(0, 5)) {
    const hrefMatch = m[1].match(/href=["']([^"']+)["']/i);
    const text = m[2].replace(/<[^>]+>/g, "").trim().slice(0, 60);
    console.log(`  href: ${hrefMatch?.[1]}  text: "${text}"`);
  }

  console.log("");
  console.log(`jsonLdLastGenerated: ${article.jsonLdLastGenerated?.toISOString() ?? "null"}`);
  console.log(`dateModified:        ${article.dateModified?.toISOString() ?? "null"}`);
  const stale = article.dateModified && article.jsonLdLastGenerated && article.dateModified > article.jsonLdLastGenerated;
  console.log(`Cache stale?         ${stale}`);

  console.log("");
  console.log("Business rules report:");
  const report = article.jsonLdValidationReport as { custom?: { errors: string[] } } | null;
  if (report?.custom?.errors) {
    for (const err of report.custom.errors) {
      console.log(`  ❌ ${err}`);
    }
  } else {
    console.log("  (no custom errors)");
  }
}

main().catch(console.error).finally(() => db.$disconnect());
