"use client";

import { useEffect, useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { createTask, updateTask } from "@/lib/tasks/task-actions";
import type { BoardTask } from "@/lib/tasks/task-types";
import { TASK_PRIORITIES, TASK_PRIORITY_META, TASK_STATUSES, TASK_STATUS_META, type TaskStatusKey } from "@/lib/tasks/task-config";

import { isTaskLate } from "@/lib/tasks/is-task-late";

import { DueDatePicker, toDateInput } from "@/components/tasks/due-date-picker";

const UNASSIGNED = "__none__";
const N = new Intl.NumberFormat("ar-EG");

export interface TaskAssigneeOption {
  id: string;
  name: string | null;
  email: string | null;
  /** حِملُه الآن — مهامُّه المفتوحة والمتأخّرة؛ يُعرض كي لا يُسند لمن غرق. اختياريّ. */
  open?: number;
  late?: number;
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
  // بلا موعد حتى يُختار (خالد ٣ أكتوبر ٢٠٢٦): «اليوم» تلقائيّاً كان يجعل كلَّ مهمّةٍ لم يُنتبه لموعدها
  // متأخّرةً غداً دون أن يقرّر أحد ذلك.
  dueDate: "",
  assigneeId: UNASSIGNED,
});

const displayName = (a: TaskAssigneeOption) => a.name?.trim() || a.email || "بلا اسم";

/** شكلُ «حبّة» الخاصّيّة في سطر الخصائص — الحالةُ والأولويّةُ والموعدُ بنفس المقاس. */
const PILL = "h-8 w-auto gap-1.5 rounded-full px-3 text-xs font-semibold";

/**
 * نافذةٌ واحدة للإنشاء والتعديل والإسناد — نسختان من الحقول تعني أنّ الثانيةَ تنسى قاعدةً ما.
 *
 * **الترتيب (خالد ٣ أكتوبر ٢٠٢٦: «السيناريو واليو اكس تبعهم الاثنين»)** على نمط Linear وTrello:
 * العنوانُ كبيراً أوّلاً — هو المهمّة؛ ثم سطرُ خصائص واحد من «حبّات» صغيرة (الحالة · الموعد)
 * والأولويّةُ في الترويسة؛ ثم التفاصيل. كانت حقولاً متراكبة بعناوينها، فطالت النافذةُ عن شاشة
 * ٤٩٥ بكسل واختفى زرُّ الحفظ خلف التمرير.
 *
 * - **إسناد** (`assignees`): الترويسة «إسناد مهمّة إلى [الزميل]»، بلا موعد — يحدّده المنفّذ.
 * - **تعديل المُسنِد** (`asAssigner`): النصُّ والأولويّة فقط.
 * - **مهمّتي** (لوحة صاحبها): كلُّ شيء هنا — الحالةُ والموعدُ والأرشفة، بلا قائمة نقاطٍ ثلاث.
 */
export function TaskDialog({
  task,
  createIn,
  onClose,
  assignees = [],
  asAssigner = false,
  onArchive,
}: {
  task: BoardTask | null;
  createIn: TaskStatusKey | null;
  onClose: () => void;
  /** مَن يرى التقارير يمرّر الزملاءَ هنا ليُسند مهمّةً على لوحة غيره. */
  assignees?: TaskAssigneeOption[];
  /** تعديلُ مهمّةٍ أسندتَها أنت لغيرك — من «Assign Task». */
  asAssigner?: boolean;
  /** لوحةُ صاحب المهمّة تمرّرها: الأرشفةُ زرٌّ في هذه النافذة لا في قائمةٍ منفصلة. */
  onArchive?: (task: BoardTask) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(emptyForm("TODO"));

  const open = Boolean(task || createIn);
  const isEdit = Boolean(task);
  const canAssign = !isEdit && assignees.length > 0;
  // الموعدُ يحدّده المنفّذ لا المُسنِد: لا موعدَ في الإسناد ولا في تعديل المُسنِد.
  const showDue = !canAssign && !asAssigner;
  const ownEdit = isEdit && !asAssigner;
  // مهمّةٌ من زميل تُقفَل باعتماده لا بيد منفّذها — آخرُ خطوةٍ هنا «بانتظار الاعتماد».
  const fromColleague = ownEdit && Boolean(task?.assignedBy);
  const assignerName = task?.assignedBy?.name?.trim() || task?.assignedBy?.email || "مَن أسندها";

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

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const chosen = assignees.find((a) => a.id === form.assigneeId) ?? null;

  const canSubmit = !isPending && form.title.trim().length >= 3 && (!canAssign || form.assigneeId !== UNASSIGNED);

  const submit = () => {
    if (!canSubmit) return;
    const payload = {
      ...form,
      // The picker needs a non-empty sentinel, and the server needs "" to mean unassigned.
      assigneeId: form.assigneeId === UNASSIGNED ? "" : form.assigneeId,
      dueDate: showDue ? form.dueDate : "",
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
        toast({ title: "لم تُحفظ", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* جسمٌ يمرّر وحده وترويسةٌ وتذييلٌ ثابتان — فلا يُقصّ زرُّ الحفظ على الشاشة القصيرة. */}
      <DialogContent
        dir="rtl"
        className="flex max-h-[90vh] max-w-lg flex-col gap-0 p-0"
        // التركيزُ على العنوان لا على أوّل زرٍّ في الترويسة (الأولويّة) — إلّا في الإسناد، فأوّلُه الزميل.
        onOpenAutoFocus={(e) => {
          if (canAssign) return;
          e.preventDefault();
          document.getElementById("task-title")?.focus();
        }}
      >
        <DialogHeader className="border-b px-5 py-3 pe-12 text-start">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <DialogTitle className="text-base">{isEdit ? "تعديل المهمّة" : canAssign ? "إسناد مهمّة" : "مهمّة جديدة"}</DialogTitle>
            {canAssign ? (
              <>
                <span className="text-base font-semibold text-muted-foreground">إلى</span>
                <Select dir="rtl" value={form.assigneeId === UNASSIGNED ? "" : form.assigneeId} onValueChange={(v) => set("assigneeId", v)}>
                  <SelectTrigger
                    id="task-assignee"
                    aria-label="الزميل"
                    className={cn("h-8 w-auto min-w-36 gap-2 rounded-full px-3 text-sm text-foreground", !chosen && "border-dashed border-primary text-primary")}
                  >
                    <SelectValue placeholder="اختر الزميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignees.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {/* `bdi` يعزل الاسمَ اللاتينيّ عن الأرقام العربيّة؛ والفاصلُ «—» و«،» لا «·»
                            (النقطةُ بجانب رقمٍ عربيّ تُقرأ صفراً). */}
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
            <Select dir="rtl" value={form.priority} onValueChange={(v) => set("priority", v as FormState["priority"])}>
              <SelectTrigger aria-label="الأولويّة" className={cn(PILL, "border-current", TASK_PRIORITY_META[form.priority].tone)}>
                <span className="font-normal opacity-70">الأولويّة:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {TASK_PRIORITY_META[p].labelAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* للقارئ الصوتيّ فقط — سطرٌ ظاهرٌ يقول «غيّر ما تحتاج واحفظ» لا يضيف شيئاً لمن يرى النافذة. */}
          <DialogDescription className="sr-only">
            {isEdit ? "عدّل المهمّة واحفظ." : canAssign ? "اختر الزميل واكتب المهمّة — وهو يحدّد موعدها." : "اكتب المهمّة."}
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
          {/* العنوانُ هو المهمّة: كبيرٌ وبلا عنوانٍ فوقه. */}
          <Label htmlFor="task-title" className="sr-only">
            المهمّة
          </Label>
          <textarea
            id="task-title"
            dir="auto"
            rows={1}
            value={form.title}
            onChange={(e) => set("title", e.target.value.replace(/\n/g, " "))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="إيش المهمّة؟ مثلاً: تحديث صور مقالات العميل"
            // يطول مع النصّ (سطرٌ عادةً، اثنان لعنوانٍ طويل) — Tailwind 3 بلا `field-sizing`، فالخاصّيّةُ هنا.
            style={{ fieldSizing: "content" } as CSSProperties}
            className="max-h-24 w-full resize-none rounded-md border border-transparent bg-transparent px-1 py-1 text-base font-semibold leading-snug outline-none placeholder:font-normal placeholder:text-muted-foreground hover:border-border focus:border-primary"
          />

          {/* سطرُ الخصائص: ما يخصّ مهمّتك (الحالة والموعد) في حبّاتٍ صغيرة، ومن أسندها بجانبها. */}
          {showDue || ownEdit ? (
            <div className="flex flex-wrap items-center gap-2">
              {ownEdit ? (
                <Select dir="rtl" value={form.status} onValueChange={(v) => set("status", v as TaskStatusKey)}>
                  <SelectTrigger aria-label="الحالة" className={cn(PILL, TASK_STATUS_META[form.status].tone)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((st) => {
                      // «منجَزة» لمهمّةٍ من زميل قرارُه هو باعتمادها — الخادمُ يرفضها أيضاً.
                      const locked = fromColleague && st === "DONE" && task?.status !== "DONE";
                      return (
                        <SelectItem key={st} value={st} disabled={locked}>
                          <span className="flex items-center gap-1.5">
                            <span className={cn("size-2 rounded-full", TASK_STATUS_META[st].dot)} aria-hidden />
                            {TASK_STATUS_META[st].labelAr}
                            {locked ? <span className="text-[11px] font-normal text-muted-foreground">— يعتمدها <bdi>{assignerName}</bdi></span> : null}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              ) : null}
              {showDue ? (
                <DueDatePicker
                  value={form.dueDate}
                  onChange={(v) => set("dueDate", v)}
                  late={!!task && isTaskLate({ dueDate: form.dueDate ? new Date(form.dueDate) : null, status: form.status })}
                />
              ) : null}
              {fromColleague ? (
                <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
                  <UserRound className="size-3.5" aria-hidden />
                  من <bdi className="font-semibold text-foreground">{assignerName}</bdi>
                </span>
              ) : null}
            </div>
          ) : null}

          {ownEdit && task?.reviewNote ? (
            <p dir="auto" className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[12px] leading-snug text-rose-800 dark:text-rose-200">
              <span className="font-semibold">ملاحظة المراجعة: </span>
              {task.reviewNote}
            </p>
          ) : null}

          {/* التفاصيلُ ظاهرةٌ دائماً — كانت خلف «+ أضف تفاصيل» فلم يُرَ الزرّ. */}
          <div className="space-y-1">
            <Label htmlFor="task-desc" className="text-xs text-muted-foreground">
              التفاصيل (اختياريّ)
            </Label>
            <Textarea
              id="task-desc"
              dir="auto"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={5}
              placeholder="إيش المطلوب؟ وأيّ شيءٍ يساعد مَن سيُنفّذها"
              className="resize-y"
            />
          </div>
        </form>

        <DialogFooter className="gap-2 border-t px-5 py-3 sm:justify-start">
          <Button type="submit" form="task-form" disabled={!canSubmit}>
            {isPending ? "جارٍ الحفظ…" : isEdit ? "حفظ" : canAssign ? (chosen ? `إسناد إلى ${displayName(chosen)}` : "اختر الزميل أوّلاً") : "إضافة"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            إلغاء
          </Button>
          {ownEdit && onArchive && task ? (
            <Button
              type="button"
              variant="ghost"
              className="ms-auto text-muted-foreground"
              disabled={isPending}
              onClick={() => {
                onArchive(task);
                onClose();
              }}
            >
              أرشفة
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
