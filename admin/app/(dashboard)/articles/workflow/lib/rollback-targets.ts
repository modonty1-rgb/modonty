import { ArticleStatus } from "@prisma/client";

/**
 * Rollback-only status maintenance — pure helpers (no server action here).
 *
 * Lives outside the "use server" action file so it can export plain
 * (non-async) constants + functions that the server page imports directly.
 *
 * Hard rules these encode:
 *   - PUBLISHED articles are live and are never a rollback target.
 *   - The only allowed targets are DRAFT / WRITING — so the admin can never
 *     use maintenance to jump an article forward and bypass the client gate.
 *   - The target must be an earlier stage than the current one (backward only).
 */

// Allowed rollback destinations — backward editing stages only.
export const ROLLBACK_TARGETS: ArticleStatus[] = [ArticleStatus.DRAFT, ArticleStatus.WRITING];

// Stage order, used to enforce "backward only".
export const STAGE_RANK: Record<ArticleStatus, number> = {
  WRITING: 0,
  DRAFT: 1,
  NEEDS_REVISION: 2,
  AWAITING_APPROVAL: 3,
  SCHEDULED: 4,
  PUBLISHED: 5,
  ARCHIVED: 6,
};

/** Valid rollback targets for a given current status (earlier DRAFT/WRITING stages). */
export function getRollbackTargets(current: ArticleStatus): ArticleStatus[] {
  return ROLLBACK_TARGETS.filter((t) => STAGE_RANK[t] < STAGE_RANK[current]);
}
