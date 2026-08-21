import { ModontyTrustMark } from "@/components/icons/modonty-trust-mark";

/**
 * Why the reader can believe what is in this list.
 *
 * Deliberately NOT a link: it makes a statement, and a statement that navigates somewhere reads as
 * an advert for another page instead of an answer to «هل أثق بهذا؟». Khalid, 2026-08-19: «ما أبغى
 * فيها لينك… بوكس، والعلامة فوق، وسطرين يوضّحون إن المقالات من جهات موثوقة».
 *
 * The mark sits above the words rather than beside them, so the shield is read first and the two
 * lines explain it — the order a trust mark actually works in.
 *
 * The wording matters and was wrong once: the partner does NOT write these articles. Modonty
 * writes them and the specialist partner reviews and signs off before publication (Khalid,
 * 2026-08-19: «الشريك ما بيكتب، إحنا اللي بنكتب، بس هو اللي بيدي التعميد»). That also explains
 * why every article's author is «Modonty» — it is accurate, not a placeholder.
 */
/**
 * The phone version: one quiet hint line, not a card (Khalid, 21 Aug — «this card is not
 * needed, make it a hint, it looks like a small bar»). Same statement, ~24px instead of
 * ~120px, so it sits above the list without pushing the articles down.
 */
export function TrustHint() {
  return (
    <p className="flex items-center justify-center gap-1.5 text-[11px] leading-4 text-muted-foreground">
      <ModontyTrustMark className="size-4 shrink-0" aria-hidden />
      مكتوب عندنا، ومعتمَد من الشريك المختصّ قبل النشر.
    </p>
  );
}

export function TrustBox() {
  return (
    <section
      aria-labelledby="trust-box-heading"
      className="rounded-lg bg-card p-4 text-center ring-1 ring-primary/10"
    >
      <span className="mx-auto mb-2 grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
        <ModontyTrustMark className="h-6 w-6" aria-hidden />
      </span>

      <h2 id="trust-box-heading" className="text-sm font-bold text-foreground">
        مكتوب عندنا، ومعتمَد من المختصّ
      </h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        فريق مدونتي يكتب المقال، والشريك المختصّ يراجعه ويعتمده قبل النشر.
      </p>
    </section>
  );
}
