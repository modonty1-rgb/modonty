import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { formatCount, messages } from "@/lib/i18n/messages";

import type { Scorer } from "../../helpers/types";
import { TeamMark } from "../team-mark/TeamMark";

const t = messages.modonty.football;

/** How many scorers the rail shows — the source lists every player tied on the last count. */
const SHOWN = 8;

export function ScorersCard({ scorers, crests }: { scorers: Scorer[] | null; crests: Record<string, string> }) {
  return (
    <section aria-labelledby="football-scorers" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="football-scorers" className="text-lg font-bold">
        {t.scorersTitle}
      </h2>
      {!scorers?.length ? (
        <p className="mt-3 text-sm text-muted-foreground">{t.scorersEmpty}</p>
      ) : (
        <ol className="mt-2 divide-y divide-border">
          {scorers.slice(0, SHOWN).map((s) => (
            <li key={`${s.rank}-${s.player}`} className="flex items-center gap-3 py-2.5">
              <span className="w-5 text-center text-sm font-bold text-muted-foreground tabular-nums">
                {s.rank.toLocaleString(SITE_LOCALE)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{s.player}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TeamMark name={s.club} crest={crests[s.club]} className="size-4 text-xs" />
                  {s.club}
                </span>
              </span>
              <span className="text-sm font-bold">{formatCount(s.goals, t.goals)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
