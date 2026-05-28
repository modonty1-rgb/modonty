/**
 * Check if JSON-LD canonical URL matches meta tag canonical for failing articles.
 */
import { PrismaClient } from "@prisma/client";

const PROD_URL = "mongodb+srv://modonty-admin:2053712713@modonty-cluster.tgixa8h.mongodb.net/modonty?retryWrites=true&w=majority&appName=modonty-cluster";
const db = new PrismaClient({ datasources: { db: { url: PROD_URL } } });

const SLUGS = ["ما-هو-السيو", "كيف-يساعد-سيو-في-زيادة-المبيعات", "تفعيل-باقات-stc-بأسعار-أقل-من-الرسمي-داخل-السعودية"];

async function run() {
  for (const slug of SLUGS) {
    const a = await db.article.findFirst({
      where: { slug },
      select: { slug: true, title: true, canonicalUrl: true, jsonLdStructuredData: true, nextjsMetadata: true },
    });
    if (!a) continue;
    console.log(`\n━━━ ${slug.slice(0, 40)} ━━━`);
    console.log(`DB.canonicalUrl: ${a.canonicalUrl}`);

    if (a.jsonLdStructuredData) {
      const j = JSON.parse(a.jsonLdStructuredData);
      // Extract all URLs and @id from @graph
      const found: string[] = [];
      const walk = (obj: any) => {
        if (!obj || typeof obj !== "object") return;
        if (obj["@id"]) found.push(`@id: ${obj["@id"]}`);
        if (obj["url"] && typeof obj.url === "string") found.push(`url: ${obj.url}`);
        if (obj["mainEntityOfPage"]) found.push(`mainEntityOfPage: ${typeof obj.mainEntityOfPage === "string" ? obj.mainEntityOfPage : JSON.stringify(obj.mainEntityOfPage).slice(0,100)}`);
        for (const v of Array.isArray(obj) ? obj : Object.values(obj)) walk(v);
      };
      walk(j);
      console.log(`JSON-LD URLs/IDs (${found.length}):`);
      found.slice(0, 10).forEach(f => console.log(`  ${f}`));
    }

    if (a.nextjsMetadata) {
      const meta = a.nextjsMetadata as any;
      console.log(`meta.alternates.canonical: ${meta?.alternates?.canonical ?? "(missing)"}`);
      console.log(`meta.openGraph.url: ${meta?.openGraph?.url ?? "(missing)"}`);
    }
  }
}

run().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
