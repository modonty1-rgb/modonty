"use client";

import { useRef, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCommercialPlan } from "../actions";

export function CreateCommercialPlanForm() {
  const ref = useRef<HTMLFormElement>(null); const [pending, startTransition] = useTransition();
  return <details className="rounded-xl border bg-card" dir="rtl">
    <summary className="cursor-pointer px-4 py-3 font-semibold">إضافة باقة جديدة</summary>
    <form ref={ref} action={(form) => startTransition(async () => { await createCommercialPlan(form); ref.current?.reset(); })} className="flex flex-col gap-3 border-t p-4">
      <p className="text-sm text-muted-foreground">ستُنشأ كمسودة مع المدد الافتراضية: 3، 6+1، 12+6.</p>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <label className="flex flex-col gap-1 text-sm">اسم الباقة<Input name="name" required placeholder="مثال: الانطلاقة" /></label>
        <label className="flex flex-col gap-1 text-sm">السعودية (SAR)<Input name="sa" required type="number" min="0" placeholder="399" /></label>
        <label className="flex flex-col gap-1 text-sm">مصر (EGP)<Input name="eg" required type="number" min="0" placeholder="4999" /></label>
        <label className="flex flex-col gap-1 text-sm">مقالات / شهر<Input name="articlesPerMonth" required type="number" min="0" placeholder="4" /></label>
        <Button className="self-end" type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Plus data-icon="inline-start" />}إنشاء مسودة</Button>
      </div>
    </form>
  </details>;
}
