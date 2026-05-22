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
    version: "0.59.2 (admin) + modonty + console",
    title: "admin v0.59.2 — Settings save 10min→2.3s · GTM/Hotjar env-only · Vercel monorepo build savings",
    items: [
      { type: "feature" as const, text: "Settings cascade fix: /settings Save now returns in ~2.3s (was 10 min for 46 articles). Replaced client-driven step-by-step loop with single updateAllSettings() + Next.js after() background cascade. Parallel chunks of 5 (Promise.all) safe under Prisma MongoDB default connection pool. Added maxDuration=800 on settings page (Vercel Pro Plus + Fluid Compute supports it). 4 files changed: cascade-all-seo.ts, settings-actions.ts, settings/page.tsx, settings-form-v2.tsx. Live verified: [cascade] done in 96s — articles 46/46, clients 6/6." },
      { type: "fix" as const, text: "Vercel monorepo build savings: added ignoreCommand to admin/modonty/console vercel.json. Each project now rebuilds ONLY when its own folder OR shared dependencies (dataLayer/, .env.shared, root package.json, pnpm-lock.yaml) actually change. Verified locally against b16811b (admin-only commit): admin would build, modonty/console would skip. Projected savings: ~50-66% of Build Minutes cost (from $17-84/month → $6-30/month depending on activity)." },
      { type: "fix" as const, text: "GTM/Hotjar architectural cleanup: DB → env-only. Removed Client.gtmId + 4 Settings fields (gtmContainerId, gtmEnabled, hotjarSiteId, hotjarEnabled). Modonty now reads tracking IDs from .env.shared directly (single deployment = global constants, not per-tenant). Fixed silent dead-import bug: <GTMContainer/> was imported but never rendered in modonty/app/layout.tsx — now mounted alongside new <HotjarScript/>. 25 files touched across schema, admin Settings UI, Client edit flow, modonty helpers, console i18n." },
      { type: "fix" as const, text: "Settings page: cleaned up CascadeProgress phase types + 80-line CascadeProgressBanner client component (no longer needed — replaced with lightweight BackgroundCascadeNotice toast). Removed dead imports from cascade-step-actions (file kept for backward compat with any future background jobs). TSC zero errors on admin, modonty, console." },
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
