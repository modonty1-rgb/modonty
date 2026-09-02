import type { TaskPriority, TaskStatus } from "@prisma/client";

// The four columns, in board order. This array is the ONLY place the order
// lives: the board renders from it, the counters map over it, and the move menu
// offers every value except the card's own. Adding a column here adds it
// everywhere.
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;

export type TaskStatusKey = (typeof TASK_STATUSES)[number];

interface StatusMeta {
  label: string;
  /** URL segment, and what a drop zone reports. */
  slug: string;
  /** Semantic tone per the admin entity standard. */
  tone: string;
  dot: string;
}

export const TASK_STATUS_META: Record<TaskStatusKey, StatusMeta> = {
  TODO: {
    label: "To Do",
    slug: "todo",
    tone: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
    dot: "bg-slate-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    slug: "in-progress",
    tone: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  REVIEW: {
    label: "Review",
    slug: "review",
    tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  DONE: {
    label: "Done",
    slug: "done",
    tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
};

export const TASK_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;

export const TASK_PRIORITY_META: Record<TaskPriority, { label: string; tone: string }> = {
  LOW: { label: "Low", tone: "bg-slate-500/15 text-slate-600 dark:text-slate-400" },
  NORMAL: { label: "Normal", tone: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  HIGH: { label: "High", tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  URGENT: { label: "Urgent", tone: "bg-red-500/15 text-red-600 dark:text-red-400" },
};

/** Sort order for priority — by severity, never alphabetically. */
export const TASK_PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
};

export function isTaskStatus(value: string): value is TaskStatusKey {
  return (TASK_STATUSES as readonly string[]).includes(value);
}

/** `in-progress` → `IN_PROGRESS`. Returns null for anything not a real column. */
export function statusFromSlug(slug: string): TaskStatus | null {
  const hit = TASK_STATUSES.find((s) => TASK_STATUS_META[s].slug === slug);
  return hit ?? null;
}
