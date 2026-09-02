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
  TASK_PRIORITY_META,
  TASK_STATUSES,
  TASK_STATUS_META,
  type TaskStatusKey,
} from "../helpers/task-config";

const dateFmt = new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "short" });

/** Overdue is only meaningful while the task is unfinished. */
function dueState(due: Date | null, status: TaskStatusKey) {
  if (!due) return null;
  const end = new Date(due);
  end.setHours(23, 59, 59, 999);
  const late = status !== "DONE" && end.getTime() < Date.now();
  return { label: dateFmt.format(due), late };
}

function Initials({ name, image }: { name: string | null; image: string | null }) {
  const letter = (name?.trim()?.[0] ?? "؟").toUpperCase();
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element -- avatars are remote Bunny URLs at 24px; next/image adds a request per card for no gain
    <img src={image} alt="" className="size-6 shrink-0 rounded-full object-cover" />
  ) : (
    <span
      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground"
      aria-hidden
    >
      {letter}
    </span>
  );
}

export function TaskCard({
  task,
  onEdit,
  onMove,
  onDelete,
  dragging = false,
}: {
  task: BoardTask;
  onEdit: (task: BoardTask) => void;
  onMove: (task: BoardTask, to: TaskStatusKey) => void;
  onDelete: (task: BoardTask) => void;
  dragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const due = dueState(task.dueDate, task.status);
  const priority = TASK_PRIORITY_META[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group rounded-lg border bg-card p-2.5 shadow-sm transition-shadow",
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
          aria-label={`اسحب «${task.title}»`}
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
              aria-label={`خيارات «${task.title}»`}
            >
              <MoreHorizontal className="size-3.5" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          {/* The keyboard and touch path to the same move that dragging performs.
              Drag alone is not an accessible control, so it is never the only way. */}
          <DropdownMenuContent align="end" className="w-44 text-start">
            <DropdownMenuItem onClick={() => onEdit(task)}>تعديل</DropdownMenuItem>
            <DropdownMenuSeparator />
            {TASK_STATUSES.filter((s) => s !== task.status).map((s) => (
              <DropdownMenuItem key={s} onClick={() => onMove(task, s)}>
                انقل إلى «{TASK_STATUS_META[s].label}»
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(task)}
              className="text-red-600 focus:text-red-600 dark:text-red-400"
            >
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 ps-5">
        <span
          className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", priority.tone)}
        >
          {priority.label}
        </span>

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
            {due.late && <span className="sr-only"> — متأخرة</span>}
          </span>
        )}

        <span className="ms-auto flex items-center gap-1.5">
          {task.assignee ? (
            <>
              <span className="max-w-24 truncate text-[11px] text-muted-foreground">
                {task.assignee.name ?? "بلا اسم"}
              </span>
              <Initials name={task.assignee.name} image={task.assignee.image} />
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground/70">بلا مسؤول</span>
          )}
        </span>
      </div>
    </div>
  );
}
