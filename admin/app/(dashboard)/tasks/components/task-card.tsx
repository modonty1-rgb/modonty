"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock, GripVertical, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

import type { BoardTask } from "../helpers/queries";
import { TASK_PRIORITY_META } from "@/lib/tasks/task-config";
import { isTaskLate } from "@/lib/tasks/is-task-late";

const dateFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long" });

/** الموعدُ ومتأخّرةٌ أم لا — بالقاعدة الواحدة: ما في المراجعة أو المنجَز لا يتأخّر. */
function dueState(task: BoardTask) {
  if (!task.dueDate) return null;
  return { label: dateFmt.format(task.dueDate), late: isTaskLate(task) };
}

export function TaskCard({
  task,
  onEdit,
  dragging = false,
  dimmed = false,
}: {
  task: BoardTask;
  /** الضغطُ على المهمّة يفتح نافذتها — وفيها كلُّ شيء: الحالة والموعد والأرشفة (لا قائمةَ نقاطٍ ثلاث). */
  onEdit: (task: BoardTask) => void;
  dragging?: boolean;
  /** خارجَ تركيز «المهمّ اليوم» — تخفت ولا تختفي، كي لا يتحرّك السحبُ تحت اليد. */
  dimmed?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const due = dueState(task);
  const assignerName = task.assignedBy?.name?.trim() || task.assignedBy?.email || "زميل";
  // الأولويّةُ تُكتب حين ترتفع فقط (خالد ٣ أكتوبر ٢٠٢٦): خطُّ الحافة الملوّن بلا اسم لم يُقرأ.
  const loud = task.priority === "HIGH" || task.priority === "URGENT";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      // البطاقةُ كلُّها تفتح نافذتها، لا العنوانُ وحده.
      onClick={() => onEdit(task)}
      className={cn(
        "cursor-pointer hover:border-primary/40",
        // بطاقةٌ واحدةُ اللون للجميع — الخلفيّةُ البنفسجيّة لكلّ مهمّةٍ مُسندة صبغت اللوحةَ كلَّها،
        // فصار «من:» سطراً صغيراً تحت العنوان (خالد ٣ أكتوبر ٢٠٢٦).
        "group rounded-md border bg-card px-2 py-1.5 shadow-sm transition-[box-shadow,opacity]",
        due?.late && "border-red-500/40",
        dimmed && "opacity-35",
        isDragging && "opacity-40",
        dragging && "rotate-2 shadow-lg",
      )}
    >
      {/* مدمجة (خالد ٣ أكتوبر ٢٠٢٦: «البورد يدوب يستوعب اثنين أو ثلاثة»): العنوانُ سطرٌ واحد — كاملاً
          عند التمرير وفي نافذة التعديل — وتحته سطرُ شاراتٍ واحد. كانت ٨٤–١٠٩ بكسل. */}
      <div className="flex items-center gap-1">
        {/* The drag handle is its OWN element, not the whole card: a card that is
            entirely draggable cannot be clicked to open, and every tap on a phone
            becomes an accidental drag. */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`اسحب: ${task.title}`}
          className="cursor-grab touch-none rounded p-0.5 text-muted-foreground/50 opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="size-3.5" aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => onEdit(task)}
          title={task.title}
          className="min-w-0 flex-1 truncate text-start text-[13px] font-medium leading-6 hover:underline"
        >
          {task.title}
        </button>

      </div>

      {/* The reviewer's note sits on the card itself: it is the instruction for the next step,
          so it must be read where the work is picked up, not buried in the bell. */}
      {task.reviewNote && (
        <p dir="auto" className="mt-1 ms-5 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-[12px] leading-snug text-rose-800 dark:text-rose-200">
          <span className="font-semibold">ملاحظة المراجعة: </span>
          {task.reviewNote}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1.5 ps-5 empty:hidden">
        {loud && (
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", TASK_PRIORITY_META[task.priority].tone)}>
            {TASK_PRIORITY_META[task.priority].labelAr}
          </span>
        )}
        {task.assignedBy && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <UserRound className="size-3" aria-hidden />
            من <bdi>{assignerName}</bdi>
          </span>
        )}
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
            {due.late && <span className="sr-only"> — متأخّرة</span>}
          </span>
        )}
        {/* مهمّةٌ أسندها زميلٌ بلا موعد: الموعدُ وعدُك أنت (خالد ٣ أكتوبر ٢٠٢٦). */}
        {/* زرٌّ لا شارة: يفتح المهمّةَ والموعدُ في يدك. */}
        {!due && task.assignedBy && task.status !== "DONE" && (
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-500/25 dark:text-amber-400"
          >
            <CalendarClock className="size-3" aria-hidden />
            حدّد موعدك
          </button>
        )}

      </div>
    </div>
  );
}
