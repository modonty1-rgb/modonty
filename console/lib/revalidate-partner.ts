import { clientCacheTags } from "@modonty/shared/lib/cache/client-cache-tags";

import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

/**
 * Refresh ONE partner's pages on modonty — immediately — instead of the broad «clients» tag that
 * threw away every partner's cached pages on any save (Khalid, 4 Oct 2026: «مو كله يضر كله»).
 *
 * `listing: true` also refreshes the shared listings (partner directory, home page cards): only
 * for saves that change what those show — name, logo, slogan, industry. Resolves true when every
 * bust was confirmed.
 */
export async function revalidatePartner(client: { id: string; slug: string }, options?: { listing?: boolean }): Promise<boolean> {
  const busts = clientCacheTags(client).map((tag) => revalidateModontyTag(tag as `client:${string}`, { immediate: true }));
  if (options?.listing) busts.push(revalidateModontyTag("clients", { immediate: true }));
  const results = await Promise.all(busts);
  return results.every(Boolean);
}
