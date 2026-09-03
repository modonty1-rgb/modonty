/**
 * Who may open the daily report.
 *
 * One function because the answer is asked in three places — the proxy, the page, and the
 * menu — and three copies of a permission rule is three chances for them to disagree. When
 * that happens the menu hides a link the page would have served, or worse, the page serves
 * what the proxy meant to block.
 *
 * Khalid (2026-09-04): «بدل ما يكون admin، الموظف نفسه في تأسيسه يكون فيه زي الـcheckmark…
 * مش شرط يكون admin». So the permission lives on the person now, not on their role.
 *
 * ADMIN still passes without the box ticked. Tying the report to the box alone would lock
 * the next admin out of their own report until someone remembered to tick it — a permission
 * system that can silently exclude its own owner is a bug waiting for a bad morning.
 *
 * `canViewReports` is optional in the schema: the rows that predate the field carry no value
 * at all, and Mongo returns absent as `null`. Both read as false here, which is the safe
 * direction — a missing value must never grant access.
 */
export function canSeeReports(staff: { role?: string | null; canViewReports?: boolean | null } | null | undefined): boolean {
  if (!staff) return false;
  return staff.role === "ADMIN" || staff.canViewReports === true;
}
