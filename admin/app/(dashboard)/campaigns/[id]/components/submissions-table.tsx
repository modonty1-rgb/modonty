import { MessageCircle } from "lucide-react";

import type { BriefSubmission } from "../helpers/get-brief-submissions";

const ar = new Intl.NumberFormat("ar-EG");
const when = new Intl.DateTimeFormat("ar-EG", { timeZone: "Asia/Riyadh", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const STATUS: Record<string, string> = { NEW: "جديد", CONTACTED: "تواصلنا", QUALIFIED: "مؤهّل", CLOSED: "مغلق", ARCHIVED: "مؤرشف" };

/** تسجيلات صفحة الهبوط المنسوبة للبريف — من قاعدتنا، مع فتح الواتساب، وتوزيعها على القطاع والإعلان. */
export function SubmissionsTable({ rows }: { rows: BriefSubmission[] }) {
  if (rows.length === 0) {
    return <p className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">ولا تسجيل يحمل وسم هذا البريف بعد.</p>;
  }
  const count = (key: (r: BriefSubmission) => string) =>
    [...rows.reduce((m, r) => m.set(key(r), (m.get(key(r)) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1]);
  const sectors = count((r) => r.sector || "—");
  const ads = count((r) => r.utmContent || "بلا utm_content");

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span>القطاع: {sectors.map(([k, n]) => `${k} ${ar.format(n)}`).join(" · ")}</span>
        <span>الإعلان: {ads.map(([k, n]) => `${k} ${ar.format(n)}`).join(" · ")}</span>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-xs">
          <thead className="text-[11px] text-muted-foreground">
            <tr className="border-b">
              <th className="px-3 py-1.5 text-start font-medium">الوقت</th>
              <th className="px-2 py-1.5 text-start font-medium">النشاط</th>
              <th className="px-2 py-1.5 text-start font-medium">الجوال</th>
              <th className="px-2 py-1.5 text-start font-medium">القطاع</th>
              <th className="px-2 py-1.5 text-start font-medium">المصدر</th>
              <th className="px-2 py-1.5 text-start font-medium">واتساب</th>
              <th className="px-3 py-1.5 text-start font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="whitespace-nowrap px-3 py-1.5 tabular-nums">{when.format(r.createdAt)}</td>
                <td className="px-2 py-1.5 font-medium" dir="auto">{r.businessName}</td>
                <td className="px-2 py-1.5 tabular-nums" dir="ltr">{r.phone}</td>
                <td className="px-2 py-1.5">{r.sector}</td>
                <td className="px-2 py-1.5 text-muted-foreground" dir="ltr">{[r.utmSource, r.utmContent].filter(Boolean).join(" · ") || "—"}</td>
                <td className="px-2 py-1.5">
                  {r.whatsappAt ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                      <MessageCircle className="size-3" aria-hidden /> فُتح
                    </span>
                  ) : (
                    <span className="text-muted-foreground">لا</span>
                  )}
                </td>
                <td className="px-3 py-1.5">{STATUS[r.status] ?? r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
