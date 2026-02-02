import { ArticleStatus } from "@prisma/client";

export const statusLabels: Record<ArticleStatus, string> = {
  WRITING: "Writing",
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const statusVariants = {
  WRITING: "outline",
  DRAFT: "secondary",
  SCHEDULED: "outline",
  PUBLISHED: "default",
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

export function getAvailableStatuses(): ArticleStatus[] {
  return Object.values(ArticleStatus);
}
