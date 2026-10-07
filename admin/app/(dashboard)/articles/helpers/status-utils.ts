import { ArticleStatus } from "@prisma/client";

const statusLabels: Record<ArticleStatus, string> = {
  WRITING: "Writing",
  DRAFT: "Draft",
  AWAITING_APPROVAL: "Awaiting Approval",
  APPROVED: "Approved — needs date",
  NEEDS_REVISION: "Needs Revision",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  PUBLISHED_ON_CLIENT_SITE: "Live on Client Site",
  ARCHIVED: "Archived",
};

const statusVariants = {
  WRITING: "outline",
  DRAFT: "secondary",
  AWAITING_APPROVAL: "outline",
  APPROVED: "outline",
  NEEDS_REVISION: "destructive",
  SCHEDULED: "outline",
  PUBLISHED: "default",
  PUBLISHED_ON_CLIENT_SITE: "default",
  ARCHIVED: "destructive",
} as Record<ArticleStatus, "default" | "secondary" | "destructive" | "outline">;

export function getStatusLabel(status: ArticleStatus): string {
  return statusLabels[status] || status;
}

export function getStatusVariant(
  status: ArticleStatus
): "default" | "secondary" | "destructive" | "outline" {
  return statusVariants[status] || "secondary";
}
