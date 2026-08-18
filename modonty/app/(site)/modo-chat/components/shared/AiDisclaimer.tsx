import Link from "next/link";

/**
 * The AI disclosure, kept permanently under the composer.
 *
 * Three rules shape it:
 *
 * 1. **Say it is a machine.** EU AI Act Article 50 requires that a person be told they are
 *    interacting with an AI system, at the first interaction, unless it is obvious. «مودو» reads
 *    like a name, so it is not obvious.
 * 2. **Say the answer can be wrong**, at the point of use. Every major assistant keeps this line
 *    under the input rather than in a dismissed dialog, because a notice the visitor clicked away
 *    three sessions ago is not a notice when they act on a price or a diagnosis today.
 * 3. **Do not pretend to be a professional.** Most of our corpus is written by doctors, so the
 *    visitor must know Modo is not one — the partner behind the answer is, and that is exactly
 *    who the booking card sends them to.
 *
 * It is deliberately one quiet line, not a banner: a warning big enough to compete with the
 * answer gets ignored like every cookie bar.
 */
export function AiDisclaimer() {
  return (
    <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground" dir="rtl">
      مودو مساعد ذكاء اصطناعي — ممكن يخطئ، وكلامه <b className="font-medium">ليس استشارة مهنية</b>.
      راجِع الشريك المختصّ قبل أي قرار.{" "}
      <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
        الشروط
      </Link>
    </p>
  );
}
