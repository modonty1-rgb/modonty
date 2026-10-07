import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { clientIdTag } from "@modonty/shared/lib/cache/client-cache-tags";

export async function getClientStats(clientId: string) {
  "use cache";
  cacheTag("clients", clientIdTag(clientId));
  cacheLife("hours");

  try {
    const [followersCount, totalViews] = await Promise.all([
      db.clientLike.count({ where: { clientId } }),
      db.clientView.count({ where: { clientId } }),
    ]);

    return {
      followers: followersCount,
      totalViews,
    };
  } catch (error) {
    return {
      followers: 0,
      totalViews: 0,
    };
  }
}
