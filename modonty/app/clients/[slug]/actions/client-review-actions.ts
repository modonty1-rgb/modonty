"use server";

import { revalidatePath } from "next/cache";
import { CommentStatus } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export interface ClientReviewFormState {
  ok: boolean;
  message: string;
  /** Increments on every submit so the client can react to repeat successes/errors */
  attempt?: number;
}

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

export async function postClientReviewAction(
  prevState: ClientReviewFormState,
  formData: FormData,
): Promise<ClientReviewFormState> {
  const attempt = (prevState.attempt ?? 0) + 1;

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول لإضافة تقييم.", attempt };
  }

  const rawSlug = formData.get("clientSlug");
  if (typeof rawSlug !== "string" || !rawSlug) {
    return { ok: false, message: "طلب غير صالح.", attempt };
  }
  const decodedSlug = decodeURIComponent(rawSlug);

  const parsed = ReviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "بيانات غير صالحة.",
      attempt,
    };
  }
  const { rating, comment } = parsed.data;

  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: { id: true, userId: true },
  });
  if (!client) {
    return { ok: false, message: "العميل غير موجود.", attempt };
  }

  // Anti self-review: the client owner can't review their own business page.
  if (client.userId && client.userId === session.user.id) {
    return { ok: false, message: "ما تقدر تقيّم نشاطك التجاري بنفسك.", attempt };
  }

  // One review per visitor per client (@@unique). Editing an existing review
  // resets it to PENDING for re-moderation.
  await db.clientReview.upsert({
    where: {
      clientId_authorId: { clientId: client.id, authorId: session.user.id },
    },
    create: {
      clientId: client.id,
      authorId: session.user.id,
      rating,
      comment,
      status: CommentStatus.PENDING,
    },
    update: {
      rating,
      comment,
      status: CommentStatus.PENDING,
    },
  });

  // Refresh the client page so the APPROVED aggregate/list updates once moderated.
  revalidatePath(`/clients/${encodeURIComponent(decodedSlug)}`);

  return {
    ok: true,
    message: "تم إرسال تقييمك. سيظهر بعد الموافقة من الشركة.",
    attempt,
  };
}
