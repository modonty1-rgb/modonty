import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ModontyMark } from "@/components/icons/modonty-mark";
import { IconChevronRight } from "@/lib/icons";

// Same four things the platform gives a visitor — one short line each, like the account
// card's benefits, so the two cards read as siblings.
const platformPoints = [
  "مقالات موثوقة",
  "طلّات وصوتيات",
  "حجز وتسوّق بثقة",
  "مودو يرشدك",
] as const;

/**
 * «مدونتي» intro card at the top of the far rail. Its skeleton is the account card's
 * (title · line · 2×2 bullets · full-width CTA, same paddings) so the two rails start with
 * cards of equal height (Khalid, 2026-08-16). Outline CTA: registering stays the one
 * filled action on the page.
 */
/**
 * The phone version: one bar, not a card (Khalid, 21 Aug — «make it small, like a bar,
 * because this is the core card»). Same promise and the same door to `/modonty`, in ~52px
 * instead of 174: the full card pushed the first article to 67% of the first screen on a
 * page whose whole job is showing articles. The desktop rail keeps `AboutCard`.
 */
export function AboutBar() {
  return (
    <Link
      href="/modonty"
      className="flex min-h-12 items-center gap-2.5 rounded-lg bg-card px-3 py-2 ring-1 ring-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <ModontyMark className="size-6 shrink-0 text-link" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-bold leading-tight text-link">مدونتي</span>
        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
          محتوى عربي موثوق من شركاء معتمدين.
        </span>
      </span>
      <IconChevronRight className="size-4 shrink-0 text-link rtl:rotate-180" aria-hidden />
    </Link>
  );
}

export function AboutCard() {
  return (
    <section aria-labelledby="about-card-heading" className="rounded-lg bg-card p-3 ring-1 ring-primary/10 lg:p-4">
      {/* Mark + name in the brand text colour (design system: text-link for brand-coloured text). */}
      <h2 id="about-card-heading" className="flex items-center gap-1.5 text-base font-medium leading-snug text-link">
        <ModontyMark className="h-5 w-5 shrink-0" />
        مدونتي
      </h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">محتوى عربي موثوق من شركاء معتمدين.</p>
      <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 lg:mt-3 lg:gap-y-2">
        {platformPoints.map((point) => (
          <li key={point} className="flex items-start gap-1.5 text-[11px] font-normal leading-4 text-foreground/90">
            <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
            {point}
          </li>
        ))}
      </ul>
      <Link href="/modonty" className={buttonVariants({ variant: "outline", className: "mt-3 min-h-11 w-full lg:mt-4" })}>
        تعرّف على مدونتي
      </Link>
    </section>
  );
}
