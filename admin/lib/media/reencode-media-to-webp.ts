"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { loadSharp } from "@/lib/utils/sharp-loader";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { uploadImageToBunny } from "./upload-image-to-bunny";

/** Same limits as the browser encoder (lib/compress-image.ts) so both paths give the same file. */
const MAX_PX = 2000;
const WEBP_QUALITY = 85; // compress-image.ts uses 0.85 on the canvas scale

/**
 * Server-side half one of «Convert to WebP»: read the stored file, re-encode it to WebP and
 * upload it to Bunny in the same type/client folder. Returns the fields `saveOptimizedImage`
 * swaps into the SAME Media row.
 *
 * Why on the server: the browser path (reencodeToWebP) fetches the image cross-origin, and
 * Bunny sends no CORS header for files without an extension — measured 26 Sep 2026 on a
 * gallery image of هابي سمايل («blocked by CORS policy»), so the card button failed where the
 * server has no such limit.
 */
export async function reencodeMediaToWebp(mediaId: string) {
  const session = await auth();
  if (!session) return { success: false as const, error: "Unauthorized" };

  const media = await db.media.findUnique({
    where: { id: mediaId },
    select: { url: true, bunnyUrl: true, blurDataURL: true, filename: true, mimeType: true, type: true, scope: true, clientId: true },
  });
  if (!media) return { success: false as const, error: "Media not found" };
  if (!media.mimeType.startsWith("image/")) return { success: false as const, error: "Only images can be converted" };

  const src = mediaSrc(media);
  if (!src) return { success: false as const, error: "The file has no address" };

  try {
    const res = await fetch(src);
    if (!res.ok) return { success: false as const, error: `Could not read the original (HTTP ${res.status})` };
    const input = Buffer.from(await res.arrayBuffer());

    const sharp = loadSharp();
    const { data, info } = await sharp(input)
      .rotate()
      .resize({ width: MAX_PX, height: MAX_PX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer({ resolveWithObject: true });

    const webpName = (media.filename || "image").replace(/\.[^.]+$/, "") + ".webp";
    const fd = new FormData();
    fd.append("file", new File([new Uint8Array(data)], webpName, { type: "image/webp" }));
    fd.append("filename", webpName);
    fd.append("type", media.type);
    fd.append("scope", media.scope || "GENERAL");
    if (media.clientId) fd.append("clientId", media.clientId);

    const up = await uploadImageToBunny(fd);
    if (!up.success || !up.url) return { success: false as const, error: up.error || "Upload to storage failed" };

    return {
      success: true as const,
      fields: {
        url: up.url,
        publicId: null as string | null,
        mimeType: "image/webp",
        fileSize: data.length,
        width: info.width,
        height: info.height,
        blurDataURL: up.blurDataURL ?? null,
      },
    };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Conversion failed" };
  }
}
