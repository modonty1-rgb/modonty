"use server";

import { toggleReelReaction } from "../helpers/toggle-reel-reaction";
import type { ToggleResult } from "../helpers/toggle-reel-reaction-as";

export async function toggleReelLike(mediaId: string): Promise<ToggleResult> {
  return toggleReelReaction(mediaId, "LIKE");
}
