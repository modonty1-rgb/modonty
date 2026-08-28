import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { ServiceChips } from "@/components/shared/service-chips/ServiceChips";
import Link from "next/link";
import { ModontyTrustMark } from "@/components/icons/modonty-trust-mark";
import { CtaTrackedLink } from "@/components/cta/cta-tracked-link";
import { buttonVariants } from "@/components/ui/button";
import { IconAdd, IconChevronRight } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

/**
 * The "dot" motif from the logo story (a dot → a brick → a building), as a faint grid
 * behind the cover only. Felt as depth, not read as decoration. Brand blue at 8% on light;
 * on dark the same 8% vanishes into the navy (Khalid, 2026-08-17: «في الدارك نهائي ما
 * يبان»), so it steps up to 22% there — same perceived weight in both themes.
 */
const DOT_GRID =
  "bg-[radial-gradient(hsl(var(--primary)_/_0.08)_1px,transparent_1px)] dark:bg-[radial-gradient(hsl(var(--primary)_/_0.22)_1px,transparent_1px)] [background-size:16px_16px]";

interface ModontyProfileHeroProps {
  name: string;
  logo: string | null;
  heroImage: string | null;
  services: string[];
}

/**
 * modonty's own identity — the flagship profile (Khalid, 2026-08-17: «الصفحة أو العميل
 * الأساسي»). Answers the visitor's one question, «مين مدونتي وليش أثق؟», top-down: cover →
 * mark overlapping its edge → name, which opens the one-line promise as its subject → the ONE call to action
 * («صِر شريكاً», far end of the name line — where a profile keeps its primary button; Khalid,
 * 2026-08-17: «هذا CTA، ما يكون مدفوناً تحت») → what we do. Where we are lives with the
 * papers in the rail's legal card. No counts at all (Khalid, 2026-08-17: «عدد المقالات لا داعي له» — and
 * feedback_design_for_visitor_intent: «ما يهمّني كم مقال عنده»). Every value is a real
 * field on modonty's own `Client` row.
 */
export function ModontyProfileHero({
  name,
  logo,
  heroImage,
  services,
}: ModontyProfileHeroProps) {
  return (
    <section className={`relative rounded-lg ${DOT_GRID}`}>
      {heroImage && (
        // Hidden on phones (Khalid, 22 Aug): a 6:1 band carries no information at 390 —
        // it is texture, and it pushed the name and the promise further down a screen that
        // already spends 135px on chrome. Desktop keeps it: the column is wide enough that
        // 6:1 reads as a cover, not a stripe.
        <div className="relative aspect-[6/1] w-full overflow-hidden rounded-lg bg-muted ring-1 ring-border after:absolute after:inset-0 after:bg-gradient-to-t after:from-background/70 after:to-transparent max-lg:hidden">
          <OptimizedImage media={asMedia(heroImage, name)} alt="" fill sizes="1096px" preload className="object-cover" />
        </div>
      )}
      {/* `relative` so the name paints ABOVE the positioned cover when it overlaps its edge. */}
      {/* <640px the pull-up is softened (-40px → -16px): with the promise stacked under
          the name, -40px pushed both onto the cover and the text drowned in it (Khalid,
          21 Aug: «move text a little down»). ≥640px unchanged. */}
      {/* The pull-up exists to overlap the cover. With the cover gone below `lg`, the phone
          gets normal top padding instead — `max-lg:mt-0 max-lg:pt-6` — or the name would
          float 16px into nothing. */}
      {/* Phone padding cut 24 → 16 on all four sides (Khalid, 22 Aug: «كميه مساحات فاضيه
          كثيره»): the block stands 141px tall there and was spending 48 of them on its own
          padding. Desktop keeps 24 — it has the room and the cover to sit under. */}
      <div className={`relative px-5 pb-6 max-lg:px-4 max-lg:pb-4 sm:px-6 ${heroImage ? "-mt-4 sm:-mt-10 max-lg:mt-0 max-lg:pt-4" : "pt-6 max-lg:pt-4"}`}>
        <div className="flex items-end gap-4">
          {/* Hidden on phones (Khalid, 22 Aug): the navbar already carries the mark and the
              active tab already says «مدونتي» — an 80px logo here was the brand's third
              appearance above the fold, and it pushed the promise sideways into a narrow
              column. Desktop keeps it: the row is wide enough that the avatar reads as a
              profile identity rather than a repeat. */}
          <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-card ring-4 ring-background max-lg:hidden">
            {logo ? (
              <OptimizedImage media={asMedia(logo, name)} alt="" fill sizes="80px" className="object-cover" />
            ) : (
              <span aria-hidden className="text-2xl font-bold text-link">{name.trim().charAt(0)}</span>
            )}
          </span>
          {/* One sentence: the name IS its subject — «مدونتي تكتب باسمك…» (Khalid, 2026-08-17:
              «مدونتي تكمل مع الكلام»), so no mark between them and a tight gap. The promise
              truncates rather than wraps — it is a line, not a paragraph. The city moved
              into the legal card in the rail, with the rest of the papers. */}
          {/* <640px the promise drops to its own two lines under the name — truncated
              beside it, the page's whole point read «تكتب باسمك، وتظهرك …» (Khalid, 21 Aug).
              ≥640px unchanged: one line, truncating. */}
          {/* On phones this block is now the page's dominant element — the cover and the
              logo left, so nothing else competes and the type has to carry the weight on
              its own (Khalid, 22 Aug: «refine it, make it professional»).
              `gap-2` under `lg`: at `gap-1` the 28px name and the promise read as one
              paragraph. Desktop keeps its baseline row untouched. */}
          <div className="flex min-w-0 flex-1 flex-col gap-2 pb-1 max-lg:pb-0 sm:flex-row sm:items-baseline sm:gap-2">
            {/* A 3px teal rule above the name: the brand's colour anchoring the block
                without drawing the mark a third time. Phones only — desktop has the avatar
                doing that job. */}
            <h1 className="shrink-0 text-[28px] font-black leading-[1.15] tracking-tight text-foreground max-lg:relative max-lg:ps-3 max-lg:before:absolute max-lg:before:inset-y-1 max-lg:before:start-0 max-lg:before:w-[3px] max-lg:before:rounded-full max-lg:before:bg-accent sm:text-3xl sm:font-bold sm:leading-tight sm:tracking-normal sm:ps-0 sm:before:hidden">
              {name}
            </h1>
            {/* NOT `description`. That field is modonty's sales line — «تكتب باسمك،
                وتظهرك في جوجل، وتجيب لك عميلاً» — written for a business owner deciding
                whether to buy. The person standing on this page is a READER (Khalid,
                22 Aug: «اللي داخل هذا مو عميل… داخل يقرا، داخل يستمتع»), and a pitch
                aimed past them is the fastest way to lose them. `description` stays
                untouched in the DB and keeps serving the metadata and the partner card,
                where the audience really is a client. */}
            {/* The promise is the most important sentence on the page — on a phone it gets
                its full length (no clamp), a readable 15px, and 85% ink instead of 75%. */}
            <p className="min-w-0 text-[15px] leading-[1.75] text-foreground/85 max-lg:ps-3 line-clamp-none sm:text-foreground/75 sm:line-clamp-2 sm:ps-0 sm:text-[15px] sm:leading-relaxed">
              {messages.modonty.readerPromise}
            </p>
          </div>
          <CtaTrackedLink
            href="https://www.jbrseo.com"
            target="_blank"
            rel="noopener noreferrer"
            label="Modonty Hero — become a partner"
            type="BANNER"
            // <768px the bottom bar already carries «صِر شريكاً» (Khalid, 21 Aug: two of
            // the same door on one screen is one too many) — desktop has no bottom bar.
            className={buttonVariants({ className: "mb-1 shrink-0 max-md:hidden" })}
          >
            <IconAdd aria-hidden />
            {messages.becomePartner.cta}
          </CtaTrackedLink>
        </div>
        {/* Hidden on phones (Khalid, 22 Aug). Measured on 390: it cost 160px of the first
            screen — four numbered steps explaining OUR process, standing between the reader
            and the first article. On desktop the column has the room, so it stays. */}
        <div className="max-lg:hidden">
          <TrustStrip />
        </div>
        <ServiceChips services={services} className="mt-4" />
      </div>
    </section>
  );
}

const TRUST = messages.modonty.trust;

/**
 * Shield + title on the start, four NUMBERED steps on an even grid, «كيف نتأكّد» at the end.
 * Numbers instead of dots-on-a-line: even cells read as a process without the ragged
 * connectors, and the words are facts we can stand behind — a copy of the register is on
 * file (Khalid, 2026-08-17: «ما يتسجّل معنا إلا وعندنا نسخة منها … أعطِ الشارة قوة، هي من
 * أقوى ما في نموذج العمل»).
 */
function TrustStrip() {
  return (
    <div className="mt-4 space-y-3 rounded-lg bg-card px-4 py-3 ring-1 ring-primary/15">
      {/* Row 1: the badge and its one-line rule · the link. Row 2: the four steps on an even grid. */}
      <div className="flex items-center gap-3">
        <ModontyTrustMark className="h-6 w-6 shrink-0" />
        {/* Title and rule on ONE line ≥640px (Khalid, 2026-08-17: «خلّيهم في سطر واحد»);
            <640px the line truncated to «أربع خطوا…» — it wraps instead (Khalid, 21 Aug). */}
        <p className="min-w-0 flex-1 text-sm leading-tight sm:truncate">
          <span className="font-medium text-foreground">{TRUST.title}</span>
          <span className="text-foreground/60"> — {TRUST.subtitle}</span>
        </p>
        <Link
          href="/trust"
          className="group inline-flex shrink-0 items-center gap-1 rounded-sm text-sm font-medium text-primary transition-[color,transform] hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-safe:active:scale-[0.98]"
        >
          {TRUST.moreLabel}
          <IconChevronRight className="h-4 w-4 rtl:rotate-180 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
      {/* A stepper: one continuous line runs through four numbered circles (the line spans from
          the first circle's centre to the last's — 12.5% inset on a 4-column grid), labels
          centred beneath. Circles are opaque so they sit ON the line. */}
      <ol className="relative grid grid-cols-4 gap-x-3 before:absolute before:inset-x-[12.5%] before:top-3 before:h-px before:bg-border">
        {TRUST.steps.map((step, index) => (
          <li key={step} className="relative flex min-w-0 flex-col items-center gap-2 text-center">
            <span
              aria-hidden
              className="grid size-6 shrink-0 place-items-center rounded-full bg-card text-[11px] font-medium text-link-accent ring-1 ring-accent/50"
            >
              {(index + 1).toLocaleString(SITE_LOCALE)}
            </span>
            {/* <640px the step labels wrap in full — clamped they read «نتأكّد من وج…»,
                and these four facts are the badge's whole force (Khalid, 21 Aug). */}
            <span className="w-full text-xs leading-tight text-foreground/80 sm:truncate sm:text-sm">
              <span className="sr-only">{(index + 1).toLocaleString(SITE_LOCALE)}. </span>
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
