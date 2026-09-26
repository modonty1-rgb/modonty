import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";

import { MobileCtaBar } from "@/components/shared/mobile-cta-bar/MobileCtaBar";
import { FollowCtaButton } from "@/components/shared/mobile-cta-bar/FollowCtaButton";
import { LOGO_URL, PARTNER_SIGNUP_URL } from "@/constants";
import { messages } from "@/lib/i18n/messages";
import { IconCompass, IconGrowth, IconHandshake, IconIdea } from "@/lib/icons";

import type { MobileHero } from "../../data/get-modonty-mobile-hero";

/**
 * `/modonty` on phones, after Khalid's design (26 Sep 2026): hero art · wordmark · «كل اللي
 * يهمك… في مكان واحد» · the one-line promise · the three values · the follow / partner pair —
 * then the page's own 3×3 doors. Phones only (`lg:hidden`); the desktop keeps its profile hero
 * and breadcrumb untouched.
 *
 * The site header and bottom bar are NOT part of this design — they are fixed site-wide
 * (Khalid, same day: «النافبار والبوتوم بار حاجات ثابتة ما نقدر نلعب فيها»), so the design's
 * own header and in-page search were left out.
 */
export function ModontyMobileLanding({ hero }: { hero: MobileHero | null }) {
  const t = messages.modonty.landing;
  const values = [
    { icon: IconCompass, label: t.discover },
    { icon: IconIdea, label: t.learn },
    { icon: IconGrowth, label: t.grow },
  ];

  return (
    <div className="relative isolate -mx-3 px-3 pb-1 pt-2 text-center sm:-mx-4 sm:px-4 lg:hidden">
      {/* A soft brand wash behind the block — tokens only, so dark mode follows. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_55%_at_50%_18%,hsl(var(--primary)/0.10),transparent_70%),radial-gradient(45%_35%_at_12%_62%,hsl(var(--accent)/0.12),transparent_70%)]"
      />

      {/* From the media library (`Client.mobileHeroImageMedia`), else the client's regular cover.
          Each at its own shape: the phone art is drawn 2:1 and floats (transparent), the cover
          is the desktop's 6:1 band, so it keeps that ratio and gets rounded corners rather than
          being cropped into a box it was never made for. Nothing at all when neither exists. */}
      {hero ? (
        <div
          className={
            hero.kind === "mobile"
              ? "relative mx-auto mb-2 aspect-[2/1] w-full max-w-sm"
              : "relative mx-auto mb-4 aspect-[6/1] w-full overflow-hidden rounded-xl"
          }
        >
          {/* Blur from the row while it loads · `1px` at lg+, where this block is display:none but
              an eager <img> would still download (same trick as PostCardHeroImage). No `vw` term:
              one makes Next drop every srcset step under 640w, so desktop still fetched a 640w copy. */}
          <OptimizedImage
            media={asMedia(hero.src, hero.alt, hero.blur)}
            alt={hero.alt}
            fill
            sizes="(min-width: 1024px) 1px, 384px"
            preload
            className={hero.kind === "mobile" ? "object-contain" : "object-cover"}
          />
        </div>
      ) : null}

      <div className="relative mx-auto h-7 w-36">
        <OptimizedImage media={asMedia(LOGO_URL)} alt="مدونتي" fill sizes="160px" className="object-contain" />
      </div>

      {/* The page's h1 on phones; the desktop h1 lives in the profile hero, hidden here. */}
      <h1 className="mt-3 text-balance text-[clamp(1.25rem,1rem+1.6vw,1.5rem)] font-black leading-tight text-foreground">
        {t.headline} <span className="text-link-accent">{t.headlineAccent}</span>
      </h1>
      <p className="mx-auto mt-1.5 max-w-xs text-balance text-sm leading-relaxed text-muted-foreground">{t.sub}</p>

      <ul
        aria-label={t.valuesLabel}
        className="mx-auto mt-4 flex w-fit items-center divide-x divide-border rounded-full bg-card/80 px-2 py-1.5 ring-1 ring-border rtl:divide-x-reverse"
      >
        {values.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-1.5 px-3 text-sm font-bold text-foreground">
            <Icon className="size-5 text-foreground" aria-hidden />
            {label}
          </li>
        ))}
      </ul>

      {/* No search box here: the design had one because its header had none, but the site
          header is fixed and already carries search (Khalid, 26 Sep 2026: «النافبار والبوتوم
          بار حاجات ثابتة») — a second box on the same screen would be a duplicate. */}
      <div className="mt-4">
        <MobileCtaBar
          placement="inline"
          ariaLabel={messages.modonty.ctaBarLabel}
          primarySlot={<FollowCtaButton />}
          secondary={{ href: PARTNER_SIGNUP_URL, label: "صِر شريكاً", icon: IconHandshake, external: true }}
        />
      </div>
    </div>
  );
}
