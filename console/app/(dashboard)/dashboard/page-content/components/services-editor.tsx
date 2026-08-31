"use client";

import { useState, useTransition } from "react";
import { Briefcase, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import { useConfirm } from "@/app/(dashboard)/components/use-confirm";

import type { ServiceInput } from "../helpers/page-content-types";
import { updateServices } from "../actions/update-services";

const EMPTY: ServiceInput = { title: "", description: "", icon: "" };

interface Draft {
  index: number | null;
  value: ServiceInput;
}

/**
 * الخدمات داخل بطاقتها — آخر قسم كان معلّقاً على زرّ الحفظ العام. بعده ما بقي في الشاشة
 * زرّ حفظٍ واحد لكل شي: كل قسم يحفظ نفسه في مكانه (خالد ٣١ أغسطس).
 */
export function ServicesEditor({
  services,
  onChange,
}: {
  services: ServiceInput[];
  onChange: (next: ServiceInput[]) => void;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, startTransition] = useTransition();
  const { confirmThen, confirmDialog } = useConfirm({ title: "حذف خدمة" });

  function persist(next: ServiceInput[], done: string) {
    startTransition(async () => {
      const res = await updateServices(next);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      onChange(next);
      setDraft(null);
      toast.success(done);
    });
  }

  function submit() {
    if (!draft) return;
    const value = { ...draft.value, title: draft.value.title.trim() };
    if (!value.title) return;
    const next =
      draft.index === null
        ? [...services, value]
        : services.map((s, i) => (i === draft.index ? value : s));
    persist(next, draft.index === null ? "أضفنا الخدمة" : "حدّثنا الخدمة");
  }

  function remove(index: number) {
    const s = services[index];
    confirmThen(
      `«${s.title}» بتختفي من صفحتك ومن صفحة خدماتنا.`,
      () => persist(services.filter((_, i) => i !== index), "حذفنا الخدمة"),
      "احذف"
    );
  }

  const patch = (p: Partial<ServiceInput>) =>
    setDraft((d) => (d ? { ...d, value: { ...d.value, ...p } } : d));

  return (
    <div className="space-y-2">
      {services.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          ما أضفت خدمات بعد — اسم الخدمة وسطر يشرحها يكفيان.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {services.map((s, i) => (
            <li
              key={`${s.title}-${i}`}
              className="flex items-start gap-2 rounded-lg border bg-muted/20 ps-3 pe-1"
            >
              <Briefcase className="mt-2.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 flex-1 py-2 text-xs text-foreground">
                <span className="font-semibold">{s.title}</span>
                {s.description && (
                  <span className="mt-0.5 block line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                    {s.description}
                  </span>
                )}
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setDraft({ index: i, value: s })}
                aria-label={`عدّل ${s.title}`}
                className="h-11 w-11 shrink-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => remove(i)}
                aria-label={`احذف ${s.title}`}
                className="h-11 w-11 shrink-0 text-[hsl(var(--destructive-ink))] hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setDraft({ index: null, value: EMPTY })}
        className="min-h-11 gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        أضف خدمة
      </Button>

      <Dialog
        open={draft !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setDraft(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{draft?.index === null ? "خدمة جديدة" : "تعديل الخدمة"}</DialogTitle>
            <DialogDescription>تظهر في الرئيسية وفي صفحة خدماتنا.</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="space-y-3"
          >
            <DialogField label="اسم الخدمة *">
              <Input
                autoFocus
                value={draft?.value.title ?? ""}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="تكميم المعدة بالمنظار"
              />
            </DialogField>

            <DialogField label="وصف مختصر (اختياري)">
              <Textarea
                value={draft?.value.description ?? ""}
                onChange={(e) => patch({ description: e.target.value })}
                rows={3}
                className="resize-none text-sm"
                placeholder="سطر أو سطران يقولان للزائر إيش يستفيد"
              />
            </DialogField>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setDraft(null)} disabled={pending}>
                إلغاء
              </Button>
              <Button type="submit" disabled={pending || !draft?.value.title.trim()} className="gap-1.5">
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {pending ? "نحفظ…" : "احفظ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {confirmDialog}
    </div>
  );
}

/** تسمية ظاهرة فوق الحقل — `placeholder` يختفي بأوّل حرف فيضيع معناه. */
function DialogField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
