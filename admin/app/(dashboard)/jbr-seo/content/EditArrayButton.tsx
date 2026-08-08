"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ListPlus, Plus, Trash2, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
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

export type ArrayFieldDef = { key: string; label: string; long?: boolean; type?: "text" | "image" };

/** Fully serializable — built in the server component, spread into the client button. */
export type EditArrayProps = {
  section: string;
  /** path to the array itself, e.g. ["faqs"] or ["storyBlocks"] */
  path: (string | number)[];
  label: string;
  /** current array value */
  initial: unknown[];
  /** "string" = array of plain strings · "object" = array of records */
  itemKind: "string" | "object";
  /** editable keys for object items (hidden keys like id/icon are preserved) */
  fields?: ArrayFieldDef[];
  /** serializable template for a new item (cloned on add) */
  blank: unknown;
  /** short noun for one item, e.g. "سؤال" */
  itemNoun: string;
};

type Rec = Record<string, unknown>;
const s = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));

export function EditArrayButton({
  section,
  path,
  label,
  initial,
  itemKind,
  fields = [],
  blank,
  itemNoun,
}: EditArrayProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<unknown[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onOpenChange = (next: boolean) => {
    if (next) {
      setItems(structuredClone(initial));
      setError(null);
    }
    setOpen(next);
  };

  const setStringItem = (i: number, val: string) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? val : it)));
  const setObjField = (i: number, key: string, val: string) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...(it as Rec), [key]: val } : it)));
  const removeItem = (i: number) => setItems((arr) => arr.filter((_, idx) => idx !== i));
  const addItem = () => setItems((arr) => [...arr, structuredClone(blank)]);
  const move = (i: number, dir: -1 | 1) =>
    setItems((arr) => {
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      const next = [...arr];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateSectionField(section, path, items);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error ?? "تعذّر الحفظ");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        title={`إدارة ${label}`}
      >
        <ListPlus className="size-3.5" aria-hidden />
        إدارة العناصر
      </button>

      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-base">{label}</DialogTitle>
          <DialogDescription>
            حرّر · أضف · احذف · رتّب — ثم احفظ. كل شي يُكتب في الداتابيس وتتحدّث الصفحة.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-1 flex-1 space-y-3 overflow-y-auto px-1 py-1">
          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">لا عناصر — أضف واحد.</p>
          ) : null}

          {items.map((it, i) => (
            <div key={i} className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">
                  {itemNoun} {i + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                    className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30" title="أعلى">
                    <ChevronUp className="size-4" aria-hidden />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1}
                    className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30" title="أسفل">
                    <ChevronDown className="size-4" aria-hidden />
                  </button>
                  <button type="button" onClick={() => removeItem(i)}
                    className="inline-flex size-6 items-center justify-center rounded text-destructive hover:bg-destructive/10" title="حذف">
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </div>

              {itemKind === "string" ? (
                <Textarea
                  value={s(it)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setStringItem(i, e.target.value)}
                  rows={2}
                  dir="rtl"
                  className="text-sm leading-7"
                />
              ) : (
                <div className="space-y-2">
                  {fields.map((f) => {
                    const val = s((it as Rec)[f.key]);
                    return (
                      <div key={f.key}>
                        <label className="mb-0.5 block text-[11px] font-medium text-muted-foreground">{f.label}</label>
                        {f.type === "image" ? (
                          <div className="flex items-start gap-2">
                            {val ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={val} alt="" className="size-14 shrink-0 rounded-md border border-border object-cover" />
                            ) : (
                              <div className="flex size-14 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-[10px] text-muted-foreground">لا صورة</div>
                            )}
                            <Textarea
                              value={val}
                              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setObjField(i, f.key, e.target.value)}
                              rows={2}
                              dir="ltr"
                              placeholder="الصق رابط الصورة (Cloudinary مُفضّل)"
                              className="flex-1 text-xs leading-6"
                            />
                          </div>
                        ) : (
                          <Textarea
                            value={val}
                            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setObjField(i, f.key, e.target.value)}
                            rows={f.long ? 4 : 1}
                            dir="rtl"
                            className="text-sm leading-7"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary/40 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
          >
            <Plus className="size-4" aria-hidden />
            أضف {itemNoun}
          </button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter className="gap-2 border-t border-border pt-3 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            إلغاء
          </Button>
          <Button type="button" onClick={save} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {pending ? "يحفظ…" : `حفظ (${items.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
