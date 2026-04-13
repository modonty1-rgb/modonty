import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const all = await db.article.findMany({ select: { id: true, slug: true, title: true, clientId: true } });
  const short = all.filter(a => a.slug.length <= 5);
  console.log("Short slugs found:", short.length);
  short.forEach(a => console.log(JSON.stringify(a)));
}
main().catch(console.error).finally(() => db.$disconnect());
