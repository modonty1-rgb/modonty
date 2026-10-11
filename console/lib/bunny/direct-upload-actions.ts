"use server";

import { randomBytes } from "node:crypto";

import { bunnyWritePath, getBunnyPublicUrl } from "@modonty/shared/lib/bunny";
import { createBunnyUploadTicket, readUploadedObject } from "@modonty/shared/lib/bunny-upload-ticket";
import type { TicketResult } from "@modonty/shared/lib/direct-upload";
import { auth } from "@/lib/auth";
import { generateBlurDataUrl } from "@/lib/media/generate-blur";

import { IMAGE_LIMIT_BYTES, imageExtension, resolveUploadFolder, UPLOAD_FOLDERS } from "./upload-folders";

/**
 * The console's upload policy for the shared browser → Bunny pipeline (`shared/lib/direct-upload.ts`):
 * only the signed-in partner, only under `clients/<their id>/<whitelisted folder>/`, reels zone.
 * The blur placeholder is still built here from the bytes on Bunny, so the client can't forge it.
 */
async function sessionClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string } | null)?.clientId ?? null;
}

export async function requestConsoleUpload(folder: string, mime: string, bytes: number): Promise<TicketResult> {
  const clientId = await sessionClientId();
  if (!clientId) return { ok: false, error: "unauthorized" };
  if (!mime.startsWith("image/")) return { ok: false, error: "الملف مش صورة" };
  if (!Number.isInteger(bytes) || bytes <= 0) return { ok: false, error: "ملف فارغ" };
  if (bytes > IMAGE_LIMIT_BYTES) {
    return { ok: false, error: `حجم الصورة ${(bytes / 1024 / 1024).toFixed(1)}MB أكبر من الحد (10MB)` };
  }

  const unique = `${Date.now()}-${randomBytes(4).toString("hex").slice(0, 6)}`;
  const path = `clients/${clientId}/${resolveUploadFolder(folder)}/${unique}.${imageExtension(mime)}`;
  const ticket = createBunnyUploadTicket({ zone: "reels", path, maxBytes: bytes });
  return { ok: true, url: ticket?.url ?? null, path: ticket?.path };
}

export async function finalizeConsoleUpload(
  path: string,
  bytes: number,
): Promise<{ url?: string; bytes?: number; blurDataURL?: string | null; error?: string }> {
  const clientId = await sessionClientId();
  if (!clientId) return { error: "unauthorized" };

  const folders = UPLOAD_FOLDERS.join("|");
  const own = new RegExp(`^${bunnyWritePath(`clients/${clientId}/`).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(${folders})/\\d+-[a-z0-9]{6}\\.(webp|png|jpg)$`);
  if (!own.test(path)) return { error: "مسار غير صالح" };

  const buffer = await readUploadedObject("reels", path, { bytes });
  if (!buffer) return { error: "لم يكتمل الرفع — حاول مرة أخرى" };

  return { url: getBunnyPublicUrl("reels", path), bytes, blurDataURL: await generateBlurDataUrl(buffer) };
}
