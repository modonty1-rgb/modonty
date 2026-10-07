import { cacheTag, cacheLife } from "next/cache";

import { db } from "@/lib/db";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";

/**
 * The slug of the Client row that IS Modonty — what «تابع مدونتي» follows through
 * `/clients/[slug]/api/follow` (Khalid, 3 Oct 2026). Read by id from Settings, never typed:
 * the slug follows the name, which the admin can change.
 */
export async function getCoreClientSlug(): Promise<string | null> {
  "use cache";
  cacheTag("settings");
  cacheTag("clients");
  cacheLife("hours");

  const id = await getCoreClientId();
  if (!id) return null;
  const client = await db.client.findUnique({ where: { id }, select: { slug: true } });
  return client?.slug ?? null;
}
