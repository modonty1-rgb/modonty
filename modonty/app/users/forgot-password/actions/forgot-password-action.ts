"use server";

import { db } from "@/lib/db";
import crypto from "crypto";
import { z } from "zod";
import { sendEmail } from "@/lib/email/resend-client";
import { passwordResetEmail } from "@/lib/email/templates/password-reset";

const schema = z.object({
  email: z.string().email("بريد إلكتروني غير صحيح"),
});

export async function forgotPasswordAction(formData: FormData) {
  const parsed = schema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { success: false as const, error: "بريد إلكتروني غير صحيح" };
  }

  const { email } = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true },
    });

    // Always return success to prevent email enumeration
    if (!user || !user.password) {
      return { success: true as const };
    }

    // Generate secure token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expires,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/users/reset-password?token=${rawToken}`;
    const { subject, html, text } = passwordResetEmail({
      userName: user.name ?? "عزيزي المستخدم",
      resetUrl,
    });

    await sendEmail({ to: email, subject, html, text });

    return { success: true as const };
  } catch (err) {
    console.error("[ForgotPassword]", err);
    return { success: false as const, error: "حدث خطأ. يرجى المحاولة مرة أخرى." };
  }
}
