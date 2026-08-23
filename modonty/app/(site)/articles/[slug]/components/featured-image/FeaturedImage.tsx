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
  // Desktop pays 439px of height for this box, so it is capped by WIDTH, not height.
  // `max-h` would have cropped (the box shrinks while `object-cover` keeps filling it),
  // and a shorter aspect ratio crops for the same reason. Capping the width keeps the
  // ratio untouched — 640 × 9/16 = 360px tall, 79px cheaper, and the file (900×506,
  // ratio 1.779 against the box's 1.777) still lands whole, exactly as it does today.
  // `md:` only: mobile shows it at 200px and has nothing to save.
  return (
    <div className="relative w-full md:max-w-[640px] md:mx-auto aspect-video overflow-hidden rounded-lg mb-6">
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
