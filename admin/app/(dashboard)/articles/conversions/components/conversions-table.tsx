"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DataTable, type Column } from "@/components/admin/data-table";
import { Fact, FactGroup } from "@/components/shared/advanced-table";
import { cn } from "@/lib/utils";
import {
  MIN_VIEWS_FOR_RATE,
  NO_CATEGORY,
  type ArticleActionsRow,
  type ClientActionsRow,
} from "@modonty/shared/lib/analytics/get-article-actions";

/**
 * «Article Conversions» — Khalid's shape (7 Oct 2026): the period alone at the top · one row per
 * CLIENT with its action totals · «+» opens that client's articles that brought an action · a
 * click on an article opens what happened in it. Advanced Table pieces (`DataTable`, `Fact`).
 */

const N = new Intl.NumberFormat("en-US");
const PERIODS = [7, 30, 90] as const;

/** One colour per action, everywhere on the page — the column numbers, the facts and the bar. */
const ACTIONS = [
  { key: "form", label: "Form", text: "text-sky-600 dark:text-sky-400", bar: "bg-sky-500" },
  { key: "whatsapp", label: "WhatsApp", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
  { key: "call", label: "Call", text: "text-indigo-600 dark:text-indigo-400", bar: "bg-indigo-500" },
  { key: "link", label: "Site", text: "text-violet-600 dark:text-violet-400", bar: "bg-violet-500" },
] as const;
type ActionKey = (typeof ACTIONS)[number]["key"];

const rateText = (r: { rate: number | null; views: number; total: number }) =>
  r.total === 0 || r.rate === null ? "—" : r.views < MIN_VIEWS_FOR_RATE ? "Few reads" : `${r.rate.toFixed(r.rate >= 10 ? 0 : 1)}%`;
const rateForSort = (r: { rate: number | null; views: number; total: number }) =>
  r.total > 0 && r.views >= MIN_VIEWS_FOR_RATE && r.rate !== null ? r.rate : -1;

const dim = <span className="text-muted-foreground/50">—</span>;
const count = (n: number, tone?: string) => (n ? <span className={cn("font-semibold", tone)}>{N.format(n)}</span> : dim);

const columns: Column<ClientActionsRow>[] = [
  {
    key: "clientName",
    header: "Client",
    sortable: true,
    render: (r) => (
      <Link
        href={`/clients/${r.clientId}`}
        onClick={(e) => e.stopPropagation()}
        title={r.clientName}
        className="block max-w-[160px] truncate hover:text-primary hover:underline"
      >
        {r.clientName}
      </Link>
    ),
  },
  {
    key: "articlesWithActions",
    header: <span title="Articles that brought an action / published articles">Art.</span>,
    sortable: true,
    className: "w-[1%] whitespace-nowrap text-center tabular-nums",
    render: (r) => (
      <span>
        <span className="font-semibold">{N.format(r.articlesWithActions)}</span>
        <span className="text-muted-foreground"> / {N.format(r.articles)}</span>
      </span>
    ),
  },
  ...ACTIONS.map(
    (a): Column<ClientActionsRow> => ({
      key: a.key,
      header: a.label,
      sortable: true,
      className: "w-[1%] whitespace-nowrap text-center tabular-nums",
      render: (r) => count(r[a.key as ActionKey], a.text),
    }),
  ),
  {
    key: "total",
    header: "Total",
    sortable: true,
    className: "w-[1%] text-center tabular-nums",
    render: (r) => (r.total ? <span className="font-bold">{N.format(r.total)}</span> : dim),
  },
  {
    key: "direct",
    header: <span title="Contacts from the client page or listings with no article read in the last 7 days — not counted in Total">Page</span>,
    sortable: true,
    sortFn: (a, b) => a.direct.total - b.direct.total,
    className: "w-[1%] text-center tabular-nums",
    render: (r) => (r.direct.total ? <span className="font-semibold text-muted-foreground">{N.format(r.direct.total)}</span> : dim),
  },
  { key: "views", header: "Reads", sortable: true, className: "w-[1%] text-center tabular-nums", render: (r) => (r.views ? N.format(r.views) : dim) },
  {
    key: "rate",
    header: <span title={`Conversion — actions per 100 reads · shown from ${MIN_VIEWS_FOR_RATE} reads`}>Conv.</span>,
    sortable: true,
    sortFn: (a, b) => rateForSort(a) - rateForSort(b),
    className: "w-[1%] whitespace-nowrap text-center tabular-nums",
    render: (r) => {
      const t = rateText(r);
      return <span className={cn(t === "—" && "text-muted-foreground/50", t === "Few reads" && "text-[11px] text-muted-foreground", t.endsWith("%") && "font-semibold")}>{t}</span>;
    },
  },
];

/** What happened in one article — opened by clicking it inside a client's «+». */
function ArticleBreakdown({ r }: { r: ArticleActionsRow }) {
  const share = (n: number) => (r.total > 0 ? (n / r.total) * 100 : 0);
  return (
    <div className="space-y-2.5 rounded-md border bg-background/70 p-3 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
        <FactGroup title="Actions" spread>
          {ACTIONS.map((a) => (
            <Fact key={a.key} label={a.label} value={N.format(r[a.key])} tone={r[a.key] > 0 ? a.text : "text-muted-foreground/60"} dot={a.bar} />
          ))}
        </FactGroup>
        <FactGroup title="Reads">
          <Fact label="Reads" value={N.format(r.views)} />
          <Fact label="Conversion" value={rateText(r)} hint="Actions per 100 reads" />
        </FactGroup>
        <FactGroup title="Open">
          <Fact label="Category" value={r.categoryName ?? NO_CATEGORY} />
          <Fact
            label="Live page"
            value={
              <a href={`https://www.modonty.com/articles/${encodeURIComponent(r.slug)}`} target="_blank" rel="noopener" className="text-primary hover:underline">
                modonty.com ↗
              </a>
            }
          />
        </FactGroup>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label={ACTIONS.map((a) => `${a.label} ${r[a.key]}`).join(", ")}>
        {ACTIONS.map((a) => (r[a.key] > 0 ? <div key={a.key} className={cn("h-full", a.bar)} style={{ width: `${share(r[a.key])}%` }} /> : null))}
      </div>
    </div>
  );
}

/** The contacts with no article behind them — one line above the client's articles. */
function DirectLine({ direct }: { direct: ClientActionsRow["direct"] }) {
  if (!direct.total) return null;
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 pb-2 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">From the client page (no article read):</span>
      {ACTIONS.map((a) =>
        direct[a.key] > 0 ? (
          <span key={a.key} className={cn("inline-flex items-center gap-1 font-semibold", a.text)}>
            <span className={cn("size-1.5 rounded-full", a.bar)} aria-hidden />
            {a.label} {N.format(direct[a.key])}
          </span>
        ) : null,
      )}
    </p>
  );
}

/** A client's «+»: its articles that brought an action, most first — each opens its breakdown. */
function ClientArticles({ articles, direct }: { articles: ArticleActionsRow[]; direct: ClientActionsRow["direct"] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (articles.length === 0)
    return (
      <div>
        <DirectLine direct={direct} />
        <p className="ms-1 text-xs text-muted-foreground">No article brought an action in this period.</p>
      </div>
    );
  return (
    <div onClick={(e) => e.stopPropagation()}>
    <DirectLine direct={direct} />
    <div className="rounded-md border bg-background/70 shadow-sm">
      <ul className="divide-y">
        {articles.map((r) => {
          const isOpen = open === r.articleId;
          return (
            <li key={r.articleId}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : r.articleId)}
                className={cn("flex w-full items-center gap-3 px-3 py-2 text-start text-sm hover:bg-muted/50", isOpen && "bg-muted/40")}
              >
                <span className="min-w-0 flex-1 truncate" title={r.title}>{r.title}</span>
                <span className="hidden max-w-[160px] truncate text-xs text-muted-foreground sm:block">{r.categoryName ?? NO_CATEGORY}</span>
                <span className="flex items-center gap-2.5 tabular-nums text-xs">
                  {ACTIONS.map((a) =>
                    r[a.key] > 0 ? (
                      <span key={a.key} className={cn("inline-flex items-center gap-1 font-semibold", a.text)} title={a.label}>
                        <span className={cn("size-1.5 rounded-full", a.bar)} aria-hidden />
                        {N.format(r[a.key])}
                      </span>
                    ) : null,
                  )}
                </span>
                <span className="w-8 text-center text-sm font-bold tabular-nums">{N.format(r.total)}</span>
              </button>
              {isOpen ? (
                <div className="px-3 pb-3">
                  <ArticleBreakdown r={r} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
    </div>
  );
}

export function ConversionsTable({
  rows,
  byClient,
  days,
}: {
  rows: ArticleActionsRow[];
  byClient: ClientActionsRow[];
  days: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const setDays = (d: number) => {
    const next = new URLSearchParams(params.toString());
    if (d === 30) next.delete("days");
    else next.set("days", String(d));
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // A client's converting articles, most actions first — grouped once, read by every «+».
  const articlesOf = new Map<string, ArticleActionsRow[]>();
  for (const r of rows) {
    if (r.total === 0) continue;
    const list = articlesOf.get(r.clientId) ?? [];
    list.push(r);
    articlesOf.set(r.clientId, list);
  }
  for (const list of articlesOf.values()) list.sort((a, b) => b.total - a.total || b.views - a.views);

  // Clients with an action or a read in the period; a client with neither has nothing to decide on.
  const visible = byClient.filter((c) => c.total > 0 || c.direct.total > 0 || c.views > 0);

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-[240px] flex-1 basis-0">
          <h1 className="text-xl font-semibold">Article Conversions</h1>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">Leads each client got from its articles — open a client to see which articles, open an article to see what happened.</p>
        </div>
        <nav className="flex gap-1.5" aria-label="Period">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={p === days}
              onClick={() => setDays(p)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                p === days ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent",
              )}
            >
              Last {p} days
            </button>
          ))}
        </nav>
      </header>
      <DataTable
        data={visible}
        columns={columns}
        searchKey="clientName"
        searchPlaceholder="Search clients..."
        pageSize={25}
        emptyText="No client had an action or a read in this period"
        rowClassName={(r) => (r.total === 0 ? "text-muted-foreground" : undefined)}
        renderExpanded={(r) => <ClientArticles articles={articlesOf.get(r.clientId) ?? []} direct={r.direct} />}
        expandLabel={(r) => `Articles of ${r.clientName.trim()}`}
      />
      <p className="text-[11px] text-muted-foreground">
        Form = contact form submitted, not opened · WhatsApp = once per visitor a day · Call and site = clicks on the article button (modonty links excluded) · Page = contacts with no article read in the last 7 days, not in Total · Conversion = actions per 100 reads in the same period, shown from {MIN_VIEWS_FOR_RATE} reads.
      </p>
    </div>
  );
}
