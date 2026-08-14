"use client";

import { PreloadHeroImage } from "./preload-hero-image";

/**
 * Preload the ARTICLE detail hero from a card linking to `/articles/[slug]`.
 * `sizes` mirrors `article-featured-image.tsx`, which declares `sizes="hero"`.
 */
export function PreloadArticleHero({ href, imageUrl }: { href: string; imageUrl: string | null }) {
  return <PreloadHeroImage href={href} imageUrl={imageUrl} sizes="hero" />;
}
