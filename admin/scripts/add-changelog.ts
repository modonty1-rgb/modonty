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
    version: "1.52.0 (modonty)",
    title: "Brand logo + favicon refresh",
    items: [
      { type: "improve" as const, text: "Navbar now uses one brand logo on both desktop and mobile — and the mobile logo is bigger and easier to read (it was a tiny icon before)." },
      { type: "improve" as const, text: "In light mode the top bar got a subtle off-white tint so the brand mark stands out clearly." },
      { type: "feature" as const, text: "New clean square favicon (the 'm' mark) now shows in the browser tab and next to the site in Google results, at every size (16–512), plus an Apple touch icon for iPhones." },
    ],
  },
  {
    version: "0.71.1 (admin)",
    title: "Modonty settings — logo preview fixes",
    items: [
      { type: "fix" as const, text: "The 'Logo (Desktop)' preview in Modonty settings no longer crops the wide logo — it now shows the full wordmark." },
      { type: "improve" as const, text: "The Google preview now shows the real site favicon (the 'm' mark) instead of a placeholder, so what you see matches what Google actually shows." },
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
