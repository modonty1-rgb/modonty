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
    version: "0.76.0 (admin)",
    title: "Client edit page — redesigned + open client console",
    items: [
      { type: "improve" as const, text: "The client edit page was rebuilt into one clean workspace: a live preview on the left (change the logo and cover right on it), five logical sections, and a clear save bar at the bottom — no more cluttered accordions, stacked header, or yellow hint clutter." },
      { type: "feature" as const, text: "New 'Open Client Console' button (admins only) — opens the client's console as the client so you can edit their data on their behalf, without needing their password." },
      { type: "fix" as const, text: "Clearing a field (SEO title/description, legal form, country, price range…) now actually saves the empty value instead of silently keeping the old one." },
    ],
  },
  {
    version: "0.17.0 (console)",
    title: "Admin console access",
    items: [
      { type: "feature" as const, text: "An admin can now open your console to help with your data. While they're browsing as you, a clear amber banner shows at the bottom with a one-click exit." },
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
