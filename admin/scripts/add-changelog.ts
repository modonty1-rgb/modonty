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
    version: "0.59.1 (admin)",
    title: "admin v0.59.1 — Page split (Database vs Maintenance) + Pricing & Leads hub + main layout padding refactor",
    items: [
      { type: "feature" as const, text: "/database split into two routes — /database (passive: stats header + Data Tables + Backup & Restore) and /maintenance (action: Health Summary + Auto-Maintenance inline panel + tool cards). Each route has a clean single purpose; one source of truth for both." },
      { type: "feature" as const, text: "/database redesigned as Health Command Center — 4-card KPI strip (Total Records · Storage with progress vs 512MB Free Tier · Collections count · Last Backup with age tone), Storage Breakdown stacked bar revealing which collection dominates disk (Articles 86.5% on dev), collapsible per-group Data Tables, Backup & Restore." },
      { type: "feature" as const, text: "/subscription-tiers transformed into 'Pricing & Leads' hub — promoted to top-level sidebar item (no longer under System). 5-card KPI strip (Active Clients · Est. Annual Revenue 54,660 SAR · Most Adopted Tier · Avg Articles/Client · jbrseo Signups with last-synced timeAgo). Tabs: Plans (4-tier cards with dual-currency 🇸🇦+🇪🇬 + Client Distribution stacked bar) and Signups (the entire former /jbrseo-subscribers content: Sync button + filterable searchable table)." },
      { type: "feature" as const, text: "Dual-market pricing surfaced — every tier card now shows Saudi (SAR) and Egypt (EGP) prices side by side at the monthly-equivalent-of-annual rate. Reads from `SubscriptionTierConfig.pricing` JSON (synced from JBRSEO landing-{sa,eg}.ts via new scripts/sync-tier-pricing.ts), falls back to in-code constants if DB null." },
      { type: "fix" as const, text: "/jbrseo-subscribers fully merged into Pricing & Leads — route deleted, sidebar entry removed, 4 files relocated (sync action, queries renamed to jbrseo-queries.ts, table component, sync button), all imports rewired, revalidatePath updated. Zero dead refs verified via grep." },
      { type: "fix" as const, text: "Main layout padding refactor — added p-4 sm:p-6 to <main> in dashboard/layout.tsx (single source of truth), bulk-removed the same padding from 49 page files that previously each carried their own copy. Any new page now inherits correct spacing without copy-pasting the pattern." },
      { type: "feature" as const, text: "Sidebar: 'Plans & Pricing' renamed to 'Pricing & Leads' to reflect the merged hub (pricing catalog + signup leads), promoted from System group to top-level visibility next to SEO Overview." },
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
