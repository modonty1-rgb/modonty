"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateClientSEO } from "./generate-client-seo";

const schema = z.object({ heroImageMediaId: z.string().nullable() });

export async function updateClientHero(
  clientId: string,
  heroImageMediaId: string | null
) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = schema.safeParse({ heroImageMediaId });
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
      data: { heroImageMediaId: parsed.data.heroImageMediaId },
    });

    await generateClientSEO(clientId);

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/articles", "layout");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update hero image";
    return { success: false, error: message };
  }
}
