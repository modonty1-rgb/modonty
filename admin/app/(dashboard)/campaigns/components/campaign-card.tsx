import Link from "next/link";
import { Pencil, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AD_CHANNEL_LABEL } from "@/lib/ad-channel-label";
import { currencyLabel } from "@modonty/shared/lib/commercial/format-money";
import { STAGE_LABEL, STAGE_TONE, briefStage } from "../helpers/brief-stage";
import { DESTINATION_LABEL, type Destination } from "../helpers/destination-label";
import { TARGET_METRIC_LABEL, isLeadObjective } from "../helpers/target-metric-label";
import type { BriefMeta } from "../helpers/build-campaign-board";
import { OBJECTIVE_LABEL, marketOf } from "../helpers/channels";
import type { CampaignRow } from "../helpers/get-campaigns";
import { CampaignDecision } from "./campaign-decision";
import { CampaignRunSwitch } from "./campaign-run-switch";
import { platformCampaignName } from "../helpers/platform-campaign-name";
import { CodeInstruction } from "./code-instruction";
import { SalesResults } from "./sales-results";
import type { SalesResults as SalesResultsData } from "../helpers/get-sales-results";

const ar = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });
const day = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" });

function Dot() {
  return <span className="text-muted-foreground/70" aria-hidden>·</span>;
}

/**
 * بطاقة البريف — ما وُوفق عليه بجانب ما حدث فعلاً في المنصّة (خالد ٢٩ سبتمبر ٢٠٢٦).
 *
 * السقف والتكلفة المستهدفة من البريف؛ الصرف من ميتا — مجموع كلّ حملةٍ يحمل اسمها الكود؛ والعملاء
 * من جدول العملاء المحتملين. فتُقرأ في سطرٍ واحد: وُوفق على كذا، صُرف كذا، جاب كذا، بكذا للعميل.
 */
export function CampaignCard({
  row,
  meta,
  sales,
  canDecide,
}: {
  row: CampaignRow;
  /** Meta campaigns carrying this brief's code; `null` when Meta is unavailable. */
  meta: BriefMeta | null;
  /** What sales made of this brief leads — stages, quality, paid orders. `null` = no lead yet. */
  sales: SalesResultsData | null;
  canDecide: boolean;
}) {
  const market = marketOf(row.countryCode);
  const leads = row._count.leads;
  const currency = meta?.currency || row.currency;
  const money = (n: number) => `${ar.format(n)} ${currencyLabel(currency)}`;
  // The cap is in the brief's own market currency; spend and cost come in the ad account's.
  const capMoney = (n: number) => `${ar.format(n)} ${currencyLabel(row.currency)}`;
  const spend = meta?.spend ?? 0;
  const cpl = leads > 0 && spend > 0 ? spend / leads : null;
  const overCap = row.spendCap != null && spend > row.spendCap;
  const leadBrief = isLeadObjective(row.objective);
  const stage = briefStage(row);
  const overCost = leadBrief && row.targetCostPerLead != null && cpl != null && cpl > row.targetCostPerLead;

  return (
    <article className="rounded-lg border bg-card transition-colors hover:border-foreground/20">
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2">
              {row.code ? (
                <span dir="ltr" className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-bold">{row.code}</span>
              ) : null}
              <Link href={`/campaigns/${row.id}/edit`} className="truncate font-medium leading-tight hover:underline">
                {row.name}
              </Link>
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground">
              <span>{AD_CHANNEL_LABEL[row.channel]}</span>
              <Dot />
              <span>{market.label}</span>
              {row.objective ? (
                <>
                  <Dot />
                  <span>{OBJECTIVE_LABEL[row.objective]}</span>
                </>
              ) : null}
              {row.destination ? (
                <>
                  <Dot />
                  <span>← {DESTINATION_LABEL[row.destination as Destination] ?? row.destination}</span>
                </>
              ) : null}
              <Dot />
              <span>{day.format(row.startAt)} — {row.endAt ? day.format(row.endAt) : "مستمرّة"}</span>
              {row.createdBy?.name ? (
                <>
                  <Dot />
                  <span>{row.createdBy.name}</span>
                </>
              ) : null}
            </p>
          </div>
          <span className={cn("shrink-0 whitespace-nowrap text-xs font-semibold", STAGE_TONE[stage])}>
            {STAGE_LABEL[stage]}
          </span>
        </div>

        {row.brief ? <p className="line-clamp-2 text-sm leading-snug">{row.brief}</p> : null}
        {row.creativeUrl ? (
          <a href={row.creativeUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-[11px] font-medium text-primary hover:underline">
            عرض التصاميم ↗
          </a>
        ) : null}
        {/* Approved but no platform campaign carries the code yet — the one thing left to do,
            said loudly until Meta shows a campaign named with it (29 Sep 2026). */}
        {(stage === "APPROVED" || stage === "RUNNING") && row.code && meta && meta.campaigns.length === 0 ? (
          <CodeInstruction
            name={platformCampaignName({ code: row.code, channel: row.channel, objective: row.objective, countryCode: row.countryCode, startAt: row.startAt })}
          />
        ) : null}
        {row.approval === "REJECTED" && row.decisionNote ? (
          <p className="rounded bg-rose-500/10 px-2 py-1 text-[11px] text-rose-800 dark:text-rose-300">سبب الرفض: {row.decisionNote}</p>
        ) : null}

        <div className="grid grid-cols-4 gap-2 rounded border bg-muted/30 px-2 py-1.5 text-center">
          <Figure label="السقف الموافَق" value={row.spendCap != null ? capMoney(row.spendCap) : "—"} />
          <Figure
            label={meta ? `الصرف · ${ar.format(meta.campaigns.length)} حملة في ميتا` : "الصرف"}
            value={meta ? money(spend) : "—"}
            tone={overCap ? "text-rose-700 dark:text-rose-400" : undefined}
            muted={!meta}
          />
          <Figure label="عميل محتمل" value={ar.format(leads)} muted={leads === 0} />
          <Figure
            label={
              row.targetCostPerLead != null
                ? `تكلفة العميل · ${row.objective && !leadBrief ? TARGET_METRIC_LABEL[row.objective].replace(" المستهدفة", "") : "المستهدف"} ${ar.format(row.targetCostPerLead)}`
                : "تكلفة العميل"
            }
            value={cpl != null ? money(cpl) : "—"}
            tone={overCost ? "text-rose-700 dark:text-rose-400" : undefined}
            muted={cpl == null}
          />
        </div>
        {sales ? <SalesResults r={sales} spend={meta ? meta.spend : null} spendCurrency={currency} /> : null}
      </div>

      <footer className="flex flex-wrap items-center gap-1.5 border-t bg-muted/30 px-3 py-2">
        {leads > 0 ? (
          <Link href={`/sales-leads?kpi=all&campaign=${row.id}`} className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
            <Users className="size-3" aria-hidden />
            {`${ar.format(leads)} عميل محتمل`}
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Users className="size-3" aria-hidden /> لسه ما جاب حد
          </span>
        )}
        {/* Meta as a fact inside the card — it no longer moves the tab (29 Sep 2026). */}
        {meta && meta.active > 0 ? (
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400">{ar.format(meta.active)} شغّالة في ميتا</span>
        ) : meta && meta.campaigns.length > 0 ? (
          <span className="text-[11px] text-muted-foreground">موقوفة في ميتا</span>
        ) : null}
        <span className="ms-auto flex items-center gap-1.5">
          {canDecide && row.approval === "PENDING" && row.code ? <CampaignDecision id={row.id} code={row.code} /> : null}
          {canDecide && row.approval === "APPROVED" && row.code ? (
            <CampaignRunSwitch id={row.id} code={row.code} stopped={stage !== "RUNNING"} runningInMeta={(meta?.active ?? 0) > 0} />
          ) : null}
          <Button asChild variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px]">
            <Link href={`/campaigns/${row.id}/edit`}>
              <Pencil className="size-3" aria-hidden /> تعديل
            </Link>
          </Button>
        </span>
      </footer>
    </article>
  );
}

function Figure({ label, value, muted, tone }: { label: string; value: string; muted?: boolean; tone?: string }) {
  return (
    <div className="min-w-0">
      <div className={cn("text-[13px] font-semibold tabular-nums", muted && "text-muted-foreground", tone)}>{value}</div>
      <div className="truncate text-[10px] text-muted-foreground" title={label}>{label}</div>
    </div>
  );
}
