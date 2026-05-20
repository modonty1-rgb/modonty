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
    version: "0.57.1 (admin)",
    title: "admin v0.57.1 — Legal Form fix: bilingual UI + Sanitizer in DB Maintenance",
    items: [
      { type: "fix" as const, text: "Fixed: Update Client form was blocked when DB held a free-text Arabic legalForm (e.g. 'شركة شخص واحد'). The strict Zod enum on client-form-schema.ts rejected the loaded value, blocking ALL form fields — including password updates — on the affected client." },
      { type: "feature" as const, text: "Added 'One-Person Company' as a canonical enum value (شركة الشخص الواحد) — distinct legal entity under Saudi Companies Law M/132 (2022). Total accepted values: LLC · JSC · Sole Proprietorship · Partnership · Limited Partnership · Simplified Joint Stock Company · One-Person Company." },
      { type: "feature" as const, text: "Bilingual dropdown in legal-section.tsx: SelectItems now display Arabic labels (شركة ذات مسؤولية محدودة, شركة مساهمة, مؤسسة فردية, شركة تضامن, شركة توصية بسيطة, شركة مساهمة مبسطة, شركة الشخص الواحد) while values remain canonical English enum." },
      { type: "feature" as const, text: "New 'Legal Form Sanitizer' card on /database page: scans Client.legalForm for non-canonical values, previews auto-mappable Arabic→English transformations (10-rule mapping), surfaces unmapped clients for manual review with deep-link to /clients/[id]/edit, one-click Sanitize button applies the migration via server action." },
      { type: "feature" as const, text: "New server actions in admin/app/(dashboard)/database/actions/legalform-sanitizer.ts: getLegalFormSanitizerStats() + sanitizeAllLegalForms(). Reusable for any future legacy Arabic legalForm values — not a one-shot migration." },
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
