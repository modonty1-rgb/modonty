import "server-only";

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

export interface ParsedSitemap {
  url: string;
  fetchedAt: string;
  count: number;
  entries: SitemapEntry[];
}

export async function fetchAndParseSitemap(sitemapUrl: string): Promise<ParsedSitemap> {
  const res = await fetch(sitemapUrl, {
    cache: "no-store",
    headers: { "User-Agent": "Modonty-Admin/1.0 (sitemap-viewer)" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch sitemap (${res.status} ${res.statusText})`);
  }
  const xml = await res.text();
  const entries = parseSitemapXml(xml);
  return {
    url: sitemapUrl,
    fetchedAt: new Date().toISOString(),
    count: entries.length,
    entries,
  };
}

export interface ImageSitemapStats {
  url: string;
  fetchedAt: string;
  status: number;
  articlesWithImages: number;
  totalImages: number;
  bytes: number;
  hasNamespace: boolean;
}

export async function fetchAndAnalyzeImageSitemap(
  sitemapUrl: string,
): Promise<ImageSitemapStats> {
  const res = await fetch(sitemapUrl, {
    cache: "no-store",
    headers: { "User-Agent": "Modonty-Admin/1.0 (image-sitemap-viewer)" },
  });
  const xml = await res.text();
  const articlesWithImages = (xml.match(/<url\b/g) ?? []).length;
  const totalImages = (xml.match(/<image:image\b/g) ?? []).length;
  const hasNamespace = xml.includes(
    "http://www.google.com/schemas/sitemap-image/1.1",
  );
  return {
    url: sitemapUrl,
    fetchedAt: new Date().toISOString(),
    status: res.status,
    articlesWithImages,
    totalImages,
    bytes: new Blob([xml]).size,
    hasNamespace,
  };
}

function parseSitemapXml(xml: string): SitemapEntry[] {
  const out: SitemapEntry[] = [];
  const urlBlocks = xml.match(/<url\b[^>]*>[\s\S]*?<\/url>/g) ?? [];
  for (const block of urlBlocks) {
    const loc = extractTag(block, "loc");
    if (!loc) continue;
    const lastmod = extractTag(block, "lastmod");
    out.push({ loc, ...(lastmod && { lastmod }) });
  }
  return out;
}

function extractTag(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  if (!match) return undefined;
  return decodeXmlEntities(match[1].trim());
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export type SitemapPathType =
  | "article"
  | "category"
  | "tag"
  | "author"
  | "client"
  | "industry"
  | "static"
  | "homepage"
  | "other";

export function classifySitemapPath(url: string): SitemapPathType {
  try {
    const u = new URL(url);
    const path = u.pathname;
    if (path === "/" || path === "") return "homepage";
    if (path.startsWith("/articles/")) return "article";
    if (path.startsWith("/categories/")) return "category";
    if (path.startsWith("/tags/")) return "tag";
    if (path.startsWith("/authors/")) return "author";
    if (path.startsWith("/clients/")) return "client";
    if (path.startsWith("/industries/")) return "industry";
    if (path === "/categories" || path === "/clients" || path === "/tags") return "static";
    if (
      path.startsWith("/legal") ||
      path.startsWith("/help") ||
      path === "/about" ||
      path === "/contact" ||
      path === "/terms" ||
      path === "/news"
    ) return "static";
    return "other";
  } catch {
    return "other";
  }
}
