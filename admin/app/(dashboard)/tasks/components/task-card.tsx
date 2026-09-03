"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock, GripVertical, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { BoardTask } from "../helpers/queries";
import {
  TASK_STATUSES,
  TASK_STATUS_META,
  type TaskStatusKey,
} from "@/lib/tasks/task-config";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

/** Priority is a property of the card, not a chip that competes with its content. */
const priorityAccent = {
  LOW: "border-s-slate-400",
  NORMAL: "border-s-blue-500",
  HIGH: "border-s-amber-500",
  URGENT: "border-s-red-500",
} as const;

/** Overdue is only meaningful while the task is unfinished. */
function dueState(due: Date | null, status: TaskStatusKey) {
  if (!due) return null;
  const end = new Date(due);
  end.setHours(23, 59, 59, 999);
  const late = status !== "DONE" && end.getTime() < Date.now();
  return { label: dateFmt.format(due), late };
}

export function TaskCard({
  task,
  onEdit,
  onMove,
  onArchive,
  dragging = false,
}: {
  task: BoardTask;
  onEdit: (task: BoardTask) => void;
  onMove: (task: BoardTask, to: TaskStatusKey) => void;
  onArchive: (task: BoardTask) => void;
  dragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const due = dueState(task.dueDate, task.status);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group rounded-lg border border-s-4 bg-card p-2.5 shadow-sm transition-shadow",
        priorityAccent[task.priority],
        task.assignedByAdmin && "bg-violet-500/10 ring-1 ring-violet-500/60 dark:bg-violet-500/15",
        isDragging && "opacity-40",
        dragging && "rotate-2 shadow-lg",
      )}
    >
      <div className="flex items-start gap-1.5">
        {/* The drag handle is its OWN element, not the whole card: a card that is
            entirely draggable cannot be clicked to open, and every tap on a phone
            becomes an accidental drag. */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag ${task.title}`}
          className="mt-0.5 cursor-grab touch-none rounded p-0.5 text-muted-foreground/50 opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="size-3.5" aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => onEdit(task)}
          className="min-w-0 flex-1 text-start text-[13px] font-medium leading-snug hover:underline"
        >
          {task.title}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
              aria-label={`Options for ${task.title}`}
            >
              <MoreHorizontal className="size-3.5" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          {/* The keyboard and touch path to the same move that dragging performs.
              Drag alone is not an accessible control, so it is never the only way. */}
          <DropdownMenuContent align="end" className="w-44 text-start">
            <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            {TASK_STATUSES.filter((s) => s !== task.status).map((s) => (
              <DropdownMenuItem key={s} onClick={() => onMove(task, s)}>
                Move to {TASK_STATUS_META[s].label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {/* Archive, never delete. It is reversible, so it does not need the
                destructive confirm a delete would — the toast says where the
                card went and the archive screen brings it back. */}
            <DropdownMenuItem onClick={() => onArchive(task)}>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 ps-5">
        {due && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
              due.late
                ? "bg-red-500/15 text-red-600 dark:text-red-400"
                : "bg-muted text-muted-foreground",
            )}
          >
            <CalendarClock className="size-3" aria-hidden />
            {due.label}
            {due.late && <span className="sr-only"> — overdue</span>}
          </span>
        )}

      </div>
    </div>
  );
}
