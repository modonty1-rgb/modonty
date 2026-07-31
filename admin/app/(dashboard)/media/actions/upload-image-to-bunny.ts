"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { uploadImageBufferToBunny } from "./bunny-mirror-core";
import { readImageMeta } from "./generate-aspect-crops";

import type { MediaType, MediaScope } from "@prisma/client";

// Vercel serverless caps the request body at 4.5MB (hard platform ceiling, no override).
// Cropped roles are WebP < 1MB; this guard protects the rare large GENERAL image so we
// return a clear error instead of a raw 413 FUNCTION_PAYLOAD_TOO_LARGE.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const IMAGE_MIME = /^image\//;

export interface BunnyUploadResult {
  success: boolean;
  url?: string;
  width?: number;
  height?: number;
  format?: string;
  error?: string;
}

/**
 * Bunny-primary upload (retire Cloudinary). Receives the cropped/compressed image through
 * a server action, uploads it straight to Bunny (base + 3 aspect crops for POST), and reads
 * intrinsic dimensions server-side via sharp. Returns the Bunny CDN url — the DB `url` now.
 * Images only — video lives on the reels zone (Bunny Stream), a separate flow.
 */
export async function uploadImageToBunny(formData: FormData): Promise<BunnyUploadResult> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const file = formData.get("file");
    if (!(file instanceof File)) return { success: false, error: "No file provided" };

    const filename = String(formData.get("filename") || file.name);
    const type = (formData.get("type") as MediaType | null) ?? undefined;
    const scope = (formData.get("scope") as MediaScope | null) ?? "GENERAL";
    const rawClientId = formData.get("clientId");
    const clientId = rawClientId ? String(rawClientId) : null;

    if (!IMAGE_MIME.test(file.type)) {
      return { success: false, error: "Only images upload to Bunny here. Video uses the reels flow." };
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return {
        success: false,
        error: `Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 4MB — crop or compress first.`,
      };
    }

    let clientSlug: string | null = null;
    if (clientId) {
      const client = await db.client.findUnique({ where: { id: clientId }, select: { slug: true } });
      if (!client) return { success: false, error: "Invalid client ID. Client not found." };
      clientSlug = client.slug;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const meta = await readImageMeta(buffer);

    const { bunnyUrl } = await uploadImageBufferToBunny({
      buffer,
      contentType: file.type,
      filename,
      type,
      scope,
      clientSlug,
    });

    return { success: true, url: bunnyUrl, width: meta.width, height: meta.height, format: meta.format };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload to Bunny";
    return { success: false, error: message };
  }
}
