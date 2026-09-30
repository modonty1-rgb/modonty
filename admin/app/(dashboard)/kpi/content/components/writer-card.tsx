import { ChevronDown, Crown, Eye, Globe2, MousePointerClick, Percent, TrendingDown, TrendingUp, Trophy } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { countryName } from "../helpers/country-name";
import type { CountryShare, GoogleTotals, WriterKpi } from "../helpers/get-content-kpis";

const N = new Intl.NumberFormat("en-US");

/** % change against the previous window; null when there is nothing to compare with. */
function change(now: number, before: number): number | null {
  if (!before) return null;
  return ((now - before) / before) * 100;
}

function Delta({ now, before }: { now: number; before: number }) {
  const pct = change(now, before);
  if (pct === null) return <span className="text-[11px] text-muted-foreground">{now > 0 ? "new" : "—"}</span>;
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums", up ? "text-emerald-600" : "text-rose-600")}>
      <Icon className="h-3 w-3" aria-hidden />
      {up ? "+" : ""}
      {pct.toFixed(0)}%
    </span>
  );
}

function Metric({ icon: Icon, label, value, delta }: { icon: typeof Eye; label: string; value: string; delta?: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline justify-between gap-2">
        <span className="text-lg font-semibold tabular-nums text-foreground">{value}</span>
        {delta}
      </div>
    </div>
  );
}

/** Share of the writer's impressions per country — the answer to «where do these impressions come from». */
function Countries({ countries, allImpressions }: { countries: CountryShare[]; allImpressions: number }) {
  const total = countries.reduce((s, c) => s + c.impressions, 0);
  if (!total) return null;
  // Google leaves out privacy-filtered impressions whenever it splits a page by country: measured
  // 30 Sep 2026, one article = 195,939 impressions by page but 118,755 by page+country. Shares are
  // of what Google did attribute, and the card says how much that is.
  const covered = allImpressions ? Math.min(100, (total / allImpressions) * 100) : 100;
  return (
    <div className="space-y-1.5 rounded-lg border px-3 py-2">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Globe2 className="h-3.5 w-3.5" aria-hidden />
        Impressions by country
      </p>
      <ul className="space-y-1">
        {countries.map((c) => {
          const share = (c.impressions / total) * 100;
          return (
            <li key={c.code} className="text-xs">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-foreground">{c.code === "other" ? "Other countries" : countryName(c.code)}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {N.format(c.impressions)} · {share.toFixed(0)}% · {N.format(c.clicks)} clicks
                </span>
              </div>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary/70" style={{ width: `${Math.max(share, 1)}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] text-muted-foreground">
        Google names the country for {covered.toFixed(0)}% of these impressions — the rest it withholds for privacy.
      </p>
    </div>
  );
}

const pos = (t: GoogleTotals) => (t.position === null ? "—" : t.position.toFixed(1));

/**
 * One writer's Google results for the period: the four Search Console numbers across all his
 * clients, the change against the previous period, how many of his published articles Google
 * showed, his strongest article — and, opened, the same numbers client by client.
 */
export function WriterCard({ writer, rank, compare }: { writer: WriterKpi; rank: number | null; compare: boolean }) {
  const w = writer;
  const initials = w.name.split(/\s+/).map((s) => s[0]).join("").slice(0, 2);

  return (
    <Card className={cn("overflow-hidden shadow-sm", rank === 1 && "border-amber-300 ring-1 ring-amber-200")}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {w.image && <AvatarImage src={w.image} alt="" />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{w.name}</p>
            <p className="text-xs text-muted-foreground">
              {w.clients.length} {w.clients.length === 1 ? "client" : "clients"} · {w.articlesSeen} of {w.articlesPublished} articles seen in Google
            </p>
          </div>
          {rank !== null && (
            <span
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-full px-2 text-sm font-bold tabular-nums",
                rank === 1 ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground",
              )}
              title="Rank by clicks from Google"
            >
              {rank === 1 && <Crown className="h-3.5 w-3.5" aria-hidden />}#{rank}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Metric icon={Eye} label="Impressions" value={N.format(w.current.impressions)} delta={compare && <Delta now={w.current.impressions} before={w.previous.impressions} />} />
          <Metric icon={MousePointerClick} label="Clicks" value={N.format(w.current.clicks)} delta={compare && <Delta now={w.current.clicks} before={w.previous.clicks} />} />
          <Metric icon={Percent} label="CTR" value={`${w.current.ctr.toFixed(2)}%`} />
          <Metric icon={Trophy} label="Avg. position" value={pos(w.current)} />
        </div>

        {w.topArticle && (
          <div className="rounded-lg border border-dashed px-3 py-2 text-xs">
            <p className="text-muted-foreground">Top article</p>
            <a
              href={`https://www.modonty.com${w.topArticle.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-1 font-medium text-foreground hover:underline"
              dir="auto"
            >
              {w.topArticle.title}
            </a>
            {/* bdi isolates the Arabic name so it doesn't reorder the English numbers after it. */}
            <p className="text-muted-foreground">
              <bdi>{w.topArticle.clientName}</bdi> · {N.format(w.topArticle.clicks)} clicks · {N.format(w.topArticle.impressions)} impressions
            </p>
          </div>
        )}

        <Countries countries={w.countries} allImpressions={w.current.impressions} />

        {w.clients.length > 0 && (
          <details className="group rounded-lg border">
            <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
              Client by client
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            {/* Two-line rows instead of a 7-column table: the card is ~400px wide, and the table
                scrolled sideways inside it (Khalid, 30 Sep 2026). Every number stays visible. */}
            <ul className="divide-y border-t">
              {w.clients.map((c) => (
                <li key={c.id} className="space-y-0.5 px-3 py-2 text-xs">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="min-w-0 truncate font-medium text-foreground" dir="auto" title={c.name}>
                      {c.name}
                    </span>
                    <span className="shrink-0 text-muted-foreground">{c.topCountry ? countryName(c.topCountry.code) : "—"}</span>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 tabular-nums text-muted-foreground">
                    <span>
                      <span className="text-foreground">{N.format(c.current.impressions)}</span> impr.{" "}
                      {compare && <Delta now={c.current.impressions} before={c.previous.impressions} />}
                    </span>
                    <span>
                      <span className="text-foreground">{N.format(c.current.clicks)}</span> clicks
                    </span>
                    <span>{c.current.ctr.toFixed(1)}% CTR</span>
                    <span>pos. {pos(c.current)}</span>
                    <span>
                      {c.articlesSeen}/{c.articlesPublished} articles
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
