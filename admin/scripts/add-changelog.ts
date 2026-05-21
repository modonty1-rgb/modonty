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
    version: "0.57.4 (admin)",
    title: "admin v0.57.4 — Restore Industry dropdown on Edit Client (silent-drop fix)",
    items: [
      { type: "fix" as const, text: "Added back the Industry <FormSelect> on the Edit Client form (basic-info-section.tsx). The dropdown was missing from the UI — the prop and watch existed but no visible field. Admins now have a working dropdown with all 20 industries to assign clients." },
      { type: "fix" as const, text: "Root cause #2: industryId was assigned to the 'required' field group in client-form-config.ts, but updateRequiredFields never wrote it to the DB. Moved industryId from 'required' to 'business' group so updateBusinessFields picks it up (which already writes industryId correctly). Same class of bug as the URL silent-drop." },
      { type: "fix" as const, text: "Verified end-to-end live: assigned 'اللوجستيات وسلاسل التوريد' to Kimazone via /clients/.../edit → saved to DB → modonty.com/industries/logistics-supply-chain renders the client card + breadcrumb correctly + /clients/كيما-زون shows the industry tag. Full data flow admin → DB → modonty SSR confirmed." },
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
