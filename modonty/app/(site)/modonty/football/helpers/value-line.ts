import { fill, formatCount, messages } from "@/lib/i18n/messages";

import type { SeasonFact } from "./season-facts";

const t = messages.modonty.football;

export function valueLine(fact: SeasonFact): string | null {
  if (fact.key === "attack") return fill(t.factValues.attack, { goals: formatCount(fact.value, t.goals) });
  if (fact.key === "defence") return fill(t.factValues.defence, { goals: formatCount(fact.value, t.goals) });
  if (fact.key === "draws") return formatCount(fact.value, t.draws);
  return null;
}
