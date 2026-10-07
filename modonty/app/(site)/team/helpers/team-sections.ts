import { messages } from "@/lib/i18n/messages";
import { TEAM_MEMBERS } from "@/lib/team/team-members";
import type { TeamDept } from "@/lib/team/team-members";

const text = messages.team;

/** Reading order on the page — leadership first, then the people a partner actually deals with. */
const DEPARTMENTS: readonly TeamDept[] = ["leadership", "content", "creative", "ops", "outreach"];
export const TEAM_SECTIONS = DEPARTMENTS.map((dept) => ({
  dept,
  label: text.departments[dept],
  members: TEAM_MEMBERS.filter((member) => member.dept === dept),
})).filter((section) => section.members.length > 0);
