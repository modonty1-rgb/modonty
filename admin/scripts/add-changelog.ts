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
    version: "0.63.2 (modonty)",
    title: "modonty v0.63.2 — robots.txt global AI-visibility expansion: 40 bots whitelisted + dedicated image sitemap declared",
    items: [
      { type: "feature" as const, text: "robots.txt expanded from 9 → 44 user-agent declarations covering every documented AI ecosystem worldwide (US + China + Russia). Goal: modonty appears as a cited source when ANY user asks ANY AI tool a question relevant to its content. Verified against Cloudflare Radar AI bot traffic data + nohacks.co + pulserank.ai + robotstxt.com (May 2026 references)." },
      { type: "feature" as const, text: "6 traditional search engines: Googlebot · Bingbot · DuckDuckBot · YandexBot · Baiduspider (China) · PetalBot (Huawei). Explicit Bingbot rule added (was relying on default *). Same sensitive-path disallow list applied (/api/ /admin/ /users/)." },
      { type: "feature" as const, text: "14 AI search/answer bots — real-time fetch when user asks AI a question: OAI-SearchBot + ChatGPT-User (OpenAI) · Claude-SearchBot + Claude-User (Anthropic) · PerplexityBot + Perplexity-User · Google-CloudVertexBot + Google-Agent + Google-NotebookLM + Gemini-Deep-Research · MistralAI-User · DuckAssistBot · YouBot · PhindBot · Applebot." },
      { type: "feature" as const, text: "20 AI training crawlers covering global LLM knowledge: US (GPTBot, ClaudeBot, anthropic-ai, claude-web, Google-Extended, Applebot-Extended, Amazonbot, bedrockbot, meta-externalagent, Meta-ExternalFetcher, FacebookBot, cohere-ai, cohere-training-data-crawler, AI2Bot, AI2Bot-Dolma) + China (Bytespider, TikTokSpider, PanguBot, DeepSeekBot) + Russia (YandexAdditional, YandexAdditionalBot) + Common Crawl (CCBot — feeds nearly every LLM). Strategy: Phase-1 brand exposure > content protection." },
      { type: "fix" as const, text: "Multiple-sitemap support added per Google Search Central spec: robots.txt now declares both `/sitemap.xml` (URL discovery) + `/image-sitemap.xml` (Google Images). Previously image-sitemap was orphan — robots didn't reference it so Google never auto-discovered it." },
      { type: "feature" as const, text: "Disallow path consolidation: `/users/login/` + `/users/profile/` collapsed to `/users/` (broader protection — covers /users/notifications, /users/reset-password, /users/verify-email, /users/forgot-password etc. — all auth-flow pages with zero SEO value). Cleaner crawl budget." },
      { type: "fix" as const, text: "Explicitly EXCLUDED (no value, only data leak): SEO scrapers SemrushBot/Diffbot/DataForSeoBot + generic scrapers Scrapy/img2dataset. Documented in code comments so future reviewers understand the intentional decision." },
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
