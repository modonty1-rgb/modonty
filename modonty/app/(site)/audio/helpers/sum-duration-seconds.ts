import type { AudioArticle } from "../data/get-audio-articles";

/** The queue's running time: every playable recording's length, added up. */
export function sumDurationSeconds(playable: AudioArticle[]) {
  return playable.reduce((sum, a) => sum + (a.durationSeconds ?? 0), 0);
}
