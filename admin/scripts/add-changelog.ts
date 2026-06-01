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
    version: "0.68.0 (admin) + 0.12.0 (console)",
    title: "Intake questionnaire is now admin-managed — add/edit questions, clients answer in their console",
    items: [
      { type: "feature" as const, text: "New Admin → Content → Intake Questions page: add, edit, reorder, hide or delete the client questionnaire questions. Questions + their options now live in the database (was hardcoded in the console). Any change appears in the client console immediately." },
      { type: "feature" as const, text: "Console intake form is now driven by the database — it renders whatever questions admin defines, by type (short text / long text / pick one / pick several / yes-no). Falls back to the legacy form until seeded. Answers keep their stable storage shape, so the publish audit + JSON-LD keep working unchanged." },
      { type: "improve" as const, text: "Simple, non-technical editor: a question is just its text + answer type (+ choices). Removed all internal/technical fields from the admin UI." },
      { type: "fix" as const, text: "Disabled the Cloudinary 'orphan sweep' maintenance step — it could permanently delete production images when Run-All was triggered against a non-production database (shared Cloudinary account). A review-before-delete redesign is tracked." },
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
