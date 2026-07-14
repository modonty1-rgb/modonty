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
    version: "0.87.0 (admin)",
    title: "Four screens that were lying to you — and the SEO score that was under-marking every article",
    items: [
      { type: "fix" as const, text: "Editing an article awaiting approval or needing revision crashed the page outright ('This page couldn't load'). The query allowed 5 of the schema's 7 statuses, so the article came back empty and the form blew up — 20 articles were uneditable, freezing the whole review stage." },
      { type: "fix" as const, text: "The renewal watch was blind and said everything was fine: 21 of 26 active clients have no end date on their record, and a date filter can never match an absent field. The dashboard now says 'expiring this week: unknown' instead of a green '0', and a new Record data group surfaces every hole — renewal date, address, social links, description — each one clickable." },
      { type: "fix" as const, text: "Every published article was quietly under-scored by 5 points: hreflang was never written to the stored metadata (0 of 56 articles), while the live page added it at render — so the score docked a field the site actually had. The generator now stores it, and a new 'Article hreflang' step in Run-All backfills the old ones." },
      { type: "fix" as const, text: "A client's schema type now follows Google's own rule — the most specific type wins. A dental clinic stored as 'LocalBusiness', 'Corporation' or 'NGO' was telling Google nothing about itself, and the last two carry no address or opening hours at all. Industry-agnostic by design: the day a furniture shop needs FurnitureStore, only the lookup grows." },
      { type: "fix" as const, text: "Breadcrumb links that led nowhere: clicking 'Segment' (and 11 other parent-only paths) bounced you out of the page. They now render as plain text — while the real /settings/social and /settings/modonty links keep working." },
    ],
  },
  {
    version: "1.72.0 (modonty)",
    title: "The rich schema we generate is now the schema Google actually reads",
    items: [
      { type: "fix" as const, text: "Articles, categories, tags and industries served a lean, live-built card while the rich stored one — publisher = the client, the YMYL doctor who reviewed it, the citations — sat unused in the database. Every page now serves the stored card." },
      { type: "feature" as const, text: "New distribution channels for answer engines: a dynamic /llms.txt that rebuilds itself from the database (the old static file had been blind since June), and /feed.xml — the RSS feed the site never had, now auto-discovered from every page." },
      { type: "fix" as const, text: "Member pages no longer leak an email address into their description, are kept out of every index, and AI crawlers are now blocked from /users/ and /api/ — they were the only crawlers not blocked, because the robots protocol ignores the default group once a bot has its own." },
      { type: "fix" as const, text: "hreflang was silently dropped on most pages (Next.js replaces alternates, never merges them), so Saudi and Egypt targeting vanished outside articles. Restored platform-wide." },
      { type: "fix" as const, text: "Stored JSON-LD is now escaped at every one of the 17 places it is injected — a content field containing markup could previously break out of the script tag." },
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
