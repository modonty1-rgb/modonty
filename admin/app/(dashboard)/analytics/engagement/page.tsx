import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getEngagementDetail } from "../actions/get-engagement-detail";

// Engagement drill-down — GA4 (SOT) aggregates + recent raw interactions from our DB.
export default async function EngagementDetailPage() {
  const d = await getEngagementDetail();
  const maxDay = Math.max(1, ...d.byDay.map((x) => x.count));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Engagement — full detail</h1>
          <p className="mt-1 text-muted-foreground">Likes, saves, shares, comments and follows (last 30 days · GA4)</p>
        </div>
        <Link href="/analytics" className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">
          ← Back to Analytics
        </Link>
      </div>

      <Card className="border-t-4 border-t-violet-500">
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total engagement events (30d · GA4)</p>
          <p className="text-3xl font-bold tabular-nums">{d.total30d.toLocaleString("en-US")}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By interaction type</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                {d.byEvent.map((e) => (
                  <tr key={e.event} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{e.event}</td>
                    <td className="py-2 text-end font-bold tabular-nums">{e.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  <div className="rounded-t bg-violet-500/80 transition group-hover:bg-violet-600" style={{ height: `${(x.count / maxDay) * 112}px` }} />
                  <span className="pointer-events-none absolute -top-6 start-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-white group-hover:block">
                    {x.date}: {x.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Most engaging pages</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <tbody>
              {d.byPage.map((p) => (
                <tr key={p.path} className="border-b last:border-0">
                  <td className="max-w-[420px] truncate py-2" title={p.path}>
                    {p.path}
                  </td>
                  <td className="py-2 text-end font-bold tabular-nums">{p.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latest comments (moderation-ready)</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                {d.recentComments.map((c) => (
                  <tr key={c.id} className="border-b align-top last:border-0">
                    <td className="py-2">
                      <div className="font-semibold">{c.author}</div>
                      <div className="line-clamp-2 text-xs text-muted-foreground">{c.excerpt}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">📄 {c.article}</div>
                    </td>
                    <td className="whitespace-nowrap py-2 text-end">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{c.status}</span>
                      <div className="mt-1 text-[11px] tabular-nums text-muted-foreground">{c.createdAt.slice(0, 16).replace("T", " ")}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest likes &amp; saves</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                {d.recentInteractions.map((i, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2">
                      <span className="me-2 rounded-full bg-muted px-2 py-0.5 text-[11px]">{i.kind}</span>
                      {i.user}
                    </td>
                    <td className="max-w-[220px] truncate py-2 text-xs text-muted-foreground">{i.article ?? "—"}</td>
                    <td className="whitespace-nowrap py-2 text-end text-[11px] tabular-nums text-muted-foreground">
                      {i.createdAt.slice(0, 16).replace("T", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
