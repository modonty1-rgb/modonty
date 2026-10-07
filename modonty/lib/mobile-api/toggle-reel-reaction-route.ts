import "server-only";

import { revalidateTag } from "next/cache";
import type { MediaReactionKind } from "@prisma/client";

import { db } from "@/lib/db";
import { toggleReelReactionAs } from "@/lib/reels/toggle-reel-reaction-as";
import { readerFromRequest } from "./auth";
import { fail, MESSAGES, ok } from "./http";
import { rejectMalformedIds } from "./params";

/**
 * E16 body for `/reels/:id/like` and `/reels/:id/favorite` — `toggleReelReactionAs`, the web
 * action's logic. The web action expires the `reels` tag with `updateTag` (Server Actions only);
 * a Route Handler uses `revalidateTag(…, { expire: 0 })` — immediate expiry, per the Next 16 docs
 * (revalidateTag.md: «Pass `{ expire: 0 }` to expire the data immediately»).
 */
export async function toggleReelReactionRoute(request: Request, mediaId: string, kind: MediaReactionKind) {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);

  const malformed = rejectMalformedIds([mediaId], MESSAGES.reelNotFound);
  if (malformed) return malformed;

  // The web toggles on a reel the feed showed; a crafted id must not grow a reaction on a
  // draft or non-reel media row. Same definition of a public reel as the feed.
  const reel = await db.media.findFirst({
    where: { id: mediaId, inReels: true, reelStatus: "PUBLISHED" },
    select: { id: true },
  });
  if (!reel) return fail("NOT_FOUND", MESSAGES.reelNotFound);

  const result = await toggleReelReactionAs(reader.id, mediaId, kind);
  if (!result.success) return fail("INTERNAL_ERROR", MESSAGES.internal);

  revalidateTag("reels", { expire: 0 });
  return ok({ active: result.active, count: result.count });
}
