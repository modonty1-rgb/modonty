"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { logAction } from "@/lib/audit/log-action";

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

    // `client` was read above (for the article guard) — the name is already in hand.
    await logAction("client.delete", {
      entity: "Client",
      entityId: id,
      summary: client.name,
      metadata: { slug: client.slug },
    });

    revalidatePath("/clients");
    // Rebuild the listing blob BEFORE busting modonty’s cache. It ran after, so the flush
    // went out first and the next visitor rebuilt the listing from the blob that still
    // contained the deleted row — the stale page served under a fresh cache. Same order the
    // create and update paths already follow.
    //
    // The answer is read too: the generator returns `{ success, error }` and never throws, so
    // `await` alone always looked successful. A failed rebuild holds the flush.
    let listingOk = true;
    try {
      const { regenerateClientsListingCache } = await import("@/lib/seo/listing-page-seo-generator");
      const r = await regenerateClientsListingCache();
      listingOk = r.success;
      if (!r.success) console.error("Clients listing cache failed:", r.error);
    } catch (e) {
      listingOk = false;
      console.error("Clients listing cache failed:", e);
    }
    if (listingOk) await revalidateModontyTag("clients");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete client";
    return { success: false, error: message };
  }
}

