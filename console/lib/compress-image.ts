/** Max pixel dimension (width or height) for gallery/license output. */
const MAX_PX = 2000;
/** WebP encode quality — matches admin Filerobot setting. */
const WEBP_QUALITY = 0.85;

/**
 * Compress any image File to WebP using the browser Canvas API.
 * - Scales down if either dimension exceeds MAX_PX (aspect ratio preserved).
 * - Converts to WebP at WEBP_QUALITY regardless of input format.
 * - Completely silent — no UI, no dependencies, no install.
 * - Returns a new File with the same base name + ".webp" extension.
 */
export async function compressToWebP(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const srcW = bitmap.width;
  const srcH = bitmap.height;

  let outW = srcW;
  let outH = srcH;
  if (srcW > MAX_PX || srcH > MAX_PX) {
    const scale = MAX_PX / Math.max(srcW, srcH);
    outW = Math.round(srcW * scale);
    outH = Math.round(srcH * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not supported");
  ctx.drawImage(bitmap, 0, 0, outW, outH);
  bitmap.close();

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("WebP compression failed"));
          return;
        }
        const baseName = file.name.replace(/\.[^.]+$/, "");
        resolve(new File([blob], `${baseName}.webp`, { type: "image/webp" }));
      },
      "image/webp",
      WEBP_QUALITY
    );
  });
}
