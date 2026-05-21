"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

export interface CanonicalSample {
  id: string;
  slug: string;
  title: string;
  before: string;
  after: string;
}

export interface CanonicalSanitizerStats {
  total: number;
  withCanonical: number;
  staleCount: number;
  expectedBase: string | null;
  detectedBadHosts: string[];
  sample: CanonicalSample[];
}

const BAD_HOST_PATTERNS = [
  "http://localhost",
  "https://localhost",
  "127.0.0.1",
  "0.0.0.0",
  ".vercel.app",
];

function buildExpectedCanonical(slug: string, baseUrl: string): string {
  // Use the same construction as modonty's runtime canonical generator —
  // `new URL` percent-encodes Arabic + path separators correctly.
  return new URL(`/articles/${slug}`, baseUrl).href;
}

function detectStaleCanonical(
  stored: string,
  expected: string,
  expectedSiteUrl: string,
): { stale: boolean; badHost?: string } {
  // Direct mismatch always counts
  if (stored !== expected) {
    // Extract the bad host (if any pattern matches) for reporting
    for (const pattern of BAD_HOST_PATTERNS) {
      if (stored.includes(pattern)) return { stale: true, badHost: pattern };
    }
    // Wrong host vs expected
    try {
      const expectedHost = new URL(expectedSiteUrl).host;
      const storedHost = new URL(stored).host;
      if (storedHost !== expectedHost) return { stale: true, badHost: storedHost };
    } catch {
      // Malformed stored URL → also stale
      return { stale: true, badHost: "malformed" };
    }
    return { stale: true };
  }
  return { stale: false };
}

export async function getCanonicalUrlSanitizerStats(): Promise<CanonicalSanitizerStats> {
  const settings = await getAllSettings();
  const expectedSiteUrl = settings?.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? null;

  if (!expectedSiteUrl) {
    return {
      total: 0,
      withCanonical: 0,
      staleCount: 0,
      expectedBase: null,
      detectedBadHosts: [],
      sample: [],
    };
  }

  const articles = await db.article.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      canonicalUrl: true,
    },
  });

  const stale: CanonicalSample[] = [];
  const badHosts = new Set<string>();
  let withCanonical = 0;

  for (const article of articles) {
    if (!article.canonicalUrl) continue;
    withCanonical++;

    const expected = buildExpectedCanonical(article.slug, expectedSiteUrl);
    const check = detectStaleCanonical(article.canonicalUrl, expected, expectedSiteUrl);

    if (check.stale) {
      if (check.badHost) badHosts.add(check.badHost);
      stale.push({
        id: article.id,
        slug: article.slug,
        title: article.title,
        before: article.canonicalUrl,
        after: expected,
      });
    }
  }

  return {
    total: articles.length,
    withCanonical,
    staleCount: stale.length,
    expectedBase: expectedSiteUrl,
    detectedBadHosts: Array.from(badHosts).slice(0, 5),
    sample: stale.slice(0, 5),
  };
}

export async function regenerateAllStaleCanonicalUrls(): Promise<{
  attempted: number;
  successful: number;
  failed: number;
}> {
  const stats = await getCanonicalUrlSanitizerStats();
  if (stats.staleCount === 0 || !stats.expectedBase) {
    return { attempted: 0, successful: 0, failed: 0 };
  }

  // Re-fetch the full stale list (sample is capped at 5; we need all)
  const articles = await db.article.findMany({
    where: { status: "PUBLISHED", canonicalUrl: { not: null } },
    select: { id: true, slug: true, canonicalUrl: true },
  });

  const baseUrl = stats.expectedBase;
  const updates = articles
    .map((a) => ({
      id: a.id,
      expected: buildExpectedCanonical(a.slug, baseUrl),
      current: a.canonicalUrl!,
    }))
    .filter((u) => u.current !== u.expected);

  let successful = 0;
  let failed = 0;
  for (const u of updates) {
    try {
      await db.article.update({ where: { id: u.id }, data: { canonicalUrl: u.expected } });
      successful++;
    } catch {
      failed++;
    }
  }

  revalidatePath("/database");
  return { attempted: updates.length, successful, failed };
}
