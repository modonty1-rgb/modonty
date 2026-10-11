"use server";

import { z } from "zod";

import { MediaScope, MediaType } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildBunnyMediaPath, bunnyWritePath, getBunnyPublicUrl } from "@modonty/shared/lib/bunny";
import { createBunnyUploadTicket, readUploadedObject } from "@modonty/shared/lib/bunny-upload-ticket";
import type { TicketResult } from "@modonty/shared/lib/direct-upload";

import { uploadAspectCrops } from "./bunny-mirror-core";
import { readImageMeta } from "./generate-aspect-crops";
import { generateBlurDataUrl } from "./generate-blur";
import type { BunnyUploadResult } from "./upload-image-to-bunny";

/**
 * Media-library images go browser → Bunny through the shared pipeline (`shared/lib/direct-upload.ts`,
 * called from `upload-image.ts`) — not through a Vercel function body (Vercel bills those bytes as
 * Fast Origin Transfer and caps them at 4.5MB). These two actions are only the media-library policy:
 * 1) `requestMediaImageUpload`: auth, then a ticket for the exact path `uploadImageToBunny` would
 *    have written (same `buildBunnyMediaPath`, same 10-char content hash computed in the browser).
 * 2) The browser PUTs the file to the Bunny Edge Script.
 * 3) `finalizeMediaImageUpload`: recomputes the same path, reads the file back from Bunny, checks its
 *    hash, then does exactly what the old action did — sharp dimensions, blur, POST crops.
 * No direct-upload env → ticket is null and the caller uses `uploadImageToBunny` as before.
 */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const inputSchema = z.object({
  filename: z.string().trim().min(1).max(300),
  mime: z.string().regex(/^image\/[a-z0-9.+-]+$/i),
  bytes: z.number().int().positive().max(MAX_IMAGE_BYTES),
  contentKey: z.string().regex(/^[a-f0-9]{10}$/),
  type: z.nativeEnum(MediaType).optional(),
  scope: z.nativeEnum(MediaScope).default("GENERAL"),
  clientId: z.string().regex(/^[a-f0-9]{24}$/).nullable().default(null),
});

export type DirectImageInput = z.input<typeof inputSchema>;

async function resolvePath(raw: DirectImageInput) {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    const tooBig = typeof raw.bytes === "number" && raw.bytes > MAX_IMAGE_BYTES;
    return {
      error: tooBig
        ? `Image too large (${(raw.bytes / 1024 / 1024).toFixed(1)}MB). Max 10MB.`
        : "Only images upload here (JPG · PNG · WebP · GIF · AVIF).",
    } as const;
  }
  const input = parsed.data;
  let clientSlug: string | null = null;
  if (input.clientId) {
    const client = await db.client.findUnique({ where: { id: input.clientId }, select: { slug: true } });
    if (!client) return { error: "Invalid client ID. Client not found." } as const;
    clientSlug = client.slug;
  }
  const path = buildBunnyMediaPath({
    type: input.type,
    scope: input.scope,
    clientSlug,
    filename: input.filename,
    uniqueKey: input.contentKey,
  });
  return { input, path } as const;
}

export async function requestMediaImageUpload(raw: DirectImageInput): Promise<TicketResult> {
  try {
    const session = await auth();
    if (!session) return { ok: false, error: "Unauthorized" };
    const resolved = await resolvePath(raw);
    if ("error" in resolved) return { ok: false, error: resolved.error ?? "مسار غير صالح" };

    const ticket = createBunnyUploadTicket({ zone: "clients", path: resolved.path, maxBytes: resolved.input.bytes });
    return { ok: true, url: ticket?.url ?? null };
  } catch (error) {
    console.error("[media] requestMediaImageUpload failed", error);
    return { ok: false, error: "Could not prepare the upload — try again." };
  }
}

export async function finalizeMediaImageUpload(raw: DirectImageInput): Promise<BunnyUploadResult> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };
    const resolved = await resolvePath(raw);
    if ("error" in resolved) return { success: false, error: resolved.error };
    const { input } = resolved;

    const path = bunnyWritePath(resolved.path);
    // The path carries the browser's hash of the file — the bytes on Bunny must match it.
    const buffer = await readUploadedObject("clients", path, { bytes: input.bytes, contentKey: input.contentKey });
    if (!buffer) {
      console.error("[media] direct upload not confirmed", { path, expected: input.bytes });
      return { success: false, error: "Upload incomplete on Bunny — try again." };
    }
    const url = getBunnyPublicUrl("clients", path);

    const [meta, blurDataURL] = await Promise.all([readImageMeta(buffer), generateBlurDataUrl(buffer)]);
    if (input.type === "POST") await uploadAspectCrops(buffer, path);

    return { success: true, url, width: meta.width, height: meta.height, format: meta.format, blurDataURL };
  } catch (error) {
    console.error("[media] finalizeMediaImageUpload failed", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to upload to Bunny" };
  }
}
