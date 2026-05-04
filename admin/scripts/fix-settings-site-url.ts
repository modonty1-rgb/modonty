/**
 * One-time fix: update Settings.siteUrl to canonical www-prefixed value.
 * Source of truth for all SEO generators.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
for (const p of [resolve(__dirname, "../../.env.shared"), resolve(__dirname, "../.env")]) {
  try { readFileSync(p, "utf-8").split("\n").forEach((l) => { if (!l.trim().startsWith("#") && l.includes("=")) { const [k, ...v] = l.split("="); const k2 = k.trim(); const v2 = v.join("=").trim().replace(/^["']|["']$/g, ""); if (!process.env[k2] || k2 === "DATABASE_URL") process.env[k2] = v2; }}); } catch {}
}

const CORRECT = "https://www.modonty.com";
const db = new PrismaClient();

async function main() {
  if (!(process.env.DATABASE_URL ?? "").includes("modonty_dev")) {
    console.error("❌ ABORT — not modonty_dev"); process.exit(1);
  }
  const before = await db.settings.findFirst({ select: { id: true, siteUrl: true } });
  if (!before) { console.error("No Settings row"); return; }
  console.log(`Before: ${before.siteUrl}`);
  if (before.siteUrl === CORRECT) {
    console.log("✅ Already correct");
    return;
  }
  await db.settings.update({ where: { id: before.id }, data: { siteUrl: CORRECT } });
  const after = await db.settings.findUnique({ where: { id: before.id }, select: { siteUrl: true } });
  console.log(`After:  ${after?.siteUrl}`);
  console.log("✅ Settings.siteUrl fixed");
}
main().catch(console.error).finally(() => db.$disconnect());
