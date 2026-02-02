"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteOldImage } from "../../../actions/delete-image";

export async function bulkDeleteIndustries(industryIds: string[]) {
  try {
    if (industryIds.length === 0) {
      return { success: false, error: "No industries selected" };
    }

    const industries = await db.industry.findMany({
      where: {
        id: { in: industryIds },
      },
      include: {
        _count: {
          select: {
            clients: true,
          },
        },
      },
    });

    const industriesWithClients = industries.filter((industry) => industry._count.clients > 0);

    if (industriesWithClients.length > 0) {
      const industryNames = industriesWithClients.map((i) => i.name).join(", ");
      const totalClients = industriesWithClients.reduce((sum, i) => sum + i._count.clients, 0);
      return {
        success: false,
        error: `Cannot delete ${industriesWithClients.length} industr${
          industriesWithClients.length === 1 ? "y" : "ies"
        } with clients: ${industryNames}. Total clients: ${totalClients}. Please delete or reassign the clients first.`,
      };
    }

    for (const industryId of industryIds) {
      await deleteOldImage("industries", industryId);
    }

    await db.industry.deleteMany({
      where: {
        id: { in: industryIds },
      },
    });

    revalidatePath("/industries");
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting industries:", error);
    const message = error instanceof Error ? error.message : "Failed to delete industries";
    return { success: false, error: message };
  }
}
