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
  // Desktop: four smaller squares instead of three big ones — same reel framing, ~45px
  // less card height (Khalid, 2026-08-15: «الطلّات الارتفاع عالي»).
  feed: "w-[clamp(5.5rem,28vw,6.5rem)] md:w-[clamp(6.5rem,20vw,8rem)] lg:w-[calc((100%-1.5rem)/4)]",
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
        "group relative isolate shrink-0 overflow-hidden rounded-lg bg-primary text-white ring-1 ring-transparent transition-[box-shadow,transform] sm:hover:ring-2 sm:hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-safe:active:scale-[0.98]",
        // Keep the familiar portrait preview on small screens; the desktop feed uses
        // square crops so this discovery rail does not push the first article too far down.
        layout === "feed" ? "aspect-[4/5] lg:aspect-square" : "aspect-[4/5]",
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
          className="object-cover object-top transition-transform duration-300 sm:group-hover:scale-105"
        />
      ) : (
        <span className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" aria-hidden />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden />
      {/* Centred, 32px: with no visible title this mark alone says «video» (YouTube/Instagram). */}
      <span className="absolute start-1/2 top-1/2 inline-flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-link shadow-sm">
        <IconPlay className="h-4 w-4" aria-hidden />
      </span>
      <span className="absolute inset-x-2 bottom-2">
        <span className="line-clamp-1 block text-xs font-normal leading-5 drop-shadow-sm lg:line-clamp-2">{item.title}</span>
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
      <div className={cn("flex gap-2 overflow-x-auto p-3 scrollbar-none sm:p-4 sm:pb-3", previews.length === 1 && "justify-center")} dir="rtl">
        {previews.map((item) => (
          <ReelPreviewTile key={item.id} item={item} layout={layout} itemCount={previews.length} />
        ))}
      </div>
    </section>
  );
}
