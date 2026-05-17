"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { CommentStatus } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify";

const COMMENT_COOLDOWN_MS = 60 * 1000; // 1 minute between comments per user

export interface ClientCommentFormState {
  ok: boolean;
  message: string;
  /** Increments on every submit so the client can react to repeat successes/errors */
  attempt?: number;
}

const ContentSchema = z
  .string()
  .trim()
  .min(3, "التعليق قصير جداً (3 أحرف على الأقل)")
  .max(2000, "التعليق طويل جداً (2000 حرف كحد أقصى)");

export async function postClientCommentAction(
  prevState: ClientCommentFormState,
  formData: FormData,
): Promise<ClientCommentFormState> {
  const attempt = (prevState.attempt ?? 0) + 1;

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "يجب تسجيل الدخول لإضافة تعليق.", attempt };
  }

  const rawSlug = formData.get("clientSlug");
  if (typeof rawSlug !== "string" || !rawSlug) {
    return { ok: false, message: "طلب غير صالح.", attempt };
  }
  const decodedSlug = decodeURIComponent(rawSlug);

  const parsed = ContentSchema.safeParse(formData.get("content"));
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "محتوى غير صالح.",
      attempt,
    };
  }
  const content = parsed.data;

  const recent = await db.clientComment.findFirst({
    where: {
      authorId: session.user.id,
      createdAt: { gt: new Date(Date.now() - COMMENT_COOLDOWN_MS) },
    },
    select: { id: true },
  });
  if (recent) {
    return {
      ok: false,
      message: "انتظر دقيقة قبل إرسال تعليق آخر.",
      attempt,
    };
  }

  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: { id: true, name: true },
  });
  if (!client) {
    return { ok: false, message: "العميل غير موجود.", attempt };
  }

  await db.clientComment.create({
    data: {
      clientId: client.id,
      authorId: session.user.id,
      content,
      status: CommentStatus.PENDING,
    },
    select: { id: true },
  });

  // Revalidate client page so APPROVED comments refresh once moderated.
  revalidatePath(`/clients/${encodeURIComponent(decodedSlug)}`);

  // Non-blocking Telegram notification with submitter IP for moderation context.
  const reqHeaders = await headers();
  const ip =
    reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    reqHeaders.get("x-real-ip") ||
    reqHeaders.get("cf-connecting-ip") ||
    null;
  notifyTelegram(client.id, "clientComment", {
    title: client.name,
    body: `${session.user.name ?? "زائر"}: ${content}`,
    link: {
      label: "مراجعة من اللوحة",
      url: "https://console.modonty.com/dashboard/client-comments",
    },
    ipAddress: ip,
    headers: reqHeaders,
  }).catch(() => {});

  return {
    ok: true,
    message: "تم إرسال تعليقك. سيظهر بعد الموافقة من الشركة.",
    attempt,
  };
}
