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
    version: "1.49.5 (modonty) + 0.65.1 (admin)",
    title: "Post-v0.65.0 Mariam audit: CLS fix + FAQPage schema + llms.txt www + Link perf",
    items: [
      { type: "fix" as const, text: "modonty 1.49.5 — CLS regression fix on article pages (Mariam PSI: 0.083 → expected ~0). Root cause: `ArticleMobileLayout` in `components/client-lazy.tsx` was wrapped in `dynamic({ ssr: false })`. Component renders a `sticky top-14` mobile bar (~70px tall); with ssr:false the bar mounted post-hydration and pushed all content below it down → CLS. Fix: removed `ssr: false` so the bar renders server-side, reserving its space in initial HTML. Component is `'use client'` and only uses React hooks (useState, useEffect for scroll), all SSR-safe. Verified: article page returns HTTP 200 locally after change." },
      { type: "feat" as const, text: "admin 0.65.1 — FAQPage JSON-LD schema added to article knowledge graph (Mariam audit #3 nice-to-have). New node in `admin/lib/seo/knowledge-graph-generator.ts` after BreadcrumbList: emits `FAQPage` with `mainEntity` array of `Question`/`acceptedAnswer` pairs. Filters strictly: `status === \"PUBLISHED\"` AND non-empty answer — excludes PENDING reader submissions to keep Google's Rich Results clean. No node emitted when article has zero published FAQs (no empty schema)." },
      { type: "fix" as const, text: "modonty 1.49.5 — Updated `public/llms.txt` URLs from `https://modonty.com/` → `https://www.modonty.com/` (8 occurrences). Aligns with canonical (www-only) decision from v1.49.1. AI crawlers (PerplexityBot, ClaudeBot, OAI-SearchBot, GPTBot) will now follow links that match the canonical host instead of triggering 301 redirects." },
      { type: "fix" as const, text: "modonty 1.49.5 — Replaced raw `<a href={`/clients/${slug}`}>` with `<Link>` from `next/link` in `app/articles/[slug]/components/article-mobile-engagement-bar.tsx` (client identity avatar). The `<a>` caused full page reloads + zero prefetch on the most-tapped mobile element. `<Link>` gives soft navigation + automatic prefetch. Scanned entire modonty/ for similar internal `<a href=\"/...\">` patterns — none others found; remaining `<a href=\"#...\">` are in-page anchors (article-header.tsx #article-faq, article-mobile-engagement-bar.tsx #article-comments, TopNav.tsx #main-content skip-link) which are correct as `<a>`." },
      { type: "fix" as const, text: "Verified Mariam CRITICAL-1 (hreflang FAIL on 4/5 articles) as FALSE ALARM. Re-tested with cache-bust: every article returns 9 hreflang locales (ar-SA, ar-EG, ar-AE, ar-KW, ar-QA, ar-BH, ar-OM, ar, x-default). Mariam was testing stale Vercel edge cache. Verified Mariam WARNING-3 (7 server errors) also FALSE — same slug-shortening issue from her report (her shortened slugs returned 410, but full slugs from sitemap return 200). Real items from Mariam: CLS regression (fixed) + FAQPage schema missing (added) + llms.txt missing (was actually present as static file, updated)." },
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
