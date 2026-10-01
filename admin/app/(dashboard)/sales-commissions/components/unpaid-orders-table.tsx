"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HandCoins, Loader2 } from "lucide-react";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { recordCommissionPayoutAction } from "../actions/record-commission-payout";

export interface UnpaidRow {
  orderId: string;
  number: string;
  clientName: string;
  soldOn: string;
  kind: "new" | "renewal";
  base: string;
  rate: string;
  /** Signed: a clawback (paid, then refunded) is negative. */
  amountMinor: number;
  clawback: boolean;
}

/**
 * The rep's orders whose commission is still unpaid — tick, then «اصرف المحدد».
 * Clawback lines (paid out, then refunded) start ticked: they are owed back and come off the
 * next payout. The total shown is only a preview — the server prices every order again.
 */
export function UnpaidOrdersTable({
  staffId,
  staffName,
  currency,
  rows,
  format,
}: {
  staffId: string;
  staffName: string;
  currency: string;
  rows: UnpaidRow[];
  /** Pre-formatted money strings keyed by minor amount would not survive negatives; so a locale+currency pair. */
  format: { locale: string; currency: string };
}) {
  const [picked, setPicked] = useState<Set<string>>(() => new Set(rows.filter((r) => r.clawback).map((r) => r.orderId)));
  const [open, setOpen] = useState(false);
  const [paidOn, setPaidOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const money = useMemo(() => {
    const f = new Intl.NumberFormat(format.locale, { style: "currency", currency: format.currency, minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return (minor: number) => f.format(minor / 100);
  }, [format.locale, format.currency]);

  const total = rows.filter((r) => picked.has(r.orderId)).reduce((s, r) => s + r.amountMinor, 0);
  const count = rows.filter((r) => picked.has(r.orderId)).length;
  const allPicked = rows.length > 0 && rows.every((r) => picked.has(r.orderId));

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  function pay() {
    setError(null);
    start(async () => {
      const res = await recordCommissionPayoutAction({ staffId, currency, orderIds: [...picked], paidOn, note: note.trim() || undefined });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      setPicked(new Set());
      setNote("");
      // Stay on this currency: without it the page opens the next currency that still owes.
      router.replace(`/sales-commissions?rep=${staffId}&cur=${currency}`, { scroll: false });
    });
  }

  if (rows.length === 0) {
    return <p className="rounded-xl border bg-card px-4 py-8 text-center text-sm text-muted-foreground">ما في طلبات عمولتها لسه ما انصرفت.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th className="w-10 px-3 py-3">
              <input
                type="checkbox"
                aria-label="تحديد الكل"
                className="size-4 accent-primary"
                checked={allPicked}
                onChange={() => setPicked(allPicked ? new Set() : new Set(rows.map((r) => r.orderId)))}
              />
            </th>
            <th className="px-3 py-3 text-start font-medium">الطلب</th>
            <th className="px-3 py-3 text-start font-medium">العميل</th>
            <th className="px-3 py-3 text-start font-medium">التاريخ</th>
            <th className="px-3 py-3 text-start font-medium">النوع</th>
            <th className="px-3 py-3 text-start font-medium">قبل الضريبة × النسبة</th>
            <th className="px-3 py-3 text-end font-medium">العمولة</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => {
            const on = picked.has(r.orderId);
            return (
              <tr
                key={r.orderId}
                onClick={() => toggle(r.orderId)}
                className={cn("cursor-pointer transition-colors", on ? "bg-primary/5" : "hover:bg-muted/40", r.clawback && "bg-rose-50/70 dark:bg-rose-950/20")}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    aria-label={`تحديد ${r.number}`}
                    className="size-4 accent-primary"
                    checked={on}
                    onChange={() => toggle(r.orderId)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-3 py-3 tabular-nums" dir="ltr">
                  {r.number}
                </td>
                <td className="max-w-[220px] truncate px-3 py-3" title={r.clientName}>
                  {r.clientName}
                </td>
                <td className="px-3 py-3 tabular-nums text-muted-foreground">{r.soldOn}</td>
                <td className="px-3 py-3">
                  {r.clawback ? <span className="font-medium text-rose-600">خصم — استُردّ بعد الصرف</span> : r.kind === "new" ? "جديدة" : "تجديد"}
                </td>
                <td className="px-3 py-3 tabular-nums text-muted-foreground">{r.clawback ? "—" : `${r.base} × ${r.rate}`}</td>
                <td className={cn("px-3 py-3 text-end font-semibold tabular-nums", r.clawback && "text-rose-600")}>{money(r.amountMinor)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t bg-card px-4 py-3">
        <p className="text-sm">
          المحدد: <b>{count}</b> طلب · المجموع <b className={cn("text-base tabular-nums", total < 0 && "text-rose-600")}>{money(total)}</b>
        </p>
        <Button type="button" className="gap-1.5" disabled={count === 0 || total <= 0} onClick={() => { setError(null); setOpen(true); }}>
          <HandCoins className="size-4" aria-hidden />
          اصرف المحدد
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>صرف {money(total)} لـ{staffName}</DialogTitle>
            <DialogDescription>
              عمولة {count} طلب. بعد الصرف تختفي من الجدول، وتظهر في «ما انصرف له».
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            تاريخ الصرف
            <Input type="date" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} dir="ltr" />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            ملاحظة (اختياري)
            <Input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="مثال: تحويل بنكي — عمولة سبتمبر" />
          </label>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              إلغاء
            </Button>
            <Button type="button" onClick={pay} disabled={pending}>
              {pending && <Loader2 className="me-2 size-4 animate-spin" aria-hidden />}
              تأكيد الصرف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
