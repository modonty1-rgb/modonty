"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { messages } from "@/lib/messages";

export async function changePassword(
  clientId: string,
  currentPassword: string,
  newPassword: string
) {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true, password: true },
    });
    if (!client) return { success: false, error: messages.error.notFound };
    if (!client.password) return { success: false, error: messages.error.notFound };

    const valid = await bcrypt.compare(currentPassword, client.password);
    if (!valid) return { success: false, error: messages.error.wrongPassword };

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.client.update({
      where: { id: clientId },
      data: { password: hashed },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e) {
    return { success: false, error: messages.error.serverError };
  }
}
