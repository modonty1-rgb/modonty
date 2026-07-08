import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

import { getLeadsDetail } from "../../analytics/actions/get-leads-detail";

/**
 * Visitor Actions breakdown row on the merged dashboard (Khalid 2026-07-08:
 * «أبغى أعرف التفاعلات الأساسية»). Numbers per the locked architecture:
 * GA4 counts + "needs action" from our DB; every card links to the filtered list.
 */
export async function VisitorActionsBreakdown() {
  const { ga4Counts, counts } = await getLeadsDetail();

  const tiles = [
    {
      label: "Needs action (new)",
      value: counts.newStatus,
      hint: "not contacted yet",
      href: "/analytics/leads?status=new",
      alert: true,
    },
    { label: "Bookings", value: ga4Counts.bookings, hint: `DB: ${counts.bookings}`, href: "/analytics/leads?type=BOOKING" },
    { label: "Contact messages", value: ga4Counts.messages, hint: `DB: ${counts.messages}`, href: "/analytics/leads?type=MESSAGE" },
    { label: "Reader questions", value: ga4Counts.questions, hint: `DB: ${counts.questions}`, href: "/analytics/leads?type=QUESTION" },
    { label: "Comments", value: ga4Counts.comments, hint: `DB: ${counts.comments}`, href: "/analytics/leads?type=COMMENT" },
  ];

  return (
    <div>
      <h2 className="mb-2 text-sm font-bold">
        Visitor Actions — bookings · messages · questions · comments
        <span className="ms-2 font-normal text-muted-foreground">last 90 days</span>
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="block h-full transition hover:shadow-md">
            <Card className={`h-full ${t.alert ? "border-t-4 border-t-red-500" : ""}`}>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">{t.label}</p>
                <p className={`text-2xl font-bold tabular-nums ${t.alert ? "text-red-600" : ""}`}>{t.value}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t.hint} <span className="text-primary">→</span>
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
