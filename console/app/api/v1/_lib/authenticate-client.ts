import { db } from "@/lib/db";

/**
 * Who is asking — decided by the KEY, never by anything in the URL.
 *
 * The client's website sends `Authorization: Bearer mdk_…` and nothing else that
 * identifies them. There is deliberately no client id in the path: an id in the URL is
 * an invitation to try someone else's, and the only thing standing between the two
 * would be a check we could forget to write. Here it cannot be forgotten — the row the
 * key belongs to IS the tenant, so a request can only ever reach its own articles.
 */
export interface AuthenticatedClient {
  id: string;
  name: string;
  articlesBaseUrl: string | null;
}

export type AuthResult =
  | { ok: true; client: AuthenticatedClient }
  | { ok: false; status: 401; error: string };

const BEARER = /^Bearer\s+(.+)$/i;

export async function authenticateClient(request: Request): Promise<AuthResult> {
  const header = request.headers.get("authorization") ?? "";
  const match = BEARER.exec(header.trim());

  if (!match) {
    return { ok: false, status: 401, error: "Missing bearer token" };
  }

  const key = match[1].trim();
  if (!key) {
    return { ok: false, status: 401, error: "Missing bearer token" };
  }

  const client = await db.client.findFirst({
    where: { apiKey: key },
    select: {
      id: true,
      name: true,
      articlesBaseUrl: true,
      canPublishToOwnSite: true,
      apiKeySuspended: true,
    },
  });

  if (!client) {
    return { ok: false, status: 401, error: "Invalid key" };
  }

  // Suspended is not "forgotten": the key stays in their env var and starts working
  // again the moment the tick comes off, which is the whole point of a suspend switch.
  if (client.apiKeySuspended) {
    return { ok: false, status: 401, error: "Service suspended" };
  }

  if (!client.canPublishToOwnSite) {
    return { ok: false, status: 401, error: "Publishing is not enabled for this client" };
  }

  // Last use is a diagnosis, not a feature: an integration that silently stopped pulling
  // is invisible without it. Never awaited — a stat must not slow the client's page.
  void db.client
    .update({ where: { id: client.id }, data: { apiKeyLastUsedAt: new Date() } })
    .catch(() => {});

  return {
    ok: true,
    client: { id: client.id, name: client.name, articlesBaseUrl: client.articlesBaseUrl },
  };
}
