"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { batchRegenerateJsonLd } from "@/lib/seo/jsonld-storage";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

export interface StaleArticleSample {
  id: string;
  slug: string;
  title: string;
}

export interface JsonLdIntegrityStats {
  total: number;
  withCache: number;
  staleCount: number;
  expectedSiteUrl: string | null;
  detectedBadHosts: string[];
  sample: StaleArticleSample[];
}

const BAD_HOST_PATTERNS = [
  "http://localhost",
  "https://localhost",
  "127.0.0.1",
  "0.0.0.0",
  ".vercel.app",
];

function detectStaleHosts(cache: string, expectedSiteUrl: string | null): string[] {
  const found = new Set<string>();

  for (const pattern of BAD_HOST_PATTERNS) {
    if (cache.includes(pattern)) found.add(pattern);
  }

  if (expectedSiteUrl) {
    try {
      const expectedHost = new URL(expectedSiteUrl).host;
      const insecure = `http://${expectedHost}`;
      if (cache.includes(insecure)) found.add(insecure);

      // Host-mismatch detection — catches www vs non-www (and any other host drift).
      // Matches the canonical-url-sanitizer policy: storedHost !== expectedHost = stale.
      // Regex scans every absolute URL in the JSON cache and compares hosts.
      const urlRe = /https?:\/\/([^\s"'/]+)/g;
      let m: RegExpExecArray | null;
      while ((m = urlRe.exec(cache)) !== null) {
        const storedHost = m[1];
        if (storedHost && storedHost !== expectedHost) {
          // Ignore third-party hosts (Cloudinary, schema.org, etc.). Drift only matters
          // when the stored host is a near-twin of expected (likely the site itself
          // pointing at the wrong subdomain). Compare apex domain ignoring www.
          const apexExpected = expectedHost.replace(/^www\./, "");
          const apexStored = storedHost.replace(/^www\./, "");
          if (apexExpected === apexStored) {
            found.add(`host-mismatch:${storedHost} (expected ${expectedHost})`);
            break; // one signal per cache entry is enough
          }
        }
      }
    } catch {
      // ignore malformed siteUrl
    }
  }

  return Array.from(found);
}

export async function getJsonLdIntegrityStats(): Promise<JsonLdIntegrityStats> {
  const settings = await getAllSettings();
  const expectedSiteUrl = settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? null;

  const articles = await db.article.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      jsonLdStructuredData: true,
    },
  });

  const total = articles.length;
  let withCache = 0;
  const stale: StaleArticleSample[] = [];
  const badHosts = new Set<string>();

  for (const article of articles) {
    if (!article.jsonLdStructuredData) continue;
    withCache++;

    const detected = detectStaleHosts(article.jsonLdStructuredData, expectedSiteUrl);
    if (detected.length > 0) {
      detected.forEach((h) => badHosts.add(h));
      stale.push({ id: article.id, slug: article.slug, title: article.title });
    }
  }

  return {
    total,
    withCache,
    staleCount: stale.length,
    expectedSiteUrl,
    detectedBadHosts: Array.from(badHosts).slice(0, 5),
    sample: stale.slice(0, 5),
  };
}

export async function regenerateAllStaleJsonLd(): Promise<{
  attempted: number;
  successful: number;
  failed: number;
}> {
  const stats = await getJsonLdIntegrityStats();
  if (stats.staleCount === 0) {
    return { attempted: 0, successful: 0, failed: 0 };
  }

  const articles = await db.article.findMany({
    where: { status: "PUBLISHED", jsonLdStructuredData: { not: null } },
    select: { id: true, jsonLdStructuredData: true },
  });

  const staleIds = articles
    .filter((a) =>
      a.jsonLdStructuredData
        ? detectStaleHosts(a.jsonLdStructuredData, stats.expectedSiteUrl).length > 0
        : false,
    )
    .map((a) => a.id);

  const result = await batchRegenerateJsonLd(staleIds);

  revalidatePath("/database");
  return {
    attempted: staleIds.length,
    successful: result.successful,
    failed: result.failed,
  };
}
