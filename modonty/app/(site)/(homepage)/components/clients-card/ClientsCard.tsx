import Link from "next/link";
import { ModontyTrustMark } from "@/components/icons/modonty-trust-mark";

// Why a visitor can book or shop with confidence — the business-model promise in three
// DIFFERENT lines: the gate, what it means for you, where to read how (Khalid, 2026-08-16:
// the earlier three said the same thing twice). The card claims; /trust explains, so the
// whole card links there. The bullet is our official verification mark (shield with M),
// shared repo-wide, not a generic check.
const proofs = [
  "ما يدخل أي شريك إلا بعد فحص أوراقه الرسمية",
  "تحجز وتشتري من جهة معروفة الاسم والسجل",
] as const;

export function ClientsCard() {
  return (
    <Link
      href="/trust"
      aria-label="شركاء موثوقون — كيف نتأكّد منهم"
      className="group relative block overflow-hidden rounded-lg bg-card p-4 ring-1 ring-primary/10 transition-shadow sm:hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="absolute inset-y-0 start-0 w-1 bg-accent" aria-hidden />
      <div className="flex items-center gap-3">
        <ModontyTrustMark className="h-11 w-11 shrink-0" />
        <span className="min-w-0 flex-1 text-base font-medium text-foreground">شركاء موثوقون</span>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <ModontyTrustMark className="h-4 w-4" />
          موثّق
        </span>
      </div>
      <ul className="mt-2.5 space-y-1">
        {proofs.map((line) => (
          <li key={line} className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <ModontyTrustMark className="mt-[3px] h-3.5 w-3.5 shrink-0" />
            {line}
          </li>
        ))}
      </ul>
      {/* The way out, as a footer line rather than a third bullet: the card is one link. */}
      <span className="mt-2 block text-xs text-link group-hover:underline">كيف نتأكّد؟ اقرأ طريقتنا ←</span>
    </Link>
  );
}
