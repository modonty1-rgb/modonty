"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit/log-action";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

const schema = z.object({ mobileHeroImageMediaId: z.string().nullable() });

/**
 * The phone image at the top of the client's page — chosen from the media library, next to the
 * desktop cover (Khalid, 26 Sep 2026: «صورة للديسكتوب وصورة للموبايل»). Null clears it, and the
 * page falls back to the cover.
 *
 * Same shape as `updateClientHero`, plus one thing it lacks: an IMMEDIATE `clients` revalidate on
 * the public site. Without it modonty keeps serving the previous image for up to its cache life
 * (hours) after the editor saves.
 */
export async function updateClientMobileHero(clientId: string, mobileHeroImageMediaId: string | null) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = schema.safeParse({ mobileHeroImageMediaId });
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const clientExists = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true },
    });
    if (!clientExists) return { success: false, error: "Client not found" };

    await db.client.update({
      where: { id: clientId },
      data: { mobileHeroImageMediaId: parsed.data.mobileHeroImageMediaId },
    });

    await logAction("client.mobileHero", {
      entity: "Client",
      entityId: clientId,
      summary: clientExists.name ?? clientId,
    });

    revalidatePath(`/clients/${clientId}`);
    revalidatePath(`/clients/${clientId}/edit`);
    await revalidateModontyTag("clients", null, { immediate: true }).catch(() => {});

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update mobile image";
    return { success: false, error: message };
  }
}
