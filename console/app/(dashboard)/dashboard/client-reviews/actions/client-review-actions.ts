"use server";

import { getSessionClientId } from "@/lib/get-session-client-id";
import { CommentStatus } from "@prisma/client";
import { messages } from "@/lib/messages";
import { setClientReviewStatusForClient } from "@/lib/client-reviews/set-client-review-status";

type Result = { success: true } | { success: false; error: string };

async function setStatus(
  reviewId: string,
  status: CommentStatus
): Promise<Result> {
  const clientId = await getSessionClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  return setClientReviewStatusForClient(clientId, reviewId, status);
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
