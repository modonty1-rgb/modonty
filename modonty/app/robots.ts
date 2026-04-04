import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";

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
          "/_next/",
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

      // ═══ AI TRAINING BOTS — BLOCK (protect content from datasets) ═══

      // OpenAI training crawler — trains GPT models
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      // Google Gemini training — does NOT affect AI Overviews or Search
      // Source: https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers
      {
        userAgent: "Google-Extended",
        disallow: ["/"],
      },
      // Common Crawl — open training dataset used by many AI companies
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      // Anthropic training crawler
      {
        userAgent: "ClaudeBot",
        disallow: ["/"],
      },
      {
        userAgent: "anthropic-ai",
        disallow: ["/"],
      },
      // ByteDance training crawler
      {
        userAgent: "Bytespider",
        disallow: ["/"],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/image-sitemap.xml`,
    ],
  };
}
