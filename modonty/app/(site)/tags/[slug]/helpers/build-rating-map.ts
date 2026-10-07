import type { getClientsRatings } from "@/lib/clients/get-clients-ratings";

export function buildRatingMap(ratingsRaw: Awaited<ReturnType<typeof getClientsRatings>>) {
  return new Map(ratingsRaw.map((r) => [r.clientId, r._avg.rating ?? 0]));
}
