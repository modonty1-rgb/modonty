"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { registerSchema } from "../helpers/schemas/register-schema";
import { getOrCreateSessionId, createConversion } from "@/lib/analytics/conversion-tracking";
import { trackSignupComplete } from "@/lib/analytics/events-registry";
import { ConversionType } from "@prisma/client";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email/resend-client";
import { welcomeEmail } from "@modonty/shared/lib/email/templates/welcome";
import { emailVerificationEmail } from "@modonty/shared/lib/email/templates/email-verification";
import { sendAdminTelegram, escapeTgHtml } from "@modonty/shared/lib/telegram/client";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

export async function registerUser(data: unknown) {
  // A server action is a public HTTP endpoint: the form's zodResolver only ever
  // ran in the attacker's own browser, so anything can arrive here — a 2-char
  // password, a non-email, or extra keys like role:"ADMIN". Re-checking the same
  // schema server-side is what actually enforces it, and Zod strips unknown keys
  // so only the three fields below can ever reach db.user.create.
  const parsed = registerSchema.safeParse(data);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      success: false as const,
      error: parsed.error.errors[0]?.message ?? "بيانات غير صحيحة",
      fieldErrors,
    };
  }

  const input = parsed.data;

  try {
    const existingUser = await db.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      return {
        success: false as const,
        error: "البريد الإلكتروني مستخدم بالفعل",
      };
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await db.user.create({
      data: {
        name: input.name ?? null,
        email: input.email,
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

    // Notify Telegram group — non-blocking. The name and email are escaped
    // because this goes out in HTML parse mode: a registrant who signs up as
    // `<b>مدفوع</b>` would otherwise forge formatting in the admin's alert, and
    // a stray `<` breaks the whole message so the notification never arrives.
    const now = new Date().toLocaleString(SITE_LOCALE, { timeZone: "Asia/Riyadh", dateStyle: "short", timeStyle: "short" });
    sendAdminTelegram(`👤 <b>مستخدم جديد — مدونتي</b>\n📧 ${escapeTgHtml(user.email ?? "—")}\n🙋 ${escapeTgHtml(user.name || "—")}\n📅 ${now}`).catch(() => null);

    if (user.email) {
      welcomeEmail({ userName: user.name ?? user.email })
        .then((welcome) => sendEmail({ to: user.email!, ...welcome }))
        .catch((err) =>
        console.error("[registerUser] Welcome email failed:", err)
      );

      // Email verification token — 24h expiry
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      db.verificationToken
        .create({ data: { identifier: user.email, token, expires } })
        .then(async () => {
          const verifyUrl = `https://modonty.com/users/verify-email?token=${token}`;
          const verification = await emailVerificationEmail({
            userName: user.name ?? user.email!,
            verifyUrl,
          });
          return sendEmail({ to: user.email!, ...verification });
        })
        .catch((err) =>
          console.error("[registerUser] Verification email failed:", err)
        );
    }

    // Funnel: signup completed (email path). Google completions fire from
    // events.createUser in lib/auth.ts instead.
    void trackSignupComplete(
      { signup_method: "email", signup_source: "page" },
      { userId: user.id },
    );

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
