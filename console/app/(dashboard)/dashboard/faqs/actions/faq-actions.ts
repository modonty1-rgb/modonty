"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { messages } from "@/lib/messages";

type Result = { success: true } | { success: false; error: string };
type BulkResult =
  | { success: true; count: number }
  | { success: false; error: string };

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

async function ensureOwnedFaq(faqId: string, clientId: string) {
  return db.articleFAQ.findFirst({
    where: { id: faqId, article: { clientId } },
    select: { id: true },
  });
}

export async function approveFaq(faqId: string, answer: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  if (!answer.trim()) return { success: false, error: messages.error.required };

  try {
    const owned = await ensureOwnedFaq(faqId, clientId);
    if (!owned) return { success: false, error: messages.error.notFound };

    await db.articleFAQ.update({
      where: { id: faqId },
      data: { status: "PUBLISHED", answer: answer.trim() },
    });
    revalidatePath("/dashboard/faqs");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function rejectFaq(faqId: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const owned = await ensureOwnedFaq(faqId, clientId);
    if (!owned) return { success: false, error: messages.error.notFound };

    await db.articleFAQ.update({
      where: { id: faqId },
      data: { status: "REJECTED" },
    });
    revalidatePath("/dashboard/faqs");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

/** Restore a REJECTED or PUBLISHED FAQ to PENDING (undo). */
export async function restoreFaqToPendingAction(faqId: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  try {
    const owned = await ensureOwnedFaq(faqId, clientId);
    if (!owned) return { success: false, error: messages.error.notFound };

    await db.articleFAQ.update({
      where: { id: faqId },
      data: { status: "PENDING" },
    });
    revalidatePath("/dashboard/faqs");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

/** Edit a PUBLISHED FAQ's answer in place (typo / improvement fix). */
export async function editPublishedFaqAction(
  faqId: string,
  answer: string
): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  if (!answer.trim()) return { success: false, error: messages.error.required };

  try {
    const owned = await db.articleFAQ.findFirst({
      where: { id: faqId, article: { clientId }, status: "PUBLISHED" },
      select: { id: true },
    });
    if (!owned) return { success: false, error: messages.error.notFound };

    await db.articleFAQ.update({
      where: { id: faqId },
      data: { answer: answer.trim() },
    });
    revalidatePath("/dashboard/faqs");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

// ─── Bulk actions ────────────────────────────────────────────────────

/** Bulk-publish FAQs that already have answers (skips ones with empty answer). */
export async function bulkPublishFaqsAction(
  ids: string[]
): Promise<BulkResult> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  if (ids.length === 0) return { success: true, count: 0 };

  try {
    const eligible = await db.articleFAQ.findMany({
      where: {
        id: { in: ids },
        article: { clientId },
        status: { not: "PUBLISHED" },
        answer: { not: null },
      },
      select: { id: true, answer: true },
    });
    const eligibleIds = eligible
      .filter((f) => f.answer && f.answer.trim().length > 0)
      .map((f) => f.id);
    if (eligibleIds.length === 0) return { success: true, count: 0 };

    const result = await db.articleFAQ.updateMany({
      where: { id: { in: eligibleIds }, article: { clientId } },
      data: { status: "PUBLISHED" },
    });
    revalidatePath("/dashboard/faqs");
    return { success: true, count: result.count };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function bulkRejectFaqsAction(ids: string[]): Promise<BulkResult> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  if (ids.length === 0) return { success: true, count: 0 };

  try {
    const result = await db.articleFAQ.updateMany({
      where: { id: { in: ids }, article: { clientId } },
      data: { status: "REJECTED" },
    });
    revalidatePath("/dashboard/faqs");
    return { success: true, count: result.count };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
