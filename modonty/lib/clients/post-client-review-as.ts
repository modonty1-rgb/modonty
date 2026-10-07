import "server-only";

import { revalidatePath } from "next/cache";
import { CommentStatus } from "@prisma/client";
import { z } from "zod";

import { db } from "@/lib/db";
import { fireClientEvent } from "@modonty/shared/lib/mobile-push";

const ReviewSchema = z.object({
  rating: z.coerce
    .number()
    .int()
    .min(1, "اختر تقييمك بالنجوم")
    .max(5, "التقييم من 1 إلى 5 نجوم"),
  comment: z
    .string()
    .trim()
    .min(3, "المراجعة قصيرة جداً (3 أحرف على الأقل)")
    .max(2000, "المراجعة طويلة جداً (2000 حرف كحد أقصى)"),
});

export type ClientReviewResult =
  | { ok: true; message: string; reviewId: string }
  | { ok: false; reason: "invalid" | "not_found" | "self_review"; message: string };

/**
 * A reader's star review of a partner (PENDING until the partner approves) — the body of
 * `postClientReviewAction` with the identity passed in. One review per reader per partner
 * (@@unique): a second submit edits it and sends it back to moderation. Not a Server Action on
 * purpose — the caller supplies a verified identity.
 */
export async function postClientReviewAs(
  userId: string,
  decodedSlug: string,
  input: { rating: unknown; comment: unknown },
): Promise<ClientReviewResult> {
  const parsed = ReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: "invalid", message: parsed.error.issues[0]?.message ?? "بيانات غير صالحة." };
  }
  const { rating, comment } = parsed.data;

  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: { id: true, userId: true },
  });
  if (!client) {
    return { ok: false, reason: "not_found", message: "العميل غير موجود." };
  }

  // Anti self-review: the client owner can't review their own business page.
  if (client.userId && client.userId === userId) {
    return { ok: false, reason: "self_review", message: "ما تقدر تقيّم نشاطك التجاري بنفسك." };
  }

  // One review per visitor per client (@@unique). Editing an existing review
  // resets it to PENDING for re-moderation.
  const review = await db.clientReview.upsert({
    where: {
      clientId_reviewerId: { clientId: client.id, reviewerId: userId },
    },
    create: {
      clientId: client.id,
      reviewerId: userId,
      rating,
      comment,
      status: CommentStatus.PENDING,
    },
    update: {
      rating,
      comment,
      status: CommentStatus.PENDING,
    },
    select: { id: true },
  });

  // Refresh the client page so the APPROVED aggregate/list updates once moderated.
  revalidatePath(`/clients/${encodeURIComponent(decodedSlug)}`);

  // تقييم جديد أو معدَّل ينتظر موافقة العميل — يرنّ في تطبيقه.
  fireClientEvent(client.id, { kind: "review", reviewId: review.id, rating });

  return {
    ok: true,
    message: "تم إرسال تقييمك. سيظهر بعد الموافقة من الشركة.",
    reviewId: review.id,
  };
}
