import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { cn } from "@/lib/utils";
import { messages } from "@/lib/i18n/messages";

import type { MatchDay } from "../../data/get-football-page";
import { matchStatusLabel } from "../../helpers/match-status-label";
import type { Match } from "../../helpers/types";
import { TeamMark } from "../team-mark/TeamMark";

const t = messages.modonty.football;

function MatchRow({ match, crests }: { match: Match; crests: Record<string, string> }) {
  const showScore = match.state === "live" || match.state === "finished";
  const goals = (n: number | null) => (n ?? 0).toLocaleString(SITE_LOCALE);
  return (
    <li className="grid grid-cols-[1fr_5.5rem_1fr] items-center gap-2 py-2.5">
      <span className="flex min-w-0 items-center gap-2 font-medium">
        <TeamMark name={match.home.name} crest={crests[match.home.name]} />
        <span className="truncate">{match.home.name}</span>
      </span>
      <span className="text-center">
        {showScore && (
          <span className={cn("block font-bold tabular-nums", match.state === "live" && "text-red-600")}>
            {goals(match.home.goals)} - {goals(match.away.goals)}
          </span>
        )}
        <span className={cn("block text-xs text-muted-foreground", !showScore && "text-sm font-bold text-foreground")}>
          {matchStatusLabel(match)}
        </span>
      </span>
      <span className="flex min-w-0 items-center justify-end gap-2 font-medium">
        <span className="truncate">{match.away.name}</span>
        <TeamMark name={match.away.name} crest={crests[match.away.name]} />
      </span>
    </li>
  );
}

/**
 * Yesterday · today · tomorrow — all the free plan lets us ask for (API-Football answers
 * «try from 2026-09-26 to 2026-09-28» for any other date). Empty days are skipped; with all
 * three empty the card says so in one line — but only when all three were read: a day that could
 * not be (after midnight tomorrow is out of the API's window) is not a day without matches.
 */
export function FixturesCard({
  days,
  crests,
}: {
  days: { yesterday: MatchDay; today: MatchDay; tomorrow: MatchDay };
  crests: Record<string, string>;
}) {
  const groups = [
    { label: t.today, day: days.today },
    { label: t.tomorrow, day: days.tomorrow },
    { label: t.yesterday, day: days.yesterday },
  ].filter((g) => g.day.matches.length > 0);

  return (
    <section aria-labelledby="football-matches" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="football-matches" className="text-lg font-bold">
        {t.matchesTitle}
      </h2>
      {groups.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {Object.values(days).every((d) => d.known) ? t.matchesEmpty : t.matchesPending}
        </p>
      ) : (
        groups.map((g) => (
          <div key={g.day.date} className="mt-4">
            <h3 className="text-sm font-bold text-muted-foreground">{g.label}</h3>
            <ul className="divide-y divide-border">
              {g.day.matches.map((m) => (
                <MatchRow key={m.id} match={m} crests={crests} />
              ))}
            </ul>
          </div>
        ))
      )}
      <p className="mt-4 text-xs text-muted-foreground">{t.matchesSource}</p>
    </section>
  );
}
