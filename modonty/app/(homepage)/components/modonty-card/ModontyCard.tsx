import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { IconArticle, IconPlay, IconVolume2 } from "@/lib/icons";

import { cn } from "@/lib/utils";
import type { FeedPost } from "@/lib/types";

interface ModontyCardProps {
  articles: FeedPost[];
  brandLogoUrl: string | null;
  className?: string;
}

// One hero plus a short list, not a carousel. In a 300px rail a carousel shows one
// article and asks the visitor to work for the rest; this shows four at once, gives
// the rail the focal point it was missing, and ships no client JavaScript.
export function ModontyCard({ articles, brandLogoUrl, className }: ModontyCardProps) {
  const withImage = articles.filter(
    (article): article is FeedPost & { image: string } => typeof article.image === "string"
  );

  if (withImage.length === 0) return null;

  const [hero, ...rest] = withImage;
  const list = rest.slice(0, 3);

  return (
    <section aria-label="مدونتي" className={cn("overflow-visible rounded-lg ring-1 ring-primary/15 bg-card", className)}>
      <div className="flex items-center gap-2 px-3 pb-2 pt-3">
        <span className="relative z-10 mb-[-20px] shrink-0 translate-x-2 -translate-y-[25px] -rotate-[16deg]">
          <span aria-hidden className="absolute inset-0 translate-x-1 translate-y-1 rounded-sm bg-primary" />
          <h2 className="relative flex h-8 w-[82px] items-center justify-center rounded-sm border-2 border-white/90 bg-white px-2">
            {brandLogoUrl ? (
              <OptimizedImage media={asMedia(brandLogoUrl, "مدونتي")} alt="مدونتي" width={70} height={20} sizes="70px" className="h-5 w-[70px] object-contain" />
            ) : (
              <span className="text-xs font-normal text-link">مدونتي</span>
            )}
          </h2>
        </span>
        <nav aria-label="محتوى مدونتي" className="flex min-w-0 flex-1 items-center justify-end gap-1">
          <Link href="/" aria-current="page" className="inline-flex items-center gap-1 rounded-full bg-primary/[0.08] px-2 py-1.5 text-[11px] font-normal text-link transition-colors hover:bg-primary/[0.12]">
            <IconArticle className="h-3.5 w-3.5" aria-hidden /> مقالات
          </Link>
          <Link href="/audio" className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <IconVolume2 className="h-3.5 w-3.5" aria-hidden /> استمع
          </Link>
          <Link href="/reels" className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-normal text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <IconPlay className="h-3.5 w-3.5" aria-hidden /> لقطات
          </Link>
        </nav>
      </div>

      <Link
        href={`/articles/${encodeURIComponent(hero.slug)}`}
        className="group relative block aspect-video overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {/* This card is `hidden lg:block`; below 1024px the img is display:none, and Chrome was
            measured still requesting it at 640w on phones (lazy or not). 1px there → 16w. */}
        <OptimizedImage media={asMedia(hero.image, hero.title, hero.imageBlur)} alt="" fill className="object-cover transition-transform duration-300 sm:group-hover:scale-105" sizes="(min-width: 1024px) 300px, 1px" />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent px-4 pb-4 pt-14">
          <span className="line-clamp-2 block text-sm font-medium leading-6 text-white">{hero.title}</span>
        </span>
      </Link>

      {list.length > 0 && (
        <ul className="divide-y divide-border">
          {list.map((article) => (
            <li key={article.id}>
              <Link
                href={`/articles/${encodeURIComponent(article.slug)}`}
                className="flex items-center gap-2.5 px-3 py-2.5 transition-colors sm:hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="relative size-11 shrink-0 overflow-hidden rounded-sm bg-muted">
                  <OptimizedImage media={asMedia(article.image, article.title, article.imageBlur)} alt="" fill className="object-cover" sizes="44px" />
                </span>
                <span className="line-clamp-2 min-w-0 flex-1 text-xs font-normal leading-5 text-foreground">{article.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* The sidebar teases; browsing happens on the articles page. One door out
          keeps the card the same height however many articles modonty publishes. */}
      <Link
        href={`/clients/${encodeURIComponent(hero.clientSlug)}`}
        className="flex items-center justify-center border-t border-border px-3 py-2.5 text-xs font-normal text-link transition-colors sm:hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        كل مقالات مدونتي
      </Link>
    </section>
  );
}
