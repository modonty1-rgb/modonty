import type { ReactNode } from "react";

import { OptimizedImage, type ImageMedia } from "@modonty/shared/components/optimized-image";

interface ArticleFeaturedImageProps {
  /** The media row itself — `bunnyUrl` and `blurDataURL` are required keys on `ImageMedia`,
   *  so a query that forgets either is a compile error here rather than a silent downgrade.
   *  Both classes of bug shipped before: the hero rendered Cloudinary while OG/JSON-LD said
   *  Bunny (2026-07-30), and it had no placeholder while 591/591 rows carried one. */
  image: ImageMedia;
  title: string;
  children?: ReactNode;
}

export function ArticleFeaturedImage({ image, title, children }: ArticleFeaturedImageProps) {
  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-lg mb-6">
      <OptimizedImage
        media={image}
        alt={image.altText || title}
        fill
        className="object-cover"
        // The LCP image: preload alone. The docs list `loading` and `fetchPriority` under
        // "when not to use preload", and quality stays at the 75 default — raising it only
        // inflates an already re-encoded WebP.
        preload
        sizes="hero"
      />
      {children}
    </div>
  );
}
