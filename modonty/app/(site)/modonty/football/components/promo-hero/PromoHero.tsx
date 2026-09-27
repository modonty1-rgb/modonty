import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { messages } from "@/lib/i18n/messages";
import { IconCheck } from "@/lib/icons";

import type { SectorHero } from "../../data/get-sector-hero";
import { enableFootballAlert } from "../../actions";
import { LOGIN_FOR_ALERT, REGISTER_FOR_ALERT } from "../../helpers/alert-links";
import { getAlertState } from "../../helpers/get-alert-state";
import { NotifyButton } from "../notify-button/NotifyButton";

const t = messages.modonty.football.alerts;

const blurOf = (img: { blur: string | null }) => (img.blur ? { placeholder: "blur" as const, blurDataURL: img.blur } : {});

const lineClass = "mt-2 max-w-md text-sm text-white/85 md:text-base";

/**
 * The line and buttons for this reader — read per request, so they stream in under the static
 * title. The admin's line speaks to visitors; a signed-in reader gets one «نبّهني», and one who has
 * agreed sees «أنت معنا» with nothing left to press (Khalid, 27 Sep 2026: «ليه التعقيد»).
 */
async function HeroBody({ guestLine }: { guestLine: string }) {
  const state = await getAlertState();
  const primary = "inline-flex h-11 items-center rounded-lg bg-white px-6 text-base font-bold text-brand-navy hover:bg-white/90";

  if (state.kind === "guest") {
    return (
      <>
        <p className={lineClass}>{guestLine}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href={REGISTER_FOR_ALERT} className={primary}>{t.register}</Link>
          <Link href={LOGIN_FOR_ALERT} className="inline-flex h-11 items-center rounded-lg px-4 text-base font-medium text-white ring-1 ring-white/40 hover:bg-white/10">
            {t.login}
          </Link>
        </div>
      </>
    );
  }
  if (state.kind === "member") {
    return (
      <>
        <p className={lineClass}>{t.memberBody}</p>
        <form action={enableFootballAlert} className="mt-5">
          <NotifyButton label={t.notify} className={primary} />
        </form>
      </>
    );
  }
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-white">
      <IconCheck className="size-6 shrink-0 text-brand-teal" aria-hidden />
      <span className="text-lg font-bold">{t.onTitle}</span>
      <span className="text-sm text-white/85 md:text-base">{t.onBody}</span>
    </p>
  );
}

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
    <section aria-labelledby="football-promo" className="relative isolate overflow-hidden rounded-xl bg-brand-navy text-white">
      {hero.mobile && (
        <Image src={hero.mobile.src} alt={hero.mobile.alt} fill priority sizes="100vw" {...blurOf(hero.mobile)} className="-z-10 object-cover md:hidden" />
      )}
      {/* 864 = the main column at 1280 (measured 27 Sep 2026); 800 made the browser fetch a smaller file than it paints. */}
      {hero.desktop && (
        <Image src={hero.desktop.src} alt={hero.desktop.alt} fill priority sizes="(min-width: 768px) 864px, 1px" {...blurOf(hero.desktop)} className="-z-10 hidden object-cover md:block" />
      )}
      {/* 420 on phones, not 340: at 340 the two stacked buttons sat on the ball and the scoreboard
          (measured at 320px, 27 Sep 2026) — the image's subject needs its own strip under them. */}
      <div className="flex min-h-[420px] flex-col justify-start p-6 md:min-h-[300px] md:w-1/2 md:justify-center md:p-8">
        <h2 id="football-promo" className="text-2xl font-bold leading-tight md:text-3xl">{title}</h2>
        <Suspense
          fallback={
            <>
              <p className={lineClass}>{subtitle}</p>
              <span aria-hidden className="mt-5 block h-11 w-40 animate-pulse rounded-lg bg-white/15" />
            </>
          }
        >
          <HeroBody guestLine={subtitle} />
        </Suspense>
      </div>
    </section>
  );
}
