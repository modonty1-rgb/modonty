import type { TaskStatusKey } from "./task-config";

/**
 * One card as every task screen consumes it.
 *
 * It lives here, not beside the query that builds it, because two ROUTES now
 * read it: `/tasks` (the personal board) and `/daily-tasks` (the Admin report,
 * through the shared `TaskDialog`). A type owned by one route and imported by
 * its sibling is the boundary crossing `.claude/rules/folder-structure.md`
 * forbids — and shared code may not reach back into a route folder to fetch it.
 */
export interface BoardTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatusKey;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  position: number;
  dueDate: Date | null;
  completedAt: Date | null;
  assignee: { id: string; name: string | null; image: string | null } | null;
  /** True only when an Admin assigned the task to someone else from Report. */
  assignedByAdmin: boolean;
}
