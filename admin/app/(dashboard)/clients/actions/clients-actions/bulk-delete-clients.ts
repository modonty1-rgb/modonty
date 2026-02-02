"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function bulkDeleteClients(clientIds: string[]) {
  try {
    if (clientIds.length === 0) {
      return { success: false, error: "No clients selected" };
    }

    const clients = await db.client.findMany({
      where: {
        id: { in: clientIds },
      },
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });

    const clientsWithArticles = clients.filter((client) => client._count.articles > 0);

    if (clientsWithArticles.length > 0) {
      const clientNames = clientsWithArticles.map((c) => c.name).join(", ");
      const totalArticles = clientsWithArticles.reduce((sum, c) => sum + c._count.articles, 0);
      return {
        success: false,
        error: `Cannot delete ${clientsWithArticles.length} client(s) with articles: ${clientNames}. Total articles: ${totalArticles}. Please delete or reassign the articles first.`,
      };
    }

    await db.client.deleteMany({
      where: {
        id: { in: clientIds },
      },
    });

    revalidatePath("/clients");
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting clients:", error);
    const message = error instanceof Error ? error.message : "Failed to delete clients";
    return { success: false, error: message };
  }
}

