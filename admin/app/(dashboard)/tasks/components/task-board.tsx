"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { archiveTask, moveTask } from "../actions/task-actions";
import type { BoardTask } from "../helpers/queries";
import { TASK_STATUSES, TASK_STATUS_META, type TaskStatusKey } from "@/lib/tasks/task-config";
import { TaskCard } from "./task-card";
import { TaskDialog } from "./task-dialog";

type Board = Record<TaskStatusKey, BoardTask[]>;

function Column({
  status,
  tasks,
  children,
}: {
  status: TaskStatusKey;
  tasks: BoardTask[];
  children: React.ReactNode;
}) {
  // The column itself is a drop target, not only the cards in it — without this
  // an EMPTY column can never receive a card, because there is nothing to
  // collide with. That is the single most common bug in a hand-rolled board.
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}`, data: { status } });
  const meta = TASK_STATUS_META[status];

  return (
    <section
      ref={setNodeRef}
      aria-label={meta.label}
      className={cn(
        "flex min-h-0 w-72 shrink-0 flex-col rounded-xl border bg-muted/30 transition-colors sm:w-full",
        isOver && "border-primary/60 bg-primary/5",
      )}
      data-column={status}
    >
      <header className="flex items-center gap-2 border-b px-3 py-2">
        <span className={cn("size-2 rounded-full", meta.dot)} aria-hidden />
        <h2 className="text-[13px] font-bold">{meta.label}</h2>
        <span className="ms-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold tabular-nums text-muted-foreground">
          {tasks.length}
        </span>
      </header>
      <div className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto p-2">{children}</div>
    </section>
  );
}

export function TaskBoard({ initialBoard }: { initialBoard: Board }) {
  const router = useRouter();
  const { toast } = useToast();
  const [, startTransition] = useTransition();

  // Local mirror of the server board so a drop paints instantly. It is RESET
  // from props whenever the server sends new data — otherwise a failed move
  // would leave the screen showing a card where the database does not have it.
  const [board, setBoard] = useState<Board>(initialBoard);
  useEffect(() => setBoard(initialBoard), [initialBoard]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState<BoardTask | null>(null);
  const [creatingIn, setCreatingIn] = useState<TaskStatusKey | null>(null);

  const sensors = useSensors(
    // 6px of slop before a drag starts: without it every click on a card is
    // read as a micro-drag and the card never opens.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // Touch needs a hold, not a distance — otherwise scrolling the column with
    // a finger drags the card instead of scrolling.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeTask = useMemo(() => {
    if (!activeId) return null;
    for (const s of TASK_STATUSES) {
      const hit = board[s].find((t) => t.id === activeId);
      if (hit) return hit;
    }
    return null;
  }, [activeId, board]);

  const columnOf = (id: string): TaskStatusKey | null => {
    if (id.startsWith("column:")) return id.slice("column:".length) as TaskStatusKey;
    return TASK_STATUSES.find((s) => board[s].some((t) => t.id === id)) ?? null;
  };

  /** One write path for both drag and the keyboard "move to" menu. */
  const commitMove = (task: BoardTask, to: TaskStatusKey, toIndex: number) => {
    const from = task.status;
    if (from === to && board[from].findIndex((t) => t.id === task.id) === toIndex) return;

    setBoard((prev) => {
      const next = { ...prev, [from]: [...prev[from]] } as Board;
      next[from] = next[from].filter((t) => t.id !== task.id);
      const target = from === to ? next[from] : [...prev[to]];
      target.splice(toIndex, 0, { ...task, status: to });
      next[to] = target;
      return next;
    });

    startTransition(async () => {
      const result = await moveTask({ id: task.id, status: to, toIndex });
      if (!result.success) {
        toast({ title: "Move failed", description: result.error, variant: "destructive" });
      }
      // Refresh either way: on success to pick up the real positions, on failure
      // to snap the card back to where the database actually has it.
      router.refresh();
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const from = columnOf(String(active.id));
    const to = columnOf(String(over.id));
    if (!from || !to) return;

    const task = board[from].find((t) => t.id === active.id);
    if (!task) return;

    const overId = String(over.id);
    const toIndex = overId.startsWith("column:")
      ? board[to].length
      : board[to].findIndex((t) => t.id === overId);

    commitMove(task, to, toIndex < 0 ? board[to].length : toIndex);
  };

  const handleArchive = (task: BoardTask) => {
    // Optimistic like a move: the card leaves the column at once, and the
    // refresh below puts it back if the server refused.
    setBoard((prev) => ({
      ...prev,
      [task.status]: prev[task.status].filter((t) => t.id !== task.id),
    }));

    startTransition(async () => {
      const result = await archiveTask(task.id);
      toast(
        result.success
          ? {
              title: "Archived",
              description: `${task.title} is off the board — find it under Archive and restore it any time.`,
            }
          : { title: "Archive failed", description: result.error, variant: "destructive" },
      );
      router.refresh();
    });
  };

  return (
    <>
      {/* ONE place to add a task, not a button per column — Khalid, 2026-09-02:
          "one place to add a task, then it moves". New cards land in To Do and
          you drag them from there.

          Pulled up onto the header's row, which is free now that the tab strip
          and the duplicate counters are gone. A single small button does not
          earn a strip of page height, and that height is what the columns
          needed — they were 257px tall and scrolling over an empty page. */}
      <div className="-mt-12 mb-2 flex items-center justify-end">
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setCreatingIn("TODO")}>
          <Plus className="size-3.5" aria-hidden />
          New Task
        </Button>
      </div>

      <DndContext
        // A FIXED id, not the generated one. Without it dnd-kit numbers its
        // `aria-describedby` from a module counter that starts fresh on the
        // server and again in the browser, so the server sends
        // `DndDescribedBy-0` and the client expects `DndDescribedBy-1` —
        // measured as a hydration mismatch on this very board.
        id="tasks-board"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        {/* A real height, not `flex-1`. The columns sat at 257px and scrolled
            internally while the page below them was empty, because `flex-1`
            resolves against a parent chain that has no definite height here.
            `min-h` off the viewport gives the cards the space that was already
            on screen; the columns still scroll when a list outgrows it. */}
        <div className="flex min-h-[calc(100dvh-10.5rem)] gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-x-visible lg:grid-cols-4">
          {TASK_STATUSES.map((status) => (
            <Column key={status} status={status} tasks={board[status]}>
              <SortableContext
                items={board[status].map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {board[status].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={setEditing}
                    onMove={(t, to) => commitMove(t, to, 0)}
                    onArchive={handleArchive}
                  />
                ))}
              </SortableContext>

              {board[status].length === 0 && (
                <p className="px-1 py-6 text-center text-[12px] text-muted-foreground/70">
                  Nothing here
                </p>
              )}
            </Column>
          ))}
        </div>

        {/* Renders the card under the cursor at full opacity while the original
            stays dimmed in place — the feedback that tells you the drag is live. */}
        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              dragging
              onEdit={() => {}}
              onMove={() => {}}
              onArchive={() => {}}
            />
          )}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        task={editing}
        createIn={creatingIn}
        onClose={() => {
          setEditing(null);
          setCreatingIn(null);
        }}
      />
    </>
  );
}
