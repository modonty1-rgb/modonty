"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

const resetSchema = z
  .object({
    password: z.string().min(8),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords must match",
    path: ["confirm"],
  });

export async function resetPassword(
  token: string,
  password: string,
  confirm: string
): Promise<{ success: false; error: string } | void> {
  // Validate password input
  const parsed = resetSchema.safeParse({ password, confirm });
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Invalid input";
    return { success: false, error: msg };
  }

  // Validate token format (should be 64-char hex from randomBytes(32).toString("hex"))
  if (!token || token.length !== 64 || !/^[a-f0-9]+$/.test(token)) {
    console.error("[resetPassword] Invalid token format:", {
      tokenLength: token?.length,
      isHex: /^[a-f0-9]+$/.test(token || ""),
    });
    return { success: false, error: "Invalid reset link format." };
  }

  // Hash the token for comparison
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const now = new Date();

  console.log("[resetPassword] Token validation:", {
    receivedTokenLength: token.length,
    hashedTokenPrefix: hashedToken.substring(0, 16) + "...",
    currentTime: now.toISOString(),
  });

  try {
    // First, check if token exists (ignoring expiration) for debugging
    const tokenExists = await db.user.findFirst({
      where: { passwordResetToken: hashedToken },
      select: {
        id: true,
        email: true,
        role: true,
        passwordResetExpires: true,
      },
    });

    if (!tokenExists) {
      console.error("[resetPassword] Token NOT found in database:", {
        hashedTokenPrefix: hashedToken.substring(0, 16) + "...",
      });
      return {
        success: false,
        error: "Invalid or expired link. Please request a new password reset.",
      };
    }

    // Token exists, check if expired
    const isExpired = !tokenExists.passwordResetExpires || tokenExists.passwordResetExpires <= now;

    console.log("[resetPassword] Token found:", {
      userId: tokenExists.id,
      email: tokenExists.email,
      role: tokenExists.role,
      expires: tokenExists.passwordResetExpires?.toISOString(),
      isExpired,
      currentTime: now.toISOString(),
    });

    if (isExpired) {
      console.error("[resetPassword] Token EXPIRED:", {
        expired: tokenExists.passwordResetExpires?.toISOString(),
        now: now.toISOString(),
      });
      return {
        success: false,
        error: "This reset link has expired. Please request a new one.",
      };
    }

    // Check role
    if (tokenExists.role !== "ADMIN") {
      console.error("[resetPassword] User is not ADMIN:", { role: tokenExists.role });
      return {
        success: false,
        error: "This feature is only available for admin accounts.",
      };
    }

    // All checks passed, update password
    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    await db.user.update({
      where: { id: tokenExists.id },
      data: {
        password: hashedPassword,
        // NOTE: Keeping token for testing - REMOVE IN PRODUCTION
        // passwordResetToken: null,
        // passwordResetExpires: null,
      },
    });

    console.log("[resetPassword] Password updated successfully for user:", tokenExists.email);
  } catch (err) {
    console.error("[resetPassword] Database error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  redirect("/login");
}
