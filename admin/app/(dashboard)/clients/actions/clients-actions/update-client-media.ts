"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateClientSEO } from "./generate-client-seo";

const mediaSchema = z.object({
  logoMediaId: z.string().optional().nullable(),
  heroImageMediaId: z.string().optional().nullable(),
});

export async function updateClientMedia(
  clientId: string,
  data: { logoMediaId?: string | null; heroImageMediaId?: string | null }
) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = mediaSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const clientExists = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });
    if (!clientExists) return { success: false, error: "Client not found" };

    await db.client.update({
      where: { id: clientId },
      data: {
        logoMediaId: parsed.data.logoMediaId,
        heroImageMediaId: parsed.data.heroImageMediaId,
      },
    });

    await generateClientSEO(clientId);

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update media";
    return { success: false, error: message };
  }
}
