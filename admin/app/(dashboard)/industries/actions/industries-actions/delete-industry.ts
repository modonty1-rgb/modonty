"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteOldImage } from "../../../actions/delete-image";

export async function deleteIndustry(id: string) {
  try {
    const industry = await db.industry.findUnique({
      where: { id },
      include: { _count: { select: { clients: true } } },
    });

    if (industry && industry._count.clients > 0) {
      return {
        success: false,
        error: `Cannot delete industry. It is used by ${industry._count.clients} client(s).`,
      };
    }

    await deleteOldImage("industries", id);

    await db.industry.delete({ where: { id } });
    revalidatePath("/industries");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete industry";
    return { success: false, error: message };
  }
}
