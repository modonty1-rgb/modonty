"use server";

import { auth } from "@/lib/auth";
import { fetchAndParseSitemap, type ParsedSitemap } from "@/lib/gsc/parse-sitemap";

interface ActionResponse {
  ok: boolean;
  error?: string;
  data?: ParsedSitemap;
}

export async function fetchSitemapUrlsAction(sitemapUrl: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user) return { ok: false, error: "Unauthorized" };

    if (!sitemapUrl || !/^https?:\/\//.test(sitemapUrl)) {
      return { ok: false, error: "Invalid sitemap URL" };
    }
    const data = await fetchAndParseSitemap(sitemapUrl);
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to fetch sitemap",
    };
  }
}
