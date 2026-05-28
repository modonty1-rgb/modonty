/**
 * READ-ONLY check on PROD DB. Verifies the article slugs that Google indexed
 * match the slugs currently in DB. Detects if slugs ever changed after publish.
 */
import { PrismaClient } from "@prisma/client";

const PROD_URL = "mongodb+srv://modonty-admin:2053712713@modonty-cluster.tgixa8h.mongodb.net/modonty?retryWrites=true&w=majority&appName=modonty-cluster";
console.log(`🌐 Target: ${PROD_URL.replace(/:[^:@/]+@/, ":***@")}\n`);

const db = new PrismaClient({ datasources: { db: { url: PROD_URL } } });

const GOOGLE_SLUGS = [
  "تفعيل-باقات-stc-بأسعار-أقل-من-الرسمي-داخل-السعودية",
  "ما-هو-السيو",
  "كيف-يساعد-سيو-في-زيادة-المبيعات",
];

async function run() {
  for (const googleSlug of GOOGLE_SLUGS) {
    const article = await db.article.findFirst({
      where: { slug: googleSlug },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        clientId: true,
        canonicalUrl: true,
        datePublished: true,
        updatedAt: true,
        client: { select: { slug: true, name: true } },
      },
    });

    console.log(`\n🔎 Looking for slug: "${googleSlug}"`);
    if (!article) {
      console.log("   ❌ NOT FOUND in DB with this exact slug");
      // Search by approximate match
      const fuzzy = await db.article.findMany({
        where: { slug: { contains: googleSlug.slice(0, 10) } },
        select: { id: true, slug: true, title: true, status: true },
        take: 3,
      });
      if (fuzzy.length > 0) {
        console.log(`   ⚠️ Possible matches (fuzzy):`);
        fuzzy.forEach(f => console.log(`      · slug="${f.slug}" status=${f.status} title="${f.title?.slice(0,60)}"`));
      }
    } else {
      console.log(`   ✅ FOUND in DB`);
      console.log(`     id:             ${article.id}`);
      console.log(`     status:         ${article.status}`);
      console.log(`     title:          ${article.title}`);
      console.log(`     client.slug:    ${article.client?.slug}`);
      console.log(`     canonicalUrl:   ${article.canonicalUrl}`);
      console.log(`     datePublished:  ${article.datePublished?.toISOString() ?? "(null)"}`);
      console.log(`     updatedAt:      ${article.updatedAt?.toISOString() ?? "(null)"}`);
    }
  }

  console.log("\n📊 Sanity: total PUBLISHED articles in PROD:");
  const total = await db.article.count({ where: { status: "PUBLISHED" } });
  console.log(`   ${total} published`);
}

run().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
