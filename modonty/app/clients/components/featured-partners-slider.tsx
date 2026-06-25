"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "@/components/link";

import { IconCheck, IconChevronRight, IconChevronLeft } from "@/lib/icons";
import { stripCloudinaryTransforms } from "@/lib/image-utils";

export interface FeaturedPartner {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  ogImage?: string;
  industry?: { name: string };
  isVerified: boolean;
  /** Published article count — when 0, the slide gets a "قريباً" badge. */
  articleCount?: number;
}

interface FeaturedPartnersSliderProps {
  partners: FeaturedPartner[];
}

/**
 * /clients hero — a full-bleed SLIDER (one slide at a time, arrows + dots + autoplay)
 * showing ONLY featured/premium partners (isFeatured = annual subscribers). The cover
 * image fills the whole hero. When there are no featured partners yet, a branded
 * invite band is shown instead.
 */
export function FeaturedPartnersSlider({ partners }: FeaturedPartnersSliderProps) {
  const count = partners.length;
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const play = useCallback(() => {
    stop();
    if (count > 1) timer.current = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
  }, [count, stop]);

  useEffect(() => {
    play();
    return stop;
  }, [play, stop]);

  const go = (i: number) => {
    setIndex(((i % count) + count) % count);
    play();
  };

  // No featured partners yet — branded invite (soft upsell), never a broken/empty band.
  if (count === 0) {
    return (
      <section
        aria-label="الشركاء المميّزون"
        className="relative w-full overflow-hidden bg-gradient-to-br from-foreground to-[#1c1a8a] text-white"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(600px 240px at 85% -10%,hsl(var(--accent)/.22),transparent 60%)" }}
        />
        <div className="relative mx-auto flex max-w-[1128px] flex-col items-center justify-center px-4 py-12 text-center sm:py-16">
          <span className="text-3xl sm:text-4xl">⭐</span>
          <h2 className="mt-3 text-xl font-black sm:text-2xl">كن شريكنا المميّز</h2>
          <p className="mt-2 max-w-md text-sm text-white/80 sm:text-base">
            اشترك سنوياً لتتصدّر علامتك هذه المساحة أمام آلاف الزوار في صدارة الشركاء.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="الشركاء المميّزون" className="relative w-full overflow-hidden bg-foreground">
      <div className="relative" onMouseEnter={stop} onMouseLeave={play}>
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="السابق"
              className="absolute start-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/70 sm:grid lg:start-6"
            >
              <IconChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="التالي"
              className="absolute end-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/70 sm:grid lg:end-6"
            >
              <IconChevronLeft className="h-5 w-5" />
            </button>
          </>
        )}

        <div className="overflow-hidden">
          {/* RTL: positive translateX reveals later slides (they sit to the left) */}
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(${index * 100}%)` }}
          >
            {partners.map((p, i) => (
              <PartnerSlide key={p.id} partner={p} priority={i === 0} />
            ))}
          </div>
        </div>

        {count > 1 && (
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
            {partners.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`الانتقال إلى ${p.name}`}
                className={`h-2 rounded-full transition-all ${i === index ? "w-5 bg-amber-400" : "w-2 bg-white/45"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PartnerSlide({ partner, priority }: { partner: FeaturedPartner; priority: boolean }) {
  const cover = partner.ogImage ? stripCloudinaryTransforms(partner.ogImage) ?? partner.ogImage : null;
  const logo = partner.logo ? stripCloudinaryTransforms(partner.logo) ?? partner.logo : null;

  return (
    <Link
      href={`/clients/${encodeURIComponent(partner.slug)}`}
      // Box follows the 6:1 Client-Cover spec → object-cover fills it with NO crop on desktop;
      // min-h keeps it usable on phones (center stays visible — the spec keeps content centered).
      className="relative block aspect-[6/1] min-h-[170px] w-full flex-[0_0_100%] overflow-hidden"
    >
      {cover ? (
        <Image src={cover} alt="" fill priority={priority} sizes="100vw" className="object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-foreground to-[#1c1a8a]" />
      )}
      {/* scrim — keeps the bottom caption legible over any cover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      <span className="absolute top-3.5 start-4 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-[11.5px] font-black text-amber-950 shadow sm:top-4 sm:start-6">
        ⭐ شريك مميّز
      </span>

      {partner.articleCount === 0 && (
        <span className="absolute top-3.5 end-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-[11.5px] font-black text-white shadow ring-1 ring-white/30 sm:top-4 sm:end-6">
          ✨ قريباً
        </span>
      )}

      {/* caption — constrained to the page width, anchored bottom-start */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto flex max-w-[1128px] items-end gap-3.5 px-4 pb-4 sm:pb-5">
          <div className="relative grid h-14 w-14 flex-shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/70 bg-white shadow-lg sm:h-16 sm:w-16">
            {logo ? (
              <Image src={logo} alt={partner.name} fill className="object-contain p-1.5" sizes="64px" />
            ) : (
              <span className="text-xl font-black text-primary">{partner.name.slice(0, 2)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-2 text-lg font-black text-white drop-shadow sm:text-xl lg:text-2xl">
              <span className="truncate">{partner.name}</span>
              {partner.isVerified && (
                <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-accent text-white">
                  <IconCheck className="h-3 w-3" />
                </span>
              )}
            </h3>
            {partner.industry && (
              <span className="mt-1.5 inline-flex rounded-full border border-white/25 bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
                {partner.industry.name}
              </span>
            )}
          </div>
          <span className="hidden flex-shrink-0 rounded-xl border border-white/40 bg-white/15 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm sm:inline-block">
            زيارة الصفحة
          </span>
        </div>
      </div>
    </Link>
  );
}
