"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

type SettingsUpdate = {
  email?: string | null;
  phone?: string | null;
  gtmId?: string | null;
};

export async function updateClientSettings(
  clientId: string,
  data: SettingsUpdate
) {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });
    if (!client) return { success: false, error: "Client not found" };

    await db.client.update({
      where: { id: clientId },
      data: {
        ...(data.email !== undefined && data.email !== null && { email: data.email }),
        ...(data.phone !== undefined && data.phone !== null && { phone: data.phone }),
        ...(data.gtmId !== undefined && data.gtmId !== null && { gtmId: data.gtmId }),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return { success: false, error: message };
  }
}
