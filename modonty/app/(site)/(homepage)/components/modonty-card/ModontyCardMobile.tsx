import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { buttonVariants } from "@/components/ui/button";
import { ModontyTrustMark } from "@/components/icons/modonty-trust-mark";
import { IconChevronLeft } from "@/lib/icons";

import type { FeedPost } from "@/lib/types";

interface ModontyCardMobileProps {
  articles: FeedPost[];
  brandLogoUrl: string | null;
}

interface MobilePublisherBrandProps {
  brandLogoUrl: string | null;
}

function MobilePublisherBrand({ brandLogoUrl }: MobilePublisherBrandProps) {
  if (!brandLogoUrl) return <span className="text-xs font-bold text-link">مدونتي</span>;

  return <OptimizedImage media={asMedia(brandLogoUrl, "مدونتي")} alt="مدونتي" width={56} height={16} sizes="56px" className="h-4 w-14 object-contain" />;
}

export function ModontyCardMobile({ articles, brandLogoUrl }: ModontyCardMobileProps) {
  const article = articles.find((item): item is FeedPost & { image: string } => typeof item.image === "string");
  if (!article) return null;

  const readingTime = article.readingTimeMinutes?.toLocaleString("ar-SA");

  return (
    <section
      aria-labelledby="modonty-publisher-heading"
      className="overflow-hidden rounded-lg border border-border/70 border-t-2 border-t-accent/80 bg-card"
    >
      <header className="flex min-h-11 items-center gap-2 border-b border-border/70 px-2">
        <Link
          href="/modonty"
          prefetch={false}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg px-1 transition-colors active:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <MobilePublisherBrand brandLogoUrl={brandLogoUrl} />
          <span id="modonty-publisher-heading" className="inline-flex min-w-0 items-center gap-1 text-xs font-bold text-foreground">
            <ModontyTrustMark className="size-4 shrink-0" />
            <span className="truncate">المحتوى الرسمي</span>
          </span>
        </Link>

        <Link
          href="/modonty"
          prefetch={false}
          className={buttonVariants({
            variant: "navigation",
            size: "mobileDefault",
            className: "gap-1 px-2 text-xs",
          })}
        >
          عرض الكل
          <IconChevronLeft aria-hidden />
        </Link>
      </header>

      <Link
        href={`/articles/${encodeURIComponent(article.slug)}`}
        prefetch={false}
        className="block p-2 transition-colors active:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <span className="relative block h-[clamp(8rem,38vw,9rem)] overflow-hidden rounded-lg bg-muted">
          {/* The artwork comes from the server unchanged. `object-contain` keeps the full
              composition visible inside the compact mobile preview instead of cropping it. */}
          <OptimizedImage media={asMedia(article.image, article.title, article.imageBlur)} alt="" fill sizes="(min-width: 1024px) 1px, (min-width: 768px) 600px, (min-width: 640px) 640px, (min-width: 480px) 480px, (min-width: 430px) 430px, (min-width: 414px) 414px, (min-width: 390px) 390px, (min-width: 375px) 375px, 360px" loading="eager" fetchPriority="high" className="object-contain" />
        </span>

        <span className="flex flex-col gap-1 px-1 pb-1 pt-2.5">
          <span className="line-clamp-2 text-sm font-bold leading-5 text-foreground">
            {article.title}
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            مقال رسمي{readingTime ? ` · ${readingTime} دقائق` : ""}
          </span>
        </span>
      </Link>
    </section>
  );
}
