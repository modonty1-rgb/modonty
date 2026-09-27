import { compressToWebP } from "@/lib/compress-image";
import { uploadImageToBunny } from "@/lib/media/upload-image-to-bunny";

/** What re-encoding needs to know about the stored file. */
export interface ReencodeSource {
  /** The served address (Bunny when the row has a copy — see `mediaSrc`). */
  url: string;
  filename: string | null;
  mimeType: string;
  type: string | null;
  scope: string | null;
  clientId: string | null;
}

/**
 * Browser-side half of «make it WebP»: fetch the stored file → re-encode on a canvas →
 * upload the WebP to Bunny in the same type/client folder → return the fields the server
 * half (`saveOptimizedImage`) swaps into the SAME Media row, so every link to it holds.
 *
 * Moved here from the Maintenance page (26 Sep 2026) when Clients › Media got a one-click
 * «Convert to WebP» on the card — one procedure, two buttons.
 */
export async function reencodeToWebP(image: ReencodeSource) {
  const resp = await fetch(image.url, { mode: "cors" });
  if (!resp.ok) throw new Error("تعذّر جلب الصورة الأصلية");
  const blob = await resp.blob();
  const source = new File([blob], image.filename || "image", { type: blob.type || image.mimeType });

  const webp = await compressToWebP(source);
  const bmp = await createImageBitmap(webp);
  const width = bmp.width;
  const height = bmp.height;
  bmp.close();

  const webpName = (image.filename || "image").replace(/\.[^.]+$/, "") + ".webp";
  const formData = new FormData();
  formData.append("file", new File([webp], webpName, { type: "image/webp" }));
  formData.append("filename", webpName);
  if (image.type) formData.append("type", image.type);
  formData.append("scope", image.scope || "GENERAL");
  if (image.clientId) formData.append("clientId", image.clientId);

  const up = await uploadImageToBunny(formData);
  if (!up.success || !up.url) throw new Error(up.error || "فشل رفع النسخة المحسّنة إلى Bunny");

  return {
    url: up.url,
    publicId: null as string | null,
    mimeType: "image/webp",
    fileSize: webp.size,
    width,
    height,
    // The file changed, so the old placeholder describes an image that no longer exists.
    blurDataURL: up.blurDataURL ?? null,
  };
}
