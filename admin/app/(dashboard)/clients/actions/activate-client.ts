"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

interface ActivateResult {
  ok: boolean;
  error?: string;
}

export async function activateClientAction(clientId: string): Promise<ActivateResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true, subscriptionStatus: true },
    });
    if (!client) return { ok: false, error: "العميل غير موجود" };
    if (client.subscriptionStatus === "ACTIVE") {
      return { ok: false, error: "العميل مفعّل بالفعل" };
    }

    // TEMP FIX (2026-05-29): also mark payment PAID so the status badge reads "Active".
    // The status badge shows "Pending" for ACTIVE-but-unpaid clients. Proper fix lives in the
    // upcoming full client workflow (see documents/tasks/CLIENT-WORKFLOW-REVIEW.md).
    await db.client.update({
      where: { id: clientId },
      data: {
        subscriptionStatus: "ACTIVE",
        paymentStatus: "PAID",
        subscriptionStartDate: new Date(),
      },
    });

    revalidatePath("/clients");
    await revalidateModontyTag("clients");

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "فشل تفعيل العميل";
    return { ok: false, error: message };
  }
}
