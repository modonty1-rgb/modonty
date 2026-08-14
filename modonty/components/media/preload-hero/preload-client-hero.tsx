"use client";

import { PreloadHeroImage } from "./preload-hero-image";

/**
 * Preload the CLIENT page hero from a card linking to `/clients/[slug]`.
 * `sizes` mirrors `client-hero-v2.tsx`, which declares `sizes="clientHero"`.
 */
export function PreloadClientHero({ href, imageUrl }: { href: string; imageUrl: string | null }) {
  return <PreloadHeroImage href={href} imageUrl={imageUrl} sizes="clientHero" />;
}
