"use client";

import { useState, useTransition } from "react";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { ImagePlus, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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

import { ImageField } from "./image-field";
import type { AchievementInput } from "../helpers/page-content-types";
import { updateAchievements } from "../actions/update-achievements";

const EMPTY: AchievementInput = { value: "", label: "", image: "", description: "" };

/**
 * «القيمة» رقمٌ ووحدته لا جملة: شريكٌ كتب فيها ٤٢ محرفاً فخرجت عن خليّتها على آيفون ٣٩٠
 * وقُصّت. الحدّ يمنع الجديد، والقديم يبقى ويُنبَّه عليه بلا حذف صامت.
 */
const VALUE_MAX = 24;
const LABEL_MAX = 52;
const DESC_MAX = 250;

interface Draft {
  index: number | null;
  value: AchievementInput;
}

/**
 * الإنجازات داخل بطاقتها في عرض الرئيسية — نفس نمط الاعتمادات: البطاقة تبقى عرضاً،
 * والإدخال في حوار يحفظ لحاله بلا زرّ حفظٍ في آخر الصفحة.
 */
export function AchievementsEditor({
  achievements,
  onChange,
}: {
  achievements: AchievementInput[];
  onChange: (next: AchievementInput[]) => void;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, startTransition] = useTransition();
  const { confirmThen, confirmDialog } = useConfirm({ title: "حذف إنجاز" });

  function persist(next: AchievementInput[], done: string) {
    startTransition(async () => {
      const res = await updateAchievements(next);
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
    const value = {
      ...draft.value,
      value: draft.value.value.trim(),
      label: draft.value.label.trim(),
    };
    if (!value.value || !value.label) return;
    const next =
      draft.index === null
        ? [...achievements, value]
        : achievements.map((a, i) => (i === draft.index ? value : a));
    persist(next, draft.index === null ? "أضفنا الإنجاز" : "حدّثنا الإنجاز");
  }

  function remove(index: number) {
    const a = achievements[index];
    confirmThen(
      `«${a.value} ${a.label}» بيختفي من صفحتك${a.image ? "، وصورته بتنحذف معه" : ""}.`,
      () => persist(achievements.filter((_, i) => i !== index), "حذفنا الإنجاز"),
      "احذف"
    );
  }

  const patch = (p: Partial<AchievementInput>) =>
    setDraft((d) => (d ? { ...d, value: { ...d.value, ...p } } : d));

  return (
    <div className="space-y-2">
      {achievements.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          ما عندك أرقام بعد — رقم ووحدته وعنوان قصير، مثل «+٥٠٠ عملية ناجحة».
        </p>
      ) : (
        <ul className="space-y-1.5">
          {achievements.map((a, i) => (
            <li
              key={`${a.value}-${i}`}
              className="flex items-center gap-2 rounded-lg border bg-muted/20 ps-2 pe-1"
            >
              {a.image ? (
                <OptimizedImage
                  media={asMedia(a.image, a.label)}
                  alt=""
                  width={32}
                  height={32}
                  sizes="32px"
                  className="h-8 w-8 shrink-0 rounded object-cover"
                />
              ) : (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-muted text-muted-foreground">
                  <ImagePlus className="h-4 w-4" aria-hidden />
                </span>
              )}
              <span className="min-w-0 flex-1 py-2 max-sm:line-clamp-2 sm:truncate text-xs text-foreground">
                <span className="font-bold" dir="auto">{a.value}</span>
                <span className="text-muted-foreground"> — {a.label}</span>
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setDraft({ index: i, value: a })}
                aria-label={`عدّل ${a.label}`}
                className="h-11 w-11 shrink-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => remove(i)}
                aria-label={`احذف ${a.label}`}
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
        أضف إنجازاً
      </Button>

      <Dialog
        open={draft !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setDraft(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{draft?.index === null ? "إنجاز جديد" : "تعديل الإنجاز"}</DialogTitle>
            <DialogDescription>رقم ووحدته، وعنوان قصير يقول إيش يعني.</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="space-y-3"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <DialogField label="الرقم *">
                <Input
                  autoFocus
                  value={draft?.value.value ?? ""}
                  onChange={(e) => patch({ value: e.target.value })}
                  maxLength={VALUE_MAX}
                  placeholder="+500"
                  dir="auto"
                />
              </DialogField>
              <DialogField label="العنوان *">
                <Input
                  value={draft?.value.label ?? ""}
                  onChange={(e) => patch({ label: e.target.value })}
                  maxLength={LABEL_MAX}
                  placeholder="عملية ناجحة"
                />
              </DialogField>
            </div>

            <DialogField label="فقرة قصيرة (اختياري)">
              <Textarea
                value={draft?.value.description ?? ""}
                onChange={(e) => patch({ description: e.target.value })}
                maxLength={DESC_MAX}
                rows={3}
                className="resize-none text-sm"
                placeholder="سطران يحكيان القصة وراء الرقم"
              />
            </DialogField>

            <ImageField
              image={draft?.value.image ?? ""}
              onChange={(image) => patch({ image })}
              label="صورة (اختياري)"
              folder="achievements"
            />

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setDraft(null)} disabled={pending}>
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={pending || !draft?.value.value.trim() || !draft?.value.label.trim()}
                className="gap-1.5"
              >
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
