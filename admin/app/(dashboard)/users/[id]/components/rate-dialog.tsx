"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Percent } from "lucide-react";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { setCommissionRateAction } from "../actions/set-commission-rate";

/**
 * Sets a rep's rate from a date. The dialog closes only on success, so a rejection is read
 * inside it (the same lesson as the refund dialog — a silent close reads as «done»).
 */
export function RateDialog({
  staffId,
  staffName,
  current,
}: {
  staffId: string;
  staffName: string;
  current: { newRate: number; renewalRate: number } | null;
}) {
  const [state, action, pending] = useActionState(setCommissionRateAction, null);
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
          <Percent className="size-3.5" aria-hidden />
          {current ? "تغيير النسبة" : "تحديد النسبة"}
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <form action={action} className="space-y-4">
          <input type="hidden" name="staffId" value={staffId} />
          <DialogHeader>
            <DialogTitle>نسبة عمولة {staffName}</DialogTitle>
            <DialogDescription>
              تسري من التاريخ الذي تختاره. الصفقات قبله تبقى على نسبتها القديمة، وأوّل نسبةٍ تُسجَّل تسري على
              صفقاته السابقة كلّها.
            </DialogDescription>
          </DialogHeader>
          {state?.error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
              {state.error}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
              الصفقة الجديدة ٪
              <Input name="newRate" type="number" inputMode="decimal" step="0.1" min={0} max={100} required defaultValue={current?.newRate ?? ""} dir="ltr" />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
              التجديد ٪
              <Input name="renewalRate" type="number" inputMode="decimal" step="0.1" min={0} max={100} required defaultValue={current?.renewalRate ?? ""} dir="ltr" />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            تسري من
            <Input name="effectiveFrom" type="date" required defaultValue={today} dir="ltr" />
          </label>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              إلغاء
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="me-2 size-4 animate-spin" aria-hidden />}
              حفظ النسبة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
