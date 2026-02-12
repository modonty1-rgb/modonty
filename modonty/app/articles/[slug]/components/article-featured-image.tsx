import { OptimizedImage } from "@/components/media/OptimizedImage";

interface ArticleFeaturedImageProps {
  image: {
    url: string;
    altText: string | null;
  };
  title: string;
}

export function ArticleFeaturedImage({ image, title }: ArticleFeaturedImageProps) {
  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
      <OptimizedImage
        src={image.url}
        alt={image.altText || title}
        fill
        className="object-cover"
        priority
        fetchPriority="high"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 800px, 1200px"
      />
    </div>
  );
}
