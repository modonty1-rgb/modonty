import type { ReactNode } from "react";

import { mediaSrc } from "@modonty/database/lib/media-src";

import { OptimizedImage } from "@/components/media/OptimizedImage";

interface ArticleFeaturedImageProps {
  /** `bunnyUrl` is part of the contract: omitting it silently pins every article hero —
   *  the LCP image — to Cloudinary, while OG/JSON-LD (which do call mediaSrc) say Bunny.
   *  Found 2026-07-30: sitemap and OG agreed, the rendered hero did not. */
  image: {
    url: string;
    bunnyUrl: string | null;
    altText: string | null;
    /** REQUIRED key (value may be null) — same discipline as `bunnyUrl` above: making it
     *  optional let every caller drop the stored blur silently, which is exactly how the
     *  hero shipped with no placeholder while 591/591 media rows had one. */
    blurDataURL: string | null;
  };
  title: string;
  children?: ReactNode;
}

export function ArticleFeaturedImage({ image, title, children }: ArticleFeaturedImageProps) {
  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-lg mb-6">
      <OptimizedImage
        src={mediaSrc(image) ?? image.url}
        alt={image.altText || title}
        fill
        className="object-cover"
        preload
        loading="eager"
        fetchPriority="high"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
        // Blur is a CSS background under the img — it paints instantly and does not delay
        // the real image, so LCP is unaffected while the empty box disappears.
        placeholder={image.blurDataURL ? "blur" : undefined}
        blurDataURL={image.blurDataURL ?? undefined}
      />
      {children}
    </div>
  );
}
