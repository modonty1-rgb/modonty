import type { ArticleStatus } from "@prisma/client";

// Client approval is a MANDATORY gate, not an optional shortcut. The only way an
// article reaches SCHEDULED (and then PUBLISHED) is the client approving it on the
// console (`approveArticle` → AWAITING_APPROVAL → SCHEDULED, a direct DB write that
// does NOT pass through this admin machine). Admin can never self-advance past the
// client: from AWAITING_APPROVAL the admin may only bounce the article back for
// revision. This closes the historical bypass where DRAFT/WRITING/AWAITING_APPROVAL
// could jump straight to SCHEDULED/PUBLISHED (added open in v0.18, never re-closed
// when client approval landed in v0.50).
const VALID_TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  WRITING: ["DRAFT"],
  DRAFT: ["WRITING", "AWAITING_APPROVAL"],
  AWAITING_APPROVAL: ["NEEDS_REVISION"],
  NEEDS_REVISION: ["WRITING", "DRAFT"],
  SCHEDULED: ["PUBLISHED", "DRAFT"],
  PUBLISHED: ["ARCHIVED", "DRAFT"],
  ARCHIVED: ["DRAFT", "WRITING"],
};

export function isValidTransition(from: ArticleStatus, to: ArticleStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getValidNextStatuses(current: ArticleStatus): ArticleStatus[] {
  return VALID_TRANSITIONS[current] ?? [];
}
