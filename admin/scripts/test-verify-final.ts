import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
for (const p of [resolve(__dirname, "../../.env.shared"), resolve(__dirname, "../.env")]) {
  try { readFileSync(p, "utf-8").split("\n").forEach((l) => { if (!l.trim().startsWith("#") && l.includes("=")) { const [k, ...v] = l.split("="); const k2 = k.trim(); const v2 = v.join("=").trim().replace(/^["']|["']$/g, ""); if (!process.env[k2] || k2 === "DATABASE_URL") process.env[k2] = v2; }}); } catch {}
}
const db = new PrismaClient();
(async () => {
  const a = await db.article.findUnique({
    where: { id: "69d6830820251ee8497527b4" },
    select: { status: true, slug: true, datePublished: true, dateModified: true, jsonLdLastGenerated: true },
  });
  console.log("Final state of test article:");
  console.log(`  status:              ${a?.status}`);
  console.log(`  slug:                ${a?.slug}`);
  console.log(`  datePublished:       ${a?.datePublished?.toISOString()}`);
  console.log(`  dateModified:        ${a?.dateModified?.toISOString()}`);
  console.log(`  jsonLdLastGenerated: ${a?.jsonLdLastGenerated?.toISOString()}`);
  await db.$disconnect();
})();
