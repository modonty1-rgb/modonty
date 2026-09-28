import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { fill, messages } from "@/lib/i18n/messages";

import type { FreeCourse } from "../../data/get-free-courses";

const t = messages.modonty.education.freeLearning;
const N = new Intl.NumberFormat(SITE_LOCALE, { maximumFractionDigits: 1 });

/** «ساعة ونص» said as a number: under an hour in minutes, otherwise in hours. */
const duration = (minutes: number) => (minutes < 60 ? fill(t.minutes, { n: N.format(minutes) }) : fill(t.hours, { n: N.format(Math.round(minutes / 30) / 2) }));

/**
 * «تعلّم مجاناً» (Khalid, 28 Sep 2026: platforms like Google give free courses and certificates —
 * «فكر من الزاوية هذه»). Microsoft Learn's Arabic paths come live from its catalog API; the other
 * big companies' free academies and the Saudi and Arab platforms have no API, so they are links to
 * their own sites (Khalid: «روابطها تكون صحيحه»). `courses` is null when the catalog could not be
 * reached — the platforms still show.
 */
export function FreeLearningCard({ courses }: { courses: FreeCourse[] | null }) {
  const link = "text-xs font-semibold text-link underline-offset-2 hover:underline";
  return (
    <section aria-labelledby="free-learning" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="free-learning" className="text-lg font-bold">
        {t.title}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{t.note}</p>

      {courses && courses.length > 0 && (
        <>
          <h3 className="mt-4 text-sm font-bold">{t.microsoftTitle}</h3>
          <ul className="mt-2 grid gap-3 sm:grid-cols-2">
            {courses.map((c) => (
              <li key={c.url} className="rounded-md bg-muted/40 p-3">
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold leading-snug hover:text-link">
                  {c.title}
                </a>
                {c.summary && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground/80">{c.summary}</p>}
                {c.minutes > 0 && <p className="mt-1 text-xs text-muted-foreground">{duration(c.minutes)}</p>}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">{t.microsoftSource}</p>
        </>
      )}

      {/* Each link opened on 28 Sep 2026 (the server, or the browser where a site turns tools away). */}
      {t.groups.map((g) => (
        <div key={g.title}>
          <h3 className="mt-5 text-sm font-bold">{g.title}</h3>
          <ul className="mt-2 grid gap-x-6 sm:grid-cols-2">
            {g.items.map((p) => (
              <li key={p.url} className="flex items-start justify-between gap-3 border-b border-border py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.blurb}</p>
                </div>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className={`shrink-0 ${link}`}>
                  {t.open}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.hint}</p>
    </section>
  );
}
