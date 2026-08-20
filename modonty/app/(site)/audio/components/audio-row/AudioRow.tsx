import Link from "next/link";

import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { IconClients, IconListen } from "@/lib/icons";

import type { AudioArticle } from "../../data/get-audio-articles";

const DATE_FMT = new Intl.DateTimeFormat("ar-SA", { year: "numeric", month: "short", day: "numeric" });

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
/** `2:06:15` for a long one, `06:12` for a short one — the hour slot only when there is one. */
function clock(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  const raw = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  return raw.replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
}

interface AudioRowProps {
  article: AudioArticle;
  /** Only the first row is worth loading eagerly. */
  isLcp?: boolean;
}

/**
 * One recording as a row.
 *
 * Deliberately the same shape as the row on `/articles` — 16:9 thumbnail, two-line title, partner
 * then date underneath — because it IS the same object seen from a different shelf, and a reader
 * who has learned one row should not have to learn another. It is rebuilt here rather than
 * imported: sibling routes may not import from each other, and this one carries no trust marks
 * and no reading time.
 *
 * The row links to the article, where the listen tab holds the player. There is no second player
 * on this page on purpose: two players in one document can talk over each other, and a list of
 * twenty would each read the file's metadata on load.
 */
export function AudioRow({ article, isLcp }: AudioRowProps) {
  const publishedAt = new Date(article.publishedAt);

  return (
    <li>
      <Link
        href={`/articles/${encodeURIComponent(article.slug)}`}
        className="flex items-start gap-3 p-3 transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:hover:bg-muted/50"
      >
        <span className="relative aspect-video w-[128px] shrink-0 overflow-hidden rounded-lg bg-muted">
          {article.image ? (
            <OptimizedImage
              media={asMedia(article.image, article.title, article.imageBlur)}
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
          {/* The one mark that says why this row is on this page rather than in the archive —
              and, when it is known, how long a commitment it is. The length comes from the
              database, so a shelf of a hundred rows still fetches no audio at all. */}
          <span
            className="absolute bottom-1 end-1 inline-flex items-center gap-1 rounded-full bg-action-listen px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-action-listen-foreground shadow"
            dir="ltr"
          >
            <IconListen className="size-3" aria-hidden />
            {article.durationSeconds ? clock(article.durationSeconds) : null}
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 block text-sm font-bold leading-6 text-foreground">
            {article.title}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground/70">
            <span className="min-w-0 truncate font-medium text-muted-foreground">{article.clientName}</span>
            <time dateTime={publishedAt.toISOString()}>{DATE_FMT.format(publishedAt)}</time>
          </span>
        </span>
      </Link>
    </li>
  );
}
