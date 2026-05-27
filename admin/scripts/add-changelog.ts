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
    version: "1.49.1 (modonty)",
    title: "modonty v1.49.1 — SEO fixes from Mariam's first audit: live JSON-LD generation + hreflang ar-SA/ar-EG + html lang ar-SA + homepage og:url to www",
    items: [
      { type: "fix" as const, text: "Critical #3 (Mariam audit): Article JSON-LD was being read from stale DB cache (article.jsonLdStructuredData column) with broken `author` and `image` as @id references only. Rich Results validator failed for all 25 articles. modonty/app/articles/[slug]/page.tsx now always calls generateArticleStructuredData() live — the live generator already inlines `author.name`, `author.url`, `author.image` (Person type) + image as buildAspectRatiosArray. Data fetchers above are cached via 'use cache', so this only re-runs the JSON-LD construction, not the DB queries." },
      { type: "fix" as const, text: "Important #4 (Mariam audit): Added site-wide hreflang via modonty/app/layout.tsx metadata.alternates.languages with ar-SA + ar-EG + ar + x-default mappings. Site previously had ZERO hreflang on homepage; AI search engines couldn't geo-target the content. Per-page generateMetadata can still override alternates.canonical without losing the languages map." },
      { type: "fix" as const, text: "Important #5 (Mariam audit): Homepage og:url was https://modonty.com (no www) from DB Settings.homeMetaTags — mismatched canonical (www). Override in app/page.tsx generateMetadata forces openGraph.url to SITE_URL/ (with www). DB row to be fixed later via admin Settings UI." },
      { type: "fix" as const, text: "Nice-to-have #8 (Mariam audit): Changed <html lang='ar'> → <html lang='ar-SA'> in layout.tsx. BCP-47 region subtag signals Saudi Arabic to AI citation systems + screen readers, improves geo-relevance." },
      { type: "fix" as const, text: "Critical #1 (Mariam audit): /image-sitemap.xml route verified existing + returns 200 with 13.7KB content. Mariam's GSC report shows 404 because GSC fetched 5/4/2026 (before our route shipped). No code change needed; will resolve when GSC re-fetches." },
      { type: "fix" as const, text: "Skipped this push: Important #7 LCP optimization (needs deeper investigation of hero image priority + script lazy-loading), Critical #2 IndexNow curl for 7 stale 5xx URLs (handled separately via terminal). Both queued for next push." },
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
