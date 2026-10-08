import "server-only";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { profileSchema } from "@/app/(site)/users/profile/settings/helpers/schemas/settings-schemas";

/**
 * Name / bio / avatar URL for a known reader — the body of `updateProfile` with the identity passed
 * in. Server-side validation is the real gate (`profileSchema`): it is what stops a base64 `data:`
 * avatar from being written into the document. Not a Server Action on purpose.
 */
export async function updateProfileAs(userId: string, data: unknown) {
  try {
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
