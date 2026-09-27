import "server-only";

import { db } from "@/lib/db";
import { clientsMediaWhere, type ClientsMediaQuery } from "./clients-media-where";

/**
 * The client picker on Clients › Media: every client except Modonty, whatever its
 * subscription state (an expired client's logo is still live on its page), each with how
 * many files it has under the type/usage/search filters that are on — clients with files
 * first, so the list opens on the ones worth picking.
 *
 * Counted by tallying one `clientId` column instead of a `groupBy`: Prisma's MongoDB groupBy
 * panicked on this filter shape (26 Sep 2026, «Option::unwrap() on a None value»).
 */
export async function getMediaOwnerClients(
  coreClientId: string | null,
  active: Pick<ClientsMediaQuery, "kind" | "used" | "search" | "issueIds">,
) {
  const [clients, rows] = await Promise.all([
    db.client.findMany({
      where: coreClientId ? { id: { not: coreClientId } } : {},
      select: { id: true, name: true },
    }),
    db.media.findMany({ where: clientsMediaWhere(coreClientId, active), select: { clientId: true } }),
  ]);

  const perClient = new Map<string, number>();
  for (const r of rows) if (r.clientId) perClient.set(r.clientId, (perClient.get(r.clientId) ?? 0) + 1);

  return clients
    .map((c) => ({ id: c.id, name: c.name.trim(), files: perClient.get(c.id) ?? 0 }))
    .sort((a, b) => b.files - a.files || a.name.localeCompare(b.name));
}
