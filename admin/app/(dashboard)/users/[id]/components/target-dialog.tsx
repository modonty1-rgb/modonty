"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Target } from "lucide-react";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { setSalesTargetAction } from "../actions/set-sales-target";

/** Sets a rep's monthly sales target from a month on. Closes only on success, like the rate dialog. */
export function TargetDialog({
  staffId,
  staffName,
  current,
}: {
  staffId: string;
  staffName: string;
  current: { amount: number } | null;
}) {
  const [state, action, pending] = useActionState(setSalesTargetAction, null);
  const [open, setOpen] = useState(false);
  const thisMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
          <Target className="size-3.5" aria-hidden />
          {current ? "تغيير التارجت" : "تحديد التارجت"}
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <form action={action} className="space-y-4">
          <input type="hidden" name="staffId" value={staffId} />
          <DialogHeader>
            <DialogTitle>تارجت {staffName} الشهري</DialogTitle>
            <DialogDescription>
              مبلغ المبيعات المطلوب منه كل شهر، بالريال وقبل الضريبة. مبيعاته بالجنيه تتحوّل للريال بسعر اليوم ويشوف السعر قدامه.
              يسري من الشهر اللي تختاره، والأشهر قبله تبقى على تارجتها.
            </DialogDescription>
          </DialogHeader>
          {state?.error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
              {state.error}
            </p>
          )}
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            المبلغ الشهري بالريال السعودي
            <Input name="amount" type="number" inputMode="decimal" step="1" min={1} required defaultValue={current?.amount ?? ""} dir="ltr" />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            يسري من شهر
            <Input name="effectiveFrom" type="month" required defaultValue={thisMonth} dir="ltr" />
          </label>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              إلغاء
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="me-2 size-4 animate-spin" aria-hidden />}
              حفظ التارجت
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
