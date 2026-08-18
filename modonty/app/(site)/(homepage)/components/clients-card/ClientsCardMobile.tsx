import { IconShield } from "@/lib/icons";
import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";

export function ClientsCardMobile() {
  return (
    <section aria-label="الثقة">
      <div className="relative overflow-hidden rounded-lg bg-primary/85 p-2.5 text-primary-foreground ring-1 ring-accent/25">
        <span className="absolute -bottom-8 -start-6 h-20 w-20 rounded-full bg-accent/10" aria-hidden />
        <div className="relative flex items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-accent text-link" aria-hidden>
            <IconShield className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-medium">شركاء موثوقون</h2>
            <p className="mt-0.5 text-xs leading-5 text-primary-foreground/80">نتأكّد من الأوراق الرسمية قبل ما يظهر أي شريك.</p>
          </div>
          <VerifiedBadge className="h-5 w-5 text-accent fill-accent/20" label="شركاء موثوقون" />
        </div>
      </div>
    </section>
  );
}
