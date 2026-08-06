"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { mirrorImageToBunny } from "./bunny-mirror-core";

import type { MediaType, MediaScope } from "@prisma/client";

interface MirrorToBunnyInput {
  sourceUrl: string; // the Cloudinary image to copy (stays the DB `url`)
  filename: string;
  type?: MediaType;
  scope: MediaScope;
  clientId: string | null;
  cloudinaryPublicId?: string;
}

/**
 * Best-effort mirror of a freshly-uploaded image to Bunny (Dual-Write, P2-2).
 * NEVER throws — a Bunny failure returns `{ bunnyUrl: null }` so the primary
 * upload (url = Cloudinary) always succeeds. The production site keeps reading `url`.
 */
export async function mirrorMediaToBunny(
  input: MirrorToBunnyInput
): Promise<{ bunnyUrl: string | null; blurDataURL: string | null }> {
  try {
    const session = await auth();
    if (!session) return { bunnyUrl: null, blurDataURL: null };

    let clientSlug: string | null = null;
    if (input.clientId) {
      const client = await db.client.findUnique({
        where: { id: input.clientId },
        select: { slug: true },
      });
      clientSlug = client?.slug ?? null;
    }

    const { bunnyUrl, blurDataURL } = await mirrorImageToBunny({
      sourceUrl: input.sourceUrl,
      filename: input.filename,
      type: input.type,
      scope: input.scope,
      clientSlug,
      cloudinaryPublicId: input.cloudinaryPublicId,
    });
    return { bunnyUrl, blurDataURL };
  } catch {
    return { bunnyUrl: null, blurDataURL: null };
  }
}
