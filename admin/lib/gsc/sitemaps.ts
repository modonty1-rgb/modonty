import type { GscSitemap } from "./types";
import { getGscClient, getGscWriteClient, GSC_PROPERTY } from "./client";

export async function listSitemaps(): Promise<GscSitemap[]> {
  const gsc = getGscClient();
  const res = await gsc.sitemaps.list({ siteUrl: GSC_PROPERTY });
  const items = res.data.sitemap ?? [];

  return items.map((s) => ({
    path: s.path ?? "",
    lastSubmitted: s.lastSubmitted ?? undefined,
    isPending: s.isPending ?? false,
    isSitemapsIndex: s.isSitemapsIndex ?? false,
    type: s.type ?? undefined,
    lastDownloaded: s.lastDownloaded ?? undefined,
    warnings: s.warnings ?? undefined,
    errors: s.errors ?? undefined,
    contents: s.contents?.map((c) => ({
      type: c.type ?? "",
      submitted: c.submitted ?? "0",
      indexed: c.indexed ?? "0",
    })),
  }));
}

export async function submitSitemap(feedpath: string): Promise<void> {
  const gsc = getGscWriteClient();
  await gsc.sitemaps.submit({ siteUrl: GSC_PROPERTY, feedpath });
}

export async function deleteSitemap(feedpath: string): Promise<void> {
  const gsc = getGscWriteClient();
  await gsc.sitemaps.delete({ siteUrl: GSC_PROPERTY, feedpath });
}
