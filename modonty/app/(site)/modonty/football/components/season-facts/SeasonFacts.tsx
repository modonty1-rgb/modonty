import { fill, formatCount, messages } from "@/lib/i18n/messages";

import { seasonFacts, type SeasonFact } from "../../helpers/season-facts";
import type { TableRow } from "../../helpers/types";
import { TeamMark } from "../team-mark/TeamMark";

const t = messages.modonty.football;

function valueLine(fact: SeasonFact): string | null {
  if (fact.key === "attack") return fill(t.factValues.attack, { goals: formatCount(fact.value, t.goals) });
  if (fact.key === "defence") return fill(t.factValues.defence, { goals: formatCount(fact.value, t.goals) });
  if (fact.key === "draws") return formatCount(fact.value, t.draws);
  return null;
}

/** Four records the standings prove on their own. Hidden entirely when there is no table. */
export function SeasonFacts({ rows, crests }: { rows: TableRow[] | null; crests: Record<string, string> }) {
  if (!rows?.length) return null;
  const facts = seasonFacts(rows);

  return (
    <section aria-labelledby="football-facts" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="football-facts" className="text-lg font-bold">
        {t.factsTitle}
      </h2>
      <ul className="mt-2 divide-y divide-border">
        {facts.map((fact) => (
          <li key={fact.key} className="py-3">
            <p className="text-xs font-medium text-muted-foreground">{t.facts[fact.key]}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {fact.teams.map((team) => (
                <span key={team} className="flex items-center gap-1.5 font-bold">
                  <TeamMark name={team} crest={crests[team]} className="size-6" />
                  {team}
                </span>
              ))}
            </div>
            {valueLine(fact) && <p className="mt-1 text-sm text-muted-foreground">{valueLine(fact)}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
