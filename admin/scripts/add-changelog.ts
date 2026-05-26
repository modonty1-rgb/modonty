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
    version: "0.63.0 (admin + modonty + console)",
    title: "admin v0.63.0 — Settings singleton race-condition permanent fix + JSON-LD host-mismatch detector + DB-level unique index",
    items: [
      { type: "fix" as const, text: "Root cause: PROD `settings` collection had 2 docs (sequential ObjectIds = race during initial seed). 30+ code sites used non-atomic `findFirst → if null create` pattern. Risk: admin saved to Doc-1 while modonty/console randomly read Doc-2 → data divergence (canonical URLs, SEO config, social links all could mismatch silently). This was the underlying cause of OBS-027 + intermittent canonical issues + Quality Check failures." },
      { type: "feature" as const, text: "Schema change: `singletonKey String @unique @default(\"global\")` on Settings model + DB-level unique index applied to MongoDB via prisma db push (DEV) or manual createIndex (PROD). Guarantees only ONE Settings doc can ever exist at the DB level — singleton enforced atomically by MongoDB E11000." },
      { type: "feature" as const, text: "New `lib/settings/settings-singleton.ts` helper in admin/modonty/console — exposes `SETTINGS_SINGLETON_WHERE` constant + `ensureSettingsId()` (admin only — write-side) with 3-path resolution: fast-path findUnique → legacy-migration via $runCommandRaw $set (bypasses Prisma's no-op skip for default values) → fresh-DB atomic upsert. Self-heals on first call against any DB shape." },
      { type: "fix" as const, text: "Refactored 30 caller sites across all 3 apps: every read swapped from `findFirst()` to `findUnique({where: SETTINGS_SINGLETON_WHERE})` (deterministic). Every write uses `ensureSettingsId() + update` (race-safe). Removed dead else-create branches in updateAllSettings + ensureSettingsExists." },
      { type: "feature" as const, text: "JSON-LD Cache Integrity detector extended (admin/database/actions/jsonld-integrity.ts): new apex-aware host-mismatch detection catches www-vs-non-www drift on the same domain (e.g. `https://modonty.com/...` cached but expected `https://www.modonty.com/...`). Ignores third-party hosts (Cloudinary, schema.org). Output signal: `host-mismatch:<storedHost> (expected <expectedHost>)`. Previously these stale entries were invisible to Auto-Maintenance — falsely reporting 'all clean'." },
      { type: "fix" as const, text: "DEV cleanup verified: Doc-2 deleted via raw MongoDB script, Doc-1 backfilled with singletonKey via raw $set, prisma db push created `settings_singletonKey_key` unique index. Stress test: 40 parallel mixed GET requests + 60 parallel modonty reads + Run-All Auto-Maintenance (10/10 steps clean in 21.4s, 25 JSON-LD entries auto-fixed in 182.7s) → DB stays at 1 doc, direct insert with duplicate singletonKey blocked by E11000." },
      { type: "fix" as const, text: "PROD prep documented in SETTINGS-SINGLETON-TODO.md: backfill script + manual Atlas createIndex sequence (do NOT prisma db push on PROD — it drops manually-created TTL indexes that Auto-Maintenance can recreate on DEV via its TTL Indexes step, but better preserved on PROD). v0.63.0 push includes self-healing helper so even without PROD-side cleanup the code resolves on first call." },
      { type: "fix" as const, text: "Verified vs Google Search Central + John Mueller: canonical mismatch between JSON-LD URLs and `link rel='canonical'` does NOT block Google indexing (per official canonicalization signals list: redirects + rel=canonical + sitemap + HTTPS + hreflang — JSON-LD URLs are NOT canonical signals). Conflict causes Google to pick one, not refuse. Still an SEO hygiene issue worth fixing (now caught by our extended detector)." },
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
