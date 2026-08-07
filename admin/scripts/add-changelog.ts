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
    version: "1.10.1 (admin) · 1.86.0 (modonty) · 0.2.1 (dataLayer)",
    title: "Bunny is now the only place images come from",
    items: [
      { type: "fix" as const, text: "A deleted author's page used to answer «page found» with an empty body — the one thing Google reads as a broken page worth keeping in its index. Every other section (articles, tags, categories, industries, clients) already answered «gone» properly; authors was the only gap. Now it does too." },
      { type: "fix" as const, text: "Four screens inside the admin still loaded pictures from the old image host: the client's media tab, the article's search-preview card, and the image editor. They were reading the old address even though every picture already had a new one. Nothing a visitor sees, but they would have gone blank the day we switch the old host off." },
      { type: "fix" as const, text: "Removed a leftover instruction attached to every image address that pointed at a placeholder file which no longer exists — dead weight on every request." },
      { type: "improve" as const, text: "The author «مدونتي» finally has a picture. Ninety-four published articles were showing an empty circle where the author's face goes." },
      { type: "improve" as const, text: "Cleaned out stale data on the live site: four image records whose files had been deleted long ago, two test accounts pointing at dead avatars, and 28,000 characters of search data belonging to a page that was removed weeks ago." },
      { type: "improve" as const, text: "Measured on the live site: 156 pictures across eight page types, every one served from the new host, none broken. Speed test on identical images — the new host is 40% faster at the typical request and 2.4× faster at the slow tail." },
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
