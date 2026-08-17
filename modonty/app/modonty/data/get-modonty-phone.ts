import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

/**
 * modonty's own WhatsApp number — the same `Client.phone` every partner page reads for its
 * WhatsApp button (Khalid, 2026-08-17: «الواتساب حتلاقي بياناته في الداتابيس»). The
 * partner-list shape only says whether a number exists (`hasWhatsapp`), so the rail card
 * reads the number itself here. Null when unset → the row does not render.
 */
export async function getModontyPhone(clientId: string): Promise<string | null> {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");

  const client = await db.client.findUnique({ where: { id: clientId }, select: { phone: true } });
  return client?.phone?.trim() || null;
}
