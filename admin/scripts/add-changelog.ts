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
    version: "0.66.0 (admin) + 1.49.6 (modonty)",
    title: "Client Accounts page + invoice issuing (number · email · statement) · non-active clients hidden on public site",
    items: [
      { type: "feat" as const, text: "admin 0.66.0 — NEW client Account page at /accounts/[clientId]: compact header strip (name + subscription stats + status badges), an 'Issue Invoice' form, and an account statement timeline. Replaces the old per-row invoice dialog — the Accounts list row now links to the full account page." },
      { type: "feat" as const, text: "admin 0.66.0 — Issue Invoice form: tier select (with live reference-price badge from jbrseo config), monthly/annual toggle, manual amount + currency (SAR/EGP) unified field, payment method (incl. InstaPay), payment status (paid/due), and manual subscription start/end dates. Live blue invoice-summary card. NO auto-calculations — all values manual. The 'Issue' button is disabled until all required fields are complete." },
      { type: "feat" as const, text: "admin 0.66.0 — invoice backend: new Invoice + Counter Prisma models. Atomic gapless invoice numbering MOD-YYYY-NNNNN via a per-year counter. Issuing creates the Invoice AND updates the client's live subscription (tier, start/end dates, articlesPerMonth, paymentStatus, status). Account statement reads real invoices; click a row → details dialog." },
      { type: "feat" as const, text: "admin 0.66.0 — invoice email via Resend: a full invoice template (number, tier+period, payment method, issue/payment date, subscription start & end, status, total) is emailed to the client on issue. Footer carries contact: mobile 0560299034 + modonty@modonty.com." },
      { type: "fix" as const, text: "modonty 1.49.6 — non-ACTIVE clients (PENDING/EXPIRED/CANCELLED) are now hidden on the public site: client page returns 404, and they're excluded from the clients listing, search, sitemap, generateStaticParams, related-clients, and metadata. Mirrors the existing /industries ACTIVE-only logic." },
      { type: "fix" as const, text: "admin 0.66.0 — non-ACTIVE clients also removed from the article-creation client picker and the media client selector (admin only shows ACTIVE clients where it matters)." },
      { type: "fix" as const, text: "admin 0.66.0 — removed the temporary 'Seed/Remove Test Subscribers' buttons (one-time prod-test tooling) and their server actions now that prod test data is cleaned." },
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
