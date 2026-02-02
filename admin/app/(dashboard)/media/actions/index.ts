// Re-export all media actions for backward compatibility
export { getMedia } from "./get-media";
export { getMediaById } from "./get-media-by-id";
export { getMediaStats } from "./get-media-stats";
export { getClients } from "./get-clients";
export { createMedia } from "./create-media";
export { updateMedia } from "./update-media";
export { renameCloudinaryAsset } from "./rename-cloudinary-asset";
export { getMediaUsage } from "./get-media-usage";
export { canDeleteMedia } from "./can-delete-media";
export { deleteCloudinaryAsset } from "./delete-cloudinary-asset";
export { deleteMedia } from "./delete-media";
export { bulkDeleteMedia } from "./bulk-delete-media";

// Re-export types
export type { MediaFilters } from "./types";
