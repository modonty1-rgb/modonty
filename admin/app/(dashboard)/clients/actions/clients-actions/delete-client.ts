"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

export async function deleteClient(id: string) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };
    const client = await db.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    if (client._count.articles > 0) {
      return {
        success: false,
        error: `Cannot delete client. This client has ${client._count.articles} article(s). Please delete or reassign the articles first.`,
      };
    }

    await db.client.delete({
      where: { id },
    });
    revalidatePath("/clients");
    await revalidateModontyTag("clients");
    try { const { regenerateClientsListingCache } = await import("@/lib/seo/listing-page-seo-generator"); await regenerateClientsListingCache(); } catch {}
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete client";
    return { success: false, error: message };
  }
}

