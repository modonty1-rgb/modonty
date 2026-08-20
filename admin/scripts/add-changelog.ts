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
    version: "1.94.0 (modonty)",
    title: "Reels play video, take comments, and count views",
    items: [
      { type: "feature" as const, text: "Reels are real videos now — approved partner videos play in the feed (adaptive streaming with a fallback chain), and every clip has its own shareable, Google-indexable page." },
      { type: "feature" as const, text: "Comments on reels: a bottom sheet like TikTok's with replies and likes. Same trust contract as article comments — a comment waits for the partner's approval in the console before visitors see it, and the partner gets a Telegram note." },
      { type: "feature" as const, text: "Views are counted: a reel that holds the screen for two seconds earns one view per visitor session — flicking past counts nothing." },
      { type: "fix" as const, text: "The share button used to share the whole feed; it now shares the exact reel the visitor is watching." },
      { type: "fix" as const, text: "Signed-out visitors tapping like, save, or comment now get the same one-tap Google sign-in card the article page uses, instead of bare links." },
      { type: "feature" as const, text: "New listen page: the full Quran (114 surahs, 20 reciters, audio only) next to the site's narrated articles with an auto-advancing queue." },
      { type: "fix" as const, text: "Production build was failing on three listing pages that read the clock outside a cached scope (a Next 16 rule) — all three fixed the same way." },
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
