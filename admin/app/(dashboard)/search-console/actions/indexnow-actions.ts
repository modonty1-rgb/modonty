"use server";

import { auth } from "@/lib/auth";
import { submitToIndexNow, type IndexNowResult } from "@/lib/indexnow";
import { buildSitemapUrl } from "@/lib/seo/url-builders";

interface IndexNowActionResponse {
  ok: boolean;
  result?: IndexNowResult;
  fetchedCount?: number;
  error?: string;
}

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

/**
 * Fetch live sitemap.xml + submit all URLs to IndexNow.
 * Single click → Bing + Yandex + Brave + Seznam + Naver all notified.
 */
export async function submitAllToIndexNowAction(): Promise<IndexNowActionResponse> {
  try {
    await requireAuth();

    const sitemapUrl = await buildSitemapUrl();
    const res = await fetch(sitemapUrl, { cache: "no-store" });
    if (!res.ok) {
      return { ok: false, error: `Failed to fetch sitemap: HTTP ${res.status}` };
    }

    const xml = await res.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    if (urls.length === 0) {
      return { ok: false, error: "No URLs found in sitemap" };
    }

    const result = await submitToIndexNow(urls);

    return {
      ok: result.ok,
      result,
      fetchedCount: urls.length,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to submit to IndexNow",
    };
  }
}

/**
 * Submit a specific list of URLs (used by per-row buttons or selective submit).
 */
export async function submitUrlsToIndexNowAction(
  urls: string[],
): Promise<IndexNowActionResponse> {
  try {
    await requireAuth();
    const result = await submitToIndexNow(urls);
    return { ok: result.ok, result };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to submit to IndexNow",
    };
  }
}
