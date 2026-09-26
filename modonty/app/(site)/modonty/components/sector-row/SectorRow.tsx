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
      {/* Phones (Khalid's design, 26 Sep 2026): nine EQUAL tiles, 3×3, 72px — icon over name —
          in the design's order: wheel · Modo Link · Quran, then the six sectors. The array
          keeps the desktop order (Quran first), so the phone reorders with `max-lg:order-*`:
          Quran to 1, the sectors to 2, the wheel and Modo Link stay at 0.
          Desktop unchanged: the featured three as wide cards, the six as bare circles. */}
      <ul className="grid grid-cols-6 gap-2.5 lg:gap-3">
        {SECTORS.map(({ slug, href, icon: Icon, featured }) => {
          const place = featured
            ? `col-span-2 h-[72px] lg:h-[68px] ${slug === "quran" ? "max-lg:order-1" : ""}`
            : "col-span-2 h-[72px] max-lg:order-2 lg:col-span-1 lg:h-auto";
          return (
            <li key={slug} className={place}>
              <Link
                href={href}
                className={
                  featured
                    ? "group flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl bg-card px-1 text-center outline-none ring-1 ring-border transition-shadow hover:ring-2 hover:ring-primary focus-visible:ring-2 focus-visible:ring-primary motion-safe:active:scale-[0.97] lg:flex-row lg:gap-3 lg:px-3"
                    : "group flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl bg-card px-1 text-center outline-none ring-1 ring-border transition-shadow hover:ring-2 hover:ring-primary focus-visible:ring-2 focus-visible:ring-primary motion-safe:active:scale-[0.97] lg:bg-transparent lg:ring-0 lg:hover:ring-0"
                }
              >
                <span
                  className={
                    featured
                      ? "grid size-10 shrink-0 place-items-center rounded-full bg-muted/60 lg:size-12"
                      : "grid size-10 place-items-center rounded-full bg-muted/60 transition-shadow lg:size-14 lg:bg-card lg:ring-1 lg:ring-border lg:group-hover:ring-2 lg:group-hover:ring-primary"
                  }
                >
                  {/* Two approved marks (AI · link) paint their body a fixed navy — the hooks let
                      them follow the text colour here, so they do not vanish on the dark card. */}
                  <Icon className={`size-6 text-foreground [--modonty-ai-body:currentColor] [--modonty-link-body:currentColor] ${featured ? "" : "lg:size-7"}`} />
                </span>
                <span className={`font-medium leading-tight text-foreground ${featured ? "text-xs lg:text-sm" : "text-xs"}`}>
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
