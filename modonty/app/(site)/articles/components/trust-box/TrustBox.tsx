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
 */
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
        محتوى من جهات موثوقة
      </h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        كل مقال هنا يكتبه شريك في مدونتي، وأوراقه الرسمية مفحوصة قبل ما ينشر.
      </p>
    </section>
  );
}
