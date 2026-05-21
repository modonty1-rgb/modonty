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
    version: "0.57.2 (admin)",
    title: "admin v0.57.2 — Native alert/confirm purge: shadcn AlertDialog + toast everywhere",
    items: [
      { type: "feature" as const, text: "Replaced native browser confirm() on the Publish Now button (scheduled-row-actions.tsx) with a shadcn AlertDialog. RTL-friendly, brand-styled, with an explicit warning that publishing is immediate and irreversible. Cancel and 'نعم، انشر الآن' buttons keep the user in control." },
      { type: "feature" as const, text: "Replaced 6 native alert() calls across batch SEO regen flows with the existing useToast() hook. Affected files: industries/components/industries-page-client.tsx, industries/components/revalidate-all-seo-button.tsx, tags/components/tags-page-client.tsx, tags/components/revalidate-all-seo-button.tsx, categories/components/categories-page-client.tsx, categories/components/revalidate-all-seo-button.tsx." },
      { type: "feature" as const, text: "Each toast shows success/failure breakdown ('N succeeded · N failed · N total') with destructive variant when any failure occurred. router.refresh() replaces the previous full-page window.location.reload() — softer refresh, no scroll-jump, no flash of empty content." },
      { type: "fix" as const, text: "Zero native browser dialogs remain across admin/(dashboard). Verified via grep — 0 matches for alert(/confirm( in app/(dashboard)." },
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
