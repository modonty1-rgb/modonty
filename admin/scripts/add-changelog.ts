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
    version: "1.48.4 (modonty)",
    title: "modonty v1.48.4 — TRUE ROOT-CAUSE FIX: disabled Next.js 16 cacheComponents (was throwing ERR_INVALID_CHAR on x-next-cache-tags header for ALL Arabic-slugged articles)",
    items: [
      { type: "fix" as const, text: "REAL root cause finally identified via Vercel runtime logs (vercel CLI): `TypeError: Invalid character in header content [\"x-next-cache-tags\"]` thrown by Next.js 16 cache layer for every article request with Arabic chars in slug. Reproduced 10/10 origin requests to /articles/دليلك-الشامل-حول-أفضل-طرق-زيادة-الدخل-في-السعودية returned 500 from cache=MISS. Code: ERR_INVALID_CHAR." },
      { type: "fix" as const, text: "Disabled `cacheComponents: true` in modonty/next.config.ts. Next.js 16 Partial Prerender + Cache Components feature auto-generates an `x-next-cache-tags` HTTP header that includes the dynamic route path. Arabic chars in /articles/[slug] route → invalid HTTP header characters → throws on every request for any article NOT in the build-time static prerender (which is most of them with PPR)." },
      { type: "fix" as const, text: "Reverted yesterday's failed v1.48.3 Promise.all .catch handlers — they correctly bubbled the auth() prerender error but didn't address the underlying x-next-cache-tags issue. Kept maxDuration=60 (still useful safety net for genuine cold-starts)." },
      { type: "fix" as const, text: "Trade-off accepted: lose PPR streaming benefit (~milliseconds of perceived latency improvement); gain 100% functional Arabic article URLs. Will re-enable cacheComponents once Next.js fixes auto-tag URL-encoding for non-ASCII routes (track at next.js GitHub issues)." },
      { type: "fix" as const, text: "Bundled (yesterday's work, previously logged): 5 PROD env vars added to Vercel modonty per Vercel monorepo best-practice + fresh build via gitSource API (not redeploy — redeploy reuses broken build artifacts). Combined with this disable, articles now return 200 reliably to Googlebot smartphone for the first time since 2026-04-30." },
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
