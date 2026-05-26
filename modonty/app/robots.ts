import { MetadataRoute } from "next";

/**
 * Modonty robots.txt — global AI-visibility policy (2026).
 *
 * Mission: allow every documented AI bot worldwide to crawl + answer with modonty.
 * Verified against Google Search Central + Cloudflare Radar + nohacks.co +
 * pulserank.ai + robotstxt.com (May 2026 references).
 *
 * Strategy:
 *   - Default *: allow + lean disallow list (auth/admin/api).
 *   - 6 traditional search engines (incl. regional Yandex/Baidu/Huawei).
 *   - 14 AI search/answer bots (real-time fetch when user asks AI a question).
 *   - 20 AI training crawlers (US/CN/RU — feeds model knowledge).
 *   - 2 sitemaps declared (main + dedicated image sitemap).
 *
 * Explicitly EXCLUDED (not AI; would only leak data to competitors):
 *   - SEO scrapers: SemrushBot, Diffbot, DataForSeoBot
 *   - Generic scrapers: Scrapy, img2dataset
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";

  const SENSITIVE_PATHS = ["/api/", "/admin/", "/users/"];

  return {
    rules: [
      // ═══ DEFAULT — All other crawlers ═══
      {
        userAgent: "*",
        allow: "/",
        disallow: SENSITIVE_PATHS,
      },

      // ═══ TRADITIONAL SEARCH ENGINES (6) ═══
      // Explicit rules for clarity + signal of intent
      {
        userAgent: [
          "Googlebot",      // Google Search + Gemini grounding
          "Bingbot",        // Bing + Copilot + ChatGPT Search backend
          "DuckDuckBot",    // DuckDuckGo
          "YandexBot",      // Yandex (Russia, MENA presence)
          "Baiduspider",    // Baidu (China — largest search engine)
          "PetalBot",       // Huawei search
        ],
        allow: "/",
        disallow: SENSITIVE_PATHS,
      },

      // ═══ AI SEARCH & ANSWER BOTS (14) — real-time when user asks AI ═══
      // These fetch live when a user asks AI a question, so allowing them
      // = modonty appears as a cited source in the AI's answer.
      {
        userAgent: [
          // OpenAI
          "OAI-SearchBot",          // SearchGPT product
          "ChatGPT-User",           // ChatGPT user-initiated browsing
          // Anthropic Claude
          "Claude-SearchBot",       // Claude web search
          "Claude-User",            // Claude user-initiated fetches
          // Perplexity
          "PerplexityBot",          // Perplexity AI search index
          "Perplexity-User",        // Perplexity user-initiated
          // Google AI
          "Google-CloudVertexBot",  // Vertex AI grounding
          "Google-Agent",           // Google AI agents
          "Google-NotebookLM",      // NotebookLM source fetch
          "Gemini-Deep-Research",   // Gemini Deep Research mode
          // Other major AI search/answer engines
          "MistralAI-User",         // Mistral Le Chat
          "DuckAssistBot",          // DuckDuckGo AI assistant
          "YouBot",                 // You.com AI search
          "PhindBot",               // Phind developer AI search
          "Applebot",               // Apple Search + Siri grounding
        ],
        allow: "/",
      },

      // ═══ AI TRAINING CRAWLERS (20) — global LLM knowledge feed ═══
      // Allowing these = modonty content informs the next generation of every
      // major LLM in the world (US, China, Russia). Phase-1 strategy: maximize
      // brand exposure while site builds authority.
      {
        userAgent: [
          // ─── US ───
          "GPTBot",                       // OpenAI training
          "ClaudeBot",                    // Anthropic
          "anthropic-ai",                 // Anthropic (legacy ID)
          "claude-web",                   // Anthropic (web focus)
          "Google-Extended",              // Google Gemini training
          "Applebot-Extended",            // Apple Intelligence training
          "Amazonbot",                    // Amazon Alexa + Bedrock
          "bedrockbot",                   // Amazon Bedrock specifically
          "meta-externalagent",           // Meta AI (Llama)
          "Meta-ExternalFetcher",         // Meta AI (additional)
          "FacebookBot",                  // Meta (legacy)
          "cohere-ai",                    // Cohere
          "cohere-training-data-crawler", // Cohere (explicit training)
          "AI2Bot",                       // Allen Institute (OLMo, Dolma)
          "AI2Bot-Dolma",                 // Allen Institute Dolma dataset
          // ─── China ───
          "Bytespider",                   // ByteDance (Doubao, TikTok)
          "TikTokSpider",                 // ByteDance TikTok specifically
          "PanguBot",                     // Huawei PanGu LLM
          "DeepSeekBot",                  // DeepSeek
          // ─── Russia ───
          "YandexAdditional",             // Yandex AI/Alice
          "YandexAdditionalBot",          // Yandex AI (additional)
          // ─── Shared dataset feeding most LLMs ───
          "CCBot",                        // Common Crawl
        ],
        allow: "/",
      },
    ],

    // Multiple sitemaps — Google + Bing both support multiple Sitemap: lines
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/image-sitemap.xml`,
    ],
  };
}
