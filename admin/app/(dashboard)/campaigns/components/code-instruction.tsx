"use client";

import { AlertTriangle, Copy } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

/**
 * اسم الحملة في المنصّة، جاهزاً للنسخ — سطرٌ واحد (خالد ٢٩ سبتمبر ٢٠٢٦: «نحدّد الاسم تبع الحملة
 * وهو ياخد كوبي وبيست»). الاسم يحمل الكود، وبه تُجمع حملات المنصّة تحت البريف؛ بدونه لا يُحسب
 * صرفها هنا وتظهر للأدمن «شغّالة بلا موافقة».
 */
export function CodeInstruction({ name, missingInMeta = false }: { name: string; missingInMeta?: boolean }) {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
      <AlertTriangle className="size-4 shrink-0" aria-hidden />
      {/* «Not found» only where we checked Meta and it is missing — the brief form shows the same name as a standing rule. */}
      <span>
        {missingInMeta
          ? "لسه ما لقينا هذي الحملة في ميتا. سمّها هناك بهذا الاسم بالضبط، وتنربط هنا لحالها:"
          : "اسم الحملة في ميتا لازم يكون هذا بالضبط — به تنربط أرقامها هنا:"}
      </span>
      <span dir="ltr" className="rounded bg-background px-2 py-0.5 font-mono text-[12px] font-semibold text-foreground">{name}</span>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(name);
          toast({ title: "اتنسخ اسم الحملة", variant: "success" });
        }}
        className="ms-auto inline-flex h-6 items-center gap-1 rounded border border-amber-600/40 bg-background px-2 text-[11px] font-medium hover:bg-amber-500/10"
      >
        <Copy className="size-3" aria-hidden /> نسخ الاسم
      </button>
    </div>
  );
}
