import { IconShield, IconVerified } from "@/lib/icons";

export function ClientTrustCard() {
  return (
    <section aria-labelledby="client-trust-heading" className="relative overflow-hidden rounded-2xl border border-accent/20 bg-primary/80 p-4 text-primary-foreground shadow-[0_12px_24px_-20px_rgba(14,6,90,0.75)]">
      <span className="absolute -top-7 -end-7 h-24 w-24 rounded-full border border-accent/30" aria-hidden />
      <span className="absolute -bottom-10 -start-8 h-28 w-28 rounded-full bg-accent/10" aria-hidden />
      <div className="relative flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-primary shadow-[0_8px_20px_-10px_rgba(0,216,216,0.9)]" aria-hidden>
          <IconShield className="h-6 w-6" />
        </span>
        <div>
          <h2 id="client-trust-heading" className="text-base font-bold">عملاء موثوقون</h2>
          <p className="mt-1 text-xs leading-5 text-primary-foreground/80">لا يُضاف أي عميل إلى مدونتي قبل التحقق من بياناته الرسمية الحكومية.</p>
        </div>
      </div>
      <p className="relative mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent">
        <IconVerified className="h-3.5 w-3.5" aria-hidden />
        نتحقق قبل الظهور
      </p>
    </section>
  );
}
