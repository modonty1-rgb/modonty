import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ModontyMark } from "@/components/icons/modonty-mark";

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
      <Link href="/about" className={buttonVariants({ variant: "outline", className: "mt-3 min-h-11 w-full lg:mt-4" })}>
        تعرّف على مدونتي
      </Link>
    </section>
  );
}
