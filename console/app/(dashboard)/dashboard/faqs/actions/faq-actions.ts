"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getClientId() {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

export async function approveFaq(faqId: string, answer: string) {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: "Unauthorized" };

  if (!answer.trim()) return { success: false, error: "Answer is required" };

  try {
    const faq = await db.articleFAQ.findFirst({
      where: { id: faqId, article: { clientId } },
      select: { id: true },
    });
    if (!faq) return { success: false, error: "FAQ not found" };

    await db.articleFAQ.update({
      where: { id: faqId },
      data: { status: "PUBLISHED", answer: answer.trim() },
    });

    revalidatePath("/dashboard/faqs");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to approve FAQ" };
  }
}

export async function rejectFaq(faqId: string) {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: "Unauthorized" };

  try {
    const faq = await db.articleFAQ.findFirst({
      where: { id: faqId, article: { clientId } },
      select: { id: true },
    });
    if (!faq) return { success: false, error: "FAQ not found" };

    await db.articleFAQ.update({
      where: { id: faqId },
      data: { status: "REJECTED" },
    });

    revalidatePath("/dashboard/faqs");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to reject FAQ" };
  }
}
