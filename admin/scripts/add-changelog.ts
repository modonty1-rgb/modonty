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
    version: "0.70.0 (admin)",
    title: "Modonty Homepage settings — SEO/UX redesign",
    items: [
      { type: "improve" as const, text: "Modonty Homepage → SEO & Sharing tab redesigned with a live Google + social-card preview that updates as you type, grouped sections (Search appearance · Brand identity · Images), and smart counters that cap each field at its best-practice length (title 60 · description 160 · brand 250 · alt 125)." },
      { type: "improve" as const, text: "Brand Description moved into the SEO & Sharing tab (it's the brand's identity description used in Google's Knowledge Panel and on every article) with a clear Arabic guide on what to write and where it appears." },
      { type: "improve" as const, text: "Cleaner page: trimmed header, two-column layout with a sticky preview, and the Business Info / Social Links / Homepage Banner tabs reorganized into clear groups. Removed the separate 'Regenerate cache' button — saving any tab already refreshes the homepage automatically." },
      { type: "feature" as const, text: "Added a standalone JBR SEO settings card, a platform Google Business Profile URL field (feeds Organization sameAs), and fixed the business hours to 24/7 for the online platform." },
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
