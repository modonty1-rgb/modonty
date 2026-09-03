"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  TaskDialog,
  type TaskAssigneeOption,
} from "@/components/tasks/task-dialog";

/** The report is the Admin's team view, so this is the one place a task can be
 * handed to another staff member. The task board itself remains personal. */
export function ReportNewTaskButton({ assignees }: { assignees: TaskAssigneeOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" aria-hidden />
        New task
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
