import "server-only";

import { db } from "@/lib/db";
import type { ClientsMediaQuery } from "./clients-media-where";
import type { ClientsMediaUniverse } from "./get-clients-media-universe";

/**
 * The client picker on Clients › Media: every client except Modonty, whatever its
 * subscription state (an expired client's logo is still live on its page), each with how
 * many files it has under the type/usage/search filters that are on — clients with files
 * first, so the list opens on the ones worth picking.
 *
 * Tallied by a `groupBy` inside the database: one row per client comes back, not one per file.
 * (It panicked on 26 Sep 2026 — «Option::unwrap() on a None value» — while the filter carried
 * relation clauses; the filter is plain fields and `id in` now.)
 */
export async function getMediaOwnerClients(
  coreClientId: string | null,
  { where }: ClientsMediaUniverse,
  active: Pick<ClientsMediaQuery, "kind" | "used" | "search" | "issueIds">,
) {
  const [clients, groups] = await Promise.all([
    db.client.findMany({
      where: coreClientId ? { id: { not: coreClientId } } : {},
      select: { id: true, name: true },
    }),
    db.media.groupBy({ by: ["clientId"], where: where(active), _count: { _all: true } }),
  ]);

  const perClient = new Map(groups.map((g) => [g.clientId, g._count._all]));

  return clients
    .map((c) => ({ id: c.id, name: c.name.trim(), files: perClient.get(c.id) ?? 0 }))
    .sort((a, b) => b.files - a.files || a.name.localeCompare(b.name));
}
