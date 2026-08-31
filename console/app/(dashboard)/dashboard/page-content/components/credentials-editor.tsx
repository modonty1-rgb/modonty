"use client";

import { useState, useTransition } from "react";
import { Award, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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

import type { CredentialInput } from "../helpers/page-content-types";
import { updateCredentials } from "../actions/update-credentials";

const EMPTY: CredentialInput = { name: "", authority: "", year: "", url: "" };

/** الاعتماد الذي يُحرَّر الآن: `index === null` يعني جديداً. */
interface Draft {
  index: number | null;
  value: CredentialInput;
}

/**
 * الاعتمادات داخل بطاقتها في عرض الرئيسية: قائمة تُقرأ، وحوارٌ يُدخِل ويحفظ.
 *
 * ثلاثة حقول فارغة تنبت في الصفحة عند كل إضافة كانت تزحم البطاقة وتخلط بين «أرى موقعي»
 * و«أعبّي بيانات» (خالد ٣١ أغسطس). الحوار يفصل الفعلين: البطاقة تبقى عرضاً، والإدخال
 * يحصل في مكانه ثم يُحفظ فوراً — بلا زرّ حفظٍ في آخر الصفحة يُنتظر.
 */
export function CredentialsEditor({
  credentials,
  onChange,
}: {
  credentials: CredentialInput[];
  onChange: (next: CredentialInput[]) => void;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, startTransition] = useTransition();
  const { confirmThen, confirmDialog } = useConfirm({ title: "حذف اعتماد" });

  function persist(next: CredentialInput[], done: string) {
    startTransition(async () => {
      const res = await updateCredentials(next);
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
        ? [...credentials, value]
        : credentials.map((c, i) => (i === draft.index ? value : c));
    persist(next, draft.index === null ? "أضفنا الاعتماد" : "حدّثنا الاعتماد");
  }

  function remove(index: number) {
    const c = credentials[index];
    confirmThen(
      `«${c.name}» بيختفي من شريط الاعتمادات في صفحتك.`,
      () => persist(credentials.filter((_, i) => i !== index), "حذفنا الاعتماد"),
      "احذف"
    );
  }

  return (
    <div className="space-y-2">
      {credentials.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          ما عندك اعتمادات بعد — أضف شهاداتك وعضوياتك وبتظهر تحت الغلاف مباشرة.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {credentials.map((c, i) => (
            <li
              key={`${c.name}-${i}`}
              className="flex items-center gap-2 rounded-lg border bg-muted/20 ps-3 pe-1"
            >
              <Award className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 flex-1 py-2 max-sm:line-clamp-2 sm:truncate text-xs text-foreground">
                {c.name}
                {(c.authority || c.year) && (
                  <span className="text-muted-foreground">
                    {" · "}
                    {[c.authority, c.year].filter(Boolean).join(" · ")}
                  </span>
                )}
              </span>
              {/* ٤٤ بكسلاً لكل هدف — Apple HIG وWCAG 2.5.8؛ الأيقونة وحدها لا تكفي
                  لقارئ الشاشة فتحمل اسم الاعتماد في `aria-label`. */}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setDraft({ index: i, value: c })}
                aria-label={`عدّل ${c.name}`}
                className="h-11 w-11 shrink-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => remove(i)}
                aria-label={`احذف ${c.name}`}
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
        // مدخل الحوار كلّه — يُلمس بإصبع، فيأخذ ٤٤ بكسلاً كاملة لا ٣٦.
        className="min-h-11 gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        أضف اعتماداً
      </Button>

      <Dialog
        open={draft !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setDraft(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{draft?.index === null ? "اعتماد جديد" : "تعديل الاعتماد"}</DialogTitle>
            {/* شريط الاعتمادات يعرض أوّل أربعة فقط (`trust-strip.tsx:13`) — يُقال هنا
                بدل ما يكتشفه الشريك بعد ما يدخل عشرة ويشوف أربعة. */}
            <DialogDescription>
              يظهر تحت غلاف صفحتك — أوّل أربعة اعتمادات هي اللي تبان للزائر.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="space-y-3"
          >
            <DialogField label="اسم الاعتماد *">
              <Input
                autoFocus
                value={draft?.value.name ?? ""}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, value: { ...d.value, name: e.target.value } } : d))
                }
                placeholder="عضوية الجمعية الأمريكية لجراحة المناظير"
              />
            </DialogField>

            <DialogField label="الجهة المانحة (اختياري)">
              <Input
                value={draft?.value.authority ?? ""}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, value: { ...d.value, authority: e.target.value } } : d
                  )
                }
                placeholder="SAGES"
              />
            </DialogField>

            <DialogField label="السنة (اختياري)">
              <Input
                dir="ltr"
                inputMode="numeric"
                maxLength={4}
                value={draft?.value.year ?? ""}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, value: { ...d.value, year: e.target.value } } : d))
                }
                placeholder="2012"
                className="text-start"
              />
            </DialogField>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraft(null)}
                disabled={pending}
              >
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
