"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/**
 * «عرض السند» — قيمة صفّ «سند الإيصال» في بطاقة «المال»، وتفتح الصورة كاملة في نافذة.
 *
 * خالد (٢٨ سبتمبر ٢٠٢٦): «سند الإيصال دمّر الـUI». كانت الصورة بعرض البطاقة (١٧٦px ارتفاعاً)
 * فتطول «المال» وحدها ويختلّ توازن البطاقات الثلاث. صارت زرّاً بحجم أيّ قيمة. والرفع من «تعديل
 * الطلب» وحده (`[id]/edit/components/receipt-field.tsx`). `version` يكسر كاش المتصفّح بعد الاستبدال.
 */
export function OrderReceipt({ orderId, version }: { orderId: string; version: number }) {
  const [open, setOpen] = useState(false);
  const src = `/orders/${orderId}/receipt?v=${version}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <Eye className="size-3.5" aria-hidden />
        عرض السند
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        {/* An image needs no description; `undefined` tells Radix so, silencing its warning. */}
        <DialogContent className="max-w-4xl p-2 sm:p-3" aria-describedby={undefined}>
          <DialogTitle className="sr-only">سند الإيصال</DialogTitle>
          {/* eslint-disable-next-line @next/next/no-img-element -- private, session-checked route; next/image would cache it */}
          <img src={src} alt="سند الإيصال" className="max-h-[85vh] w-full rounded object-contain" />
        </DialogContent>
      </Dialog>
    </>
  );
}
