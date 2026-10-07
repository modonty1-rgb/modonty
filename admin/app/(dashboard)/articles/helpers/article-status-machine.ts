import type { ArticleStatus } from "@prisma/client";

// Client approval is a MANDATORY gate, not an optional shortcut. The only way an
// article reaches APPROVED is the client approving it on the console (`approveArticle`
// → AWAITING_APPROVAL → APPROVED, a direct DB write that does NOT pass through this admin
// machine). The team then picks the date (APPROVED → SCHEDULED, set-scheduled-date) and the
// cron — or «Publish Now» — takes it live (27 Sep 2026: approval used to write SCHEDULED
// directly, and undated articles went live on the next cron tick). Admin can never self-advance past the
// client: from AWAITING_APPROVAL the admin may only bounce the article back for
// revision. This closes the historical bypass where DRAFT/WRITING/AWAITING_APPROVAL
// could jump straight to SCHEDULED/PUBLISHED (added open in v0.18, never re-closed
// when client approval landed in v0.50).
const VALID_TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  WRITING: ["DRAFT"],
  DRAFT: ["WRITING", "AWAITING_APPROVAL"],
  AWAITING_APPROVAL: ["NEEDS_REVISION"],
  APPROVED: ["SCHEDULED", "DRAFT"],
  NEEDS_REVISION: ["WRITING", "DRAFT"],
  SCHEDULED: ["PUBLISHED", "PUBLISHED_ON_CLIENT_SITE", "DRAFT"],
  PUBLISHED: ["ARCHIVED", "DRAFT"],
  // Live on the client's OWN site. No ARCHIVED here: archiving would pull the
  // article off their site without anyone deciding to (see the delete/archive
  // guards). Which of the two published values a SCHEDULED article may reach is
  // decided by `isClientSiteArticle`, not by this table — this machine only
  // knows stages, so the destination check lives in the publish action.
  PUBLISHED_ON_CLIENT_SITE: ["DRAFT"],
  ARCHIVED: ["DRAFT", "WRITING"],
};

export function isValidTransition(from: ArticleStatus, to: ArticleStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
