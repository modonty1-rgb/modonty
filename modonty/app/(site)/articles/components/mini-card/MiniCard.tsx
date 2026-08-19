import Link from "next/link";

import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { IconClock, IconClients } from "@/lib/icons";

import type { FeedPost } from "@/lib/types";

const DATE_FMT = new Intl.DateTimeFormat("ar-SA", { year: "numeric", month: "short", day: "numeric" });

interface MiniCardProps {
  post: FeedPost;
  /** Only the first row on the first page is worth loading eagerly. */
  isLcp?: boolean;
}

/**
 * One article as a row, not a poster.
 *
 * The archive used the homepage's `PostCard`, whose hero image is `aspect-[5/2]` — right for a
 * feed you scroll through one article at a time, wrong for a page whose whole job is comparing
 * many. Khalid, seeing it: «مساحات كبيرة فاضية… الفاضية كروت مرة كبيرة. الأرتكل اعملها كرت مصغر».
 * Ten articles went from roughly 2,400px of scroll to under 900.
 *
 * The look is not invented: it is the compact row already used inside `ModontyCard` on the
 * homepage — square thumbnail, two-line title, rows divided by a hairline — scaled up for a 600px
 * column instead of a 300px rail. Khalid's instruction was to reuse what exists, and that row IS
 * modonty's compact standard.
 */
export function MiniCard({ post, isLcp }: MiniCardProps) {
  const publishedAt = new Date(post.publishedAt);

  return (
    <li>
      <Link
        href={`/articles/${encodeURIComponent(post.slug)}`}
        className="flex items-start gap-3 p-3 transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:hover:bg-muted/50"
      >
        {/* 16:9, not a square. Measured 2026-08-19: 115 of 116 featured images are 1.78, and a
            square thumbnail cropped 44% of the width off — on banners whose subject IS text, that
            is not a crop, it is deletion. Khalid: «الصورة في الكرت المصغر جاية مقطوعة». */}
        <span className="relative aspect-video w-[128px] shrink-0 overflow-hidden rounded-lg bg-muted">
          {post.image ? (
            <OptimizedImage
              media={asMedia(post.image, post.title, post.imageBlur)}
              alt=""
              fill
              sizes="128px"
              className="object-cover"
              {...(isLcp ? { preload: true } : { loading: "lazy" as const })}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <IconClients className="h-5 w-5 text-muted-foreground" aria-hidden />
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 block text-sm font-bold leading-6 text-foreground">
            {post.title}
          </span>

          {/* The partner is the trust signal, so it leads; date and length are context and step back. */}
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground/70">
            <span className="truncate font-medium text-muted-foreground">{post.clientName}</span>
            {/* Every archive measured on 2026-08-19 — Vercel, Stripe, Intercom — shows the date.
                On a page sorted by recency, a row without one cannot be judged.
                Rendered on the server:  is a client component, and twenty rows would
                have meant twenty s on a page whose whole point is that it ships none. */}
            <time dateTime={publishedAt.toISOString()}>{DATE_FMT.format(publishedAt)}</time>
            {post.readingTimeMinutes ? (
              <span className="inline-flex items-center gap-1">
                <IconClock className="h-3 w-3 shrink-0" aria-hidden />
                {post.readingTimeMinutes.toLocaleString("ar-SA")} دقائق
              </span>
            ) : null}
          </span>
        </span>
      </Link>
    </li>
  );
}
