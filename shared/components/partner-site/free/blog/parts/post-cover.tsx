import { OptimizedImage, asMedia } from "../../../../optimized-image";
import type { HomeData } from "../../home/home-data";

/**
 * A post's cover. With no image it used to be an empty grey box — a card that read as
 * "failed to load" (4 Oct 2026). Now: the partner's logo on their own tint, or their name
 * when there is no logo, so the card still says whose writing it is.
 */
export function PostCover({ post, data, sizes, className }: { post: HomeData["posts"][number]; data: HomeData; sizes: string; className: string }) {
  if (post.imageUrl) {
    return (
      <span className={`${className} bg-muted`}>
        <OptimizedImage media={asMedia(post.imageUrl, post.title)} alt="" fill sizes={sizes} className="object-cover motion-safe:transition-transform motion-safe:group-hover:scale-[1.02]" />
      </span>
    );
  }
  return (
    <span className={`${className} grid place-items-center bg-primary/10`}>
      {data.hero.logoUrl ? (
        <span className="relative h-1/3 w-1/2">
          <OptimizedImage media={asMedia(data.hero.logoUrl, data.name)} alt="" fill sizes="200px" className="object-contain opacity-80" />
        </span>
      ) : (
        <span className="px-6 text-center text-lg font-bold text-[hsl(var(--primary-ink,var(--primary)))]">{data.name}</span>
      )}
    </span>
  );
}
