import { SiteLink } from "../../parts/site-link";
import { OptimizedImage, asMedia } from "../../../optimized-image";
import { ModontyPlayMark } from "../../../icons/modonty-play-mark";
import { Section } from "../home/parts/section";
import { ViewAllLink } from "../home/parts/view-all-link";
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
    <Section id="reels" eyebrow="فيديوهات قصيرة" heading="أحدث الريلز" tone="plain">
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {reels.map((r, i) => (
          <li key={r.href}>
            {/* An untitled reel was a link with no name at all — the image is decorative and the
                <h3> empty (4 Oct 2026). The label falls back to the partner and the position. */}
            <SiteLink href={r.href} aria-label={r.title?.trim() ? undefined : `ريل ${i + 1} من ${data.name}`} className="group block">
              <span className="relative block aspect-[9/16] overflow-hidden rounded-[var(--ps-radius-card,0.5rem)] bg-muted">
                {r.imageUrl && (
                  <OptimizedImage
                    media={asMedia(r.imageUrl, r.title)}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 260px, 45vw"
                    className="object-cover motion-safe:transition-transform motion-safe:group-hover:scale-[1.02]"
                  />
                )}
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-11 place-items-center rounded-full bg-black/55 text-white">
                    <ModontyPlayMark className="size-5" aria-hidden />
                  </span>
                </span>
              </span>
              {r.title?.trim() && <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-foreground">{r.title}</h3>}
            </SiteLink>
          </li>
        ))}
      </ul>
      {/* No page to go to → no button. `?? "#"` printed a link that went nowhere. */}
      {!all && <ViewAllLink href={data.reelsHref} label="كل الريلز" shown={reels.length} total={data.reels.length} />}
    </Section>
  );
}
