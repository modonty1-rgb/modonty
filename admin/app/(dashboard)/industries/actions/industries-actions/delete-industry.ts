"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { deleteOldImage } from "../../../actions/delete-image";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";

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

    await logAction("industry.delete", {
      entity: "Industry",
      entityId: id,
      summary: industry?.name ?? id,
    });

    revalidatePath("/industries");
    // Rebuild the listing blob BEFORE busting modonty’s cache. It ran after, so the flush
    // went out first and the next visitor rebuilt the listing from the blob that still
    // contained the deleted row — the stale page served under a fresh cache. Same order the
    // create and update paths already follow.
    //
    // The answer is read too: the generator returns `{ success, error }` and never throws, so
    // `await` alone always looked successful. A failed rebuild holds the flush.
    let listingOk = true;
    try {
      const { regenerateIndustriesListingCache } = await import("@/lib/seo/listing-page-seo-generator");
      const r = await regenerateIndustriesListingCache();
      listingOk = r.success;
      if (!r.success) console.error("Industries listing cache failed:", r.error);
    } catch (e) {
      listingOk = false;
      console.error("Industries listing cache failed:", e);
    }
    if (listingOk) await revalidateModontyTag("industries");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete industry";
    return { success: false, error: message };
  }
}
