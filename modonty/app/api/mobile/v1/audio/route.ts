import { getAudioArticles } from "@/app/(site)/audio/data/get-audio-articles";
import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";

/**
 * C19 — GET /api/mobile/v1/audio · public.
 * `getAudioArticles` — what `/audio` renders: every published article with a recording, newest
 * first, at most 100, each with its `audioUrl` so the queue plays in place.
 */
export const GET = handle("audio", async () => {
  const items = await getAudioArticles();
  return ok({ items }, PUBLIC_CACHE);
});
