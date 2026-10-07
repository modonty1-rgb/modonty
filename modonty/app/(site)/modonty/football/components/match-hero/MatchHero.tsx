import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { fill, messages } from "@/lib/i18n/messages";

import { formatGoals } from "../../helpers/format-goals";
import { matchStatusLabel } from "../../helpers/match-status-label";
import { riyadhDate } from "../../helpers/riyadh-date";
import { roundNumber } from "../../helpers/round-number";
import type { Match } from "../../helpers/types";
import { TeamMark } from "../team-mark/TeamMark";

const t = messages.modonty.football;

interface MatchHeroProps {
  match: Match;
  crests: Record<string, string>;
  /** Riyadh day of the page render, to say «اليوم» or «بكرة» for an upcoming match. */
  today: string;
}

/**
 * The page's dominant element on a match day — the one match a fan came to check: the live one,
 * else the next kickoff, else today's last result. Without one the page shows `PromoHero` instead.
 */
export function MatchHero({ match, crests, today }: MatchHeroProps) {

  const round = roundNumber(match.round);
  const dayLabel = riyadhDate(new Date(match.kickoff)) === today ? t.today : t.tomorrow;
  const showScore = match.state === "live" || match.state === "finished";

  return (
    <section
      aria-label={`${match.home.name} ${match.away.name}`}
      className="relative overflow-hidden rounded-xl bg-brand-navy px-6 py-6 text-white"
    >
      <div className="flex items-center justify-between text-sm text-white/80">
        <span>
          {t.league}
          {round !== null && ` · ${fill(t.round, { n: round.toLocaleString(SITE_LOCALE) })}`}
        </span>
        {match.state === "live" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold">
            <span className="size-1.5 animate-pulse rounded-full bg-white motion-reduce:animate-none" />
            {t.live}
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <TeamMark name={match.home.name} crest={crests[match.home.name]} inset className="size-16 bg-white text-xl" />
          <span className="text-lg font-bold">{match.home.name}</span>
        </div>
        <div className="text-center">
          {showScore ? (
            // No `dir="ltr"`: the home side is on the right in RTL, so its goals must read first.
            <p className="text-5xl font-bold tabular-nums">
              {formatGoals(match.home.goals)} - {formatGoals(match.away.goals)}
            </p>
          ) : (
            // Before kickoff there is no score; the time under it carries the information.
            <p aria-hidden className="text-2xl font-bold text-white/60">×</p>
          )}
          <p className="mt-2 text-sm font-bold text-brand-teal">{matchStatusLabel(match, dayLabel)}</p>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <TeamMark name={match.away.name} crest={crests[match.away.name]} inset className="size-16 bg-white text-xl" />
          <span className="text-lg font-bold">{match.away.name}</span>
        </div>
      </div>

      {match.venue && <p className="mt-5 text-center text-xs text-white/65">{match.venue}</p>}
    </section>
  );
}

