/**
 * One partner's cache tags — so a partner's save refreshes HIS pages, not every partner's.
 *
 * Everything on a partner site was tagged only «clients», so any save from any partner (or the
 * admin) threw away the cached pages of all partners at once (Khalid, 4 Oct 2026: «مو كله يضر
 * كله»). Partner-page caches now also carry these tags; the console busts them alone, and the
 * broad «clients» stays for the listings (directory, home page) and for the admin.
 *
 * Two forms because the cached readers are keyed two ways: most by slug, one by id. Next allows
 * tags built from data and up to 256 characters each (node_modules/next/dist/docs/…/cacheTag.md).
 * The slug is the DECODED one — the readers all decode before querying.
 */
export function clientSlugTag(decodedSlug: string): string {
  return `client:${decodedSlug}`;
}

export function clientIdTag(clientId: string): string {
  return `client-id:${clientId}`;
}

/** Both tags for one partner — what a revalidation sends. */
export function clientCacheTags(client: { id: string; slug: string }): string[] {
  return [clientSlugTag(client.slug), clientIdTag(client.id)];
}
