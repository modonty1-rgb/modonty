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
  // Clear mainEntityOfPage so the generator rebuilds from siteUrl + slug
  await db.article.update({
    where: { id: "69d6830820251ee8497527b4" },
    data: { mainEntityOfPage: null, canonicalUrl: null },
  });
  const { regenerateJsonLd } = await import("../lib/seo/jsonld-storage");
  const r = await regenerateJsonLd("69d6830820251ee8497527b4");
  console.log("Regen:", r.success ? "✅" : "❌", "errors:", r.validationReport?.adobe?.errors?.length, "/", r.validationReport?.custom?.errors?.length);
  const a = await db.article.findUnique({ where: { id: "69d6830820251ee8497527b4" }, select: { mainEntityOfPage: true, jsonLdStructuredData: true } });
  console.log("DB mainEntityOfPage:", a?.mainEntityOfPage);
  const ld = JSON.parse(a?.jsonLdStructuredData ?? "{}");
  const articleNode = (ld["@graph"] ?? []).find((n: { "@type"?: string }) => n["@type"] === "Article" || n["@type"] === "BlogPosting");
  console.log("JSON-LD @id:", articleNode?.["@id"]);
  await db.$disconnect();
})();
