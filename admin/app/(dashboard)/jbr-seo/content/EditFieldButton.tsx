"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";
import { updateSectionField } from "./actions/content-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type EditTarget = { section: string; path: (string | number)[] };

type Props = {
  target: EditTarget;
  label: string;
  value: string;
  /** field number shown on the reference row */
  n?: number;
};

/** Pencil button on a reference row → dialog to edit that one field → save → refresh. */
export function EditFieldButton({ target, label, value, n }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // reset the draft whenever the dialog is (re)opened, so it reflects latest value
  const onOpenChange = (next: boolean) => {
    if (next) {
      setDraft(value);
      setError(null);
    }
    setOpen(next);
  };

  const save = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateSectionField(target.section, target.path, draft);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error ?? "تعذّر الحفظ");
      }
    });
  };

  const unchanged = draft === value;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        aria-label={`تعديل ${label}`}
        title="تعديل"
      >
        <Pencil className="size-3.5" aria-hidden />
      </button>

      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-base">
            {n ? <span className="text-primary">#{n} · </span> : null}
            {label}
          </DialogTitle>
          <DialogDescription>عدّل النص واحفظ — يُكتب في الداتابيس مباشرة وتتحدّث الصفحة.</DialogDescription>
        </DialogHeader>

        <Textarea
          value={draft}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value)}
          rows={Math.min(14, Math.max(3, draft.split("\n").length + 1))}
          dir="rtl"
          className="text-sm leading-7"
          autoFocus
        />

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            إلغاء
          </Button>
          <Button type="button" onClick={save} disabled={pending || unchanged}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {pending ? "يحفظ…" : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
