import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";

  return {
    rules: [
      // Default: allow all search engines
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/users/login/",
          "/users/profile/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/users/login/",
          "/users/profile/",
        ],
      },

      // ═══ AI SEARCH BOTS — ALLOW (visibility in AI answers) ═══

      // OpenAI search crawler — powers ChatGPT Search results
      // Source: https://developers.openai.com/api/docs/bots
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
      },
      // Perplexity search indexer — powers Perplexity answers
      // Source: https://docs.perplexity.ai/guides/bots
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },

      // ═══ AI TRAINING BOTS — ALLOW (Phase 1: maximize visibility) ═══
      // Trade-off accepted: brand exposure > content protection while site is new.
      // Re-evaluate once organic traffic + authority are established.

      // OpenAI training crawler — feeds GPT model memory
      { userAgent: "GPTBot", allow: "/" },
      // Google Gemini training — influences Gemini answers
      { userAgent: "Google-Extended", allow: "/" },
      // Common Crawl — open dataset used by dozens of AI companies
      { userAgent: "CCBot", allow: "/" },
      // Anthropic training crawler — feeds Claude
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      // ByteDance — feeds Doubao + TikTok search
      { userAgent: "Bytespider", allow: "/" },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
