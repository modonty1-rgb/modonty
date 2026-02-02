"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteClient(id: string) {
  try {
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
    return { success: true };
  } catch (error) {
    console.error("Error deleting client:", error);
    const message = error instanceof Error ? error.message : "Failed to delete client";
    return { success: false, error: message };
  }
}

