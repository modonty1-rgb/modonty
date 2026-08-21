import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { IconPlay } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface ReelItem {
  id: string;
  title: string;
  imageUrl: string | null;
  clientName: string;
}

type ReelsPreviewLayout = "sidebar" | "feed";

interface ReelsCardProps {
  items: ReelItem[];
  layout: ReelsPreviewLayout;
  className?: string;
}

const itemWidthByLayout: Record<ReelsPreviewLayout, string> = {
  sidebar: "w-[calc((100%-1rem)/3)]",
  // Phones stay at the compact end of the preview range so the article feed remains
  // visible; desktop keeps four smaller squares instead of three large tiles.
  feed: "w-[clamp(4.5rem,21vw,5rem)] md:w-[clamp(6.5rem,20vw,8rem)] lg:w-[calc((100%-1.5rem)/4)]",
};

const imageSizesByLayout: Record<ReelsPreviewLayout, string> = {
  sidebar: "86px",
  feed: "(min-width: 1024px) 140px, (min-width: 768px) 128px, 104px",
};

function getSidebarTileWidth(itemCount: number) {
  if (itemCount === 1) return "w-[52%]";
  if (itemCount === 2) return "w-[calc((100%-0.5rem)/2)]";
  return itemWidthByLayout.sidebar;
}

interface ReelPreviewTileProps {
  item: ReelItem;
  layout: ReelsPreviewLayout;
  itemCount: number;
}

function ReelPreviewTile({ item, layout, itemCount }: ReelPreviewTileProps) {
  const tileWidth = layout === "sidebar" ? getSidebarTileWidth(itemCount) : itemWidthByLayout.feed;
  const imageSizes = layout === "sidebar" && itemCount === 1 ? "156px" : imageSizesByLayout[layout];

  return (
    <Link
      href="/reels"
      aria-label={`شوف الطلّة: ${item.title}`}
      className={cn(
        "group relative isolate shrink-0 overflow-hidden text-white ring-1 ring-transparent transition-[box-shadow,transform] sm:hover:ring-2 sm:hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-safe:active:scale-[0.98]",
        // Phones fit the native vertical frame without cropping; tablets use the compact
        // preview ratio, and desktop retains its existing square treatment.
        layout === "feed" ? "aspect-[9/16] rounded-none bg-black md:aspect-[4/5] lg:aspect-square lg:rounded-lg lg:bg-primary" : "aspect-[4/5] rounded-lg bg-primary",
        tileWidth
      )}
    >
      {item.imageUrl ? (
        <OptimizedImage
          media={asMedia(item.imageUrl, item.title)}
          alt=""
          fill
          sizes={imageSizes}
          quality={75}
          loading="lazy"
          className={cn(
            layout === "feed"
              ? "object-contain lg:object-cover lg:object-top lg:transition-transform lg:duration-300 lg:group-hover:scale-105"
              : "object-cover object-top transition-transform duration-300 sm:group-hover:scale-105"
          )}
        />
      ) : (
        <span className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" aria-hidden />
      )}
      <span className={cn("absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent", layout === "feed" && "hidden lg:block")} aria-hidden />
      {/* Centred, 32px: with no visible title this mark alone says «video» (YouTube/Instagram). */}
      <span className={cn("absolute start-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-link shadow-sm", layout === "feed" ? "size-7 lg:size-8" : "size-8")}>
        <IconPlay className={cn(layout === "feed" ? "size-3.5 lg:size-4" : "size-4")} aria-hidden />
      </span>
      <span className={cn("absolute inset-x-2 bottom-2", layout === "feed" && "hidden lg:block")}>
        <span className={cn("line-clamp-1 block font-normal drop-shadow-sm", layout === "feed" ? "text-[11px] leading-4 lg:line-clamp-2 lg:text-xs lg:leading-5" : "text-xs leading-5")}>{item.title}</span>
        <span className="mt-0.5 hidden truncate text-[10px] text-white/80 lg:block">{item.clientName}</span>
      </span>
    </Link>
  );
}

export function ReelsCard({ items, layout, className }: ReelsCardProps) {
  const previews = items.slice(0, layout === "feed" ? 4 : 3);
  if (previews.length === 0) return null;

  return (
    <section
      aria-labelledby={`reels-preview-heading-${layout}`}
      className={cn(
        "overflow-hidden rounded-lg ring-1 ring-primary/10 bg-card",
        className
      )}
    >
      {/* Title for machines only (Khalid, 2026-08-16): the play marks and the portrait
          crops already say «reels» to the eye, and the card loses ~32px. */}
      <h2 id={`reels-preview-heading-${layout}`} className="sr-only">طلة جديدة</h2>
      <div className={cn("flex gap-2 overflow-x-auto px-3 py-1.5 scrollbar-none sm:p-4 sm:pb-3", previews.length === 1 && "justify-center")} dir="rtl">
        {previews.map((item) => (
          <ReelPreviewTile key={item.id} item={item} layout={layout} itemCount={previews.length} />
        ))}
      </div>
    </section>
  );
}
