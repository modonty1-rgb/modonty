"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { TaskDialog } from "@/components/tasks/task-dialog";
import type { BoardTask } from "@/lib/tasks/task-types";

/**
 * عنوانُ المهمّة المُسنَدة زرٌّ يفتح تعديلَها (خالد ٣ أكتوبر ٢٠٢٦: أسند ١٢ مهمّةً لطارق ولم يجد
 * طريقاً يصحّح صياغتها). نفسُ `TaskDialog` بوضع التعديل — والخادمُ (`updateTask`) يحفظ لمن أسندها
 * النصَّ والأولويّة فقط (الموعدُ يحدّده المنفّذ)، ويُبقي العمودَ بيد المنفّذ.
 */
export function EditSentTask({ task }: { task: BoardTask }) {
  const [open, setOpen] = useState(false);

  return (
    // السطرُ نفسُه يفتح «+» — فالضغطُ هنا (والنافذةُ، فأحداثُ البوّابة تصعد في شجرة React) لا يصل إليه.
    <span className="min-w-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-start gap-1.5 text-start hover:text-primary"
        aria-label={`تعديل: ${task.title}`}
      >
        <span className="line-clamp-2">{task.title}</span>
        <Pencil className="mt-0.5 size-3.5 shrink-0 opacity-40 group-hover:opacity-100" aria-hidden />
      </button>
      <TaskDialog task={open ? task : null} createIn={null} asAssigner onClose={() => setOpen(false)} />
    </span>
  );
}
