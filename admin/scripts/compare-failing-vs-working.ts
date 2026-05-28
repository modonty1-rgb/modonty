/**
 * READ-ONLY diff: compare a working article vs failing ones to find the difference.
 */
import { PrismaClient } from "@prisma/client";

const PROD_URL = "mongodb+srv://modonty-admin:2053712713@modonty-cluster.tgixa8h.mongodb.net/modonty?retryWrites=true&w=majority&appName=modonty-cluster";
console.log(`🌐 PROD\n`);

const db = new PrismaClient({ datasources: { db: { url: PROD_URL } } });

const SLUGS = {
  WORKING: "ما-هو-السيو",
  FAILING_1: "تفعيل-باقات-stc-بأسعار-أقل-من-الرسمي-داخل-السعودية",
  FAILING_2: "كيف-يساعد-سيو-في-زيادة-المبيعات",
};

async function inspect(label: string, slug: string) {
  const a = await db.article.findFirst({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      authorId: true,
      categoryId: true,
      clientId: true,
      featuredImageId: true,
      jsonLdStructuredData: true,
      nextjsMetadata: true,
      datePublished: true,
      updatedAt: true,
      _count: { select: { faqs: true, tags: true, views: true, likes: true, comments: true } },
      author: { select: { id: true, slug: true } },
      category: { select: { id: true, slug: true } },
      client: { select: { id: true, slug: true, name: true } },
      featuredImage: { select: { id: true, url: true } },
    },
  });
  console.log(`\n━━━━ ${label}: "${slug}" ━━━━`);
  if (!a) { console.log("  ❌ not found"); return; }
  console.log(`  id:                ${a.id}`);
  console.log(`  status:            ${a.status}`);
  console.log(`  clientId:          ${a.clientId}`);
  console.log(`  client:            ${a.client?.slug} (${a.client?.name})`);
  console.log(`  authorId:          ${a.authorId}`);
  console.log(`  author:            ${a.author?.slug ?? "(null)"}`);
  console.log(`  categoryId:        ${a.categoryId}`);
  console.log(`  category:          ${a.category?.slug ?? "(null)"}`);
  console.log(`  featuredImageId:   ${a.featuredImageId ?? "(null)"}`);
  console.log(`  featuredImage URL: ${a.featuredImage?.url ?? "(null)"}`);
  console.log(`  hasJsonLD:         ${!!a.jsonLdStructuredData}  len=${a.jsonLdStructuredData?.length ?? 0}`);
  console.log(`  hasNextjsMeta:     ${!!a.nextjsMetadata}`);
  console.log(`  _count.faqs:       ${a._count.faqs}`);
  console.log(`  _count.tags:       ${a._count.tags}`);
  console.log(`  _count.views:      ${a._count.views}`);
  console.log(`  _count.likes:      ${a._count.likes}`);
  console.log(`  _count.comments:   ${a._count.comments}`);
  if (a.jsonLdStructuredData) {
    try {
      JSON.parse(a.jsonLdStructuredData);
      console.log(`  jsonLD valid:      ✅`);
    } catch (e: any) {
      console.log(`  jsonLD valid:      ❌ ${e.message?.slice(0,100)}`);
    }
  }
}

async function run() {
  await inspect("WORKING (200)", SLUGS.WORKING);
  await inspect("FAILING 1 (500)", SLUGS.FAILING_1);
  await inspect("FAILING 2 (500)", SLUGS.FAILING_2);
}

run().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
