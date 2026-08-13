import { OptimizedImage, asMedia } from "@modonty/database/components/optimized-image";
import Link from "@/components/link";
import { ModontySectionLink } from "@/components/feed/ModontySectionLink";
import { IconPlay } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface ReelPreviewItem {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  clientName: string;
}

type ReelsPreviewLayout = "sidebar" | "feed";

interface ReelsPreviewCardProps {
  items: ReelPreviewItem[];
  layout: ReelsPreviewLayout;
  className?: string;
}

const itemWidthByLayout: Record<ReelsPreviewLayout, string> = {
  sidebar: "w-[calc((100%-1rem)/3)]",
  feed: "w-[clamp(5.5rem,28vw,6.5rem)] md:w-[clamp(6.5rem,20vw,8rem)] lg:w-[30%]",
};

const imageSizesByLayout: Record<ReelsPreviewLayout, string> = {
  sidebar: "86px",
  feed: "(min-width: 1024px) 30vw, (min-width: 768px) 128px, 104px",
};

function getSidebarTileWidth(itemCount: number) {
  if (itemCount === 1) return "w-[52%]";
  if (itemCount === 2) return "w-[calc((100%-0.5rem)/2)]";
  return itemWidthByLayout.sidebar;
}

interface ReelPreviewTileProps {
  item: ReelPreviewItem;
  layout: ReelsPreviewLayout;
  itemCount: number;
}

function ReelPreviewTile({ item, layout, itemCount }: ReelPreviewTileProps) {
  const tileWidth = layout === "sidebar" ? getSidebarTileWidth(itemCount) : itemWidthByLayout.feed;
  const imageSizes = layout === "sidebar" && itemCount === 1 ? "156px" : imageSizesByLayout[layout];

  return (
    <Link
      href="/reels"
      aria-label={`مشاهدة ريلز: ${item.title}`}
      className={cn(
        "group relative isolate shrink-0 overflow-hidden rounded-xl bg-primary text-white",
        "aspect-[4/5] lg:aspect-[9/14]",
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
          className="object-cover transition-transform duration-300 sm:group-hover:scale-105"
        />
      ) : (
        <span className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" aria-hidden />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden />
      <span className="absolute end-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-primary shadow-sm">
        <IconPlay className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span className="absolute inset-x-2 bottom-2">
        <span className="line-clamp-1 block text-xs font-bold leading-5 drop-shadow-sm lg:line-clamp-2">{item.title}</span>
        <span className="mt-0.5 hidden truncate text-[10px] text-white/80 lg:block">{item.clientName}</span>
      </span>
    </Link>
  );
}

export function ReelsPreviewCard({ items, layout, className }: ReelsPreviewCardProps) {
  const previews = items.slice(0, 3);
  if (previews.length === 0) return null;

  return (
    <section
      aria-labelledby={`reels-preview-heading-${layout}`}
      className={cn(
        "overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-[0_10px_30px_-22px_rgba(14,6,90,0.45)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 sm:gap-3 sm:px-4 sm:pb-3 sm:pt-4">
        <div className="flex min-w-0 items-start gap-1.5">
          <IconPlay className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0">
            <h2 id={`reels-preview-heading-${layout}`} className="whitespace-nowrap text-sm font-bold text-foreground lg:text-base">طلة جديدة</h2>
            <p className="mt-0.5 hidden whitespace-nowrap text-xs text-muted-foreground lg:block">أفكار سريعة من الشركاء</p>
          </div>
        </div>
        <ModontySectionLink href="/reels" label="كل الطلات" />
      </div>
      <div className={cn("flex gap-2 overflow-x-auto px-3 pb-2.5 scrollbar-none sm:px-4 sm:pb-4", previews.length === 1 && "justify-center")} dir="rtl">
        {previews.map((item) => (
          <ReelPreviewTile key={item.id} item={item} layout={layout} itemCount={previews.length} />
        ))}
      </div>
    </section>
  );
}
