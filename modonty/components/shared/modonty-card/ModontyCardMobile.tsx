import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { IconArticle, IconPlay, IconVolume2 } from "@/lib/icons";

import type { FeedPost } from "@/lib/types";

interface ModontyCardMobileProps {
  articles: FeedPost[];
  brandLogoUrl: string | null;
}

interface MobilePublisherBrandProps {
  brandLogoUrl: string | null;
}

function MobilePublisherBrand({ brandLogoUrl }: MobilePublisherBrandProps) {
  if (!brandLogoUrl) return <span className="text-[11px] font-normal text-link">مدونتي</span>;

  return <OptimizedImage media={asMedia(brandLogoUrl, "مدونتي")} alt="مدونتي" width={56} height={16} sizes="56px" className="h-4 w-14 object-contain" />;
}

export function ModontyCardMobile({ articles, brandLogoUrl }: ModontyCardMobileProps) {
  const article = articles.find((item): item is FeedPost & { image: string } => typeof item.image === "string");
  if (!article) return null;

  return (
    <section
      aria-label="من مدونتي"
      className="relative overflow-hidden rounded-lg rounded-bl-none rounded-tr-none bg-card before:pointer-events-none before:absolute before:bottom-0 before:end-0 before:z-10 before:size-[clamp(7rem,38vw,10rem)] before:border-b-2 before:border-e-2 before:border-accent after:pointer-events-none after:absolute after:start-0 after:top-0 after:z-10 after:size-[clamp(7rem,38vw,10rem)] after:border-s after:border-t after:border-accent"
    >
      <header className="flex h-11 items-center gap-1 px-3">
        <MobilePublisherBrand brandLogoUrl={brandLogoUrl} />
        <nav aria-label="محتوى مدونتي" className="flex min-w-0 flex-1 items-center justify-end gap-0.5">
          <Link href="/" aria-current="page" className="inline-flex min-h-8 items-center gap-1 rounded-full bg-primary/[0.08] px-1.5 text-[10px] font-normal text-link">
            <IconArticle className="size-3.5" aria-hidden /> مقالات
          </Link>
          <Link href="/audio" className="inline-flex min-h-8 items-center gap-1 rounded-full px-1.5 text-[10px] font-normal text-muted-foreground">
            <IconVolume2 className="size-3.5" aria-hidden /> استمع
          </Link>
          <Link href="/reels" className="inline-flex min-h-8 items-center gap-1 rounded-full px-1.5 text-[10px] font-normal text-muted-foreground">
            <IconPlay className="size-3.5" aria-hidden /> لقطات
          </Link>
        </nav>
      </header>
      <Link href={`/articles/${encodeURIComponent(article.slug)}`} aria-label={`مقال من مدونتي: ${article.title}`} className="relative block aspect-video overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
        {/* Mobile LCP element (Next flagged it lazy in the console). eager + high per the
            Next 16 image docs. `sizes` says 1px from lg up because the card is `lg:hidden`
            there — desktop then fetches the smallest candidate (16w) instead of a full-width
            one. Written as a px ladder (lower bounds), not `100vw`: any vw in `sizes` makes
            Next drop every srcset candidate below 640w (get-img-props getWidths), which
            would defeat the 1px. From md the column is capped at 600px (PageLayout). */}
        <OptimizedImage media={asMedia(article.image, article.title, article.imageBlur)} alt={article.title} fill sizes="(min-width: 1024px) 1px, (min-width: 768px) 600px, (min-width: 640px) 640px, (min-width: 480px) 480px, (min-width: 430px) 430px, (min-width: 414px) 414px, (min-width: 390px) 390px, (min-width: 375px) 375px, 360px" loading="eager" fetchPriority="high" className="object-cover" />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent px-4 pb-4 pt-16">
          <span className="line-clamp-2 block text-[clamp(0.9375rem,4vw,1.125rem)] font-medium leading-[clamp(1.375rem,5.5vw,1.625rem)] text-white">{article.title}</span>
        </span>
      </Link>
    </section>
  );
}
