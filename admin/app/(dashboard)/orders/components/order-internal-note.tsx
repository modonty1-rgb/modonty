import Link from "next/link";
import { StickyNote } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The internal note of a subscription order (`CheckoutOrder.notes`), shown where people act on
 * it — the order page and the client's edit screen (Khalid, 28 Sep 2026: «الملاحظة هذه الداخلية
 * المفروض تنعرض في طلب الاشتراك… ومع العميل في التعديل عشان تكون واضحة للي بيعدل»). It was
 * visible only inside the order's own edit form. A note starting with ⚠ is a migration
 * warning, so it reads amber like the «مراجعة وتعديل ⚠» button.
 */
export function OrderInternalNote({ note, orderNumber, href }: { note: string; orderNumber?: string; href?: string }) {
  const warn = note.trimStart().startsWith("⚠");
  return (
    <section
      className={cn(
        "rounded-lg border bg-card px-4 py-3",
        warn ? "border-amber-500/40 bg-amber-500/5" : "border-sky-500/30 bg-sky-500/5",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StickyNote className={cn("size-4", warn ? "text-amber-500" : "text-sky-500")} aria-hidden />
        <h2 className="text-[12px] font-semibold">ملاحظة داخلية</h2>
        {orderNumber ? (
          href ? (
            <Link href={href} className="text-[11px] tabular-nums text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              {orderNumber}
            </Link>
          ) : (
            <span className="text-[11px] tabular-nums text-muted-foreground">{orderNumber}</span>
          )
        ) : null}
      </div>
      <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed">{note}</p>
    </section>
  );
}
