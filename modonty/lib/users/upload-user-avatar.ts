import "server-only";

import { uploadToBunny } from "@modonty/shared/lib/bunny";

const MB = 1024 * 1024;
// Stays under Vercel's 4.5MB function body limit; the client downscales before sending.
const IMAGE_LIMIT = 4 * MB;

interface ImageKind {
  mime: "image/jpeg" | "image/png" | "image/webp";
  ext: "jpg" | "png" | "webp";
}

/**
 * `file.type` is a string the uploader chooses — the browser copies it from the file, a script
 * types whatever it likes. Trusting it meant an HTML or SVG payload labelled `image/png` was
 * stored on the assets CDN and later served under our domain, where a browser would run it.
 * The bytes cannot lie the same way, so the format is read from the file's own signature and
 * the three formats below are the only ones with a path through: both the stored extension and
 * the content type sent to Bunny come from what was found, never from the request.
 */
function detectImageKind(buffer: Buffer): ImageKind | null {
  if (buffer.length < 12) return null;

  // JPEG — SOI marker, FF D8 FF.
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  // PNG — \x89 P N G \r \n \x1a \n.
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mime: "image/png", ext: "png" };
  }
  // WebP — a RIFF container whose form type is WEBP; bytes 4-7 are the length, not part of it.
  if (
    buffer.subarray(0, 4).toString("latin1") === "RIFF" &&
    buffer.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return { mime: "image/webp", ext: "webp" };
  }

  return null;
}

export type AvatarUploadResult =
  | { ok: true; url: string }
  | { ok: false; reason: "missing" | "too_large" | "bad_type"; error: string };

/**
 * Visitor avatar upload → Bunny (assets zone, `avatars/users/`) — the body of
 * `POST /users/profile/api/avatar` with the identity passed in. Returns the hosted URL only; the
 * caller saves it through `updateProfileAs` (the settings form does the same in two steps).
 * The user id comes from the verified session or Bearer, never from the request body.
 * Bunny failures throw — each door turns them into its own 500.
 */
export async function uploadUserAvatar(userId: string, file: FormDataEntryValue | null): Promise<AvatarUploadResult> {
  if (!(file instanceof File)) {
    return { ok: false, reason: "missing", error: "لم يتم إرسال ملف" };
  }
  // Size first, so a rejected upload never also pays for the full copy into a Buffer below.
  if (file.size > IMAGE_LIMIT) {
    return { ok: false, reason: "too_large", error: `حجم الصورة ${(file.size / MB).toFixed(1)} ميجا — الحد ٤ ميجا` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = detectImageKind(buffer);
  if (!kind) {
    return { ok: false, reason: "bad_type", error: "الملف لازم يكون صورة JPG أو PNG أو WebP" };
  }

  const remotePath = `avatars/users/${userId}-${Date.now()}.${kind.ext}`;
  const { url } = await uploadToBunny("assets", buffer, remotePath, kind.mime);
  return { ok: true, url };
}
