// Whitelisted upload folders — the browser must NOT choose an arbitrary path.
// `team` = صور أعضاء الفريق في «من نحن» (أُضيف ١٦ سبتمبر ٢٠٢٦ مع تحويل الحقل من رابط إلى رفع).
export const UPLOAD_FOLDERS = ["gallery", "achievements", "licenses", "reels", "team"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

/** Unknown folder → gallery, as the upload route always did. */
export function resolveUploadFolder(requested: string | null | undefined): UploadFolder {
  return (UPLOAD_FOLDERS as readonly string[]).includes(requested ?? "") ? (requested as UploadFolder) : "gallery";
}

/** Client-side compression outputs WebP ≤2000px (~0.1–2MB); 10MB is the direct-to-Bunny ceiling. */
export const IMAGE_LIMIT_BYTES = 10 * 1024 * 1024;

export function imageExtension(mime: string): string {
  return mime === "image/webp" ? "webp" : mime === "image/png" ? "png" : "jpg";
}
