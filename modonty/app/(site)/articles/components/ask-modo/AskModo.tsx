import Link from "next/link";

/**
 * All that is left in the left column after the reading-time strip moved to the top.
 *
 * Kept as its own small card rather than folded into the feed: the visitor who reaches the bottom
 * of a filtered list without finding his answer is exactly the one Modo is for.
 */
export function AskModo() {
  return (
    <section className="rounded-xl border border-border bg-card p-3">
      <h2 className="mb-1 text-sm font-bold text-foreground">ما لقيت جوابك؟</h2>
      <p className="text-xs leading-relaxed text-muted-foreground">
        اسأل مودو — يجاوبك من محتوى مدونتي، وإذا ما لقى يوصّلك بالشريك المختصّ.
      </p>
      <Link href="/modo-chat" className="mt-2 inline-block text-xs font-medium text-link hover:underline">
        افتح مودو ←
      </Link>
    </section>
  );
}
