import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ModontyMark } from "@/components/icons/modonty-mark";

/**
 * «مدونتي» intro card at the top of the far rail.
 *
 * REBUILT 24 Aug 2026 (Khalid: «تقرأ كإعلان داخلي» — approved option A of
 * `documents/tasks/ABOUTCARD-mockup.html`). The old card listed four promises —
 * «مقالات موثوقة · طلّات وصوتيات · حجز وتسوّق بثقة · مودو يرشدك» — which is what the
 * platform SELLS, not what the reader GETS, and any site can claim all four. The live
 * partner proof belongs in «شركاء موثوقون», the card that makes that promise.
 *
 * The CTA changed too: «تعرّف على مدونتي» asked the reader to leave the page they came
 * for; its CTA leads to Modonty's own core profile rather than repeating the partner directory.
 */

export async function AboutCard() {
  return (
    <section aria-labelledby="about-card-heading" className="relative isolate overflow-hidden rounded-xl border border-primary/25 bg-card p-3 shadow-[0_12px_30px_-24px_hsl(var(--primary)/0.8)] lg:p-4">
      {/* The real Modonty mark, not a typed M: a quiet brand watermark that distinguishes
          the platform card without competing with the live numbers or CTA. */}
      <ModontyMark className="pointer-events-none absolute -left-5 -top-4 -z-10 size-28 text-primary/[0.07]" />

      <div className="flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/[0.08] text-link">
          <ModontyMark className="size-5" />
        </span>
        <h2 id="about-card-heading" className="text-base font-bold leading-snug text-link">
          مدونتي
        </h2>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        كل مقال هنا كتبه شريك موثَّق بسجلّه التجاري.
      </p>

      <Link href="/modonty" className={buttonVariants({ variant: "outline", className: "mt-3 min-h-11 w-full border-primary/45 bg-primary/[0.04] text-link hover:bg-primary/10 hover:text-link lg:mt-4" })}>
        اكتشف مدونتي
      </Link>
    </section>
  );
}
