"use client";

import { useState, useTransition } from "react";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { Loader2, Pencil, Plus, Trash2, User } from "lucide-react";
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
import { useConfirm } from "@/app/(dashboard)/components/use-confirm";

import type { TeamMemberInput } from "../helpers/page-content-types";
import { updateTeam } from "../actions/update-team";

const EMPTY: TeamMemberInput = { name: "", role: "", bio: "", photoUrl: "" };

interface Draft {
  index: number | null;
  value: TeamMemberInput;
}

/**
 * الفريق داخل بطاقته في عرض الرئيسية — نفس نمط الاعتمادات والإنجازات: البطاقة عرض،
 * والإدخال في حوار يحفظ لحاله.
 */
export function TeamEditor({
  team,
  onChange,
}: {
  team: TeamMemberInput[];
  onChange: (next: TeamMemberInput[]) => void;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, startTransition] = useTransition();
  const { confirmThen, confirmDialog } = useConfirm({ title: "حذف عضو" });

  function persist(next: TeamMemberInput[], done: string) {
    startTransition(async () => {
      const res = await updateTeam(next);
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
    const value = { ...draft.value, name: draft.value.name.trim() };
    if (!value.name) return;
    const next =
      draft.index === null
        ? [...team, value]
        : team.map((m, i) => (i === draft.index ? value : m));
    persist(next, draft.index === null ? "أضفنا العضو" : "حدّثنا بيانات العضو");
  }

  function remove(index: number) {
    const m = team[index];
    confirmThen(
      `«${m.name}» بيختفي من صفحة «من نحن» في موقعك.`,
      () => persist(team.filter((_, i) => i !== index), "حذفنا العضو"),
      "احذف"
    );
  }

  const patch = (p: Partial<TeamMemberInput>) =>
    setDraft((d) => (d ? { ...d, value: { ...d.value, ...p } } : d));

  return (
    <div className="space-y-2">
      {team.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          ما أضفت أحداً بعد — الاسم والمسمّى يكفيان، والصورة تزيد الثقة.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {team.map((m, i) => (
            <li
              key={`${m.name}-${i}`}
              className="flex items-center gap-2 rounded-lg border bg-muted/20 ps-2 pe-1"
            >
              {m.photoUrl ? (
                <OptimizedImage
                  media={asMedia(m.photoUrl, m.name)}
                  alt=""
                  width={32}
                  height={32}
                  sizes="32px"
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                  <User className="h-4 w-4" aria-hidden />
                </span>
              )}
              <span className="min-w-0 flex-1 py-2 max-sm:line-clamp-2 sm:truncate text-xs text-foreground">
                {m.name}
                {m.role && <span className="text-muted-foreground"> — {m.role}</span>}
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setDraft({ index: i, value: m })}
                aria-label={`عدّل ${m.name}`}
                className="h-11 w-11 shrink-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => remove(i)}
                aria-label={`احذف ${m.name}`}
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
        أضف عضواً
      </Button>

      <Dialog
        open={draft !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setDraft(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{draft?.index === null ? "عضو جديد" : "تعديل العضو"}</DialogTitle>
            <DialogDescription>يظهر في «من نحن» على موقعك.</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="space-y-3"
          >
            <DialogField label="الاسم *">
              <Input
                autoFocus
                value={draft?.value.name ?? ""}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="د. سارة منصور"
              />
            </DialogField>

            <DialogField label="المسمّى (اختياري)">
              <Input
                value={draft?.value.role ?? ""}
                onChange={(e) => patch({ role: e.target.value })}
                placeholder="استشاري تخدير"
              />
            </DialogField>

            <DialogField label="رابط صورة (اختياري)">
              <Input
                type="url"
                inputMode="url"
                dir="ltr"
                className="text-start"
                value={draft?.value.photoUrl ?? ""}
                onChange={(e) => patch({ photoUrl: e.target.value })}
                placeholder="https://…"
              />
            </DialogField>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setDraft(null)} disabled={pending}>
                إلغاء
              </Button>
              <Button type="submit" disabled={pending || !draft?.value.name.trim()} className="gap-1.5">
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
