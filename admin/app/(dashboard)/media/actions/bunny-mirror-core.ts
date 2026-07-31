import "server-only";

import { buildBunnyMediaPath, bunnyAspectUrl, uploadToBunny } from "@modonty/database/lib/bunny";
import { generateAspectCrops } from "./generate-aspect-crops";

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
  const remotePath = buildBunnyMediaPath({
    type: input.type,
    scope: input.scope,
    clientSlug: input.clientSlug,
    filename: input.filename,
    publicId: input.publicId,
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
export async function mirrorImageToBunny(input: MirrorImageInput): Promise<{ bunnyUrl: string }> {
  const res = await fetch(input.sourceUrl);
  if (!res.ok) throw new Error(`source fetch failed (${res.status})`);
  const contentType = res.headers.get("content-type") ?? undefined;
  const buffer = Buffer.from(await res.arrayBuffer());

  return uploadImageBufferToBunny({
    buffer,
    contentType,
    filename: input.filename,
    type: input.type,
    scope: input.scope,
    clientSlug: input.clientSlug,
    publicId: input.cloudinaryPublicId,
  });
}

export type { MediaType, MediaScope };
