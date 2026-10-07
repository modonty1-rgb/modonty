"use server";

import { toggleReelReaction } from "../helpers/toggle-reel-reaction";
import type { ToggleResult } from "../helpers/toggle-reel-reaction-as";

export async function toggleReelFavorite(mediaId: string): Promise<ToggleResult> {
  return toggleReelReaction(mediaId, "FAVORITE");
}
