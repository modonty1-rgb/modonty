import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ModontyMark } from "@/components/icons/modonty-mark";
import { IconVerified } from "@/lib/icons";
import { getPlatformCounts } from "@/lib/queries/get-platform-counts";
import { Fact } from "./Fact";

/**
 * «مدونتي» intro card at the top of the far rail.
 *
 * REBUILT 24 Aug 2026 (Khalid: «تقرأ كإعلان داخلي» — approved option A of
 * `documents/tasks/ABOUTCARD-mockup.html`). The old card listed four promises —
 * «مقالات موثوقة · طلّات وصوتيات · حجز وتسوّق بثقة · مودو يرشدك» — which is what the
 * platform SELLS, not what the reader GETS, and any site can claim all four. Three live
 * numbers replace them: a promise is argued with, a count is checked.
 *
 * The numbers come from `getPlatformCounts()` and mirror the filters of the page each one
 * links to, so the card can never state a figure `/clients` then contradicts. Nothing is
 * hardcoded — an invented number here would be the first thing a partner could catch us
 * lying about.
 *
 * The CTA changed too: «تعرّف على مدونتي» asked the reader to leave the page they came
 * for; «شوف الشركاء» is a step further into it.
 */

export async function AboutCard() {
  const { partners, articles, industries } = await getPlatformCounts();

  return (
    <section aria-labelledby="about-card-heading" className="rounded-lg bg-card p-3 ring-1 ring-primary/10 lg:p-4">
      {/* Mark + name in the brand text colour (design system: text-link for brand-coloured text). */}
      <h2 id="about-card-heading" className="flex items-center gap-1.5 text-base font-medium leading-snug text-link">
        <ModontyMark className="h-5 w-5 shrink-0" />
        مدونتي
      </h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        كل مقال هنا كتبه شريك موثَّق بسجلّه التجاري.
      </p>

      <div className="mt-2.5 grid grid-cols-3 gap-2 lg:mt-3">
        <Fact value={partners} label="شريكاً موثَّقاً" />
        <Fact value={articles} label="مقالاً منشوراً" />
        <Fact value={industries} label="مجالات" />
      </div>

      {/* The trust mark earns its place by naming what the «موثَّق» above actually means:
          papers on file, not a badge we award ourselves. */}
      <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] leading-tight text-action-listen">
        <IconVerified className="size-3.5 shrink-0" aria-hidden />
        سجلّ تجاري موثَّق لكل شريك
      </p>

      <Link href="/clients" className={buttonVariants({ variant: "outline", className: "mt-3 min-h-11 w-full lg:mt-4" })}>
        شوف الشركاء
      </Link>
    </section>
  );
}
