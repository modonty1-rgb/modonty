"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeDollarSign, ChartNoAxesColumn, Copy, Gauge, Link2Off, Pencil, Siren } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CountTab } from "@/components/admin/count-tab";
import { DataTable, type Column } from "@/components/admin/data-table";
import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { DetailCard, Fact, FactGroup, FilterRow } from "@/components/shared/advanced-table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { currencyLabel } from "@modonty/shared/lib/commercial/format-money";
import { STAGES, STAGE_LABEL, type BriefStage } from "../helpers/brief-stage";
import type { CampaignFlag, CampaignTableRow } from "../helpers/build-campaign-table-rows";
import { CampaignDecision } from "./campaign-decision";
import { CampaignRunSwitch } from "./campaign-run-switch";
import { CodeInstruction } from "./code-instruction";
import { SalesResults } from "./sales-results";

const N = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });
const N2 = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 });

/** One colour per stage across the page (Advanced Table recipe): amber waits · sky approved · emerald runs. */
const STAGE_BADGE: Record<BriefStage, string> = {
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  APPROVED: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  RUNNING: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  PAUSED: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
  REJECTED: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

const FLAGS: CampaignFlag[] = ["noMeta", "overCap", "overCost", "afterEnd"];
/** `hint` says in plain words what happened and what to do — shown on hover of the badge and the tile. */
const FLAG: Record<CampaignFlag, KpiMeta & { icon: React.ComponentType<{ className?: string }>; badge: string; hint: string }> = {
  noMeta: {
    label: "لسه ما انبنت في ميتا",
    hint: "انوافق عليها هنا، بس ما فيه حملة في ميتا اسمها فيه كودها — فما نشوف صرفها. انسخ الاسم وحطّه اسم الحملة في ميتا.",
    tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400", ring: "ring-amber-500", icon: Link2Off, badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  overCap: {
    label: "تجاوزت السقف",
    hint: "صرفها في ميتا أكثر من السقف اللي انوافق عليه.",
    tone: "bg-rose-500/15 text-rose-600 dark:text-rose-400", ring: "ring-rose-500", icon: Gauge, badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  },
  overCost: {
    label: "العميل أغلى من المستهدف",
    hint: "تكلفة العميل المحتمل الواحد فوق المستهدف في البريف.",
    tone: "bg-orange-500/15 text-orange-600 dark:text-orange-400", ring: "ring-orange-500", icon: BadgeDollarSign, badge: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  },
  afterEnd: {
    label: "شغّالة بعد الإيقاف",
    hint: "أوقفناها هنا، بس لسه شغّالة في ميتا وتصرف — لازم تنوقف هناك.",
    tone: "bg-red-500/15 text-red-600 dark:text-red-400", ring: "ring-red-500", icon: Siren, badge: "bg-red-500/15 text-red-700 dark:text-red-300",
  },
};

/** The «not built in Meta yet» badge copies the exact name — the one thing to do about it, done in one click. */
function CopyNameBadge({ name }: { name: string }) {
  const { toast } = useToast();
  return (
    <button
      type="button"
      title={`${FLAG.noMeta.hint}\n\n${name}`}
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(name);
        toast({ title: "اتنسخ اسم الحملة", description: "الصقه اسم للحملة في ميتا — وتنربط هنا لحالها.", variant: "success" });
      }}
      className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold hover:ring-1 hover:ring-amber-500", FLAG.noMeta.badge)}
    >
      {FLAG.noMeta.label}
      <Copy className="size-3" aria-hidden />
      <span className="font-normal">انسخ الاسم</span>
    </button>
  );
}

const money = (n: number, c: string) => `${N2.format(n)} ${currencyLabel(c)}`;

function Details({ r, canDecide }: { r: CampaignTableRow; canDecide: boolean }) {
  return (
    <DetailCard
      columns="lg:grid-cols-[minmax(0,1.2fr)_1px_minmax(0,1fr)]"
      groups={[
        <FactGroup key="brief" title="البريف">
          <div className="w-full space-y-1.5 text-sm">
            {r.brief ? <p className="leading-relaxed">{r.brief}</p> : <p className="text-muted-foreground">بلا وصف.</p>}
            <p className="text-xs text-muted-foreground">
              {r.setup} · {r.period}
              {r.createdBy ? ` · كتبه ${r.createdBy}` : ""}
            </p>
            {r.creativeUrl ? (
              <a href={r.creativeUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-block text-xs font-medium text-primary hover:underline">
                عرض التصاميم ↗
              </a>
            ) : null}
            {r.decisionNote ? <p className="rounded bg-rose-500/10 px-2 py-1 text-xs text-rose-800 dark:text-rose-300">سبب الرفض: {r.decisionNote}</p> : null}
          </div>
        </FactGroup>,
        <FactGroup key="meta" title="ميتا" spread>
          <Fact label="السقف" value={r.cap != null ? money(r.cap, r.capCurrency) : "—"} />
          <Fact label="المستهدف للعميل" value={r.target != null ? money(r.target, r.capCurrency) : "—"} />
          {/* Words, not «·»: beside Arabic-Indic digits the dot reads as a zero («١٠١»). */}
          <Fact
            label="حملات تحمل الكود"
            value={`${N.format(r.metaCampaigns.length)} حملة${r.metaActive ? `، منها ${N.format(r.metaActive)} شغّالة` : ""}`}
          />
        </FactGroup>,
      ]}
      footer={
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          {r.platformName ? <CodeInstruction name={r.platformName} missingInMeta /> : null}
          {r.sales ? <SalesResults r={r.sales} spend={r.spend} spendCurrency={r.currency} /> : null}
          <div className="flex flex-wrap items-center gap-1.5 border-t pt-2">
            {canDecide && r.approval === "PENDING" && r.code ? <CampaignDecision id={r.id} code={r.code} /> : null}
            {canDecide && r.approval === "APPROVED" && r.code ? (
              <CampaignRunSwitch id={r.id} code={r.code} stopped={r.stage !== "RUNNING"} runningInMeta={r.metaActive > 0} />
            ) : null}
            <Button asChild variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
              <Link href={`/campaigns/${r.id}/edit`}>
                <Pencil className="size-3" aria-hidden /> تعديل البريف
              </Link>
            </Button>
          </div>
        </div>
      }
    />
  );
}

/**
 * **الحملات — Advanced Table** (خالد ١٦ أكتوبر ٢٠٢٦: «تشويش بصري كثير… أنا تايه»). كانت كرتاً من سبع
 * طبقات لكل بريف؛ صارت صفّاً واحداً بالأساسيات (الحالة · الصرف من السقف · التسجيلات · العملاء · تكلفة
 * العميل) وشارةً لما يحتاج تصرّفاً اليوم، و«+» يفتح البريف وميتا والمبيعات والأزرار. فوق: الحالة
 * يساراً، وما يحتاج تصرّفاً يميناً — كل كرت فلتر.
 */
export function CampaignsTable({ rows, canDecide }: { rows: CampaignTableRow[]; canDecide: boolean }) {
  const [stage, setStage] = useState<BriefStage | null>(null);
  const [flag, setFlag] = useState<CampaignFlag | null>(null);

  const byStage = stage ? rows.filter((r) => r.stage === stage) : rows;
  const visible = flag ? byStage.filter((r) => r.flags.includes(flag)) : byStage;

  const columns: Column<CampaignTableRow>[] = [
    {
      key: "name",
      header: "الحملة",
      sortable: true,
      render: (r) => (
        <span className="flex min-w-0 items-center gap-2">
          {r.code ? <span dir="ltr" className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-bold">{r.code}</span> : null}
          <span className="truncate font-medium" dir="auto" title={r.name}>{r.name}</span>
        </span>
      ),
    },
    {
      key: "stage",
      header: "الحالة",
      render: (r) => (
        <span className="flex flex-wrap items-center gap-1">
          <span className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold", STAGE_BADGE[r.stage])}>{STAGE_LABEL[r.stage]}</span>
          {r.flags.map((f) =>
            f === "noMeta" && r.platformName ? (
              <CopyNameBadge key={f} name={r.platformName} />
            ) : (
              <span key={f} title={FLAG[f].hint} className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold", FLAG[f].badge)}>
                {FLAG[f].label}
              </span>
            ),
          )}
        </span>
      ),
    },
    {
      key: "spend",
      header: "الصرف من السقف",
      sortable: true,
      sortFn: (a, b) => (a.spend ?? 0) - (b.spend ?? 0),
      render: (r) =>
        r.spend == null ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span className="whitespace-nowrap tabular-nums">
            <b>{N2.format(r.spend)}</b>
            <span className="text-xs text-muted-foreground">{r.cap != null ? ` / ${N.format(r.cap)}` : ""} {currencyLabel(r.currency)}</span>
          </span>
        ),
    },
    {
      key: "submissions",
      header: "تسجيلات",
      sortable: true,
      sortFn: (a, b) => a.submissions - b.submissions,
      className: "text-center",
      render: (r) => <span className={cn("font-bold tabular-nums", r.submissions === 0 && "text-muted-foreground/60")}>{N.format(r.submissions)}</span>,
    },
    {
      key: "leads",
      header: "عملاء محتملون",
      sortable: true,
      sortFn: (a, b) => a.leads - b.leads,
      className: "text-center",
      render: (r) => <span className={cn("font-bold tabular-nums", r.leads === 0 && "text-muted-foreground/60")}>{N.format(r.leads)}</span>,
    },
    {
      key: "costPerLead",
      header: "تكلفة العميل",
      sortable: true,
      sortFn: (a, b) => (a.costPerLead ?? Infinity) - (b.costPerLead ?? Infinity),
      render: (r) =>
        r.costPerLead == null ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span className={cn("whitespace-nowrap tabular-nums", r.flags.includes("overCost") && "font-semibold text-orange-700 dark:text-orange-400")}>
            {money(r.costPerLead, r.currency)}
          </span>
        ),
    },
    {
      key: "analysis",
      header: "",
      render: (r) => (
        <Button asChild variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={(e) => e.stopPropagation()}>
          <Link href={`/campaigns/${r.id}`}>
            <ChartNoAxesColumn className="size-3" aria-hidden /> التحليل
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)]">
        <section aria-label="الفلاتر" className="flex flex-col justify-center gap-2 rounded-lg border bg-card px-4 py-2.5">
          <FilterRow label="الحالة">
            <CountTab label="الكل" count={N.format(rows.length)} active={!stage} onClick={() => setStage(null)} />
            {STAGES.map((s) => {
              const c = rows.filter((r) => r.stage === s).length;
              return (
                <CountTab key={s} label={STAGE_LABEL[s]} count={N.format(c)} active={stage === s} disabled={c === 0 && stage !== s} onClick={() => setStage(stage === s ? null : s)} />
              );
            })}
          </FilterRow>
        </section>
        <section aria-label="يحتاج تصرّف">
          <div className="grid h-full auto-rows-fr grid-cols-2 gap-2">
            {FLAGS.map((f) => {
              const hits = byStage.filter((r) => r.flags.includes(f)).length;
              return (
                <KpiToggle
                  key={f}
                  variant="tile"
                  meta={FLAG[f]}
                  icon={FLAG[f].icon}
                  value={N.format(hits)}
                  active={flag === f}
                  disabled={hits === 0 && flag !== f}
                  onClick={() => setFlag(flag === f ? null : f)}
                />
              );
            })}
          </div>
        </section>
      </div>

      <DataTable
        data={visible}
        columns={columns}
        searchKey="searchText"
        searchPlaceholder="ابحث بالكود أو الاسم أو البريف…"
        pageSize={25}
        emptyText={rows.length === 0 ? "ما فيه بريف بعد — البريف الجديد من قائمة الحملات فوق." : "ما فيه حملات بهذا الفلتر."}
        arabic
        renderExpanded={(r) => <Details r={r} canDecide={canDecide} />}
        expandLabel={(r) => `تفاصيل ${r.code ?? r.name}`}
      />
    </div>
  );
}
