import { db } from "../lib/db";

async function main() {
  const articles = await db.article.findMany({
    where: { clientId: "69e8927b6a15f350c2158a2e", status: "PUBLISHED" },
    select: { id: true, slug: true, title: true },
    take: 3,
  });
  console.log(JSON.stringify(articles, null, 2));
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
