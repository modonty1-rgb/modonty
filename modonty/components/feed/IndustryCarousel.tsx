"use client";

import { useRef } from "react";
import { OptimizedImage, asMedia } from "@modonty/database/components/optimized-image";
import Link from "@/components/link";
import { ModontySectionLink } from "@/components/feed/ModontySectionLink";
import { IconChevronLeft, IconChevronRight, IconIndustry } from "@/lib/icons";
import { stripCloudinaryTransforms } from "@/lib/image-utils";

interface IndustryPreview {
  id: string;
  name: string;
  slug: string;
  clientCount: number;
  socialImage?: string | null;
}

interface IndustryCarouselProps {
  industries: IndustryPreview[];
}

export function IndustryCarousel({ industries }: IndustryCarouselProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const slides = [...industries]
    .filter((industry) => industry.clientCount > 0)
    .sort((first, second) => second.clientCount - first.clientCount)
    .slice(0, 8);

  if (slides.length === 0) return null;

  const moveRail = (direction: 1 | -1) => {
    railRef.current?.scrollBy({ left: direction * railRef.current.clientWidth * 0.82, behavior: "smooth" });
  };

  return (
    <section aria-labelledby="industries-heading" className="overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-[0_10px_30px_-22px_rgba(14,6,90,0.45)]">
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 sm:gap-3 sm:px-5 sm:pb-3 sm:pt-4">
        <div>
          <h2 id="industries-heading" className="text-base font-bold text-foreground">استكشف المجالات</h2>
          <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">اختر المجال الأقرب لاحتياجك</p>
        </div>
        <ModontySectionLink href="/industries" label="كل المجالات" />
      </div>

      <div className="relative">
        <div ref={railRef} className="flex snap-x snap-proximity gap-2 overflow-x-auto px-3 pb-2.5 scrollbar-none sm:gap-3 sm:px-5 sm:pb-4" dir="rtl">
          {slides.map((industry) => {
            const image = stripCloudinaryTransforms(industry.socialImage);
            return (
              <Link
                key={industry.id}
                href={`/industries/${encodeURIComponent(industry.slug)}`}
                className="group relative isolate aspect-[3/2] w-[clamp(5.75rem,29vw,7rem)] shrink-0 snap-start overflow-hidden rounded-xl bg-primary text-white sm:aspect-[4/3] sm:w-[clamp(9rem,24vw,10.5rem)] lg:w-[calc((100%-1.5rem)/3)]"
              >
                {image ? (
                  <OptimizedImage media={asMedia(image, industry.name)} alt="" fill sizes="(min-width: 1024px) 175px, (min-width: 640px) 168px, 112px" quality={75} loading="lazy" className="object-cover transition-transform duration-300 sm:group-hover:scale-105" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary to-secondary"><IconIndustry className="h-8 w-8" aria-hidden /></span>
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" aria-hidden />
                <span className="absolute end-2 top-2 rounded-full bg-background/90 px-1.5 py-0.5 text-[9px] font-semibold text-primary">{industry.clientCount.toLocaleString("ar-SA")} شريك</span>
                <span className="absolute inset-x-2.5 bottom-2.5 line-clamp-2 text-xs font-bold leading-snug drop-shadow-sm sm:inset-x-3 sm:bottom-3 sm:text-base">{industry.name}</span>
              </Link>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center bg-gradient-to-r from-card via-card/70 to-transparent px-1" dir="ltr">
          <button type="button" onClick={() => moveRail(1)} className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/95 text-primary shadow-sm sm:hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="المجالات التالية"><IconChevronRight className="h-4 w-4" aria-hidden /></button>
        </div>
        <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center bg-gradient-to-l from-card via-card/70 to-transparent px-1" dir="ltr">
          <button type="button" onClick={() => moveRail(-1)} className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/95 text-primary shadow-sm sm:hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="المجالات السابقة"><IconChevronLeft className="h-4 w-4" aria-hidden /></button>
        </div>
      </div>
    </section>
  );
}
