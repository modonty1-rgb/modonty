"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Verification image ("التوثيق") — a Cloudinary image of the client's official
// registration/license. Admin-controlled (Modonty verifies; the client does not
// verify itself — trust anchor). Stored as a plain URL string, displayed on the
// public client page. NOT part of JSON-LD, so no SEO regeneration is needed.
const schema = z.object({
  verificationImageUrl: z.string().url("رابط صورة غير صالح").nullable(),
});

export async function updateClientVerificationImage(
  clientId: string,
  verificationImageUrl: string | null
) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = schema.safeParse({ verificationImageUrl });
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
      data: { verificationImageUrl: parsed.data.verificationImageUrl },
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update verification image";
    return { success: false, error: message };
  }
}
