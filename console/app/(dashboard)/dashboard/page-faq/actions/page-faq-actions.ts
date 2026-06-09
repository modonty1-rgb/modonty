"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ArticleFAQStatus } from "@prisma/client";
import { messages } from "@/lib/messages";
import { regenerateClientSeo } from "../../profile/actions/regenerate-client-seo";

type Result = { success: true } | { success: false; error: string };

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

function sanitize(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Create or update a client-page FAQ. A row with an answer is PUBLISHED (shows
 * on the page + feeds FAQPage JSON-LD); without an answer it stays PENDING (an
 * unanswered reader submission). Regenerates the cached JSON-LD after every change.
 */
export async function saveClientPageFaq(input: {
  id?: string;
  question: string;
  answer: string;
}): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const question = sanitize((input.question ?? "").trim());
  if (question.length < 3) return { success: false, error: "اكتب سؤالاً صحيحاً" };
  const answerRaw = (input.answer ?? "").trim();
  const answer = answerRaw ? sanitize(answerRaw) : null;
  const status = answer ? ArticleFAQStatus.PUBLISHED : ArticleFAQStatus.PENDING;

  try {
    if (input.id) {
      const owned = await db.clientFAQ.findFirst({
        where: { id: input.id, clientId },
        select: { id: true },
      });
      if (!owned) return { success: false, error: messages.error.notFound };
      await db.clientFAQ.update({
        where: { id: input.id },
        data: { question, answer, status },
      });
    } else {
      const last = await db.clientFAQ.findFirst({
        where: { clientId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      const position = (last?.position ?? -1) + 1;
      await db.clientFAQ.create({
        data: { clientId, question, answer, status, position, source: "manual" },
      });
    }
    try {
      await regenerateClientSeo(clientId);
    } catch {
      /* best-effort */
    }
    revalidatePath("/dashboard/page-faq");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function rejectClientPageFaq(id: string): Promise<Result> {
  return setStatus(id, ArticleFAQStatus.REJECTED);
}

export async function restoreClientPageFaq(id: string): Promise<Result> {
  return setStatus(id, ArticleFAQStatus.PENDING);
}

async function setStatus(id: string, status: ArticleFAQStatus): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  try {
    const owned = await db.clientFAQ.findFirst({
      where: { id, clientId },
      select: { id: true },
    });
    if (!owned) return { success: false, error: messages.error.notFound };
    await db.clientFAQ.update({ where: { id }, data: { status } });
    try {
      await regenerateClientSeo(clientId);
    } catch {
      /* best-effort */
    }
    revalidatePath("/dashboard/page-faq");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function deleteClientPageFaq(id: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  try {
    const owned = await db.clientFAQ.findFirst({
      where: { id, clientId },
      select: { id: true },
    });
    if (!owned) return { success: false, error: messages.error.notFound };
    await db.clientFAQ.delete({ where: { id } });
    try {
      await regenerateClientSeo(clientId);
    } catch {
      /* best-effort */
    }
    revalidatePath("/dashboard/page-faq");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
