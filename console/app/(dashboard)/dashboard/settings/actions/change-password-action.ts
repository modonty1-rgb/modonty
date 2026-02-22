"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

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
    if (!client) return { success: false, error: "Client not found" };
    if (!client.password) return { success: false, error: "No password set" };

    const valid = await bcrypt.compare(currentPassword, client.password);
    if (!valid) return { success: false, error: "wrongPassword" };

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.client.update({
      where: { id: clientId },
      data: { password: hashed },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return { success: false, error: message };
  }
}
