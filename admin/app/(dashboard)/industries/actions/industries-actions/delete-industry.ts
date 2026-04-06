"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { deleteOldImage } from "../../../actions/delete-image";
import { auth } from "@/lib/auth";

export async function deleteIndustry(id: string) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };
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
    await revalidateModontyTag("industries");
    try { const { regenerateIndustriesListingCache } = await import("@/lib/seo/listing-page-seo-generator"); await regenerateIndustriesListingCache(); } catch (e) { console.error("Industries listing cache failed:", e); }
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete industry";
    return { success: false, error: message };
  }
}
