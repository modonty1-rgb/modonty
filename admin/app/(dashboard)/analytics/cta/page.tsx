import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getCtaDetail } from "../actions/get-cta-detail";

// CTA drill-down — GA4 (SOT) aggregates + recent raw clicks from our DB.
export default async function CtaDetailPage() {
  const d = await getCtaDetail();
  const maxDay = Math.max(1, ...d.byDay.map((x) => x.count));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">CTA Clicks — full detail</h1>
          <p className="mt-1 text-muted-foreground">Which buttons, on which pages, from which sources (last 30 days · GA4)</p>
        </div>
        <Link href="/analytics" className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">
          ← Back to Analytics
        </Link>
      </div>

      <Card className="border-t-4 border-t-amber-500">
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total CTA clicks (30d · GA4)</p>
          <p className="text-3xl font-bold tabular-nums">{d.total30d.toLocaleString("en-US")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Per day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-end gap-1">
            {d.byDay.map((x) => (
              <div key={x.date} className="group relative flex-1">
                <div className="rounded-t bg-amber-500/80 transition group-hover:bg-amber-600" style={{ height: `${(x.count / maxDay) * 112}px` }} />
                <span className="pointer-events-none absolute -top-6 start-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-white group-hover:block">
                  {x.date}: {x.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top pages driving clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                {d.byPage.map((p) => (
                  <tr key={p.path} className="border-b last:border-0">
                    <td className="max-w-[380px] truncate py-2" title={p.path}>
                      {p.path}
                    </td>
                    <td className="py-2 text-end font-bold tabular-nums">{p.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clicks by traffic source</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                {d.bySource.map((s) => (
                  <tr key={s.source} className="border-b last:border-0">
                    <td className="py-2">{s.source}</td>
                    <td className="py-2 text-end font-bold tabular-nums">{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest 50 clicks (our DB — button type & context)</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-2 text-start font-medium">Button</th>
                <th className="py-2 text-start font-medium">Article</th>
                <th className="py-2 text-start font-medium">Client</th>
                <th className="py-2 text-start font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {d.recent.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2 font-semibold">{c.type}</td>
                  <td className="max-w-[320px] truncate py-2">{c.articleTitle ?? "—"}</td>
                  <td className="py-2">{c.clientName ?? "—"}</td>
                  <td className="whitespace-nowrap py-2 text-xs tabular-nums text-muted-foreground">
                    {c.createdAt.slice(0, 16).replace("T", " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
