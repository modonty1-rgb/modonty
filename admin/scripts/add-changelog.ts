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
    version: "1.47.0",
    title: "modonty v1.47.0 — تحويل 14 صفحة/مكوّن إلى Server Components (SEO + Performance)",
    items: [
      { type: "feature" as const, text: "Phase 1 (article page): related-articles + more-from-client + more-from-author + manual-related + article-faq كلها Server Components الآن. البيانات تُجلب server-side وتُعرض في raw HTML لـ Googlebot + AI engines (60-100 رابط داخلي مكشوف لكل مقال)" },
      { type: "feature" as const, text: "Phase 2 (client page): client-followers-list (pure Server) + client-comments-section (Server) + client-comment-form (Client + useActionState + Server Action). POST API route حُذف، استُبدل بـ Server Action مع revalidatePath + Zod validation" },
      { type: "feature" as const, text: "Phase 3 (profile pages — perf + UX): page (stats) + activity-feed + favorites + following + comments + liked + disliked كلها Server Components مع auth() + redirect() + Promise.all server fetch. لا skeleton flicker، لا client fetch waterfall" },
      { type: "refactor" as const, text: "Phase 4: ask-client-dialog — تنظيف dead code (useEffect lazy fetch + retry UI + pendingFaqsLocal/Loading/Error). Dialog يبقى Client للـ interactivity لكن البيانات تُمرَّر من Server" },
      { type: "refactor" as const, text: "article-section-collapsible: icon prop من ComponentType إلى ReactNode (يحل Server→Client serialization error بعد تحويل الـ wrappers لـ Server Components)" },
      { type: "feature" as const, text: "13 helper جديد للـ server-side fetching: client-comments, profile-stats, profile-activity, profile-favorites, profile-following, profile-comments, profile-liked, profile-disliked + faq-collapsible-body (small Client wrapper) + client-comment-actions (Server Action)" },
      { type: "fix" as const, text: "Next.js 16 compliance: كل التحويلات مُتحقَّق منها مقابل vercel/next.js docs عبر Context7. minimal Client boundary، Server Component default، useActionState للـ form mutations" },
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
