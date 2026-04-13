"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

export async function resetPasswordAction(formData: FormData) {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false as const, error: parsed.error.errors[0]?.message ?? "بيانات غير صحيحة" };
  }

  const { token, password } = parsed.data;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await db.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
      select: { id: true },
    });

    if (!user) {
      return { success: false as const, error: "الرابط منتهي الصلاحية أو غير صحيح. اطلب رابطاً جديداً." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return { success: true as const };
  } catch (err) {
    console.error("[ResetPassword]", err);
    return { success: false as const, error: "حدث خطأ. يرجى المحاولة مرة أخرى." };
  }
}
