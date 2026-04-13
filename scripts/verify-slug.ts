import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const broken = await db.article.findFirst({ where: { slug: "م" }, select: { id: true, slug: true, title: true } });
  console.log("Still broken?", broken ? JSON.stringify(broken) : "NO — slug 'م' not found ✅");
  const fixed = await db.article.findFirst({ where: { id: "69d74957bcbae09689d031ac" }, select: { id: true, slug: true, title: true } });
  console.log("Fixed article:", fixed ? JSON.stringify(fixed) : "NOT FOUND");
}
main().catch(console.error).finally(() => db.$disconnect());
