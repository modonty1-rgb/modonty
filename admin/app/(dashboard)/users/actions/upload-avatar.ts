"use server";

import { auth } from "@/lib/auth";
import { uploadToBunny } from "@modonty/shared/lib/bunny";

// Bunny-primary (2026-07-29): staff avatars go to the platform assets zone.
export async function uploadAvatar(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const session = await auth(); if (!session) return { success: false, error: "Unauthorized" };
  try {
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string) || "admin";

    if (!file) {
      return { success: false, error: "No file provided." };
    }
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Only images are allowed." };
    }

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9؀-ۿ\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 30) || "admin";

    const ext = (file.name.match(/\.[a-z0-9]+$/i)?.[0] || ".webp").toLowerCase();
    const remotePath = `avatars/${slug}-${Date.now()}${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadToBunny("assets", buffer, remotePath, file.type);

    return { success: true, url };
  } catch {
    return { success: false, error: "Something went wrong during upload." };
  }
}
