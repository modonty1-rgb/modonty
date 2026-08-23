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
    version: "1.96.0 (modonty)",
    title: "Mobile: infinite scroll on /modonty, brand icons everywhere, one field tile for /clients and /industries",
    items: [
      { type: "feature" as const, text: "/modonty on a phone loads more articles as you scroll (and fixed a freeze in the shared infinite-list engine that also hit /articles on a fast fling)." },
      { type: "improve" as const, text: "38 approved brand icons extracted from the master reference — zero lucide icons left on the nine mobile surfaces; the diamond is one size and always accent-coloured." },
      { type: "improve" as const, text: "/clients on a phone: one row of three tiles (trusted partners · all partners · featured) above the field strip, and the field strip now uses the same standard tile as /industries — no repeated platform logo." },
      { type: "improve" as const, text: "Save on a card asks signed-out readers to sign in; «تابع مدونتي» is the primary bottom-bar action, «صِر شريكاً» moved to secondary." },
      { type: "improve" as const, text: "Filters on the /modonty feed: «popular» and «audio» views; pagination is one shared component with 44px targets." },
      { type: "fix" as const, text: "Reels action rail: brand marks, token colours instead of hardcoded hex, Arabic-Indic counts, zero counts hidden." },
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
