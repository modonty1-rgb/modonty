"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SocialCalendarKind } from "@prisma/client";
import { Archive, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { archiveSocialCalendar, updateSocialCalendar } from "../actions";
import { calendarHomeHref } from "../helpers/post-href";

type Designer = { id: string; name: string };

const KINDS: { kind: SocialCalendarKind; label: string }[] = [
  { kind: "CONTENT", label: "محتوى" },
  { kind: "SOCIAL", label: "سوشيال ميديا" },
];

/**
 * إعدادات الكاليندر في رأسه (خالد ١١ أكتوبر ٢٠٢٦): النوع · الاسم (إلّا المربوط بعميل فباسم عميله) ·
 * المصمم مرّة واحدة لا على كل منشور · الأرشفة لا الحذف. الحفظ يمسح «محتاج مراجعة».
 * التأسيس في `/social-calendar/new`.
 */
export function CalendarSettingsDialog({
  calendarId,
  initialKind,
  initialName = "",
  nameEditable,
  initialDesignerId = null,
  reviewNote,
  canArchive,
  designers,
}: {
  calendarId: string;
  initialKind: SocialCalendarKind;
  initialName?: string;
  nameEditable: boolean;
  initialDesignerId?: string | null;
  reviewNote: string | null;
  canArchive: boolean;
  designers: Designer[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [kind, setKind] = useState<SocialCalendarKind>(initialKind);
  const [name, setName] = useState(initialName);
  const [designerId, setDesignerId] = useState<string | null>(initialDesignerId);
  const [pending, startTransition] = useTransition();
  const designerName = designers.find((d) => d.id === initialDesignerId)?.name;

  function openDialog() {
    setKind(initialKind);
    setName(initialName);
    setDesignerId(initialDesignerId);
    setConfirmArchive(false);
    setOpen(true);
  }

  function submit() {
    startTransition(async () => {
      const res = await updateSocialCalendar({ calendarId, kind, designerId, ...(nameEditable ? { name } : {}) });
      if (!res.success) return void toast({ title: res.error, variant: "destructive" });
      toast({ title: "تم الحفظ", variant: "success" });
      setOpen(false);
      router.refresh();
    });
  }

  function archive() {
    startTransition(async () => {
      const res = await archiveSocialCalendar(calendarId);
      if (!res.success) return void toast({ title: res.error, variant: "destructive" });
      toast({ title: "تمت الأرشفة — تسترجعه من «المؤرشفة» أسفل القسم", variant: "success" });
      setOpen(false);
      router.push(calendarHomeHref({ kind: initialKind }));
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          reviewNote ? "border-amber-400" : "border-border",
        )}
      >
        <Settings2 className="h-3.5 w-3.5" />
        {reviewNote && <span className="font-semibold text-amber-700 dark:text-amber-300">محتاج مراجعة ·</span>}
        المصمم: <span className="font-semibold text-foreground">{designerName ?? "بدون"}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="sm:max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>إعدادات الكاليندر</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            {reviewNote && (
              <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200">
                محتاج مراجعة: {reviewNote}
              </p>
            )}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-foreground">النوع</span>
              <div className="grid grid-cols-2 gap-2">
                {KINDS.map((k) => (
                  <button
                    key={k.kind}
                    type="button"
                    aria-pressed={kind === k.kind}
                    onClick={() => setKind(k.kind)}
                    className={cn(
                      "h-9 rounded-md border text-sm transition-colors",
                      kind === k.kind ? "border-primary bg-primary/10 font-semibold text-foreground" : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>
            {nameEditable && (
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-foreground">الاسم</span>
                <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
              </label>
            )}
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-foreground">المصمم</span>
              <select
                value={designerId ?? ""}
                onChange={(e) => setDesignerId(e.target.value || null)}
                className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
              >
                <option value="">بدون مصمم</option>
                {designers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <span className="block text-[11px] leading-snug text-muted-foreground">
                كل منشور في هذا الكاليندر يذهب تاسك تصميمه للمصمم. تغييره ينقل إليه ما لم يُعتمد بعد.
              </span>
            </label>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            {canArchive ? (
              confirmArchive ? (
                <Button type="button" size="sm" variant="destructive" disabled={pending} onClick={archive} className="gap-1.5">
                  <Archive className="h-3.5 w-3.5" />
                  تأكيد الأرشفة
                </Button>
              ) : (
                <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmArchive(true)} className="gap-1.5 text-muted-foreground">
                  <Archive className="h-3.5 w-3.5" />
                  أرشفة
                </Button>
              )
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button type="button" size="sm" disabled={pending || (nameEditable && !name.trim())} onClick={submit}>
                {pending ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
