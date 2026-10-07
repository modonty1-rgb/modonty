import "server-only";

import { updateTag } from "next/cache";

import { auth } from "@/lib/auth";
import { toggleReelReactionAs, type ToggleResult } from "./toggle-reel-reaction-as";
import type { MediaReactionKind } from "@prisma/client";

/**
 * Web door for reel likes/favorites: identity from the session cookie, logic in
 * `toggleReelReactionAs` (shared with the mobile API). The signed-in check stays here and is
 * the ONLY thing enforcing a signed-in user for FAVORITE — removing it would allow anonymous
 * favorites. Called from the two Server Actions only — `updateTag` needs that context.
 */
export async function toggleReelReaction(mediaId: string, kind: MediaReactionKind): Promise<ToggleResult> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "unauthorized" };

    const result = await toggleReelReactionAs(userId, mediaId, kind);
    // Read-your-own-writes: expire the cached feed so counters reflect immediately.
    if (result.success) updateTag("reels");
    return result;
  } catch {
    return { success: false, error: "server" };
  }
}
