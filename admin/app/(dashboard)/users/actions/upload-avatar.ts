"use server";

import { auth } from "@/lib/auth";
import { bunnyWritePath, getBunnyPublicUrl, uploadToBunny } from "@modonty/shared/lib/bunny";
import { bunnyObjectSize, createBunnyUploadTicket } from "@modonty/shared/lib/bunny-upload-ticket";
import type { TicketResult } from "@modonty/shared/lib/direct-upload";

const MAX_AVATAR_BYTES = 10 * 1024 * 1024;

function avatarPath(name: string, filename: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 30) || "admin";
  const ext = (filename.match(/\.[a-z0-9]+$/i)?.[0] || ".webp").toLowerCase();
  return `avatars/${slug}-${Date.now()}${ext}`;
}

/**
 * Staff avatars go browser → Bunny (assets zone) through the shared pipeline (`shared/lib/direct-upload.ts`):
 * `requestAvatarUpload` signs the path, `confirmAvatarUpload` checks the bytes landed. `uploadAvatar`
 * below is the fallback when direct upload isn't configured.
 */
export async function requestAvatarUpload(name: string, filename: string, mime: string, bytes: number): Promise<TicketResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Unauthorized" };
  if (!mime.startsWith("image/")) return { ok: false, error: "Only images are allowed." };
  if (!Number.isInteger(bytes) || bytes <= 0 || bytes > MAX_AVATAR_BYTES) return { ok: false, error: "Image too large. Max 10MB." };
  const ticket = createBunnyUploadTicket({ zone: "assets", path: avatarPath(name || "admin", filename), maxBytes: bytes });
  return { ok: true, url: ticket?.url ?? null, path: ticket?.path };
}

export async function confirmAvatarUpload(path: string, bytes: number): Promise<{ success: boolean; url?: string; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };
  if (!path.startsWith(bunnyWritePath("avatars/")) || path.includes("..")) return { success: false, error: "Invalid path." };
  if ((await bunnyObjectSize("assets", path)) !== bytes) return { success: false, error: "Upload incomplete — try again." };
  return { success: true, url: getBunnyPublicUrl("assets", path) };
}

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

    const remotePath = avatarPath(name, file.name);

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadToBunny("assets", buffer, remotePath, file.type);

    return { success: true, url };
  } catch {
    return { success: false, error: "Something went wrong during upload." };
  }
}

/**
 * ⛔ RETIRED (2026-07-29, tripwire rule) — the old Cloudinary avatar upload, kept as
 * text only. Never call: throws so a hidden Cloudinary path can't fail silently.
 * Final disposal of all Cloudinary code = last migration phase.
 */
export async function uploadAvatarCloudinaryRETIRED(): Promise<never> {
  throw new Error("RETIRED: Cloudinary avatar upload is disabled — uploadAvatar now uses Bunny.");
  /* Original implementation (text, for reference):
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const publicId = `admins/${slug}-${Date.now()}`;
  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("upload_preset", uploadPreset);
  uploadData.append("public_id", publicId);
  uploadData.append("asset_folder", "admins");
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: uploadData }
  );
  const result = await response.json();
  return result.secure_url || result.url;
  */
}
