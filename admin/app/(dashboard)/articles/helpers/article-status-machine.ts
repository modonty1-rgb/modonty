import type { ArticleStatus } from "@prisma/client";

const VALID_TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  WRITING: ["DRAFT"],
  DRAFT: ["WRITING", "SCHEDULED", "PUBLISHED"],
  SCHEDULED: ["PUBLISHED", "DRAFT"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

export function isValidTransition(from: ArticleStatus, to: ArticleStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getValidNextStatuses(current: ArticleStatus): ArticleStatus[] {
  return VALID_TRANSITIONS[current] ?? [];
}
