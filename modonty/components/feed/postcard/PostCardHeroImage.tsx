import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import type { SizePreset } from "@modonty/shared/components/optimized-image";
import { IconArticle, IconVolume2 } from "@/lib/icons";
import type { PostCardProps } from "./PostCard.types";

// The desktop card is `hidden lg:block`, so below 1024px this image is display:none —
// yet an eager <img> still downloads. Declaring 1px there makes the browser pick the
// smallest srcset candidate (16w) instead of a 100vw one for an image nobody sees.
const LCP_SIZES = "(min-width: 1024px) 600px, 1px";
const DEFAULT_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

interface PostCardHeroImageProps extends PostCardProps {
  enableHoverEffect?: boolean;
  sizes?: SizePreset | (string & {});
}

export function PostCardHeroImage({
  post,
  index,
  isLcp,
  enableHoverEffect = true,
  sizes,
}: PostCardHeroImageProps) {
  const lcp = isLcp ?? (index === 0);
  const imageSizes = sizes ?? (lcp ? LCP_SIZES : DEFAULT_SIZES);

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
          <OptimizedImage
            media={asMedia(post.clientLogo, post.clientName)}
            alt={post.clientName}
            width={64}
            height={64}
            sizes="64px"
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

  return (
    // 5:2 instead of 16:9 — the hero keeps the card's full width and loses ~29% of its
    // height to a centred vertical crop (Khalid, 2026-08-15: the cover was too tall).
    <div className="relative w-full overflow-hidden aspect-[5/2]">
      {audioBadge}
      <OptimizedImage
        // `post.image` is a resolved url on the feed payload, not a Media relation → asMedia,
        // with the stored LQIP so OptimizedImage renders its blur placeholder while loading.
        // The old `optimizeCloudinaryUrl(post.image, lcp)` wrapper is gone: it rewrites
        // Cloudinary urls only, and every served feed image is on Bunny (verified
        // 2026-08-07: 95/95 article covers, 27/27 client logos → zero Cloudinary).
        media={asMedia(post.image, post.title, post.imageBlur)}
        alt={post.title || "صورة المقال"}
        fill
        className={enableHoverEffect ? "object-cover transition-transform duration-300 group-hover:scale-105" : "object-cover"}
        sizes={imageSizes}
        // Next 16 image docs: "In most cases, you should use loading="eager" or
        // fetchPriority="high" instead of preload" — and preload is explicitly NOT for
        // pages whose LCP element differs by viewport, which is our case (this hero on
        // desktop, the Modonty card hero on mobile). So: eager + high, no preload.
        {...(lcp ? { loading: "eager" as const, fetchPriority: "high" as const } : { loading: "lazy" as const })}
        decoding="async"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
