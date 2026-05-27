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
    version: "0.63.4 (modonty)",
    title: "modonty v0.63.4 — CRITICAL fix: removed /articles → / redirect that was soft-404'ing all article URLs to Google + filtered 32 -test YMYL fixture slugs from sitemap",
    items: [
      { type: "fix" as const, text: "Root cause of GSC reporting 17 articles as 'Not found (404)' + 7 as '5xx': modonty/next.config.ts had a global `redirects: [{source: '/articles', destination: '/', permanent: true}]` rule for legacy bookmarks. Bug chain: (a) request arrives as /articles/{raw-arabic-slug} (e.g. /articles/ما-هو-السيو), (b) Vercel's URL normalizer corrupts non-ASCII path chars to '?' placeholders → path becomes /articles?-??-?????, (c) Next.js redirect rule matches `source: '/articles'` (query strings are ignored in source matching), (d) 308 to /?-??-????? = homepage. Google followed the chain → landed on homepage instead of the requested article → classified as soft-404 → de-indexed. v0.63.3 catch-fix was correct but unrelated — the redirect fires BEFORE the route handler executes." },
      { type: "fix" as const, text: "Removed the entire `/articles → /` redirect block from next.config.ts. No /articles/page.tsx exists, so legacy bookmarks now get a clean 404 (acceptable trade-off — clean 404 is healthier for SEO than soft-404 redirect). All article URLs (/articles/{slug}) work correctly because they match the [slug] route directly." },
      { type: "fix" as const, text: "Filtered 32 YMYL test-fixture slugs (ending in `-test`) from sitemap.ts: categories/digital-marketing-test, categories/seo-test, categories/social-media-test, categories/ai-test, categories/dev-test, tags/seo-tag-test, etc. New `notTestSlug()` helper applied to all entity types (categories/clients/authors/tags/industries). Reason: these were created during YMYL system testing earlier in this session — they pollute Google's view + waste crawl budget + send negative quality signals. Real content slugs ending in `-test` are blocked by convention — rename them." },
      { type: "fix" as const, text: "Verified with curl: raw Arabic URL /articles/ما-هو-السيو was returning chain 308→308→200 ending at homepage. Percent-encoded URL /articles/%D9%85%D8%A7-... returns 200 directly (Google's typical request form). The /articles → / redirect was the ONLY rule causing the chain. Removed safely — TSC clean." },
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
