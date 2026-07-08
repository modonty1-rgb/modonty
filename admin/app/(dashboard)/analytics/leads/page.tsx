import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getLeadsDetail, type LeadRow } from "../actions/get-leads-detail";

// Leads drill-down (Khalid 2026-07-07: «أبغى أعرف المعلومات كاملة عشان أتعامل مع العملاء»).
// Numbers = GA4 SOT on the overview page; THIS page is the operational follow-up list (our DB).

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  BOOKING: { label: "Booking", cls: "bg-emerald-100 text-emerald-800" },
  MESSAGE: { label: "Message", cls: "bg-blue-100 text-blue-800" },
  QUESTION: { label: "Question", cls: "bg-violet-100 text-violet-800" },
  COMMENT: { label: "Comment", cls: "bg-amber-100 text-amber-800" },
};

function StatusBadge({ status }: { status: string }) {
  const isNew = status === "new" || status === "PENDING";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${isNew ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function fmt(iso: string): string {
  return iso.slice(0, 16).replace("T", " ");
}

function LeadTypeBadge({ type }: { type: LeadRow["type"] }) {
  const b = TYPE_BADGE[type];
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.cls}`}>{b.label}</span>;
}

export default async function LeadsDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  const { type, status } = await searchParams;
  const { rows: allRows, counts, ga4Counts } = await getLeadsDetail();

  // Tiles double as filter tabs (Khalid 2026-07-07)
  const rows = allRows.filter((r) => {
    if (type && r.type !== type) return false;
    if (status === "new" && !(r.status === "new" || r.status === "PENDING")) return false;
    return true;
  });

  const tile = (active: boolean) =>
    `block h-full transition hover:shadow-md ${active ? "ring-2 ring-primary rounded-xl" : ""}`;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Visitor Actions — أفعال الزوار</h1>
          <p className="mt-1 text-muted-foreground">
            Bookings, messages, reader questions and comments (last 90 days) — everything you need to follow up
          </p>
        </div>
        <Link href="/analytics" className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">
          ← Back to Analytics
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        <Link href="/analytics/leads" className={tile(!type && !status)}>
          <Card className="h-full">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">All actions</p>
              <p className="text-2xl font-bold tabular-nums">{allRows.length}</p>
              <p className="text-[11px] text-muted-foreground">everything in the table</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics/leads?status=new" className={tile(status === "new")}>
          <Card className="h-full border-t-4 border-t-red-500">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Needs action (new)</p>
              <p className="text-2xl font-bold tabular-nums">{counts.newStatus}</p>
              <p className="text-[11px] text-muted-foreground">not contacted yet</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics/leads?type=BOOKING" className={tile(type === "BOOKING")}>
          <Card className="h-full">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Bookings · GA4</p>
              <p className="text-2xl font-bold tabular-nums">{ga4Counts.bookings}</p>
              <p className="text-[11px] text-muted-foreground">DB: {counts.bookings} · from deploy day</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics/leads?type=MESSAGE" className={tile(type === "MESSAGE")}>
          <Card className="h-full">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Contact messages · GA4</p>
              <p className="text-2xl font-bold tabular-nums">{ga4Counts.messages}</p>
              <p className="text-[11px] text-muted-foreground">DB: {counts.messages}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics/leads?type=QUESTION" className={tile(type === "QUESTION")}>
          <Card className="h-full">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Reader questions · GA4</p>
              <p className="text-2xl font-bold tabular-nums">{ga4Counts.questions}</p>
              <p className="text-[11px] text-muted-foreground">DB: {counts.questions}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics/leads?type=COMMENT" className={tile(type === "COMMENT")}>
          <Card className="h-full">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Comments · GA4</p>
              <p className="text-2xl font-bold tabular-nums">{ga4Counts.comments}</p>
              <p className="text-[11px] text-muted-foreground">DB: {counts.comments}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All visitor actions — newest first</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No leads in the last 90 days</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="py-2 pe-3 text-start font-medium">Type</th>
                    <th className="py-2 pe-3 text-start font-medium">Name</th>
                    <th className="py-2 pe-3 text-start font-medium">Contact</th>
                    <th className="py-2 pe-3 text-start font-medium">Client</th>
                    <th className="py-2 pe-3 text-start font-medium">Details / source article</th>
                    <th className="py-2 pe-3 text-start font-medium">Status</th>
                    <th className="py-2 text-start font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.type}-${r.id}`} className="border-b align-top last:border-0">
                      <td className="py-2 pe-3">
                        <LeadTypeBadge type={r.type} />
                      </td>
                      <td className="py-2 pe-3 font-semibold">{r.name}</td>
                      <td className="py-2 pe-3">
                        {r.phone && <div dir="ltr" className="tabular-nums">{r.phone}</div>}
                        {r.email && <div className="text-xs text-muted-foreground">{r.email}</div>}
                      </td>
                      <td className="py-2 pe-3">{r.clientName ?? "—"}</td>
                      <td className="max-w-[340px] py-2 pe-3">
                        {r.articleTitle && <div className="truncate text-xs text-muted-foreground">📄 {r.articleTitle}</div>}
                        {r.text && <div className="line-clamp-2">{r.text}</div>}
                        {r.source && <div className="text-[11px] text-muted-foreground">via {r.source}</div>}
                        {r.href && (
                          <Link href={r.href} className="text-xs text-primary underline-offset-2 hover:underline">
                            Open message →
                          </Link>
                        )}
                      </td>
                      <td className="py-2 pe-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="whitespace-nowrap py-2 text-xs tabular-nums text-muted-foreground">{fmt(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
