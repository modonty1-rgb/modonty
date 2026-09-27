import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { fill, messages } from "@/lib/i18n/messages";

import { formatRiyadhTime } from "./format-riyadh-time";
import type { Match } from "./types";

const t = messages.modonty.football;

/**
 * The one line under a score: «الدقيقة ٦٧» · «بين الشوطين» · «انتهت» · «بكرة ٩:٠٠ م».
 * `dayLabel` names the day for an upcoming match («اليوم» / «بكرة»); omit it inside a list
 * that is already grouped by day.
 */
export function matchStatusLabel(match: Match, dayLabel?: string): string {
  if (match.state === "live") {
    if (match.status === "HT") return t.halfTime;
    return match.minute !== null ? fill(t.minute, { n: match.minute.toLocaleString(SITE_LOCALE) }) : t.live;
  }
  if (match.state === "finished") return t.finished;
  if (match.state === "off") return t.postponed;
  const time = formatRiyadhTime(match.kickoff);
  return dayLabel ? `${dayLabel} ${time}` : time;
}
