import Image from "next/image";
import Link from "@/components/link";

import { highlightQuery } from "@/lib/highlight-query";
import { IconArticle, IconViews, IconCheck } from "@/lib/icons";
import { stripCloudinaryTransforms } from "@/lib/image-utils";
import { formatMetric } from "../helpers/format-metrics";

interface ClientCardProps {
  id: string;
  name: string;
  slug: string;
  legalName?: string;
  description?: string;
  industry?: { name: string; slug: string };
  logo?: string;
  /** Partner cover/hero image — the card banner. Falls back to a brand gradient. */
  ogImage?: string;
  articleCount: number;
  viewsCount: number;
  subscribersCount: number;
  commentsCount: number;
  likesCount: number;
  dislikesCount: number;
  favoritesCount: number;
  subscriptionTier?: string;
  isVerified: boolean;
  /** Featured/premium partner (annual) — adds the gold spotlight ribbon. */
  isFeatured?: boolean;
  url?: string;
  ctaMode?: "NONE" | "FORM" | "LINK" | null;
  ctaLabel?: string;
  ctaUrl?: string;
  /** When set, highlights this query in the name (search results). */
  highlightQuery?: string;
  /** GA4 total (pageViews+sessions+users+events) — shown as "تفاعلات". */
  ga4Total?: number;
}

export function ClientCard(props: ClientCardProps) {
  const displayViews = props.ga4Total ?? props.viewsCount;
  const viewsLabel  = props.ga4Total !== undefined ? "تفاعلات" : "مشاهدة";
  const initials = props.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const q = props.highlightQuery;
  const nameContent = q ? highlightQuery(props.name, q) : props.name;
  const cover = props.ogImage ? stripCloudinaryTransforms(props.ogImage) ?? props.ogImage : null;
  const logo = props.logo ? stripCloudinaryTransforms(props.logo) ?? props.logo : null;
  const location = props.industry?.name;

  return (
    <Link
      href={`/clients/${encodeURIComponent(props.slug)}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <article className="relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_12px_26px_rgba(0,0,0,0.1)]">
        {/* Banner — partner cover image, or a brand gradient fallback */}
        <div className="relative h-[92px] overflow-hidden bg-gradient-to-br from-foreground to-primary">
          {cover && (
            <Image src={cover} alt="" fill sizes="(max-width: 768px) 100vw, 380px" className="object-cover" />
          )}
          {props.isFeatured && (
            <span className="absolute top-2.5 start-2.5 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10.5px] font-black text-amber-950 shadow-sm">
              ⭐ مميّز
            </span>
          )}
        </div>

        {/* Logo — overlapping the banner edge (neutral frame + verified mark) */}
        <div className="absolute top-[62px] end-4 z-[2] grid h-[58px] w-[58px] place-items-center overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_4px_12px_rgba(0,0,0,0.14),0_0_0_3px_#fff]">
          {logo ? (
            <Image src={logo} alt={props.name} fill className="object-contain p-1.5" sizes="58px" />
          ) : (
            <span className="text-lg font-black text-primary">{initials}</span>
          )}
          <span
            className="absolute -bottom-1 -start-1 grid h-[18px] w-[18px] place-items-center rounded-full border-2 border-card bg-accent text-white"
            aria-label="موثّق من مدوّنتي"
          >
            <IconCheck className="h-2.5 w-2.5" />
          </span>
        </div>

        {/* Body */}
        <div className="px-4 pb-4 pt-8">
          <h3 className="line-clamp-1 text-base font-black leading-tight text-foreground transition-colors group-hover:text-primary">
            {nameContent}
          </h3>
          {location && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{location}</p>}

          <div className="mt-3 flex gap-4 border-t border-border pt-3 text-[12.5px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <IconArticle className="h-3.5 w-3.5" />
              <b className="font-black text-foreground">{formatMetric(props.articleCount)}</b> مقالات
            </span>
            <span className="flex items-center gap-1.5">
              {props.ga4Total !== undefined ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" aria-label="Google Analytics">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              ) : (
                <IconViews className="h-3.5 w-3.5" />
              )}
              {displayViews === 0 ? (
                <span>لا توجد</span>
              ) : (
                <>
                  <b className="font-black text-foreground">{formatMetric(displayViews)}</b> {viewsLabel}
                </>
              )}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-[10px] bg-primary/[0.08] py-2 text-[13px] font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            زيارة الصفحة <span aria-hidden="true">←</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
