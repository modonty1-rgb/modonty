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
    version: "1.48.2",
    title: "modonty v1.48.2 — GA4 auth-event hotfix: after() wrap on engagement actions",
    items: [
      { type: "fix" as const, text: "Critical: 11 auth-required GA4 events (article like/dislike/favorite, comment submit/reply/like) were dropped on Vercel because the calling actions used `db.findUnique().then(...)` — fire-and-forget Promise chain killed before the inner sendGA4Event registered its after() callback. Fixed by wrapping the whole DB lookup + dispatch in `after(async () => {...})` at the outer layer." },
      { type: "fix" as const, text: "modonty/app/articles/[slug]/actions/article-interactions.ts — fireEngagement() now uses after() (covers article_like + article_dislike + article_favorite)." },
      { type: "fix" as const, text: "modonty/app/articles/[slug]/actions/comment-actions.ts — 4 .then() patterns rewritten to after() (covers comment_submit + comment_reply + comment_like + comment_dislike)." },
      { type: "fix" as const, text: "Discovery via live Playwright test on PROD: 0/11 auth events arrived in GA4 Realtime even though anonymous events worked perfectly. Root cause traced + fixed in 30 min." },
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
