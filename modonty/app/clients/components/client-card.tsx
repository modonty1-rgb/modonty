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
}

export function ClientCard(props: ClientCardProps) {
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
              <IconViews className="h-3.5 w-3.5" />
              {props.viewsCount === 0 ? (
                <span>لا توجد</span>
              ) : (
                <>
                  <b className="font-black text-foreground">{formatMetric(props.viewsCount)}</b> مشاهدة
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
