/**
 * Run before every push: pnpm changelog
 * Updates entries below — writes to LOCAL + PROD instantly.
 */
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env.shared") });

// ─── UPDATE THESE BEFORE EVERY PUSH ──────────────────────────────────────────
const entries = [
  {
    version: "0.63.1 (admin + modonty)",
    title: "admin v0.63.1 — Sitemap perfected per Google Search Central 2026 + dateModified bug fix + image-sitemap.xml restored",
    items: [
      { type: "fix" as const, text: "CRITICAL bug: `dateModified` field was NEVER updated when admin edited an article — `update-article.ts` wrote `ogArticleModifiedTime` but skipped `dateModified` entirely. Sitemap falls back to `dateModified || datePublished` — so after first publish, lastmod stayed frozen on the original publish date forever, even after edits. Google saw 'unchanged content' and never recrawled. Fixed in 3 mutation paths: `update-article.ts`, `publish-article.ts`, `publish-article-by-id.ts`. Now every save updates `dateModified: new Date()` → next sitemap fetch reflects reality → Google detects change → recrawl triggered." },
      { type: "feature" as const, text: "Created missing `modonty/app/image-sitemap.xml/route.ts` — was referenced in admin UI + memory but the actual route file was absent (returned 404 on PROD). Now serves dedicated image sitemap with all PUBLISHED articles' images: featured + all in-content `<img>` URLs (extracted via regex). Follows Google 2026 spec: only `<image:loc>` required (caption/title/license/geo_location are deprecated). Verified on DEV: 25 articles emit clean XML with proper image:image namespace." },
      { type: "fix" as const, text: "Sitemap rewrite per Google Search Central 2026 best practices: (1) `lastmod` ONLY when 'consistently and verifiably accurate' — removed from 12 static code-only pages (about, terms, legal/*, help/*, contact, news) so Google trusts sitemap rather than seeing `new Date()` lies. (2) Listing pages (`/`, `/categories`, `/clients`, `/tags`, `/industries`, `/trending`) now compute `lastmod` as MAX(child.updatedAt) instead of `new Date()` — accurate reflection of last content change. (3) Added 6 missing pages: `/trending`, `/industries`, `/industries/[slug]` (dynamic from DB), `/help/faq`, `/help/feedback`, `/help`. (4) Used `new URL().href` for all URLs (consistent percent-encoding for Arabic slugs). (5) `priority` + `changefreq` omitted (Google officially ignores). Final output: 134 URLs (was ~80), every URL has either accurate lastmod or omitted lastmod — zero faked timestamps." },
      { type: "fix" as const, text: "Verified vs official sources (Google Search Central docs + Context7 + sitemap.org protocol spec + Next.js 16.2.2 MetadataRoute.Sitemap docs): image sitemap can be separate from main sitemap ('equally fine for Google'). Main sitemap stays lean for URL discovery; image-sitemap.xml handles Google Images. No need for `xhtml:link` hreflang (modonty serves same URL for ar-SA + ar-EG)." },
      { type: "fix" as const, text: "Live test on DEV verified: sitemap.xml = 134 URLs · static pages emit `<loc>` only (no lastmod) · dynamic pages have real DB timestamps · articles include featuredImage. image-sitemap.xml = 25 articles · clean `xmlns:image` namespace · proper image:loc per Google deprecation announcement." },
    ],
  },
];
// ─────────────────────────────────────────────────────────────────────────────

// Hardcoded PROD DB URL (user decision 2026-04-29) — to avoid env juggling.
// ⚠️ Trade-off: URL credentials are in git history. Rotate Atlas password = update all 3 changelog scripts.
const PRODUCTION_DATABASE_URL = "mongodb+srv://modonty-admin:2053712713@modonty-cluster.tgixa8h.mongodb.net/modonty?retryWrites=true&w=majority&appName=modonty-cluster";

const localDb = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const prodDb = new PrismaClient({ datasources: { db: { url: PRODUCTION_DATABASE_URL } } });

async function run() {
  if (!process.env.DATABASE_URL) { console.error("❌ DATABASE_URL missing"); process.exit(1); }

  for (const entry of entries) {
    const [local, prod] = await Promise.all([
      localDb.changelog.create({ data: entry }),
      prodDb.changelog.create({ data: entry }),
    ]);
    console.log(`✅ v${entry.version} — LOCAL: ${local.id}  PROD: ${prod.id}`);
  }

  console.log(`\nDone. ${entries.length} entries added to both databases.`);
  await Promise.all([localDb.$disconnect(), prodDb.$disconnect()]);
}

run().catch((e) => { console.error(e); process.exit(1); });
