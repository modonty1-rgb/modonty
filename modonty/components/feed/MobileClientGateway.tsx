import { IconShield, IconVerified } from "@/lib/icons";

export function MobileClientTrustCard() {
  return (
    <section aria-label="الثقة">
      <div className="relative overflow-hidden rounded-xl border border-accent/25 bg-primary/85 p-2.5 text-primary-foreground shadow-sm">
        <span className="absolute -bottom-8 -start-6 h-20 w-20 rounded-full bg-accent/10" aria-hidden />
        <div className="relative flex items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-primary" aria-hidden>
            <IconShield className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold">عملاء موثوقون</h2>
            <p className="mt-0.5 text-xs leading-5 text-primary-foreground/80">نتحقق من البيانات الرسمية الحكومية قبل ظهور أي عميل.</p>
          </div>
          <IconVerified className="h-5 w-5 shrink-0 text-accent" aria-hidden />
        </div>
      </div>
    </section>
  );
}
