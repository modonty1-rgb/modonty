"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import { createTask, updateTask } from "../actions/task-actions";
import type { AssignableStaff, BoardTask } from "../helpers/queries";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_META,
  TASK_STATUSES,
  TASK_STATUS_META,
  type TaskStatusKey,
} from "../helpers/task-config";

const UNASSIGNED = "__none__";

/** `Date` → `yyyy-mm-dd` in LOCAL time. `toISOString()` would shift the day for
 *  anyone east of UTC, which is everyone on this team. */
function toDateInput(d: Date | null): string {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

interface FormState {
  title: string;
  description: string;
  status: TaskStatusKey;
  priority: (typeof TASK_PRIORITIES)[number];
  dueDate: string;
  assigneeId: string;
}

const emptyForm = (status: TaskStatusKey): FormState => ({
  title: "",
  description: "",
  status,
  priority: "NORMAL",
  dueDate: "",
  assigneeId: UNASSIGNED,
});

/**
 * One dialog for both create and edit.
 *
 * `task` set = editing it; `createIn` set = a new card for that column. Two
 * dialogs would mean two copies of the same six fields, and the second copy is
 * always the one that misses a validation rule.
 */
export function TaskDialog({
  staff,
  task,
  createIn,
  onClose,
}: {
  staff: AssignableStaff[];
  task: BoardTask | null;
  createIn: TaskStatusKey | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(emptyForm("TODO"));

  const open = Boolean(task || createIn);
  const isEdit = Boolean(task);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        priority: task.priority,
        dueDate: toDateInput(task.dueDate),
        assigneeId: task.assignee?.id ?? UNASSIGNED,
      });
    } else if (createIn) {
      setForm(emptyForm(createIn));
    }
  }, [task, createIn]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    const payload = {
      ...form,
      // The select needs a non-empty sentinel (Radix forbids an empty value),
      // and the server needs "" to mean unassigned. Translated here, once.
      assigneeId: form.assigneeId === UNASSIGNED ? "" : form.assigneeId,
      ...(isEdit && task ? { id: task.id } : {}),
    };

    startTransition(async () => {
      const result = isEdit ? await updateTask(payload) : await createTask(payload);
      if (result.success) {
        toast({
          title: isEdit ? "اتحفظت" : "اتضافت",
          description: `«${form.title.trim()}» ${isEdit ? "اتحدثت" : `راحت لعمود «${TASK_STATUS_META[form.status].label}»`}.`,
        });
        onClose();
        router.refresh();
      } else {
        toast({ title: "ما اتحفظت", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? "تعديل المهمة" : "مهمة جديدة"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "غيّر اللي تحتاجه واحفظ."
              : "اكتب المطلوب وحدّد مين مسؤول عنه وإمتى لازم يخلص."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">المهمة</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="مثال: راجع مقالات جبر سيو قبل النشر"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-desc">تفاصيل (اختياري)</Label>
            <Textarea
              id="task-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="أي حاجة تساعد اللي هينفّذها"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-assignee">المسؤول</Label>
              <Select value={form.assigneeId} onValueChange={(v) => set("assigneeId", v)}>
                <SelectTrigger id="task-assignee">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value={UNASSIGNED}>بلا مسؤول</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name?.trim() || s.email || "بلا اسم"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-due">تاريخ التسليم</Label>
              <Input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-priority">الأولوية</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => set("priority", v as FormState["priority"])}
              >
                <SelectTrigger id="task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {TASK_PRIORITY_META[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-status">العمود</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as TaskStatusKey)}
              >
                <SelectTrigger id="task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {TASK_STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            إلغاء
          </Button>
          <Button onClick={submit} disabled={isPending || form.title.trim().length < 3}>
            {isPending ? "بيحفظ…" : isEdit ? "احفظ" : "أضف"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
