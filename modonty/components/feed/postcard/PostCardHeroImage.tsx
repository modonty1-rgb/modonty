import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import type { SizePreset } from "@modonty/shared/components/optimized-image";
import { IconArticle, IconVolume2 } from "@/lib/icons";
import type { PostCardProps } from "./PostCard.types";

// The desktop card is `hidden lg:block`, so below 1024px this image is display:none —
// yet an eager <img> still downloads. Declaring 1px there makes the browser pick the
// smallest srcset candidate (16w) instead of a 100vw one for an image nobody sees.
// 800px, not 600: measured 1 Sep 2026 on /articles at a 1280 viewport, this hero paints at
// 779px wide. Declaring 600 made the browser fetch a candidate 30% narrower than the box and
// stretch it — on the LCP image of all things. 800 is the next srcset step above 779.
const LCP_SIZES = "(min-width: 1024px) 800px, 1px";
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

  // Below lg this image is the 92px feed THUMB (MobilePostCard) — ANY overlay eats it
  // (Khalid, 21 Aug: «ماكل الصورة كلها»), so the badge exists only ≥1024px, where the
  // DesktopPostCard hero has room. The mobile card announces audio in its text column.
  const audioBadge = post.hasAudio ? (
    <span
      className="absolute top-2 start-2 z-10 hidden items-center gap-1 rounded-full bg-teal-500/90 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm lg:inline-flex"
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
    // 16:9 — the SAME ratio the covers are stored at (measured: 600×337 = 1.78), so the
    // image lands whole: `cover` has nothing left to trim, and there are no letterbox bars
    // either. The frame was `aspect-[5/2]` (2.50) from 2026-08-15 to shorten a cover judged
    // too tall, and the price was a 29% centred vertical crop — measured on three cards
    // across the homepage, the feed and /articles. Khalid, 1 Sep 2026: «خل الصورة تكون
    // واضحة… بدون قطع». A ratio that matches the source is the only crop-free way to fill
    // a box; keeping 5:2 and merely moving `object-position` would relocate the loss, not
    // remove it.
    <div className="relative w-full overflow-hidden aspect-video">
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
