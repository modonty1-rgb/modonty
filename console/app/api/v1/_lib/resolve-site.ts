import { db } from "@/lib/db";

/**
 * Who is asking — the client id in the path, and nothing else.
 *
 * There is deliberately no key. Everything this endpoint returns is already printed on
 * the client's own public website, so a secret would guard nothing while costing every
 * client a credential to install and us a credential to rotate. What the id still has to
 * prove is that this client is allowed to pull at all: the two gates below are the ones
 * that used to sit behind the key, and they are why a suspended client stops the moment
 * the tick goes on rather than whenever someone remembers to change a value.
 */
export interface ResolvedSite {
  id: string;
  name: string;
  articlesBaseUrl: string | null;
}

export type ResolveResult =
  | { ok: true; site: ResolvedSite }
  | { ok: false; status: 403 | 404; error: string };

// A malformed id must never reach the driver: Mongo throws on anything that is not an
// ObjectId, and a 500 tells the caller more about us than a 404 does.
const OBJECT_ID = /^[0-9a-f]{24}$/i;

export async function resolveSite(siteId: string): Promise<ResolveResult> {
  if (!OBJECT_ID.test(siteId)) {
    return { ok: false, status: 404, error: "Unknown site" };
  }

  const client = await db.client.findUnique({
    where: { id: siteId },
    select: {
      id: true,
      name: true,
      articlesBaseUrl: true,
      canPublishToOwnSite: true,
      apiKeySuspended: true,
    },
  });

  if (!client) {
    return { ok: false, status: 404, error: "Unknown site" };
  }

  if (!client.canPublishToOwnSite) {
    return { ok: false, status: 403, error: "Publishing is not enabled for this site" };
  }

  // Suspended is not "forgotten": the address stays valid and starts answering again the
  // moment the tick comes off, which is the whole point of a suspend switch.
  if (client.apiKeySuspended) {
    return { ok: false, status: 403, error: "Service suspended" };
  }

  // Last pull is a diagnosis, not a feature: an integration that silently stopped asking
  // is invisible without it. Never awaited — a stat must not slow the client's page.
  void db.client
    .update({ where: { id: client.id }, data: { apiKeyLastUsedAt: new Date() } })
    .catch(() => {});

  return {
    ok: true,
    site: { id: client.id, name: client.name, articlesBaseUrl: client.articlesBaseUrl },
  };
}
