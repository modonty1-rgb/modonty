"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";
import { sendResetEmail } from "../../helpers/send-reset-email";

const emailSchema = z.string().email();

const CONTACT_SUPER_ADMIN = " Contact your super admin if you need help.";

export async function requestPasswordReset(
  email: string
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = emailSchema.safeParse(email.trim());
  if (!parsed.success) {
    return { success: true };
  }

  const normalizedEmail = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return { success: true };
    }

    if (user.role !== "ADMIN") {
      return {
        success: false,
        error:
          "This feature is for admin accounts only." + CONTACT_SUPER_ADMIN,
      };
    }

    // Generate unique request ID for tracking this specific request
    const requestId = crypto.randomBytes(4).toString("hex").toUpperCase();
    const timestamp = new Date().toISOString();

    const plainToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      select: {
        id: true,
        email: true,
        passwordResetToken: true,
        passwordResetExpires: true,
      },
    });

    await sendResetEmail(user.email!, plainToken, requestId);
    
    return { success: true };
  } catch (err) {
    console.error("Forgot password error:", err);
    return {
      success: false,
      error:
        "Something went wrong. Please try again." + CONTACT_SUPER_ADMIN,
    };
  }
}
