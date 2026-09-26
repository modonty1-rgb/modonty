import Link from "next/link";
import { messages } from "@/lib/i18n/messages";
import { SECTORS } from "../../helpers/sectors";

/**
 * The doors above «من قلمنا» (Khalid, 24 Sep 2026: give the young reader variety, not only
 * what we write). Two kinds, from `helpers/sectors.ts`:
 *  · featured — pages of their own (القرآن · عجلة الحظ · مودو لينك): wide cards, icon beside name;
 *  · sectors — the six live-feed sectors: square tiles on phones, bare circles on desktop.
 *
 * One 6-column grid carries both, so nine doors never leave a hole in a row:
 *  phone   — Quran the full row (span 6) · wheel + Modo Link half each (span 3) · sectors 3×2 (span 2);
 *  desktop — the three featured in one row (span 2 each) · the six sectors in one row (span 1).
 *
 * Phone tiles keep a fixed 104px (Khalid, 24 Sep: «مو شرط تغطي الشاشة كاملة… خلي الأرتكل تكون
 * ظاهرة من تحت») — the peek of the first article is what says the page goes on.
 */
export function SectorRow() {
  return (
    <section aria-labelledby="modonty-sectors-heading">
      {/* Visible title dropped (Khalid, 24 Sep: «ما لها داعي») — labelled tiles say what they are.
          Kept for screen readers so the section still has a name. */}
      <h2 id="modonty-sectors-heading" className="sr-only">
        {messages.modonty.sectorsTitle}
      </h2>
      <ul className="grid grid-cols-6 gap-2.5 lg:gap-3">
        {SECTORS.map(({ slug, href, icon: Icon, featured }) => {
          const span = featured
            ? slug === "quran"
              ? "col-span-6 lg:col-span-2"
              : "col-span-3 lg:col-span-2"
            : "col-span-2 lg:col-span-1";
          return (
            <li key={slug} className={`${span} ${featured ? "h-[68px]" : "h-[104px] lg:h-auto"}`}>
              <Link
                href={href}
                className={
                  featured
                    ? "group flex h-full items-center justify-center gap-3 rounded-2xl bg-card px-3 outline-none ring-1 ring-border transition-shadow hover:ring-2 hover:ring-primary focus-visible:ring-2 focus-visible:ring-primary motion-safe:active:scale-[0.97]"
                    : "group flex h-full flex-col items-center justify-center gap-2 rounded-2xl bg-card px-1 py-3 text-center outline-none ring-1 ring-border transition-shadow hover:ring-2 hover:ring-primary focus-visible:ring-2 focus-visible:ring-primary motion-safe:active:scale-[0.97] lg:gap-1.5 lg:bg-transparent lg:py-0 lg:ring-0 lg:hover:ring-0"
                }
              >
                <span
                  className={
                    featured
                      ? "grid size-12 shrink-0 place-items-center rounded-full bg-muted/60"
                      : "grid size-14 place-items-center rounded-full bg-muted/60 transition-shadow lg:bg-card lg:ring-1 lg:ring-border lg:group-hover:ring-2 lg:group-hover:ring-primary"
                  }
                >
                  {/* Two approved marks (AI · link) paint their body a fixed navy — the hooks let
                      them follow the text colour here, so they do not vanish on the dark card. */}
                  <Icon className={`${featured ? "size-6" : "size-7"} text-foreground [--modonty-ai-body:currentColor] [--modonty-link-body:currentColor]`} />
                </span>
                <span className={`font-medium leading-tight text-foreground ${featured ? "text-sm" : "text-xs"}`}>
                  {messages.modonty.sectors[slug]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
