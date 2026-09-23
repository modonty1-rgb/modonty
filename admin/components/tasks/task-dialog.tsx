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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { createTask, updateTask } from "@/lib/tasks/task-actions";
import type { BoardTask } from "@/lib/tasks/task-types";
import { TASK_PRIORITIES, TASK_PRIORITY_META, type TaskStatusKey } from "@/lib/tasks/task-config";

const UNASSIGNED = "__none__";
const N = new Intl.NumberFormat("ar-EG");
const dueFmt = new Intl.DateTimeFormat("ar-EG", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export interface TaskAssigneeOption {
  id: string;
  name: string | null;
  email: string | null;
  /** حِملُه الآن — مهامُّه المفتوحة والمتأخّرة؛ يُعرض كي لا يُسند لمن غرق. اختياريّ. */
  open?: number;
  late?: number;
}

/** `Date` → `yyyy-mm-dd` in LOCAL time. `toISOString()` would shift the day for
 *  anyone east of UTC, which is everyone on this team. */
function toDateInput(d: Date | null): string {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const plusDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

/** آخرُ يوم عملٍ في الأسبوع — الخميس (الأحد–الخميس في السعوديّة ومصر). اليومُ نفسُه إن كان خميساً. */
function endOfWorkWeek(): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7));
  return d;
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
  // A new task is normally work for today. Calculate this per dialog reset,
  // not once at module load, so leaving the dashboard open overnight cannot
  // create tomorrow's task with yesterday's default.
  dueDate: toDateInput(new Date()),
  assigneeId: UNASSIGNED,
});

const displayName = (a: TaskAssigneeOption) => a.name?.trim() || a.email || "بلا اسم";

/**
 * One dialog for both create and edit — and, with `assignees`, for handing a task to a colleague.
 *
 * `task` set = editing it; `createIn` set = a new card for that column. Two
 * dialogs would mean two copies of the same six fields, and the second copy is
 * always the one that misses a validation rule.
 *
 * **عربيّةٌ ومن اليمين** (خالد ٢٣ سبتمبر ٢٠٢٦: «الديالوج محتاج تحسين»). كانت إنجليزيّةً
 * يساريّة والمهامُّ تُكتب بالعربيّة، فيُكتب العربيُّ في حقلٍ يساريّ. والترتيبُ ترتيبُ السؤال:
 * لمن ← ماذا ← متى ← بأيّ أولويّة. والزميلُ يُختار ببطاقةٍ عليها حِملُه، والموعدُ بأزرارٍ سريعة،
 * والأولويّةُ أربعةُ أزرارٍ ملوّنة بدل قائمة — وزرُّ الحفظ يسمّي الزميل.
 */
export function TaskDialog({
  task,
  createIn,
  onClose,
  assignees = [],
}: {
  task: BoardTask | null;
  createIn: TaskStatusKey | null;
  onClose: () => void;
  /** Report viewers pass staff here to assign a new task on someone else's board. */
  assignees?: TaskAssigneeOption[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(emptyForm("TODO"));
  // التفاصيلُ مطويّةٌ حتى تُطلب — أغلبُ المهامّ سطرٌ واحد، والحقلُ الفارغُ يطيل النافذة بلا داعٍ.
  const [showDetails, setShowDetails] = useState(false);

  const open = Boolean(task || createIn);
  const isEdit = Boolean(task);
  const canAssign = !isEdit && assignees.length > 0;

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
      setShowDetails(Boolean(task.description));
    } else if (createIn) {
      setForm(emptyForm(createIn));
      setShowDetails(false);
    }
  }, [task, createIn]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const chosen = assignees.find((a) => a.id === form.assigneeId) ?? null;

  const quickDates = [
    { label: "اليوم", value: toDateInput(new Date()) },
    { label: "بكرة", value: toDateInput(plusDays(1)) },
    { label: "بعد ٣ أيام", value: toDateInput(plusDays(3)) },
    { label: "آخر الأسبوع", value: toDateInput(endOfWorkWeek()) },
  ];

  const dueLabel = (() => {
    const [y, m, d] = form.dueDate.split("-").map(Number);
    return y && m && d ? dueFmt.format(new Date(y, m - 1, d)) : "بلا موعد";
  })();

  const canSubmit = !isPending && form.title.trim().length >= 3 && (!canAssign || form.assigneeId !== UNASSIGNED);

  const submit = () => {
    if (!canSubmit) return;
    const payload = {
      ...form,
      // The picker needs a non-empty sentinel, and the server needs "" to mean
      // unassigned. Translated here, once.
      assigneeId: form.assigneeId === UNASSIGNED ? "" : form.assigneeId,
      ...(isEdit && task ? { id: task.id } : {}),
    };

    startTransition(async () => {
      const result = isEdit ? await updateTask(payload) : await createTask(payload);
      if (result.success) {
        toast({
          title: isEdit ? "حُفظت" : canAssign && chosen ? `أُسندت إلى ${displayName(chosen)}` : "أُضيفت",
          description: form.title.trim(),
        });
        onClose();
        router.refresh();
      } else {
        toast({
          title: "لم تُحفظ",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* جسمٌ يمرّر وحده وترويسةٌ وتذييلٌ ثابتان — فلا يُقصّ زرُّ الحفظ على الشاشة القصيرة. */}
      <DialogContent dir="rtl" className="flex max-h-[90vh] max-w-lg flex-col gap-0 p-0">
        {/* الترويسةُ سطرٌ واحدٌ يعمل: «إسناد مهمّة إلى [الزميل ▾]» (خالد ٢٣ سبتمبر ٢٠٢٦: «الهيدر مهلك…
            يستفيد منه» · «بدل ما تكون ماخذة منطقة كاملة… أضغط عليها أختار الزميل»). `pe-12` يُبعدها عن ✕. */}
        <DialogHeader className="border-b px-5 py-3 pe-12 text-start">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <DialogTitle>{isEdit ? "تعديل المهمّة" : canAssign ? "إسناد مهمّة" : "مهمّة جديدة"}</DialogTitle>
            {canAssign ? (
              <>
                <span className="text-lg font-semibold text-muted-foreground">إلى</span>
                <Select
                  dir="rtl"
                  value={form.assigneeId === UNASSIGNED ? "" : form.assigneeId}
                  onValueChange={(v) => set("assigneeId", v)}
                >
                  <SelectTrigger
                    id="task-assignee"
                    aria-label="الزميل"
                    className={cn(
                      "h-8 w-auto min-w-36 gap-2 rounded-full px-3 text-sm text-foreground",
                      !chosen && "border-dashed border-primary text-primary"
                    )}
                  >
                    <SelectValue placeholder="اختر الزميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignees.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {/* `bdi` يعزل الاسمَ اللاتينيّ عن الأرقام العربيّة. والفاصلُ «—» و«،» لا «·»: النقطةُ
                          بجانب رقمٍ عربيّ تُقرأ صفراً («٣ ·» تُرى «٣٠»). */}
                        <bdi>{displayName(a)}</bdi>
                        {a.open !== undefined ? (
                          <span className="text-[12px] text-muted-foreground">
                            {" — "}
                            <bdi>{N.format(a.open)} مفتوحة</bdi>
                            {a.late ? (
                              <>
                                {"، "}
                                <bdi className="text-red-600 dark:text-red-400">{N.format(a.late)} متأخّرة</bdi>
                              </>
                            ) : null}
                          </span>
                        ) : null}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : null}
          </div>
          <DialogDescription className={canAssign ? "sr-only" : undefined}>
            {isEdit
              ? "غيّر ما تحتاج واحفظ."
              : canAssign
              ? "اختر الزميل، واكتب المهمّة وموعدها."
              : "اكتب المطلوب وموعده."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="task-form"
          className="flex-1 space-y-3 overflow-y-auto px-5 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="task-title">المهمّة</Label>
            <Input
              id="task-title"
              dir="auto"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="مثلاً: مراجعة مقالات جبر سيو قبل النشر"
              autoFocus={!canAssign}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-due">
              الموعد <span className="font-normal text-muted-foreground">· {dueLabel}</span>
            </Label>
            <div className="flex flex-wrap items-center gap-1.5">
              {quickDates.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => set("dueDate", q.value)}
                  aria-pressed={form.dueDate === q.value}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    form.dueDate === q.value ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  {q.label}
                </button>
              ))}
              <Input
                id="task-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                className="h-8 w-auto text-xs"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="shrink-0 text-sm font-medium">الأولويّة</span>
            <div role="radiogroup" aria-label="الأولويّة" className="grid flex-1 grid-cols-4 gap-1.5">
              {TASK_PRIORITIES.map((p) => {
                const selected = form.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => set("priority", p)}
                    className={cn(
                      "rounded-md border py-1.5 text-xs font-semibold transition-colors",
                      selected
                        ? cn(TASK_PRIORITY_META[p].tone, "border-current")
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {TASK_PRIORITY_META[p].labelAr}
                  </button>
                );
              })}
            </div>
          </div>

          {showDetails ? (
            <div className="space-y-1.5">
              <Label htmlFor="task-desc">
                تفاصيل <span className="font-normal text-muted-foreground">(اختياريّ)</span>
              </Label>
              <Textarea
                id="task-desc"
                dir="auto"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="أيّ شيءٍ يساعد مَن سيُنفّذها"
                className="resize-y"
                autoFocus
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="text-[13px] font-medium text-primary hover:underline"
            >
              + أضف تفاصيل
            </button>
          )}

          {/* No column field either — Khalid, 2026-09-02. A card moves by being
              dragged, or by "Move to" on its own menu. The form still SENDS the
              current status so saving an edit does not move the card. */}
        </form>

        <DialogFooter className="gap-2 border-t px-5 py-3 sm:justify-start">
          <Button type="submit" form="task-form" disabled={!canSubmit}>
            {isPending
              ? "جارٍ الحفظ…"
              : isEdit
              ? "حفظ"
              : canAssign
              ? chosen
                ? `إسناد إلى ${displayName(chosen)}`
                : "اختر الزميل أوّلاً"
              : "إضافة"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
