"use server";

import { auth } from "@/lib/auth";
import { CLIENT_PASSWORD_MIN_LENGTH } from "@modonty/shared/lib/constants/client-password";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { messages } from "@/lib/messages";

type Result =
  | { success: true }
  | { success: false; error: string; field?: "currentPassword" | "newPassword" };

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const cur = String(currentPassword ?? "");
  const next = String(newPassword ?? "");

  if (!cur) {
    return {
      success: false,
      error: messages.error.required,
      field: "currentPassword",
    };
  }
  if (next.length < CLIENT_PASSWORD_MIN_LENGTH) {
    return {
      success: false,
      error: `كلمة المرور الجديدة يجب أن تكون ${CLIENT_PASSWORD_MIN_LENGTH} أحرف على الأقل`,
      field: "newPassword",
    };
  }

  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { id: true, password: true },
  });
  if (!client?.password) {
    return { success: false, error: messages.error.notFound };
  }

  const valid = await bcrypt.compare(cur, client.password);
  if (!valid) {
    return {
      success: false,
      error: messages.error.wrongPassword,
      field: "currentPassword",
    };
  }

  try {
    const hashed = await bcrypt.hash(next, 10);
    await db.client.update({
      where: { id: clientId },
      data: { password: hashed },
    });
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
