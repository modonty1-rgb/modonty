"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CommentStatus } from "@prisma/client";
import { messages } from "@/lib/messages";
import { regenerateClientSeo } from "../../profile/actions/regenerate-client-seo";

type Result = { success: true } | { success: false; error: string };

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

async function ensureOwned(reviewId: string, clientId: string) {
  return db.clientReview.findFirst({
    where: { id: reviewId, clientId },
    select: { id: true },
  });
}

async function setStatus(
  reviewId: string,
  status: CommentStatus
): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  const owned = await ensureOwned(reviewId, clientId);
  if (!owned) return { success: false, error: messages.error.notFound };
  try {
    await db.clientReview.update({
      where: { id: reviewId },
      data: { status },
    });
    // Keep cached JSON-LD (AggregateRating + Review[]) fresh in the shared DB,
    // since approving/rejecting a review changes the aggregate read by modonty.
    try {
      await regenerateClientSeo(clientId);
    } catch {
      /* best-effort — moderation must succeed even if SEO regen fails */
    }
    revalidatePath("/dashboard/client-reviews");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function approveClientReview(reviewId: string): Promise<Result> {
  return setStatus(reviewId, CommentStatus.APPROVED);
}

export async function rejectClientReview(reviewId: string): Promise<Result> {
  return setStatus(reviewId, CommentStatus.REJECTED);
}

export async function deleteClientReview(reviewId: string): Promise<Result> {
  return setStatus(reviewId, CommentStatus.DELETED);
}

export async function restoreClientReview(reviewId: string): Promise<Result> {
  return setStatus(reviewId, CommentStatus.PENDING);
}
