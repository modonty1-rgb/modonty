"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { profileSchema } from "../helpers/schemas/settings-schemas";
import type { ProfileFormData } from "../helpers/schemas/settings-schemas";

export async function updateProfile(userId: string, data: ProfileFormData) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Server-side validation is the real gate — the client schema is UX only. This is what
    // stops a base64 `data:` avatar from being written into the document.
    const parsed = profileSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.name,
        image: parsed.data.image || null,
        bio: parsed.data.bio || null,
      },
    });

    revalidatePath("/users/profile");
    revalidatePath("/users/profile/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
