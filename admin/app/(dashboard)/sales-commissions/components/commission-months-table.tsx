"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HandCoins, Loader2, Minus, Plus } from "lucide-react";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { recordCommissionPayoutAction } from "../actions/record-commission-payout";

export interface CommissionRow {
  orderId: string;
  number: string;
  clientName: string;
  /** YYYY-MM-DD — the day the order was sold; its month is the row it sits under. */
  soldOn: string;
  kind: "new" | "renewal";
  /** «4,000 ج.م × 6٪» — how the commission was reached; null for a refunded order. */
  basis: string | null;
  /** What the order earned the rep: the paid-out snapshot once settled, today's figure while unpaid, 0 once refunded. */
  earnedMinor: number;
  /** What went out to him for it (net of payouts). */
  paidMinor: number;
  /** earned − paid. Positive = still his; negative = paid, then refunded — comes off the next payout. */
  leftMinor: number;
  /** The day it went out, for a settled order. */
  paidOn: string | null;
  refunded: boolean;
}

/**
 * **One table that adds up** (Khalid, 1 Oct 2026: «في فلوس ولازم تكون الأمور واضحة»). It replaced two
 * — «unpaid orders» by sale month and «what was paid» by payout month — that read as two answers to
 * one question. Now every month of sales carries three figures that close on each other:
 *
 *   المستحق − انصرف = الباقي
 *
 * and the totals row closes on the cards above (الباقي = «لسه ما انصرف»). The month is the row,
 * «+» opens its orders (Advanced Table); a tick takes what is left of a month or of one order.
 * The server prices every ticked order again — the total here is a preview.
 */
export function CommissionMonthsTable({
  staffId,
  staffName,
  currency,
  rows,
  format,
}: {
  staffId: string;
  staffName: string;
  currency: string;
  /** Oldest first. */
  rows: CommissionRow[];
  format: { locale: string; currency: string };
}) {
  const payable = useMemo(() => rows.filter((r) => r.leftMinor !== 0), [rows]);
  // Clawbacks start ticked: they are owed back and come off the next payout.
  const [picked, setPicked] = useState<Set<string>>(() => new Set(payable.filter((r) => r.leftMinor < 0).map((r) => r.orderId)));
  const [openKey, setOpenKey] = useState<string | null>(null);
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
  const num = (n: number) => n.toLocaleString("ar-EG");

  const months = useMemo(() => {
    const out: { key: string; label: string; rows: CommissionRow[] }[] = [];
    for (const r of rows) {
      const key = r.soldOn.slice(0, 7);
      let m = out.find((x) => x.key === key);
      if (!m) {
        m = { key, label: new Date(`${key}-01T00:00:00Z`).toLocaleDateString("ar-EG", { month: "long", year: "numeric", timeZone: "UTC" }), rows: [] };
        out.push(m);
      }
      m.rows.push(r);
    }
    return out;
  }, [rows]);

  const sum = (list: CommissionRow[], f: (r: CommissionRow) => number) => list.reduce((s, r) => s + f(r), 0);
  const pickedRows = payable.filter((r) => picked.has(r.orderId));
  const total = sum(pickedRows, (r) => r.leftMinor);

  const setMany = (ids: string[], on: boolean) =>
    setPicked((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
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
      router.replace(`/sales-commissions?rep=${staffId}&cur=${currency}`, { scroll: false });
    });
  }

  if (rows.length === 0) {
    return <p className="rounded-xl border bg-card px-4 py-8 text-center text-sm text-muted-foreground">ما له طلبات بهذه العملة بعد.</p>;
  }

  const head = "px-3 py-3 font-medium";
  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th className="w-10 px-3 py-3" />
            <th className={cn(head, "text-start")} colSpan={3}>
              الشهر
            </th>
            <th className={cn(head, "text-end")}>المستحق</th>
            <th className={cn(head, "text-end")}>انصرف</th>
            <th className={cn(head, "text-end")}>الباقي</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {months.map((m) => {
            const ids = m.rows.filter((r) => r.leftMinor !== 0).map((r) => r.orderId);
            const monthAll = ids.length > 0 && ids.every((id) => picked.has(id));
            const pickedIn = ids.filter((id) => picked.has(id)).length;
            const isOpen = openKey === m.key;
            const left = sum(m.rows, (r) => r.leftMinor);
            return (
              <Fragment key={m.key}>
                <tr className={cn("cursor-pointer hover:bg-muted/40", (isOpen || pickedIn > 0) && "bg-muted/50")} onClick={() => setOpenKey(isOpen ? null : m.key)} aria-expanded={isOpen}>
                  <td className="px-3 py-3">
                    {ids.length > 0 && (
                      <input
                        type="checkbox"
                        aria-label={`تحديد باقي ${m.label}`}
                        className="size-4 accent-primary"
                        checked={monthAll}
                        onChange={() => setMany(ids, !monthAll)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </td>
                  <td className="px-3 py-3" colSpan={3}>
                    <span className="flex items-center gap-3">
                      <span className="grid size-5 place-items-center rounded border text-muted-foreground">
                        {isOpen ? <Minus className="size-3.5" aria-hidden /> : <Plus className="size-3.5" aria-hidden />}
                      </span>
                      <span className="w-28 font-semibold">{m.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {num(m.rows.length)} طلب{pickedIn > 0 && !monthAll ? ` · محدّد ${num(pickedIn)}` : ""}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-end tabular-nums">{money(sum(m.rows, (r) => r.earnedMinor))}</td>
                  <td className="px-3 py-3 text-end tabular-nums text-muted-foreground">{money(sum(m.rows, (r) => r.paidMinor))}</td>
                  <td className={cn("px-3 py-3 text-end font-semibold tabular-nums", left > 0 && "text-emerald-700 dark:text-emerald-400", left < 0 && "text-rose-600")}>
                    {left === 0 ? <span className="font-normal text-muted-foreground">خالص</span> : money(left)}
                  </td>
                </tr>
                {isOpen &&
                  m.rows.map((r) => {
                    const selectable = r.leftMinor !== 0;
                    const on = picked.has(r.orderId);
                    return (
                      <tr
                        key={r.orderId}
                        onClick={selectable ? () => setMany([r.orderId], !on) : undefined}
                        className={cn("bg-background/70 text-[13px]", selectable && "cursor-pointer hover:bg-muted/40", on && "bg-primary/5", r.leftMinor < 0 && "bg-rose-50/70 dark:bg-rose-950/20")}
                      >
                        <td className="px-3 py-2.5">
                          {selectable && (
                            <input
                              type="checkbox"
                              aria-label={`تحديد ${r.number}`}
                              className="size-4 accent-primary"
                              checked={on}
                              onChange={() => setMany([r.orderId], !on)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums" dir="ltr">
                          {r.number}
                          <span className="block text-xs text-muted-foreground">{r.soldOn}</span>
                        </td>
                        <td className="max-w-[220px] truncate px-3 py-2.5" title={r.clientName}>
                          {r.clientName}
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {r.refunded ? <span className="font-medium text-rose-600">مسترد</span> : r.kind === "new" ? "جديد" : "تجديد"}
                        </td>
                        <td className="px-3 py-2.5 text-end tabular-nums">
                          {money(r.earnedMinor)}
                          {r.basis && <span className="block text-xs text-muted-foreground">{r.basis}</span>}
                        </td>
                        <td className="px-3 py-2.5 text-end tabular-nums text-muted-foreground">
                          {r.paidMinor ? money(r.paidMinor) : "—"}
                          {r.paidOn && <span className="block text-xs" dir="ltr">{r.paidOn}</span>}
                        </td>
                        <td className={cn("px-3 py-2.5 text-end font-semibold tabular-nums", r.leftMinor > 0 && "text-emerald-700 dark:text-emerald-400", r.leftMinor < 0 && "text-rose-600")}>
                          {r.leftMinor === 0 ? <span className="font-normal text-muted-foreground">خالص</span> : money(r.leftMinor)}
                          {r.leftMinor < 0 && <span className="block text-xs font-normal">ينخصم من الصرف الجاي</span>}
                        </td>
                      </tr>
                    );
                  })}
              </Fragment>
            );
          })}
        </tbody>
        <tfoot className="border-t-2 bg-muted/30 font-semibold">
          <tr>
            <td />
            <td className="px-3 py-3" colSpan={3}>
              المجموع
            </td>
            <td className="px-3 py-3 text-end tabular-nums">{money(sum(rows, (r) => r.earnedMinor))}</td>
            <td className="px-3 py-3 text-end tabular-nums">{money(sum(rows, (r) => r.paidMinor))}</td>
            <td className="px-3 py-3 text-end tabular-nums">{money(sum(rows, (r) => r.leftMinor))}</td>
          </tr>
        </tfoot>
      </table>

      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t bg-card px-4 py-3">
        <p className="text-sm">
          المحدد: <b>{num(pickedRows.length)}</b> طلب · المجموع <b className={cn("text-base tabular-nums", total < 0 && "text-rose-600")}>{money(total)}</b>
        </p>
        <Button type="button" className="gap-1.5" disabled={pickedRows.length === 0 || total <= 0} onClick={() => { setError(null); setOpen(true); }}>
          <HandCoins className="size-4" aria-hidden />
          اصرف المحدد
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>صرف {money(total)} لـ{staffName}</DialogTitle>
            <DialogDescription>
              عمولة {num(pickedRows.length)} طلب. بعد الصرف ينتقل مبلغها من «الباقي» إلى «انصرف»، وتنسجّل الدفعة في «سجلّ الدفعات».
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
