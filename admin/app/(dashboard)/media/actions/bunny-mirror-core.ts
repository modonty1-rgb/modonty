import "server-only";

import { createHash } from "node:crypto";

import { buildBunnyMediaPath, bunnyAspectUrl, uploadToBunny } from "@modonty/database/lib/bunny";
import { generateAspectCrops } from "./generate-aspect-crops";
import { generateBlurDataUrl } from "./generate-blur";

import type { MediaType, MediaScope } from "@prisma/client";

export interface MirrorImageInput {
  sourceUrl: string; // the Cloudinary image to copy
  filename: string;
  type?: MediaType;
  scope: MediaScope;
  clientSlug: string | null;
  cloudinaryPublicId?: string | null;
}

export interface UploadImageBufferInput {
  buffer: Buffer;
  contentType?: string;
  filename: string;
  type?: MediaType;
  scope: MediaScope;
  clientSlug: string | null;
  publicId?: string | null;
}

/**
 * Core Bunny image write: upload the given buffer to Bunny (base + 3 aspect crops for
 * POST article images) → return the Bunny url. THROWS on any failure. Shared by the
 * direct upload (Bunny-primary), the Cloudinary mirror, and the migration.
 */
export async function uploadImageBufferToBunny(
  input: UploadImageBufferInput
): Promise<{ bunnyUrl: string }> {
  // Content hash, not a random token: the SAME bytes always produce the SAME key, so
  // re-running the migration overwrites its own object instead of piling up a new one —
  // while two DIFFERENT images can never share a key again (the 2026-08-07 collision).
  const contentKey = createHash("sha256").update(input.buffer).digest("hex").slice(0, 10);

  const remotePath = buildBunnyMediaPath({
    type: input.type,
    scope: input.scope,
    clientSlug: input.clientSlug,
    filename: input.filename,
    publicId: input.publicId,
    uniqueKey: contentKey,
  });

  const { url } = await uploadToBunny("clients", input.buffer, remotePath, input.contentType);

  if (input.type === "POST") {
    const crops = await generateAspectCrops(input.buffer);
    await Promise.all(
      crops.map((c) =>
        uploadToBunny("clients", c.buffer, bunnyAspectUrl(remotePath, c.suffix), "image/webp")
      )
    );
  }

  return { bunnyUrl: url };
}

/**
 * Fetch a remote (Cloudinary) image → upload to Bunny. Used by the migration + legacy
 * dual-write. Delegates the actual Bunny write to `uploadImageBufferToBunny`.
 */
export async function mirrorImageToBunny(
  input: MirrorImageInput
): Promise<{ bunnyUrl: string; blurDataURL: string | null }> {
  const res = await fetch(input.sourceUrl);
  if (!res.ok) throw new Error(`source fetch failed (${res.status})`);
  const contentType = res.headers.get("content-type") ?? undefined;
  const buffer = Buffer.from(await res.arrayBuffer());

  // The migration already holds the full image in memory here, so building the blur
  // placeholder now costs one resize and ZERO extra downloads. Doing it later would mean
  // re-fetching every migrated asset. Returns null for video (sharp can't read it) — fine.
  const [uploaded, blurDataURL] = await Promise.all([
    uploadImageBufferToBunny({
      buffer,
      contentType,
      filename: input.filename,
      type: input.type,
      scope: input.scope,
      clientSlug: input.clientSlug,
      publicId: input.cloudinaryPublicId,
    }),
    generateBlurDataUrl(buffer),
  ]);

  return { bunnyUrl: uploaded.bunnyUrl, blurDataURL };
}

export type { MediaType, MediaScope };
