"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  TaskDialog,
  type TaskAssigneeOption,
} from "@/components/tasks/task-dialog";

/**
 * إسنادُ مهمّةٍ لزميل — صار في «Assign Task» (خالد ٢٣ سبتمبر ٢٠٢٦) بعد أن كان زرّاً داخل
 * التقرير: التقريرُ يُقرأ، والإسنادُ فعل، وخلطُهما كان يخفي الإسنادَ داخل صفحةٍ اسمُها تقرير.
 * اللوحةُ نفسُها تبقى شخصيّة.
 */
export function AssignTaskButton({ assignees }: { assignees: TaskAssigneeOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" aria-hidden />
        إسناد مهمّة
      </Button>
      <TaskDialog
        task={null}
        createIn={open ? "TODO" : null}
        assignees={assignees}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
