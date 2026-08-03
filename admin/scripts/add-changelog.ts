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
    version: "1.9.0 (admin) · 1.84.1 (modonty)",
    title: "One source of truth for every modonty page's SEO",
    items: [
      { type: "improve" as const, text: "All seven modonty pages (Home, Clients, Categories, Tags, Industries, Trending, FAQ) now build their Google card from a single generator that runs three independent validators. Previously two different generators wrote the same pages and whichever ran last won — so the same page could look different depending on what you had just saved." },
      { type: "fix" as const, text: "The FAQ page was silently losing its official link (canonical) and its share image every time it regenerated, because it was saved in a shape the site could not read. Fixed and verified on the live page." },
      { type: "fix" as const, text: "Tags, Industries and the Clients/Categories/Trending pages were shipping a thin card with only a name and a link, and were storing a «valid» stamp that nothing had actually checked. They now carry the full card — publisher details, per-item data — and a real validation report." },
      { type: "fix" as const, text: "The system was building and storing SEO for an /articles page that does not exist on modonty (that path is deliberately a 404). It rebuilt it on every article create, edit and delete. Removed — the Home page is the articles page, and two pages listing the same articles would have split their ranking signals." },
      { type: "improve" as const, text: "Cleanup: 22 unused files removed after proving nothing references them, plus six leftover database fields belonging to the phantom page. Zero type errors across admin, modonty and console." },
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
