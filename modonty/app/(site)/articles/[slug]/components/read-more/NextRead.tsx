import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { OptimizedImage } from "@modonty/shared/components/optimized-image";

interface NextReadItem {
  id: string;
  title: string;
  slug: string;
  featuredImage?: { url: string; bunnyUrl: string | null; blurDataURL: string | null; altText: string | null } | null;
  clientName?: string | null;
}

/**
 * «اقرأ بعدها» — one card right under the last sentence (Khalid, 3 Oct 2026 · plan هـ٤).
 *
 * Readers left after one page: on the national-day articles 398 of 400 entries were exits. The
 * «اقرأ أيضاً» list existed, but at the very bottom — after sources, tags and comments, and closed
 * on a phone (measured at 360: the article ended at 3676, the list began at 4335). The moment a
 * reader finishes is the moment to offer the next step, so the closest article sits there. The
 * full list stays where it was. Server-rendered: a plain link and an image, no client JS of its own
 * beyond the shared click counter.
 */
export function NextRead({ item, articleId, clientId }: { item: NextReadItem | undefined; articleId: string; clientId?: string }) {
  if (!item) return null;
  return (
    <CtaTrackedLink
      href={`/articles/${item.slug}`}
      label={`اقرأ بعدها: ${item.title}`}
      type="LINK"
      articleId={articleId}
      clientId={clientId}
      className="mb-8 flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-3 transition-colors hover:bg-primary/10"
    >
      {item.featuredImage ? (
        <span className="relative block h-[66px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-muted">
          <OptimizedImage
            media={item.featuredImage}
            alt={item.featuredImage.altText || item.title}
            fill
            className="object-cover"
            sizes="88px"
          />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="mb-1 block text-xs font-bold text-primary">اقرأ بعدها ←</span>
        <span className="line-clamp-2 text-[15px] font-bold leading-snug text-foreground">{item.title}</span>
        {item.clientName ? <span className="mt-0.5 block text-xs text-muted-foreground">في {item.clientName}</span> : null}
      </span>
    </CtaTrackedLink>
  );
}
