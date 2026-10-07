"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { deleteMedia } from "@/lib/media/delete-media";
import { updateClientLogo } from "@/lib/clients/update-client-logo";
import { updateClientHero } from "@/lib/clients/update-client-hero";
import { updateClientMobileHero } from "@/lib/clients/update-client-mobile-hero";

const schema = z.object({
  clientId: z.string().min(1),
  role: z.enum(["LOGO", "HERO", "HERO_MOBILE"]),
  mediaId: z.string().min(1),
});

/**
 * Put a new image in one of the client's page slots — and remove the one it replaces.
 *
 * Replacing used to leave the previous file behind as «Unused», so the slot showed one image
 * while its type counted two (Khalid, 26 Sep 2026: «كفر ديسكتوب اثنين وموبايل اثنين… في حاجة
 * غلط»). The old file goes through `deleteMedia`, i.e. the same guard as a manual delete: if
 * anything else still uses it (an article, another client), it is kept and the reason returned.
 *
 * The mini image has no field on Client, so it is not handled here — a new CLIENT_MINI row
 * simply joins the client's files.
 */
export async function replaceClientSlotImage(clientId: string, role: "LOGO" | "HERO" | "HERO_MOBILE", mediaId: string) {
  const session = await auth();
  if (!session) return { success: false as const, error: "Unauthorized" };

  const parsed = schema.safeParse({ clientId, role, mediaId });
  if (!parsed.success) return { success: false as const, error: parsed.error.errors[0].message };

  const before = await db.client.findUnique({
    where: { id: clientId },
    select: { logoMediaId: true, heroImageMediaId: true, mobileHeroImageMediaId: true },
  });
  if (!before) return { success: false as const, error: "Client not found" };

  const previousId =
    role === "LOGO" ? before.logoMediaId : role === "HERO" ? before.heroImageMediaId : before.mobileHeroImageMediaId;

  const write = role === "LOGO" ? updateClientLogo : role === "HERO" ? updateClientHero : updateClientMobileHero;
  const linked = await write(clientId, mediaId);
  if (!linked.success) return { success: false as const, error: ("error" in linked && linked.error) || "Could not link the image" };

  if (!previousId || previousId === mediaId) return { success: true as const, removedOld: false };

  const removed = await deleteMedia(previousId);
  return removed.success
    ? { success: true as const, removedOld: true }
    : { success: true as const, removedOld: false, keptOldReason: ("error" in removed && removed.error) || "still in use" };
}
