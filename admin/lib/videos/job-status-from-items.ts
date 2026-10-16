import type { VideoJobStatus, VideoPublishItem } from "@prisma/client";

import { FINAL_ITEM_STATUSES } from "./video-api-values";

/** `done` لما كل بند `published` أو `skipped` (العقد F3)؛ وإلا جاهز للمراجعة. */
export function jobStatusFromItems(items: VideoPublishItem[]): VideoJobStatus {
  return items.length > 0 && items.every((i) => FINAL_ITEM_STATUSES.includes(i.status)) ? "DONE" : "READY_FOR_REVIEW";
}
