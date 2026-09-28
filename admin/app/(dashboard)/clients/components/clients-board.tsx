"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { SubscriptionStatus } from "@prisma/client";
import {
  AlertTriangle,
  CalendarClock,
  ExternalLink,
  FileText,
  FileWarning,
  Images,
  Info,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Video,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CountTab } from "@/components/admin/count-tab";
import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SeoScoreBadge } from "@/components/shared/seo-score-badge";
import { DetailCard, Fact, FactGroup, FilterRow } from "@/components/shared/advanced-table";
import { computeClientSeoScore } from "@modonty/shared/lib/seo/client/seo-score";
import { clientToSeoInput } from "@modonty/shared/lib/seo/client/from-client";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { cn } from "@/lib/utils";
import { calculateDeliveryRate } from "../helpers/business-metrics";
import type { ClientForList, ClientsStats } from "../actions/clients-actions/types";
import { ClientAvatar } from "./client-avatar";
import { ClientsFilters } from "./clients-filters";
import { RegenerateAllSeoButton } from "./regenerate-all-seo-button";
import { hasExternalIntroVideo } from "./client-table";

const N = new Intl.NumberFormat("en-US");
const NO_WRITER = "none";
const day = (d: Date | string | null | undefined) => (d ? format(new Date(d), "d MMM yyyy") : "—");

/**
 * Subscription state in the «Advanced Table» palette: emerald live · slate not started ·
 * rose ended (a problem to act on) · zinc closed.
 */
const SUB_TONE: Record<SubscriptionStatus, { label: string; dot: string; badge: string }> = {
  ACTIVE: { label: "Active", dot: "bg-emerald-500", badge: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300" },
  PENDING: { label: "Pending", dot: "bg-slate-400", badge: "bg-slate-500/15 text-slate-700 ring-slate-500/30 dark:text-slate-300" },
  EXPIRED: { label: "Expired", dot: "bg-rose-500", badge: "bg-rose-500/15 text-rose-700 ring-rose-500/30 dark:text-rose-300" },
  CANCELLED: { label: "Cancelled", dot: "bg-zinc-500", badge: "bg-muted text-muted-foreground ring-border" },
};

type KpiKey = "overdue" | "renewals" | "incomplete" | "externalVideo";

/**
 * All Clients as an «Advanced Table» (Khalid, 27 Sep 2026: «الكلاينتس… نفس المشكلة»).
 * Header: writer · status on the left, the four «act on it» cards on the right (they were
 * scattered pills before). Main row: the basics. «+»: articles, reels, account and links.
 *
 * The old table (`client-table.tsx`) stays in the repo, unused here, until the team confirms.
 */
export function ClientsBoard({
  clients,
  stats,
  defaultLogoUrl,
  expiringThisMonth,
  overdueRenewals,
}: {
  clients: ClientForList[];
  stats: ClientsStats;
  defaultLogoUrl?: string | null;
  expiringThisMonth: number;
  overdueRenewals: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [seoDialogOpen, setSeoDialogOpen] = useState(false);

  const writer = params.get("writer");
  const status = params.get("status") as SubscriptionStatus | null;
  const kpi = (params.get("kpi") as KpiKey | null) ?? null;
  const setParam = (key: "writer" | "status" | "kpi", value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Computed once for every client — the table sorts and pages them itself.
  const computed = useMemo(() => {
    const map = new Map<string, { seo: number; delivered: number; promised: number }>();
    for (const c of clients) {
      const { score } = computeClientSeoScore(clientToSeoInput(c as unknown as Record<string, unknown>));
      const d = calculateDeliveryRate(c, c.articles?.length ?? 0);
      map.set(c.id, { seo: score, delivered: d.delivered, promised: d.promised });
    }
    return map;
  }, [clients]);

  const writers = useMemo(() => {
    const byId = new Map<string, { id: string; name: string; count: number }>();
    let none = 0;
    for (const c of clients) {
      if (!c.editor?.id) { none++; continue; }
      const w = byId.get(c.editor.id) ?? { id: c.editor.id, name: c.editor.name?.trim() || "Unnamed", count: 0 };
      w.count++;
      byId.set(c.editor.id, w);
    }
    return { list: [...byId.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)), none };
  }, [clients]);

  const byWriter = useMemo(
    () => (writer ? clients.filter((c) => (writer === NO_WRITER ? !c.editor?.id : c.editor?.id === writer)) : clients),
    [clients, writer],
  );
  const statusCount = (s: SubscriptionStatus) => byWriter.filter((c) => c.subscriptionStatus === s).length;
  const byStatus = useMemo(() => (status ? byWriter.filter((c) => c.subscriptionStatus === status) : byWriter), [byWriter, status]);

  /**
   * The four «act on it» cards. Overdue and renewals open their segment lists (their counts
   * come from the server, by end date — not from the status field); the other two filter here.
   */
  const KPIS: Record<KpiKey, KpiMeta & { icon: React.ComponentType<{ className?: string }>; value: number; onClick: () => void }> = {
    overdue: {
      label: "تجديد متأخر",
      tone: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
      ring: "ring-rose-500",
      icon: AlertTriangle,
      value: overdueRenewals,
      onClick: () => router.push("/clients/segment/expired"),
    },
    renewals: {
      label: "تجديد هذا الشهر",
      tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      ring: "ring-amber-500",
      icon: CalendarClock,
      value: expiringThisMonth,
      onClick: () => router.push("/clients/segment/expiring-month"),
    },
    incomplete: {
      label: "ملف ناقص",
      tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      ring: "ring-amber-500",
      icon: FileWarning,
      value: byStatus.filter((c) => !c.industryId).length,
      onClick: () => setParam("kpi", kpi === "incomplete" ? null : "incomplete"),
    },
    externalVideo: {
      label: "فيديو خارجي",
      tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      ring: "ring-amber-500",
      icon: Video,
      value: byStatus.filter(hasExternalIntroVideo).length,
      onClick: () => setParam("kpi", kpi === "externalVideo" ? null : "externalVideo"),
    },
  };

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return byStatus.filter((c) => {
      if (kpi === "incomplete" && c.industryId) return false;
      if (kpi === "externalVideo" && !hasExternalIntroVideo(c)) return false;
      if (!term) return true;
      return (
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term) ||
        !!c.email?.toLowerCase().includes(term) ||
        !!c.phone?.toLowerCase().includes(term)
      );
    });
  }, [byStatus, kpi, search]);

  const columns: Column<ClientForList>[] = [
    {
      key: "name",
      header: "Client",
      sortFn: (a, b) => a.name.localeCompare(b.name, "ar"),
      render: (c) => (
        <div className="flex min-w-0 items-center gap-2.5 whitespace-normal">
          <ClientAvatar url={mediaSrc(c.logoMedia)} fallbackUrl={defaultLogoUrl} name={c.name} />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <Link
                href={`/clients/${c.id}`}
                onClick={(e) => e.stopPropagation()}
                className="truncate font-medium hover:text-primary hover:underline"
                title={c.name}
              >
                {c.name}
              </Link>
              {/* The two things someone must fix, visible without opening the row. */}
              {!c.industryId ? (
                <span className="shrink-0 rounded-full bg-amber-500/15 px-1.5 text-[10px] font-semibold leading-4 text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-300" title="No industry — complete the profile before the first article">
                  Incomplete
                </span>
              ) : null}
              {hasExternalIntroVideo(c) ? (
                <span className="shrink-0 rounded-full bg-amber-500/15 px-1.5 text-[10px] font-semibold leading-4 text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-300" title="Intro video on a channel the client does not own">
                  External video
                </span>
              ) : null}
            </span>
            <span className="block truncate text-xs text-muted-foreground">{c.email}</span>
          </span>
        </div>
      ),
    },
    {
      key: "writer",
      header: "Writer",
      className: "w-[1%]",
      sortFn: (a, b) => (a.editor?.name ?? "~").localeCompare(b.editor?.name ?? "~"),
      render: (c) => (c.editor?.name ? <span dir="auto">{c.editor.name}</span> : <span className="text-muted-foreground">No writer</span>),
    },
    {
      key: "status",
      header: "Status",
      className: "w-[1%]",
      sortFn: (a, b) => a.subscriptionStatus.localeCompare(b.subscriptionStatus),
      render: (c) => (
        <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1", SUB_TONE[c.subscriptionStatus].badge)}>
          <span className={cn("size-1.5 rounded-full", SUB_TONE[c.subscriptionStatus].dot)} aria-hidden />
          {SUB_TONE[c.subscriptionStatus].label}
        </span>
      ),
    },
    {
      key: "published",
      header: <span title="Published on modonty.com">Published</span>,
      className: "w-[1%] text-center tabular-nums",
      sortFn: (a, b) => a.articleStats.published - b.articleStats.published,
      render: (c) => (
        <span className={cn("font-semibold", c.articleStats.published > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/60")}>
          {N.format(c.articleStats.published)}
        </span>
      ),
    },
    {
      key: "thisMonth",
      header: <span title="Published this month ÷ monthly quota">This month</span>,
      className: "w-[1%] text-center tabular-nums",
      sortFn: (a, b) => (computed.get(a.id)?.delivered ?? 0) - (computed.get(b.id)?.delivered ?? 0),
      render: (c) => {
        const d = computed.get(c.id);
        if (!d || d.promised === 0) return <span className="text-muted-foreground/60">—</span>;
        return (
          <span>
            <span className={cn("font-semibold", d.delivered > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
              {N.format(d.delivered)}
            </span>
            <span className="text-muted-foreground"> / {N.format(d.promised)}</span>
          </span>
        );
      },
    },
    {
      key: "seo",
      header: "SEO",
      className: "w-[1%] text-center",
      sortFn: (a, b) => (computed.get(a.id)?.seo ?? 0) - (computed.get(b.id)?.seo ?? 0),
      render: (c) => <SeoScoreBadge score={computed.get(c.id)?.seo ?? 0} size="sm" />,
    },
  ];

  const details = (c: ClientForList) => {
    const d = computed.get(c.id);
    const inWork = Math.max(0, c.articleStats.total - c.articleStats.published - c.articleStats.awaitingApproval);
    return (
      <DetailCard
        columns="lg:grid-cols-[minmax(0,1fr)_1px_auto_1px_auto]"
        groups={[
          <FactGroup key="articles" title="Articles" spread>
            <Fact label="Received" value={N.format(c.articleStats.total)} hint="Every article created for this client, any status" />
            <Fact label="Published" value={N.format(c.articleStats.published)} dot="bg-emerald-500" tone={c.articleStats.published ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/60"} />
            <Fact label="Waiting for approval" value={N.format(c.articleStats.awaitingApproval)} dot="bg-sky-500" tone={c.articleStats.awaitingApproval ? "text-sky-600 dark:text-sky-400" : "text-muted-foreground/60"} />
            <Fact label="Other stages" value={N.format(inWork)} dot="bg-slate-400" hint="Writing, draft, needs changes, scheduled or archived" tone={inWork ? undefined : "text-muted-foreground/60"} />
            <Fact
              label="This month"
              value={d && d.promised ? `${N.format(d.delivered)} / ${N.format(d.promised)}` : "—"}
              tone={d && d.promised ? (d.delivered > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400") : undefined}
            />
          </FactGroup>,
          <FactGroup key="reels" title="Reels">
            <Fact label="Published" value={N.format(c.reelStats.published)} dot="bg-emerald-500" tone={c.reelStats.published ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/60"} />
            <Fact label="Waiting for approval" value={N.format(c.reelStats.pending)} dot="bg-sky-500" tone={c.reelStats.pending ? "text-sky-600 dark:text-sky-400" : "text-muted-foreground/60"} />
          </FactGroup>,
          <FactGroup key="account" title="Account">
            <Fact label="Ends" value={<span className="text-sm">{day(c.subscriptionEndDate)}</span>} />
            <Fact label="Joined" value={<span className="text-sm">{day(c.createdAt)}</span>} />
            <Fact label="Phone" value={<span className="text-sm font-medium" dir="ltr">{c.phone || "—"}</span>} />
          </FactGroup>,
        ]}
        footer={
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link href={`/clients/${c.id}`} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium hover:bg-muted">
              <ExternalLink className="size-3.5" /> Open
            </Link>
            <Link href={`/clients/${c.id}/edit`} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium hover:bg-muted">
              <Pencil className="size-3.5" /> Edit
            </Link>
            <Link href={`/articles?clientId=${c.id}`} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium hover:bg-muted">
              <FileText className="size-3.5" /> Articles
            </Link>
            <Link href={`/clients/media?clientId=${c.id}`} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium hover:bg-muted">
              <Images className="size-3.5" /> Media
            </Link>
            <Link href={`/clients/${c.id}/seo-technical`} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium hover:bg-muted">
              <SeoScoreBadge score={d?.seo ?? 0} size="sm" /> SEO
            </Link>
          </div>
        }
      />
    );
  };

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-xl font-semibold">Clients</h1>
        <span className="text-sm tabular-nums text-muted-foreground">({N.format(clients.length)})</span>
        <span className="text-xs text-muted-foreground">
          {stats.delivery.deliveryRate}% delivery · {stats.averageSEO}% SEO
        </span>
        <span
          className="inline-flex items-center text-muted-foreground"
          title="ترتيب العملاء في صفحة مدونتي: المميّزون، ثم الأعلى في عدد المقالات المنشورة، ثم الاسم عربيًا."
        >
          <Info className="size-3.5" aria-label="Order on modonty" />
        </span>
      </header>

      {/* Two panels: what you choose on the left, what needs acting on on the right. */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_460px]">
        <section aria-label="Filters" className="flex flex-col justify-center gap-2 rounded-lg border bg-card px-4 py-2.5">
          <FilterRow label="Writer">
            <CountTab label="All" count={N.format(clients.length)} active={!writer} onClick={() => setParam("writer", null)} />
            {writers.list.map((w) => (
              <CountTab
                key={w.id}
                label={<span dir="auto">{w.name}</span>}
                count={N.format(w.count)}
                active={writer === w.id}
                onClick={() => setParam("writer", writer === w.id ? null : w.id)}
              />
            ))}
            {writers.none ? (
              <CountTab label="No writer" count={N.format(writers.none)} active={writer === NO_WRITER} onClick={() => setParam("writer", writer === NO_WRITER ? null : NO_WRITER)} />
            ) : null}
          </FilterRow>
          <FilterRow label="Status">
            <CountTab label="All" count={N.format(byWriter.length)} active={!status} onClick={() => setParam("status", null)} />
            {(Object.keys(SUB_TONE) as SubscriptionStatus[]).map((s) => {
              const n = statusCount(s);
              return (
                <CountTab
                  key={s}
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <span className={cn("size-1.5 rounded-full", SUB_TONE[s].dot)} aria-hidden />
                      {SUB_TONE[s].label}
                    </span>
                  }
                  count={N.format(n)}
                  active={status === s}
                  disabled={n === 0 && status !== s}
                  onClick={() => setParam("status", status === s ? null : s)}
                />
              );
            })}
          </FilterRow>
        </section>
        <section aria-label="Needs acting on">
          <div className="grid h-full auto-rows-fr grid-cols-2 gap-2">
            {(Object.keys(KPIS) as KpiKey[]).map((key) => {
              const k = KPIS[key];
              return (
                <KpiToggle
                  variant="tile"
                  key={key}
                  meta={k}
                  icon={k.icon}
                  value={N.format(k.value)}
                  active={kpi === key}
                  disabled={k.value === 0 && kpi !== key}
                  onClick={k.onClick}
                />
              );
            })}
          </div>
        </section>
      </div>

      {filtersOpen ? <ClientsFilters /> : null}

      <DataTable
        data={visible}
        columns={columns}
        pageSize={20}
        emptyText="No clients match these filters"
        toolbar={
          <>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search clients, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="ps-10" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Client actions">
                  <MoreHorizontal className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Client actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setFiltersOpen((v) => !v)}>
                  <SlidersHorizontal className="me-2 size-4" aria-hidden />
                  {filtersOpen ? "Hide filters" : "Filters"}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSeoDialogOpen(true)}>
                  <RefreshCw className="me-2 size-4" aria-hidden />
                  Regenerate all SEO
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
        renderExpanded={details}
        expandLabel={(c) => `Details of ${c.name.trim()}`}
      />
      <RegenerateAllSeoButton clients={clients} open={seoDialogOpen} onOpenChange={setSeoDialogOpen} hideTrigger />
    </div>
  );
}
