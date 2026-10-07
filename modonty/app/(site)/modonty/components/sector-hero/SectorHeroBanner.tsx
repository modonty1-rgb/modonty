import Image from "next/image";
import type { ReactNode } from "react";

import type { SectorHero } from "../../data/get-sector-hero";
import { blurOf } from "../../helpers/blur-of";

/** The line under the headline, the same on every sector's banner. */
export const heroLineClass = "mt-2 max-w-md text-sm text-white/85 md:text-base";

/**
 * A sector page's banner: the admin's two images behind live HTML text — never baked into the
 * image (Khalid, 27 Sep 2026). The desktop image leaves its right half calm for the text, the phone
 * image its top half. What goes under the headline is the page's own: football streams its alert
 * buttons, a sector without actions passes its line.
 */
export function SectorHeroBanner({ hero, headingId, title, children }: { hero: SectorHero; headingId: string; title: string; children: ReactNode }) {
  // The tall box is room for the image's subject; with no image yet it was 420px of empty navy on a phone.
  const tall = hero.mobile || hero.desktop ? "min-h-[420px] md:min-h-[300px]" : "";
  return (
    <section aria-labelledby={headingId} className="relative isolate overflow-hidden rounded-xl bg-brand-navy text-white">
      {/* The phone image is square; the box is taller (420, room for the text). Filling the box with
          `object-cover` cut the image's sides — 62px each side at 320 (Khalid, 28 Sep 2026: «مقصوصة»).
          So it sits whole at the bottom, full width, and its top edge fades into the navy above. */}
      {hero.mobile && (
        <div className="absolute inset-x-0 bottom-0 -z-10 aspect-square [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_18%)] [mask-image:linear-gradient(to_bottom,transparent,black_18%)] md:hidden">
          <Image src={hero.mobile.src} alt={hero.mobile.alt} fill priority sizes="100vw" {...blurOf(hero.mobile)} className="object-cover" />
        </div>
      )}
      {/* 864 = the main column at 1280 (measured 27 Sep 2026); 800 made the browser fetch a smaller file than it paints. */}
      {hero.desktop && (
        <Image src={hero.desktop.src} alt={hero.desktop.alt} fill priority sizes="(min-width: 768px) 864px, 1px" {...blurOf(hero.desktop)} className="-z-10 hidden object-cover md:block" />
      )}
      {/* 420 on phones, not 340: at 340 the two stacked buttons sat on the ball and the scoreboard
          (measured at 320px, 27 Sep 2026) — the image's subject needs its own strip under them. */}
      <div className={`flex flex-col justify-start p-6 md:w-1/2 md:justify-center md:p-8 ${tall}`}>
        <h2 id={headingId} className="text-2xl font-bold leading-tight md:text-3xl">{title}</h2>
        {children}
      </div>
    </section>
  );
}
