import { mediaSrc } from "@modonty/shared/lib/media-src";
import type { ClientForMetadata } from "./get-client-for-metadata";

/** The partner's own images with their real dimensions — what the stored OG block may honestly claim. */
export function buildKnownImages(client: ClientForMetadata) {
  return [client.heroImageMedia, client.logoMedia].flatMap((media) => {
    const url = mediaSrc(media);
    return url ? [{ url, width: media?.width, height: media?.height }] : [];
  });
}
