"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ReferralLeadStatus } from "@prisma/client";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

import { setReferralStatus, type ReferralRow } from "../actions/referral-actions";
import { ALLOWED_NEXT, STATUS_AR, IS_CLOSED } from "../helpers/referral-status";

interface ClientOption { id: string; name: string }

/** ألوان الحالة: الحيّ يتقدّم أخضراً، والمغلق يهدأ رمادياً، والمرفوض أحمر هادئ. */
const TONE: Record<ReferralLeadStatus, string> = {
  NEW: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  CONTACTED: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  SUBSCRIBED: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  PAID: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  REWARDED: "bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 font-semibold",
  REJECTED: "bg-destructive/15 text-destructive",
  LOST: "bg-muted text-muted-foreground",
};

const DATE = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
});
const when = (d: Date | string | null) => (d ? DATE.format(new Date(d)) : null);

/** السجلّ الزمني — أختامٌ فعلية فقط. الختم الغائب لا يُرسم، فالفراغ نفسه معلومة. */
function Timeline({ row }: { row: ReferralRow }) {
  const steps = [
    ["وافق على التواصل", row.consentConfirmedAt],
    ["تواصلنا", row.contactedAt],
    ["اشترك", row.subscribedAt],
    ["سدّد", row.paidAt],
    ["مُنحت المكافأة", row.rewardedAt],
  ] as const;
  const done = steps.filter(([, at]) => at);
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {done.map(([label, at], i) => (
        <li key={label} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden>←</span>}
          <span>{label}</span>
          <span dir="ltr" className="opacity-70">{when(at)}</span>
        </li>
      ))}
    </ol>
  );
}

export function ReferralsTable({ rows, clients }: { rows: ReferralRow[]; clients: ClientOption[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<{ row: ReferralRow; next: ReferralLeadStatus } | null>(null);
  const [note, setNote] = useState("");
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState<string | null>(null);

  /** الرفض والانقطاع يطلبان سبباً — بلاه يصير التقرير «١٢ انقطعوا» بلا تفسير واحد. */
  const needsNote = (s: ReferralLeadStatus) => s === "REJECTED" || s === "LOST";
  /** «اشترك» يطلب العميل الناتج — وهو ما يربط السداد لاحقاً بهذه الإحالة بالذات. */
  const needsClient = (s: ReferralLeadStatus) => s === "SUBSCRIBED";

  function move(row: ReferralRow, next: ReferralLeadStatus) {
    if (needsNote(next) || needsClient(next)) {
      setTarget({ row, next }); setNote(""); setClientId(""); setError(null); return;
    }
    run(row.id, next);
  }

  function run(id: string, next: ReferralLeadStatus, input?: { closingNote?: string; convertedClientId?: string }) {
    setError(null);
    startTransition(async () => {
      const res = await setReferralStatus(id, next, input ?? {});
      if (!res.ok) { setError(res.error ?? "تعذّر الحفظ."); return; }
      setTarget(null);
      router.refresh();
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-sm font-medium">لا توجد إحالات بعد</p>
        <p className="mt-1 text-xs text-muted-foreground">
          الإحالات تصل من تطبيق الشركاء — يرفعها العميل بنفسه بعد تأكيد موافقة صاحب الرقم.
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">{error}</p>
      )}

      <ul className="space-y-2">
        {rows.map((row) => {
          const next = ALLOWED_NEXT[row.status];
          return (
            <li key={row.id} className="rounded-xl border bg-card p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-xs ${TONE[row.status]}`}>
                      {STATUS_AR[row.status]}
                    </span>
                    <span className="font-medium">{row.candidateName || "بلا اسم"}</span>
                    <a href={`tel:${row.phoneE164}`} dir="ltr" className="text-sm text-link hover:underline">
                      {row.phoneE164}
                    </a>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    أحالَه: <b>{row.referrerName}</b> · {when(row.createdAt)}
                  </p>
                  {row.candidateNote && (
                    <p className="mt-1 text-xs text-muted-foreground">ملاحظة المُحيل: {row.candidateNote}</p>
                  )}
                  {row.closingNote && (
                    <p className="mt-1 text-xs text-destructive">السبب: {row.closingNote}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {next.map((s) => (
                    <Button key={s} size="sm" variant={s === "REJECTED" || s === "LOST" ? "outline" : "default"}
                      disabled={pending} onClick={() => move(row, s)}>
                      {pending && <Loader2 className="size-3.5 animate-spin" />}
                      {STATUS_AR[s]}
                    </Button>
                  ))}
                  {IS_CLOSED(row.status) && (
                    <span className="text-xs text-muted-foreground">انتهى مسارها</span>
                  )}
                </div>
              </div>

              <div className="mt-2 border-t pt-2">
                <Timeline row={row} />
              </div>
            </li>
          );
        })}
      </ul>

      <Dialog open={target !== null} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{target ? STATUS_AR[target.next] : ""}</DialogTitle>
            <DialogDescription>
              {target && needsClient(target.next)
                ? "اختر العميل الذي صار منه المُرشَّح. هذا ما يجعل السداد يُحسب لصاحب الإحالة تلقائياً."
                : "اكتب السبب بخطّك — يظهر على الإحالة، وبلاه يصير التقرير أرقاماً بلا تفسير."}
            </DialogDescription>
          </DialogHeader>

          {target && needsClient(target.next) ? (
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              autoFocus
            >
              <option value="">— اختر العميل —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : (
            <Input value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="مثال: الرقم لا يردّ بعد ثلاث محاولات" autoFocus />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)} disabled={pending}>إلغاء</Button>
            <Button
              disabled={pending || !target || (needsClient(target.next) ? clientId === "" : note.trim().length === 0)}
              onClick={() => target && run(target.row.id, target.next,
                needsClient(target.next) ? { convertedClientId: clientId } : { closingNote: note })}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
