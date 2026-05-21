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
    version: "0.10.1 (console)",
    title: "console v0.10.1 — Sign-out UX upgrade: dedicated confirmation page",
    items: [
      { type: "feature" as const, text: "New /signed-out page replaces the silent redirect-to-login-form behaviour. Shows a clear ✓ confirmation card ('تم تسجيل خروجك بنجاح'), brand-consistent layout with Modonty logo, two CTAs (تسجيل الدخول مرة ثانية / العودة لـ modonty.com), and a security note ('تم إغلاق جلستك بأمان')." },
      { type: "feature" as const, text: "Updated callbackUrl in both desktop sidebar.tsx and mobile-sidebar.tsx from '/' to '/signed-out'. Industry pattern (Stripe / Notion / Linear / Vercel) — never drop a signed-out user straight onto a fresh login form (security + UX rationale)." },
      { type: "feature" as const, text: "No auto-redirect — user chooses next action explicitly. Matches modern SaaS sign-out flow." },
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
