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
import { AlarmClock, CalendarClock, Info, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { archiveTask, moveTask } from "@/lib/tasks/task-actions";
import type { BoardTask } from "../helpers/queries";
import { TASK_STATUSES, TASK_STATUS_META, type TaskStatusKey } from "@/lib/tasks/task-config";
import { TaskCard } from "./task-card";
import { TaskDialog } from "./task-dialog";
import { isTaskLate } from "@/lib/tasks/is-task-late";

type Board = Record<TaskStatusKey, BoardTask[]>;

const N = new Intl.NumberFormat("ar-EG");

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
      aria-label={meta.labelAr}
      className={cn(
        "flex min-h-0 w-72 shrink-0 flex-col rounded-xl border bg-muted/30 transition-colors sm:w-full",
        isOver && "border-primary/60 bg-primary/5",
      )}
      data-column={status}
    >
      <header className="flex items-center gap-2 border-b px-3 py-1.5">
        <span className={cn("size-2 rounded-full", meta.dot)} aria-hidden />
        <h2 className="text-[13px] font-bold">{meta.labelAr}</h2>
        <span className="ms-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold tabular-nums text-muted-foreground">
          {tasks.length}
        </span>
      </header>
      <div className="flex min-h-24 flex-1 flex-col gap-1.5 overflow-y-auto p-1.5 scrollbar-thin">{children}</div>
    </section>
  );
}

export function TaskBoard({ initialBoard, total, done }: { initialBoard: Board; total: number; done: number }) {
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
  // «المهمّ اليوم» (خالد ٣ أكتوبر ٢٠٢٦): المتأخّرُ وما ينتظر موعدَك — تركيزٌ يُخفت الباقي ولا يُخفيه.
  const [focus, setFocus] = useState<"late" | "noDue" | null>(null);
  const all = TASK_STATUSES.flatMap((s) => board[s]);
  const FOCUS = {
    late: (t: BoardTask) => isTaskLate(t),
    noDue: (t: BoardTask) => !t.dueDate && !!t.assignedBy && t.status !== "DONE",
  } as const;
  const lateCount = all.filter(FOCUS.late).length;
  const noDueCount = all.filter(FOCUS.noDue).length;

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
        toast({ title: "ما انتقلت", description: result.error, variant: "destructive" });
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
              title: "أُرشفت",
              description: `«${task.title}» خرجت من اللوحة — تلقاها في المؤرشفة تحت، وترجّعها متى شئت.`,
            }
          : { title: "ما تأرشفت", description: result.error, variant: "destructive" },
      );
      router.refresh();
    });
  };

  return (
    <>
      {/* سطرٌ واحد فوق اللوحة (خالد ٣ أكتوبر ٢٠٢٦: «مساحات كثيرة مهدرة»): العنوانُ وعددُه، ثم المهمُّ
          اليوم، ثم القاعدةُ خافتة، وزرُّ الإضافة في الطرف — كانت أربعةَ صفوف تأكل ٢١٦ بكسل من ٤٩٥ قبل
          أوّل مهمّة. والإضافةُ مكانٌ واحد (خالد ٢ سبتمبر): تنزل في «لم تبدأ» وتُسحب من هناك. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-lg font-bold">مهامّي</h1>
        <span className="text-[13px] text-muted-foreground">
          {total === 0 ? "لا مهامّ بعد — ابدأ بواحدة" : `${N.format(total)} مهمّة · ${N.format(done)} منجَزة`}
        </span>
        {lateCount > 0 ? (
          <button
            type="button"
            aria-pressed={focus === "late"}
            onClick={() => setFocus(focus === "late" ? null : "late")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-500/20 dark:text-red-300",
              focus === "late" && "ring-2 ring-red-500",
            )}
          >
            <AlarmClock className="size-3.5" aria-hidden />
            {N.format(lateCount)} متأخّرة
          </button>
        ) : null}
        {noDueCount > 0 ? (
          <button
            type="button"
            aria-pressed={focus === "noDue"}
            onClick={() => setFocus(focus === "noDue" ? null : "noDue")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300",
              focus === "noDue" && "ring-2 ring-amber-500",
            )}
          >
            <CalendarClock className="size-3.5" aria-hidden />
            {N.format(noDueCount)} تنتظر موعدك
          </button>
        ) : null}
        <p className="ms-auto flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Info className="size-3.5 shrink-0" aria-hidden />
          متابعة مهامك اليومية واجب وظيفي، وعدم الالتزام يُعرّضك لإجراء إداري.
        </p>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setCreatingIn("TODO")}>
          <Plus className="size-3.5" aria-hidden />
          مهمّة جديدة
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
        {/* طولُ الشاشة بالضبط: الصفحةُ لا تتمرّر، وكلُّ عمودٍ يتمرّر وحده — فتُرى الأعمدةُ الأربعة
            كاملةً مهما طال واحدٌ منها. ٩٫٥rem = الشريطُ العلويّ + حشوةُ main + سطرُ العنوان. */}
        <div className="flex h-[calc(100dvh-9.5rem)] min-h-80 gap-3 overflow-x-auto sm:grid sm:grid-cols-2 sm:overflow-x-visible lg:grid-cols-4">
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
                    dimmed={focus !== null && !FOCUS[focus](task)}
                  />
                ))}
              </SortableContext>

              {board[status].length === 0 && (
                <p className="px-1 py-6 text-center text-[12px] text-muted-foreground/70">
                  لا شيء هنا
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
            />
          )}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        task={editing}
        createIn={creatingIn}
        onArchive={handleArchive}
        onClose={() => {
          setEditing(null);
          setCreatingIn(null);
        }}
      />
    </>
  );
}
