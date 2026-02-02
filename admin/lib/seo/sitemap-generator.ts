/**
 * Sitemap & Robots.txt Generator - Phase 15
 *
 * Generates:
 * - Standard XML sitemap
 * - News sitemap
 * - Image sitemap
 * - Robots.txt with AI crawler rules
 */

import { Article, Media } from "@prisma/client";

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
  images?: SitemapImage[];
  news?: SitemapNews;
}

export interface SitemapImage {
  loc: string;
  caption?: string;
  title?: string;
  license?: string;
}

export interface SitemapNews {
  publicationName: string;
  publicationLanguage: string;
  publicationDate: string;
  title: string;
  keywords?: string;
}

// Article with required fields for sitemap (sitemapPriority, sitemapChangeFreq, inLanguage may come from Settings)
interface ArticleForSitemap {
  slug: string;
  title: string;
  dateModified: Date;
  datePublished?: Date | null;
  sitemapPriority?: number | null;
  sitemapChangeFreq?: string | null;
  inLanguage?: string;
  featuredImage?: {
    url: string;
    altText?: string | null;
    caption?: string | null;
  } | null;
  tags?: Array<{ tag: { name: string } }>;
}

export interface ArticleSitemapDefaults {
  sitemapPriority: number;
  sitemapChangeFreq: string;
  inLanguage: string;
}

/**
 * Generate XML sitemap header
 */
function getSitemapHeader(includeImage: boolean = false, includeNews: boolean = false): string {
  let namespaces = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

  if (includeImage) {
    namespaces += ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
  }

  if (includeNews) {
    namespaces += ' xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"';
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset ${namespaces}>`;
}

/**
 * Generate sitemap entry XML
 */
function generateSitemapEntryXml(entry: SitemapEntry): string {
  let xml = "  <url>\n";
  xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`;

  if (entry.lastmod) {
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
  }

  if (entry.changefreq) {
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
  }

  if (entry.priority !== undefined) {
    xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
  }

  // Image extension
  if (entry.images && entry.images.length > 0) {
    for (const image of entry.images) {
      xml += "    <image:image>\n";
      xml += `      <image:loc>${escapeXml(image.loc)}</image:loc>\n`;
      if (image.caption) {
        xml += `      <image:caption>${escapeXml(image.caption)}</image:caption>\n`;
      }
      if (image.title) {
        xml += `      <image:title>${escapeXml(image.title)}</image:title>\n`;
      }
      if (image.license) {
        xml += `      <image:license>${escapeXml(image.license)}</image:license>\n`;
      }
      xml += "    </image:image>\n";
    }
  }

  // News extension
  if (entry.news) {
    xml += "    <news:news>\n";
    xml += "      <news:publication>\n";
    xml += `        <news:name>${escapeXml(entry.news.publicationName)}</news:name>\n`;
    xml += `        <news:language>${entry.news.publicationLanguage}</news:language>\n`;
    xml += "      </news:publication>\n";
    xml += `      <news:publication_date>${entry.news.publicationDate}</news:publication_date>\n`;
    xml += `      <news:title>${escapeXml(entry.news.title)}</news:title>\n`;
    if (entry.news.keywords) {
      xml += `      <news:keywords>${escapeXml(entry.news.keywords)}</news:keywords>\n`;
    }
    xml += "    </news:news>\n";
  }

  xml += "  </url>\n";
  return xml;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generate article sitemap entry
 */
export function generateArticleSitemapEntry(
  article: ArticleForSitemap,
  siteUrl: string,
  options?: {
    includeImage?: boolean;
    includeNews?: boolean;
    publicationName?: string;
    defaults?: ArticleSitemapDefaults;
  }
): SitemapEntry {
  const defaults = options?.defaults;
  const entry: SitemapEntry = {
    loc: `${siteUrl}/articles/${article.slug}`,
    lastmod: article.dateModified.toISOString().split("T")[0],
    changefreq: (article.sitemapChangeFreq ?? defaults?.sitemapChangeFreq ?? "weekly") as SitemapEntry["changefreq"],
    priority: article.sitemapPriority ?? defaults?.sitemapPriority ?? 0.8,
  };

  // Add image
  if (options?.includeImage && article.featuredImage) {
    entry.images = [
      {
        loc: article.featuredImage.url,
        caption: article.featuredImage.caption || undefined,
        title: article.featuredImage.altText || article.title,
      },
    ];
  }

  // Add news
  if (options?.includeNews && article.datePublished) {
    const isRecent =
      new Date().getTime() - article.datePublished.getTime() < 48 * 60 * 60 * 1000; // 48 hours

    if (isRecent) {
      entry.news = {
        publicationName: options.publicationName || "مودونتي",
        publicationLanguage: article.inLanguage || options?.defaults?.inLanguage || "ar",
        publicationDate: article.datePublished.toISOString(),
        title: article.title,
        keywords: article.tags?.map((t) => t.tag.name).join(", "),
      };
    }
  }

  return entry;
}

/**
 * Generate complete article sitemap XML
 */
export function generateArticleSitemap(
  articles: ArticleForSitemap[],
  siteUrl: string,
  options?: {
    includeImage?: boolean;
    includeNews?: boolean;
    publicationName?: string;
    defaults?: ArticleSitemapDefaults;
  }
): string {
  const includeImage = options?.includeImage ?? true;
  const includeNews = options?.includeNews ?? false;

  let xml = getSitemapHeader(includeImage, includeNews);
  xml += "\n";

  for (const article of articles) {
    const entry = generateArticleSitemapEntry(article, siteUrl, { ...options, defaults: options?.defaults });
    xml += generateSitemapEntryXml(entry);
  }

  xml += "</urlset>";
  return xml;
}

/**
 * Generate sitemap index for multiple sitemaps
 */
export function generateSitemapIndex(
  sitemaps: Array<{ loc: string; lastmod?: string }>,
  siteUrl: string
): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const sitemap of sitemaps) {
    xml += "  <sitemap>\n";
    xml += `    <loc>${escapeXml(sitemap.loc)}</loc>\n`;
    if (sitemap.lastmod) {
      xml += `    <lastmod>${sitemap.lastmod}</lastmod>\n`;
    }
    xml += "  </sitemap>\n";
  }

  xml += "</sitemapindex>";
  return xml;
}

/**
 * Generate robots.txt with AI crawler rules
 */
export function generateRobotsTxt(
  siteUrl: string,
  options?: {
    allowAICrawlers?: boolean;
    customRules?: string[];
    crawlDelay?: number;
  }
): string {
  const lines: string[] = [];

  // Default rules for all bots
  lines.push("# Robots.txt for Modonty");
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("User-agent: *");
  lines.push("Allow: /");
  lines.push("Disallow: /admin/");
  lines.push("Disallow: /api/");
  lines.push("Disallow: /_next/");
  lines.push("");

  // Crawl delay
  if (options?.crawlDelay) {
    lines.push(`Crawl-delay: ${options.crawlDelay}`);
    lines.push("");
  }

  // Google bots (allow all)
  lines.push("# Google");
  lines.push("User-agent: Googlebot");
  lines.push("Allow: /");
  lines.push("");

  lines.push("User-agent: Googlebot-Image");
  lines.push("Allow: /");
  lines.push("");

  lines.push("User-agent: Googlebot-News");
  lines.push("Allow: /");
  lines.push("");

  // Bing bot
  lines.push("# Bing");
  lines.push("User-agent: Bingbot");
  lines.push("Allow: /");
  lines.push("");

  // AI Crawlers
  lines.push("# AI Crawlers");

  if (options?.allowAICrawlers !== false) {
    // Allow AI crawlers (default)
    lines.push("User-agent: GPTBot");
    lines.push("Allow: /");
    lines.push("");

    lines.push("User-agent: ChatGPT-User");
    lines.push("Allow: /");
    lines.push("");

    lines.push("User-agent: Google-Extended");
    lines.push("Allow: /");
    lines.push("");

    lines.push("User-agent: PerplexityBot");
    lines.push("Allow: /");
    lines.push("");

    lines.push("User-agent: Anthropic-AI");
    lines.push("Allow: /");
    lines.push("");

    lines.push("User-agent: ClaudeBot");
    lines.push("Allow: /");
    lines.push("");

    lines.push("User-agent: Claude-Web");
    lines.push("Allow: /");
    lines.push("");
  } else {
    // Block AI crawlers
    lines.push("User-agent: GPTBot");
    lines.push("Disallow: /");
    lines.push("");

    lines.push("User-agent: ChatGPT-User");
    lines.push("Disallow: /");
    lines.push("");

    lines.push("User-agent: Google-Extended");
    lines.push("Disallow: /");
    lines.push("");
  }

  // Custom rules
  if (options?.customRules && options.customRules.length > 0) {
    lines.push("# Custom Rules");
    lines.push(...options.customRules);
    lines.push("");
  }

  // Sitemaps
  lines.push("# Sitemaps");
  lines.push(`Sitemap: ${siteUrl}/sitemap.xml`);
  lines.push(`Sitemap: ${siteUrl}/sitemap-articles.xml`);
  lines.push(`Sitemap: ${siteUrl}/sitemap-news.xml`);
  lines.push("");

  // Host
  lines.push(`Host: ${siteUrl.replace(/^https?:\/\//, "")}`);

  return lines.join("\n");
}

/**
 * Validate sitemap URL count (Google limit: 50,000)
 */
export function validateSitemapSize(
  urlCount: number
): { valid: boolean; message?: string } {
  const MAX_URLS = 50000;
  const WARN_THRESHOLD = 40000;

  if (urlCount > MAX_URLS) {
    return {
      valid: false,
      message: `عدد URLs (${urlCount}) يتجاوز الحد الأقصى (${MAX_URLS}). قسّم إلى عدة ملفات sitemap`,
    };
  }

  if (urlCount > WARN_THRESHOLD) {
    return {
      valid: true,
      message: `عدد URLs (${urlCount}) قريب من الحد الأقصى. فكر في تقسيم الـ sitemap`,
    };
  }

  return { valid: true };
}
