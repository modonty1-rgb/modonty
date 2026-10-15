import { hasStoredOgImage } from "@modonty/shared/lib/seo/client/meta-score";

/**
 * The ONE rule for "does this client have image X" — same spirit as
 * contact-channel-rules.ts, kept separate because it answers a different question
 * (profile completeness, not reach). Shared by the server count (segments.ts →
 * getClientImageGaps) and the client table (profile-images-table.tsx).
 */
export interface ImageChannelFields {
  logoMediaId: string | null;
  heroImageMediaId: string | null;
  nextjsMetadata: unknown;
}

export interface ImageChannelFlags {
  hasLogo: boolean;
  hasHero: boolean;
  hasOg: boolean;
}

export function imageChannelFlags(c: ImageChannelFields): ImageChannelFlags {
  return {
    hasLogo: !!c.logoMediaId,
    hasHero: !!c.heroImageMediaId,
    hasOg: hasStoredOgImage(c.nextjsMetadata),
  };
}
