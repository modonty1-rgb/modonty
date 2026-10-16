const N = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });

/** `clicks` = Meta link clicks · `saved` = our form submissions · `waClicks` = our saved WhatsApp clicks (form-less page). */
export type AdRow = { label: string; spend: number; clicks: number; landingViews: number; leads: number; saved: number; waClicks: number };

/**
 * إعلان إعلان — لأن إعلانات البريف الواحد قد توصّل لصفحات هبوط مختلفة («Land 1» · «Land 2»)، وصفحةٌ
 * منها تحفظ التسجيل عندنا والأخرى تودّي واتساب مباشرة. «سجّلوا عندنا» بمطابقة `utm_content` باسم الإعلان.
 */
export function AdsTable({ rows, money }: { rows: AdRow[]; money: (n: number) => string }) {
  if (rows.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr className="border-b">
            <th className="px-3 py-2 text-start font-medium">الإعلان</th>
            <th className="px-2 py-2 text-start font-medium">الصرف</th>
            <th className="px-2 py-2 text-start font-medium">ضغطوا</th>
            <th className="px-2 py-2 text-start font-medium">فتحوا الصفحة</th>
            <th className="px-2 py-2 text-start font-medium">عميل حسب ميتا</th>
            <th className="px-2 py-2 text-start font-medium">سجّلوا عندنا</th>
            <th className="px-2 py-2 text-start font-medium">ضغطوا واتساب عندنا</th>
            <th className="px-3 py-2 text-start font-medium">العميل بـ (ميتا)</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map((r) => (
            <tr key={r.label} className="border-b last:border-0">
              <td className="px-3 py-2 font-medium" dir="auto">{r.label}</td>
              <td className="px-2 py-2">{money(r.spend)}</td>
              <td className="px-2 py-2">{N.format(r.clicks)}</td>
              <td className="px-2 py-2">{N.format(r.landingViews)}</td>
              <td className="px-2 py-2 font-semibold">{N.format(r.leads)}</td>
              <td className="px-2 py-2 font-semibold">{r.saved ? N.format(r.saved) : <span className="font-normal text-muted-foreground">—</span>}</td>
              <td className="px-2 py-2 font-semibold">{r.waClicks ? N.format(r.waClicks) : <span className="font-normal text-muted-foreground">—</span>}</td>
              <td className="px-3 py-2">{r.leads ? money(r.spend / r.leads) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
