import Link from "next/link";

export type ActionItem = { title: string; detail: string; href?: string; cta?: string };

/** ما يحتاج تصرّفاً — عنوان قصير، سطر دليل، وزرّ لو له مكان يُصلَح منه. لا يظهر إن ما فيه شيء. */
export function ActionItems({ items }: { items: ActionItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-label="يحتاج تصرّف" className="rounded-lg border border-amber-500/40 bg-amber-500/5">
      <h2 className="border-b border-amber-500/30 px-3 py-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
        يحتاج تصرّف ({new Intl.NumberFormat("ar-EG").format(items.length)})
      </h2>
      <ol className="divide-y divide-amber-500/20">
        {items.map((a, i) => (
          <li key={a.title} className="flex items-start gap-3 px-3 py-2">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-900 dark:text-amber-200">
              {new Intl.NumberFormat("ar-EG").format(i + 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{a.title}</p>
              <p className="text-xs text-muted-foreground" dir="auto">{a.detail}</p>
            </div>
            {a.href ? (
              <Link href={a.href} className="shrink-0 self-center rounded border bg-background px-2 py-1 text-xs font-medium hover:bg-accent">
                {a.cta ?? "افتح"}
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
