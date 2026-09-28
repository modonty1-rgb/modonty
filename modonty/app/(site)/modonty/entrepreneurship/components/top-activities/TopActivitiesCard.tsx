import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { messages } from "@/lib/i18n/messages";

import type { ActivityMatch } from "../../helpers/types";

const t = messages.modonty.entrepreneurship.top;
const N = new Intl.NumberFormat(SITE_LOCALE);

/** The most crowded activities — where a new shop meets the most competitors. */
export function TopActivitiesCard({ activities }: { activities: ActivityMatch[] }) {
  return (
    <section aria-labelledby="top-activities" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="top-activities" className="text-lg font-bold">
        {t.title}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{t.note}</p>
      <ol className="mt-2 divide-y divide-border">
        {activities.map((a) => (
          <li key={a.code} className="flex items-baseline gap-3 py-2 text-sm">
            <span className="w-5 shrink-0 text-xs text-muted-foreground tabular-nums">{N.format(a.rank)}</span>
            <span className="min-w-0 flex-1 leading-snug">{a.name}</span>
            <span className="shrink-0 font-semibold tabular-nums">{N.format(a.count)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
