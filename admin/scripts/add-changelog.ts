/**
 * Run before every push: pnpm changelog
 * Updates entries below — writes to LOCAL + PROD instantly.
 */
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

// ─── UPDATE THESE BEFORE EVERY PUSH ──────────────────────────────────────────
const entries = [
  {
    version: "1.46.0",
    title: "modonty v1.46.0 + admin v0.56.0 — IndexNow integration + كل bots مفتوحة (GEO Phase 1)",
    items: [
      { type: "feature" as const, text: "IndexNow integration: helper modonty/lib/indexnow.ts + admin/lib/indexnow.ts (mirror) + verification file على الروت + bulk script — request واحد يفهرس الـ URLs في Bing + Yandex + Brave + Seznam + Naver = يفتح ChatGPT Search + Copilot + DuckDuckGo + Perplexity + Brave AI" },
      { type: "feature" as const, text: "Admin UI: SubmitIndexNowButton في /search-console — manual click يقرأ sitemap.xml + يرسل كل URLs لـ IndexNow + يعرض toast + شريط نتيجة (count + timestamp + message)" },
      { type: "feature" as const, text: "robots.txt: فتح كل training bots (GPTBot + Google-Extended + ClaudeBot + anthropic-ai + CCBot + Bytespider) — قرار خالد للـ Phase 1 (visibility فوق كل شيء، الحماية لاحقاً لما يثبت الموقع)" },
      { type: "refactor" as const, text: "تنظيم env vars: INDEXNOW_KEY في .env.shared (gitignored) — لازم يُضاف يدوياً في Vercel Dashboard للـ production" },
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
