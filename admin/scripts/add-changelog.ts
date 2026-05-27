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
    version: "1.48.6 (modonty)",
    title: "modonty v1.48.6 — correct fix per Next.js 16 official docs: `connection()` API on article route (replaces deprecated `dynamic='force-dynamic'` which is incompatible with cacheComponents)",
    items: [
      { type: "fix" as const, text: "v1.48.5 build failed with `Route segment config 'dynamic' is not compatible with nextConfig.cacheComponents. Please remove it.` — Next.js 16 deprecated `export const dynamic = 'force-dynamic'` when cacheComponents is enabled. From official migration guide (https://nextjs.org/docs/app/guides/migrating-to-cache-components): with Cache Components, all pages are dynamic by default; force-dynamic is unnecessary." },
      { type: "fix" as const, text: "Modern replacement (per https://nextjs.org/docs/app/api-reference/functions/connection): import `connection` from `next/server` and call `await connection()` at the top of the page component. This semantically ties dynamic rendering to the incoming request, explicit + Next.js-16-compatible, and skips the PPR cache-tag write that was triggering ERR_INVALID_CHAR for Arabic slugs." },
      { type: "fix" as const, text: "Applied `await connection();` at the top of ArticlePageContent in modonty/app/articles/[slug]/page.tsx. TSC clean. Build should succeed (no segment config conflict). Runtime: response is marked not-cacheable → Vercel skips the `x-next-cache-tags` header write that crashes with non-ASCII slugs." },
      { type: "fix" as const, text: "Trade-off unchanged from v1.48.5 reasoning: every article view triggers full SSR (no PPR streaming benefit). Acceptable for ~25 articles + Vercel CDN still caches the SSR response via standard HTTP cache headers." },
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
