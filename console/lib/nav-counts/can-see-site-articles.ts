import { db } from "@/lib/db";

/**
 * Whether publishing to the client's own website is switched on. It no longer decides a
 * tab — every client sees «مقالاتك على موقعك», and a client without it gets the offer —
 * but the plan block in the sidebar still marks the feature as live from this flag.
 */
export async function canSeeSiteArticles(clientId: string): Promise<boolean> {
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { canPublishToOwnSite: true },
  });
  return client?.canPublishToOwnSite ?? false;
}
