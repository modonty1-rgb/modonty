// Re-export all media actions for backward compatibility
export { getMedia } from "./get-media";
export { getMediaById } from "./get-media-by-id";
export { getMediaStats } from "./get-media-stats";
export { getClients } from "./get-clients";
export { createMedia } from "@/lib/media/create-media";
export { updateMedia } from "./update-media";
export { canDeleteMedia } from "@/lib/media/can-delete-media";
export { deleteMedia } from "@/lib/media/delete-media";

// Re-export types
export type { MediaFilters } from "./types";
