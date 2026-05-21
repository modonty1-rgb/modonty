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
    version: "0.59.0 (admin)",
    title: "admin v0.59.0 — Auto-Maintenance: 10-step one-click DB cleanup + content-owner UX overhaul",
    items: [
      { type: "feature" as const, text: "/database completely redesigned — Tabs (Maintenance/Data Tables/Backup) + Health Summary strip + Auto-Maintenance inline progress panel (no dialog). 10 deterministic clean-up steps run sequentially with live per-step progress bars: Expired OTPs · Expired Sessions · Stale Versions (30d+) · TTL Indexes · JSON-LD Regen · Canonical URLs · Legal Forms · Cloudinary Orphans · Sitemap Refresh (GSC) · Soft-Deleted Comments (30d+)." },
      { type: "feature" as const, text: "Cloudinary Orphan Sweep — scans Cloudinary by Modonty-only prefixes (modonty/, general/, clients/, admins/) and deletes files with no DB record, older than 1h. CRITICAL safety scope: shared Cloudinary account means we double-check prefix BEFORE every destroy — other projects' files cannot be touched. DEV run cleaned 84 real orphans." },
      { type: "feature" as const, text: "Sitemap Freshness Ping — auto-resubmits /sitemap.xml + /image-sitemap.xml to Google Search Console if last submission > 24h ago. Helps Google detect new content faster." },
      { type: "feature" as const, text: "Canonical URL Sanitizer — fixes legacy stored canonicalUrl values that don't match what modonty.com would emit at runtime. Completes Session 104b indexing bug fix data-side cleanup." },
      { type: "feature" as const, text: "Unused Media moved from /database to /media as an inline dialog (amber banner → opens dialog with thumbnail · filename · size · per-file Open/Delete actions). Content owner now controls media review in its natural place." },
      { type: "feature" as const, text: "Article version snapshots cleanup handled silently in auto-maintenance (was a banner on /articles, removed). 30-day threshold matches industry retention." },
      { type: "fix" as const, text: "Media stats reconciliation — single source of truth via MEDIA_USED_WHERE/MEDIA_UNUSED_WHERE (OR of featuredArticles + logoClients + heroImageClients). Stats `unused` count now matches the /media filter result 1:1 (was 58 vs 7 mismatch)." },
      { type: "fix" as const, text: "media-grid renders 'Host not allowed' placeholder for any image with hostname not in next.config remotePatterns — prevents the page from crashing on legacy/test rows with bad URLs." },
      { type: "feature" as const, text: "Data Tables tab now hosts Storage Usage (MongoDB collection sizes) — moved from Maintenance tab to keep system tools and data references logically separated." },
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
