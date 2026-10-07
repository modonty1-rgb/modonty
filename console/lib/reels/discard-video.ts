import { db } from "@/lib/db";
import { deleteStreamVideo } from "@modonty/shared/lib/bunny-stream";

/** Drop both sides at once — the row here and the file on Bunny. */
export async function discardVideo(mediaId: string, bunnyVideoId: string | null) {
  if (bunnyVideoId) await deleteStreamVideo(bunnyVideoId);
  await db.media.delete({ where: { id: mediaId } });
}
