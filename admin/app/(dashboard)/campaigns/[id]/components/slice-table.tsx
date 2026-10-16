const ar = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });
const ar2 = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 });

export type SliceRow = { label: string; spend: number; clicks: number; leads: number; extra?: number };

/** جدول توزيعٍ صغير (المنصّة · العمر والجنس · اليوم): الصرف والنقرات والعملاء وتكلفة كلّ عميل. */
export function SliceTable({ title, rows, extraLabel }: { title?: string; rows: SliceRow[]; extraLabel?: string }) {
  if (rows.length === 0) return <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">ما فيه بيانات من ميتا لهذا التوزيع.</p>;
  const total = rows.reduce((s, r) => s + r.spend, 0);
  return (
    <section className="overflow-x-auto rounded-lg border bg-card">
      {title ? <h3 className="border-b px-3 py-2 text-xs font-semibold">{title}</h3> : null}
      <table className="w-full text-xs">
        <thead className="text-[11px] text-muted-foreground">
          <tr className="border-b">
            <th className="px-3 py-1.5 text-start font-medium" />
            <th className="px-2 py-1.5 text-start font-medium">الصرف</th>
            <th className="px-2 py-1.5 text-start font-medium">من الصرف</th>
            <th className="px-2 py-1.5 text-start font-medium">نقرات</th>
            <th className="px-2 py-1.5 text-start font-medium">عملاء (البكسل)</th>
            {extraLabel ? <th className="px-2 py-1.5 text-start font-medium">{extraLabel}</th> : null}
            <th className="px-3 py-1.5 text-start font-medium">تكلفة العميل</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map((r) => (
            <tr key={r.label} className="border-b last:border-0">
              <td className="px-3 py-1.5 font-medium" dir="auto">{r.label}</td>
              <td className="px-2 py-1.5">{ar2.format(r.spend)}</td>
              <td className="px-2 py-1.5 text-muted-foreground">{total > 0 ? `${ar.format((r.spend / total) * 100)}٪` : "—"}</td>
              <td className="px-2 py-1.5">{ar.format(r.clicks)}</td>
              <td className="px-2 py-1.5">{ar.format(r.leads)}</td>
              {extraLabel ? <td className="px-2 py-1.5">{ar.format(r.extra ?? 0)}</td> : null}
              <td className="px-3 py-1.5">{r.leads > 0 ? ar2.format(r.spend / r.leads) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
