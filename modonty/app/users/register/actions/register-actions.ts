"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import type { RegisterFormData } from "../helpers/schemas/register-schema";
import { getOrCreateSessionId, createConversion } from "@/lib/conversion-tracking";
import { ConversionType } from "@prisma/client";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email/resend-client";
import { welcomeEmail } from "@/lib/email/templates/welcome";
import { emailVerificationEmail } from "@/lib/email/templates/email-verification";
import { sendTelegramMessage } from "@/lib/telegram";

export async function registerUser(data: RegisterFormData) {
  try {
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return {
        success: false as const,
        error: "البريد الإلكتروني مستخدم بالفعل",
      };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "EDITOR",
      },
    });

    const sessionId = await getOrCreateSessionId();
    await createConversion({
      type: ConversionType.SIGNUP,
      userId: user.id,
      sessionId,
    });

    // Notify Telegram group — non-blocking
    const now = new Date().toLocaleString("ar-SA", { timeZone: "Asia/Riyadh", dateStyle: "short", timeStyle: "short" });
    sendTelegramMessage(`👤 <b>مستخدم جديد — مودونتي</b>\n📧 ${user.email}\n🙋 ${user.name || "—"}\n📅 ${now}`).catch(() => null);

    if (user.email) {
      const welcome = welcomeEmail({ userName: user.name ?? user.email });
      sendEmail({ to: user.email, ...welcome }).catch((err) =>
        console.error("[registerUser] Welcome email failed:", err)
      );

      // Email verification token — 24h expiry
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      db.verificationToken
        .create({ data: { identifier: user.email, token, expires } })
        .then(() => {
          const verifyUrl = `https://modonty.com/users/verify-email?token=${token}`;
          const verification = emailVerificationEmail({
            userName: user.name ?? user.email!,
            verifyUrl,
          });
          return sendEmail({ to: user.email!, ...verification });
        })
        .catch((err) =>
          console.error("[registerUser] Verification email failed:", err)
        );
    }

    return { success: true as const };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false as const,
        error: "البريد الإلكتروني مستخدم بالفعل",
      };
    }

    console.error("Error registering user:", error);
    return {
      success: false as const,
      error: "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.",
    };
  }
}
