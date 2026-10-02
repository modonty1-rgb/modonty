import { OptimizedImage, asMedia } from "../../../optimized-image";
import { ModontyPlayMark } from "../../../icons/modonty-play-mark";
import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";

/** Home shows one row on desktop; the reels page shows them all. */
export const HOME_REELS_LIMIT = 4;

/**
 * «الريلز» — the partner's short videos as portrait tiles, each a real `<a href>` to its watch
 * page (plan item د١, 2 Oct 2026).
 *
 * Measured in Search Console: 11 of 23 reels were not indexed, and every one of them had zero
 * pages linking to it — the homepage only ever links the latest 4. Google crawls a link «only
 * if it's an `<a>` HTML element with an `href` attribute», so each reel needs one from a page
 * that stays put: its partner's page.
 */
export function ReelsGrid({ data, all = false }: { data: HomeData; preview?: boolean; all?: boolean }) {
  const reels = all ? data.reels : data.reels.slice(0, HOME_REELS_LIMIT);
  return (
    <Section id="reels" eyebrow="فيديوهات قصيرة" heading={`ريلز ${data.name}`} tone="plain">
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {reels.map((r) => (
          <li key={r.href}>
            <a href={r.href} className="group block">
              <span className="relative block aspect-[9/16] overflow-hidden rounded-lg bg-muted">
                {r.imageUrl && (
                  <OptimizedImage
                    media={asMedia(r.imageUrl, r.title)}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 260px, 45vw"
                    className="object-cover transition-transform group-hover:scale-[1.02]"
                  />
                )}
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-11 place-items-center rounded-full bg-black/55 text-white">
                    <ModontyPlayMark className="size-5" aria-hidden />
                  </span>
                </span>
              </span>
              <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-foreground">{r.title}</h3>
            </a>
          </li>
        ))}
      </ul>
      {!all && data.reels.length > HOME_REELS_LIMIT && (
        <a
          href={data.reelsHref ?? "#"}
          className="mt-8 inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          كل الريلز
        </a>
      )}
    </Section>
  );
}
