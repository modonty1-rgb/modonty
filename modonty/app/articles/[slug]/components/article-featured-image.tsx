import type { ReactNode } from "react";
import { OptimizedImage } from "@/components/media/OptimizedImage";

interface ArticleFeaturedImageProps {
  image: {
    url: string;
    altText: string | null;
  };
  title: string;
  children?: ReactNode;
}

export function ArticleFeaturedImage({ image, title, children }: ArticleFeaturedImageProps) {
  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-lg mb-6">
      <OptimizedImage
        src={image.url}
        alt={image.altText || title}
        fill
        className="object-cover"
        preload
        loading="eager"
        fetchPriority="high"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
      />
      {children}
    </div>
  );
}
