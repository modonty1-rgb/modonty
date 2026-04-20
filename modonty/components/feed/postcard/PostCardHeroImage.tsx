import Image from "next/image";
import { optimizeCloudinaryUrl } from "@/components/media/OptimizedImage";
import { IconArticle, IconVolume2 } from "@/lib/icons";
import type { PostCardProps } from "./PostCard.types";

const LCP_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px";
const DEFAULT_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

export function PostCardHeroImage({
  post,
  index,
  isLcp,
  featured,
}: PostCardProps) {
  const lcp = isLcp ?? (index === 0);

  const audioBadge = post.hasAudio ? (
    <span
      className="absolute top-2 start-2 z-10 inline-flex items-center gap-1 rounded-full bg-teal-500/90 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm"
      aria-label="نسخة صوتية متاحة"
    >
      <IconVolume2 className="h-3 w-3" aria-hidden />
      <span>نسخة صوتية</span>
    </span>
  ) : null;

  if (!post.image) {
    return (
      <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-muted/80 to-muted/40 flex flex-col items-center justify-center gap-2">
        {audioBadge}
        {post.clientLogo ? (
          <Image
            src={optimizeCloudinaryUrl(post.clientLogo, false)}
            alt={post.clientName}
            width={64}
            height={64}
            className="object-contain opacity-60"
          />
        ) : (
          <>
            <IconArticle className="h-8 w-8 text-muted-foreground/50" />
            <span className="text-xs font-medium text-muted-foreground/70 text-center px-4 line-clamp-1">
              {post.clientName}
            </span>
          </>
        )}
      </div>
    );
  }

  const optimizedSrc = optimizeCloudinaryUrl(post.image, lcp);

  return (
    <div className={`relative w-full overflow-hidden ${featured ? "aspect-[16/7]" : "aspect-video"}`}>
      {audioBadge}
      <Image
        src={optimizedSrc}
        alt={post.title || "صورة المقال"}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes={lcp ? LCP_SIZES : DEFAULT_SIZES}
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
  );
}
