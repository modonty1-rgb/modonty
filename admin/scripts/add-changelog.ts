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
    version: "0.69.0 (admin) + 1.50.0 (modonty)",
    title: "Settings redesign + WhatsApp/Telegram channel links",
    items: [
      { type: "improve" as const, text: "Settings hub (/settings) redesigned — areas grouped by purpose with one clear focal point, live data counts per listing (clients/categories/tags/industries/articles), and everything fits one screen (no long scroll)." },
      { type: "improve" as const, text: "Modonty Homepage settings reorganized into 4 clear tabs (SEO & Sharing · Business Info · Social Links · Homepage Banner) with per-tab save — each tab saves only its own fields, and the OG/Share image + Logo now live under SEO & Sharing where they belong." },
      { type: "feature" as const, text: "Added WhatsApp Channel and Telegram Channel links under Social Links. They now show in the public 'تابعنا' card on modonty.com (homepage + article sidebar) and flow into the Organization sameAs structured data. Enter the real channel URLs in Settings → Social Links and they appear instantly." },
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
