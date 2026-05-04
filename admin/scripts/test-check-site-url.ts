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
  const s = await db.settings.findFirst({ select: { siteUrl: true, siteName: true } });
  console.log("Settings.siteUrl:", JSON.stringify(s?.siteUrl));
  console.log("Settings.siteName:", JSON.stringify(s?.siteName));
  console.log("env NEXT_PUBLIC_SITE_URL:", JSON.stringify(process.env.NEXT_PUBLIC_SITE_URL));
  await db.$disconnect();
})();
