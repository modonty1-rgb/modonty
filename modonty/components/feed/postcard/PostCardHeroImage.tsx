import Link from "@/components/link";
import Image from "next/image";
import { optimizeCloudinaryUrl } from "@/components/media/OptimizedImage";
import type { PostCardProps } from "./PostCard.types";

const LCP_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px";
const DEFAULT_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

export function PostCardHeroImage({
  post,
  index,
  isLcp,
  articleTitle,
}: PostCardProps) {
  if (!post.image) return null;

  const lcp = isLcp ?? (index === 0);
  const optimizedSrc = optimizeCloudinaryUrl(post.image, lcp);

  return (
    <Link
      href={`/articles/${post.slug}`}
      className="block"
      prefetch={typeof index === "number" && index < 5}
      aria-label={articleTitle ? `صورة مقال: ${articleTitle}` : undefined}
    >
      <div className="relative w-full aspect-video overflow-hidden rounded-md bg-muted">
        <Image
          src={optimizedSrc}
          alt={post.title || "صورة المقال"}
          fill
          className="object-cover h-full w-full"
          sizes={lcp ? LCP_SIZES : DEFAULT_SIZES}
          preload={lcp}
          loading={lcp ? "eager" : "lazy"}
          fetchPriority={lcp ? "high" : "auto"}
          quality={75}
          decoding="async"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
