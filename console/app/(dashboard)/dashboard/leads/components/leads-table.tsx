"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ar } from "@/lib/ar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Flame,
  TrendingUp,
  Snowflake,
  Search as SearchIcon,
  Download,
  Mail,
  MessageCircle,
  ExternalLink,
  Award,
  Eye,
  Clock,
  MousePointerClick,
  Target,
  UserCircle2,
  Users as UsersIcon,
} from "lucide-react";
import { LeadWithDetails } from "../helpers/lead-queries";

interface Props {
  leads: LeadWithDetails[];
}

type FilterKey = "all" | "hot" | "warm" | "cold" | "qualified";

const PAGE_LIMIT = 200;

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(d));
}

function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

function levelMeta(level: string | null) {
  if (level === "HOT") {
    return {
      label: ar.leads.hot,
      icon: Flame,
      classes:
        "bg-red-50 text-red-700 ring-red-200",
      dot: "bg-red-500",
    };
  }
  if (level === "WARM") {
    return {
      label: ar.leads.warm,
      icon: TrendingUp,
      classes:
        "bg-amber-50 text-amber-700 ring-amber-200",
      dot: "bg-amber-500",
    };
  }
  return {
    label: ar.leads.cold,
    icon: Snowflake,
    classes:
      "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  };
}

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\r\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function buildCsv(leads: LeadWithDetails[]): string {
  const header = [
    "Name",
    "Email",
    "Phone",
    "Score",
    "Level",
    "Pages",
    "Time (min)",
    "Interactions",
    "Conversions",
    "Last Activity",
  ].join(",");
  const rows = leads.map((l) =>
    [
      csvEscape(l.user?.name),
      csvEscape(l.user?.email ?? l.email),
      csvEscape(l.phone),
      l.engagementScore,
      l.qualificationLevel ?? "",
      l.pagesViewed,
      (l.totalTimeSpent / 60).toFixed(1),
      l.interactions,
      l.conversions,
      l.lastActivityAt ? new Date(l.lastActivityAt).toISOString() : "",
    ].join(",")
  );
  return "\uFEFF" + [header, ...rows].join("\r\n");
}

export function LeadsTable({ leads }: Props) {
  const l = ar.leads;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [openLead, setOpenLead] = useState<LeadWithDetails | null>(null);

  const filtered = useMemo(() => {
    let result = leads;
    if (filter === "qualified") result = result.filter((x) => x.isQualified);
    else if (filter === "hot") result = result.filter((x) => x.qualificationLevel === "HOT");
    else if (filter === "warm") result = result.filter((x) => x.qualificationLevel === "WARM");
    else if (filter === "cold") result = result.filter((x) => x.qualificationLevel === "COLD");

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((x) => {
        const name = x.user?.name ?? "";
        const email = x.user?.email ?? x.email ?? "";
        return (
          name.toLowerCase().includes(q) || email.toLowerCase().includes(q)
        );
      });
    }
    return result;
  }, [leads, filter, query]);

  const counts = useMemo(
    () => ({
      all: leads.length,
      hot: leads.filter((x) => x.qualificationLevel === "HOT").length,
      warm: leads.filter((x) => x.qualificationLevel === "WARM").length,
      cold: leads.filter((x) => x.qualificationLevel === "COLD").length,
      qualified: leads.filter((x) => x.isQualified).length,
    }),
    [leads]
  );

  function handleExport() {
    if (leads.length === 0) {
      toast.error(l.exportFailed);
      return;
    }
    try {
      const csv = buildCsv(leads);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(l.exported_toast);
    } catch {
      toast.error(l.exportFailed);
    }
  }

  const showPagedHint = leads.length >= PAGE_LIMIT;

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="space-y-4 p-6">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-sm">
              <SearchIcon className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={l.searchPlaceholder}
                className="ps-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FilterPill
                active={filter === "all"}
                onClick={() => setFilter("all")}
                label={l.all}
                count={counts.all}
              />
              <FilterPill
                active={filter === "hot"}
                onClick={() => setFilter("hot")}
                label={l.hot}
                count={counts.hot}
                tone="red"
              />
              <FilterPill
                active={filter === "warm"}
                onClick={() => setFilter("warm")}
                label={l.warm}
                count={counts.warm}
                tone="amber"
              />
              <FilterPill
                active={filter === "cold"}
                onClick={() => setFilter("cold")}
                label={l.cold}
                count={counts.cold}
                tone="slate"
              />
              <FilterPill
                active={filter === "qualified"}
                onClick={() => setFilter("qualified")}
                label={l.qualifiedFilter}
                count={counts.qualified}
                tone="primary"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleExport}
                disabled={leads.length === 0}
                className="gap-2 whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5 shrink-0" />
                {l.exportCsv}
              </Button>
            </div>
          </div>

          {showPagedHint && (
            <p className="text-xs text-muted-foreground">
              {l.showingPagedHint.replace("{n}", String(PAGE_LIMIT))}
            </p>
          )}

          {/* Body */}
          {filtered.length === 0 ? (
            <EmptyState
              hasLeads={leads.length > 0}
              hasQuery={!!query.trim()}
              hasFilter={filter !== "all"}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-start text-muted-foreground">
                    <th className="text-start py-3 px-2 font-medium">{l.contact}</th>
                    <th className="text-start py-3 px-2 font-medium">{l.level}</th>
                    <th className="text-start py-3 px-2 font-medium">{l.score}</th>
                    <th className="text-end py-3 px-2 font-medium">{l.pages}</th>
                    <th className="text-end py-3 px-2 font-medium">{l.timeMin}</th>
                    <th className="text-end py-3 px-2 font-medium">{l.interactions}</th>
                    <th className="text-end py-3 px-2 font-medium">{l.conversions}</th>
                    <th className="text-start py-3 px-2 font-medium">{l.lastActive}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => {
                    const meta = levelMeta(lead.qualificationLevel);
                    const Icon = meta.icon;
                    const displayName =
                      lead.user?.name ?? lead.user?.email ?? lead.email ?? l.anonymous;
                    const displayContact =
                      lead.user?.email ?? lead.email ?? lead.phone ?? l.noContact;
                    return (
                      <tr
                        key={lead.id}
                        className="border-b border-border last:border-0 transition-colors hover:bg-muted/50"
                      >
                        <td className="py-3 px-2">
                          <button
                            type="button"
                            onClick={() => setOpenLead(lead)}
                            className="flex items-center gap-2 text-start hover:text-primary"
                          >
                            <UserCircle2 className="h-7 w-7 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground hover:underline">
                                {displayName}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {displayContact}
                              </p>
                            </div>
                          </button>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ring-1 ${meta.classes}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {meta.label}
                          </span>
                          {lead.isQualified && (
                            <span className="ms-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              <Award className="h-3 w-3" />
                              {l.qualifiedBadge}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <ScoreBar score={lead.engagementScore} />
                        </td>
                        <td className="py-3 px-2 text-end tabular-nums text-foreground">
                          {lead.pagesViewed}
                        </td>
                        <td className="py-3 px-2 text-end tabular-nums text-foreground">
                          {(lead.totalTimeSpent / 60).toFixed(1)}
                        </td>
                        <td className="py-3 px-2 text-end tabular-nums text-foreground">
                          {lead.interactions}
                        </td>
                        <td className="py-3 px-2 text-end tabular-nums text-foreground">
                          {lead.conversions}
                        </td>
                        <td className="py-3 px-2 text-xs text-muted-foreground tabular-nums">
                          {lead.lastActivityAt ? formatDate(lead.lastActivityAt) : l.never}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <LeadDetailSheet
        lead={openLead}
        onClose={() => setOpenLead(null)}
      />
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function FilterPill({
  active,
  onClick,
  label,
  count,
  tone = "default",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: "default" | "red" | "amber" | "slate" | "primary";
}) {
  const toneAccent =
    !active && tone !== "default"
      ? {
          red: "border-red-200 text-red-700",
          amber: "border-amber-200 text-amber-700",
          slate: "border-slate-200 text-slate-600",
          primary: "border-primary/30 text-primary",
        }[tone]
      : "";
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={`gap-2 whitespace-nowrap ${toneAccent}`}
    >
      {label}
      <span
        className={`inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
          active
            ? "bg-background/20 text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </Button>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  const color =
    score >= 70
      ? "bg-red-500"
      : score >= 40
        ? "bg-amber-500"
        : "bg-slate-400";
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 shrink-0 text-end font-bold tabular-nums text-foreground">
        {pct}
      </span>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function EmptyState({
  hasLeads,
  hasQuery,
  hasFilter,
}: {
  hasLeads: boolean;
  hasQuery: boolean;
  hasFilter: boolean;
}) {
  const l = ar.leads;
  if (!hasLeads) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          {l.noLeadsFound}
        </h3>
        <p className="mt-1 max-w-sm mx-auto text-sm text-muted-foreground">
          {l.noLeadsHint}
        </p>
      </div>
    );
  }
  if (hasQuery) {
    return (
      <div className="py-12 text-center">
        <SearchIcon className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{l.noSearchResults}</p>
      </div>
    );
  }
  if (hasFilter) {
    return (
      <div className="py-12 text-center">
        <UsersIcon className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{l.noFilterResults}</p>
      </div>
    );
  }
  return null;
}

// ─── Detail Sheet ────────────────────────────────────────────────────

function LeadDetailSheet({
  lead,
  onClose,
}: {
  lead: LeadWithDetails | null;
  onClose: () => void;
}) {
  const l = ar.leads;
  if (!lead) return null;

  const meta = levelMeta(lead.qualificationLevel);
  const Icon = meta.icon;
  const displayName = lead.user?.name ?? lead.user?.email ?? lead.email ?? l.anonymous;
  const email = lead.user?.email ?? lead.email;
  const phone = lead.phone;
  const hasContact = !!(email || phone);

  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{l.detailsTitle}</SheetTitle>
          <SheetDescription className="break-all text-foreground/90">
            {displayName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Score header */}
          <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-card text-2xl font-bold tabular-nums text-foreground shadow-sm ring-1 ring-border">
              {lead.engagementScore}
            </div>
            <div className="min-w-0 flex-1">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${meta.classes}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {meta.label}
              </span>
              {lead.isQualified && (
                <span className="ms-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  <Award className="h-3 w-3" />
                  {l.qualifiedBadge}
                </span>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {l.lastActivityLabel}: {lead.lastActivityAt ? formatDateTime(lead.lastActivityAt) : l.never}
              </p>
            </div>
          </div>

          {/* Contact */}
          <Section title={l.contactInfo}>
            {hasContact ? (
              <div className="space-y-2">
                {email && <Field label="Email" value={email} mono />}
                {phone && <Field label="Phone" value={phone} mono />}
                <div className="flex flex-wrap gap-2 pt-1">
                  {email && (
                    <Button asChild size="sm" variant="outline" className="gap-2">
                      <a href={`mailto:${email}`}>
                        <Mail className="h-3.5 w-3.5" />
                        {l.contactCta}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {phone && (
                    <Button
                      asChild
                      size="sm"
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <a
                        href={`https://wa.me/${phone.replace(/[^\d+]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        {l.whatsappCta}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{l.noContactMethods}</p>
            )}
          </Section>

          {/* Score breakdown */}
          <Section title={l.scoreBreakdown}>
            <ScoreRow icon={Eye} label={l.scoreView} value={lead.viewScore} />
            <ScoreRow icon={Clock} label={l.scoreTime} value={lead.timeScore} />
            <ScoreRow icon={MousePointerClick} label={l.scoreInteraction} value={lead.interactionScore} />
            <ScoreRow icon={Target} label={l.scoreConversion} value={lead.conversionScore} />
          </Section>

          {/* Activity */}
          <Section title={l.activitySection}>
            <div className="grid grid-cols-2 gap-3">
              <Stat label={l.pagesViewedLabel} value={String(lead.pagesViewed)} />
              <Stat label={l.timeSpentLabel} value={`${(lead.totalTimeSpent / 60).toFixed(1)} min`} />
              <Stat label={l.interactionsLabel} value={String(lead.interactions)} />
              <Stat label={l.conversionsLabel} value={String(lead.conversions)} />
            </div>
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`break-all text-sm text-foreground ${mono ? "tabular-nums" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function ScoreRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const color =
    value >= 70 ? "bg-red-500" : value >= 40 ? "bg-amber-500" : "bg-slate-400";
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="w-32 shrink-0 truncate text-xs text-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-7 shrink-0 text-end text-xs font-bold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-base font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
