import { TrendingUp, MousePointerClick, Eye, Target, AlertCircle, Search, FileText, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  getBingQueryStats,
  getBingPageStats,
  getBingRankAndTrafficStats,
  aggregateBingTraffic,
  parseBingDate,
  type BingQueryStat,
  type BingPageStat,
} from "@/lib/bing-webmaster/client";

import { SubmitIndexNowCard } from "./components/submit-indexnow-card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface BingDataResult<T> {
  ok: boolean;
  data: T | null;
  error: string | null;
}

async function safeBingCall<T>(fn: () => Promise<T>): Promise<BingDataResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data, error: null };
  } catch (e) {
    return { ok: false, data: null, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-GB").format(n);
}

function formatPercent(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

export default async function BingWebmasterPage() {
  const [queries, pages, traffic] = await Promise.all([
    safeBingCall(getBingQueryStats),
    safeBingCall(getBingPageStats),
    safeBingCall(getBingRankAndTrafficStats),
  ]);

  const totals = traffic.data ? aggregateBingTraffic(traffic.data) : null;
  const anyError = !queries.ok || !pages.ok || !traffic.ok;

  const topQueries: BingQueryStat[] = (queries.data ?? [])
    .slice()
    .sort((a, b) => (b.Impressions ?? 0) - (a.Impressions ?? 0))
    .slice(0, 10);

  const topPages: BingPageStat[] = (pages.data ?? [])
    .slice()
    .sort((a, b) => (b.Impressions ?? 0) - (a.Impressions ?? 0))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Bing Webmaster</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Performance from Bing — also covers ChatGPT Search, Copilot, DuckDuckGo, Perplexity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Bing's AI Performance report (Copilot citations, Citation Share — public preview
              since 2026-02, expanded 2026-06) is UI-only, no API — deep-link to it. */}
          <a
            href="https://www.bing.com/webmasters/aiperformance"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            AI Performance report
            <ExternalLink className="h-3 w-3" />
          </a>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Bing Webmaster API
          </Badge>
        </div>
      </div>

      {anyError && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-700 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-medium mb-1">Some Bing data could not be loaded</p>
              <ul className="space-y-0.5 list-disc list-inside opacity-90">
                {!queries.ok && <li>Queries: {queries.error}</li>}
                {!pages.ok && <li>Pages: {pages.error}</li>}
                {!traffic.ok && <li>Traffic: {traffic.error}</li>}
              </ul>
              <p className="mt-2 text-xs">
                Bing may still be processing the site (24–48h after first registration). Returning placeholder values.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={MousePointerClick}
          label="Total Clicks"
          value={totals ? formatNumber(totals.totalClicks) : "—"}
          hint={totals ? `${totals.daysCount} days` : "no data yet"}
          tone="emerald"
        />
        <KpiCard
          icon={Eye}
          label="Total Impressions"
          value={totals ? formatNumber(totals.totalImpressions) : "—"}
          hint={totals ? `${totals.daysCount} days` : "no data yet"}
          tone="blue"
        />
        <KpiCard
          icon={TrendingUp}
          label="CTR"
          value={totals ? formatPercent(totals.ctr) : "—"}
          hint="clicks / impressions"
          tone="violet"
        />
        <KpiCard
          icon={Target}
          label="Avg Position"
          value={totals && totals.avgPosition > 0 ? totals.avgPosition.toFixed(1) : "—"}
          hint="across impressions"
          tone="amber"
        />
      </div>

      <SubmitIndexNowCard />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4" />
            Top Queries (by impressions)
            <Badge variant="outline" className="ml-auto">
              {topQueries.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topQueries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No query data yet. Bing typically needs 24–48 hours after first indexing.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b">
                <tr>
                  <th className="text-left py-2 font-medium">#</th>
                  <th className="text-left py-2 font-medium">Query</th>
                  <th className="text-right py-2 font-medium">Clicks</th>
                  <th className="text-right py-2 font-medium">Impressions</th>
                  <th className="text-right py-2 font-medium">Position</th>
                </tr>
              </thead>
              <tbody>
                {topQueries.map((q, i) => (
                  <tr key={q.Query + i} className="border-b last:border-b-0">
                    <td className="py-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-2 font-medium" dir="rtl">{q.Query}</td>
                    <td className="py-2 text-right">{formatNumber(q.Clicks ?? 0)}</td>
                    <td className="py-2 text-right">{formatNumber(q.Impressions ?? 0)}</td>
                    <td className="py-2 text-right text-muted-foreground">
                      {q.AvgImpressionPosition?.toFixed(1) ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Top Pages (by impressions)
            <Badge variant="outline" className="ml-auto">
              {topPages.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topPages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No page data yet. Will populate as Bing crawls and ranks your URLs.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b">
                <tr>
                  <th className="text-left py-2 font-medium">#</th>
                  <th className="text-left py-2 font-medium">Page</th>
                  <th className="text-right py-2 font-medium">Clicks</th>
                  <th className="text-right py-2 font-medium">Impressions</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((p, i) => (
                  <tr key={p.Page + i} className="border-b last:border-b-0">
                    <td className="py-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-2">
                      <a
                        href={p.Page}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-700 line-clamp-1 max-w-md inline-block"
                        title={p.Page}
                      >
                        {decodeURIComponent(p.Page.replace(/^https?:\/\/[^/]+/, ""))}
                      </a>
                    </td>
                    <td className="py-2 text-right">{formatNumber(p.Clicks ?? 0)}</td>
                    <td className="py-2 text-right">{formatNumber(p.Impressions ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="pt-6 text-xs text-muted-foreground space-y-1">
          <p>
            <strong className="text-foreground">Data source:</strong> Bing Webmaster Tools API · auth via{" "}
            <code className="bg-background rounded px-1">INDEXNOW_KEY</code> (same key as IndexNow).
          </p>
          <p>
            <strong className="text-foreground">Refresh:</strong> Bing updates query/page stats every few hours.
            Force-fresh by reloading this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface KpiCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  tone: "emerald" | "blue" | "violet" | "amber";
}

function KpiCard({ icon: Icon, label, value, hint, tone }: KpiCardProps) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`inline-flex items-center justify-center h-8 w-8 rounded-md ${tones[tone]}`}>
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5 opacity-70">{hint}</div>
      </CardContent>
    </Card>
  );
}
