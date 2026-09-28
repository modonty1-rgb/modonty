import { Suspense } from "react";

import { messages } from "@/lib/i18n/messages";

import { SectorAlertBody } from "../../../components/sector-alert/SectorAlertBody";
import { SectorHeroBanner, heroLineClass as lineClass } from "../../../components/sector-hero/SectorHeroBanner";
import type { SectorHero } from "../../../data/get-sector-hero";

const t = messages.modonty.football.alerts;

/**
 * The page's dominant element on days without a match (Khalid, 27 Sep 2026: the old empty-state
 * card was «مو ملفت» — it wasted the best spot on the page). Image, headline and line come from the
 * admin (Modonty › Sectors); the text is live HTML over the image, never baked into it. The desktop
 * image leaves its right half calm for the text, the phone image its top half.
 */
export function PromoHero({ hero }: { hero: SectorHero }) {
  const title = hero.title || t.guestTitle;
  const subtitle = hero.subtitle || t.guestBody;

  return (
    <SectorHeroBanner hero={hero} headingId="football-promo" title={title}>
      <Suspense
        fallback={
          <>
            <p className={lineClass}>{subtitle}</p>
            <span aria-hidden className="mt-5 block h-11 w-40 animate-pulse rounded-lg bg-white/15" />
          </>
        }
      >
        <SectorAlertBody topic="football" path="/modonty/football" guestLine={subtitle} memberLine={t.memberBody} onLine={t.onBody} />
      </Suspense>
    </SectorHeroBanner>
  );
}
