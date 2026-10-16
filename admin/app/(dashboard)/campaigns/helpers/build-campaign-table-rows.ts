import "server-only";

import { AD_CHANNEL_LABEL } from "@/lib/ad-channel-label";
import { briefStage, type BriefStage } from "./brief-stage";
import type { BriefMeta, CampaignAlert } from "./build-campaign-board";
import { OBJECTIVE_LABEL, marketOf } from "./channels";
import { DESTINATION_LABEL, type Destination } from "./destination-label";
import type { CampaignRow } from "./get-campaigns";
import type { SalesResults } from "./get-sales-results";
import { platformCampaignName } from "./platform-campaign-name";
import { isLeadObjective } from "./target-metric-label";

/** What needs someone today — one badge each in the row, one tile each in the header. */
export type CampaignFlag = "noMeta" | "overCap" | "overCost" | "afterEnd";

export type CampaignTableRow = {
  id: string;
  code: string | null;
  name: string;
  stage: BriefStage;
  approval: CampaignRow["approval"];
  /** «انستقرام · السعودية · عملاء محتملون → واتساب» — the brief's setup in one line, for the detail card. */
  setup: string;
  period: string;
  createdBy: string | null;
  brief: string | null;
  creativeUrl: string | null;
  decisionNote: string | null;
  currency: string;
  capCurrency: string;
  cap: number | null;
  target: number | null;
  /** `null` = Meta unavailable; 0 = no Meta campaign carries the code yet. */
  spend: number | null;
  metaCampaigns: { name: string; status: string; spend: number }[];
  metaActive: number;
  submissions: number;
  leads: number;
  costPerLead: number | null;
  /** The exact platform name to copy, while no Meta campaign carries the code. */
  platformName: string | null;
  flags: CampaignFlag[];
  sales: SalesResults | null;
  searchText: string;
};

const day = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" });

/** صفّ لكل بريف — كل ما يحتاجه الجدول وتفاصيله، محسوباً على الخادم ومسطّحاً ليعبر للمتصفّح. */
export function buildCampaignTableRows(
  rows: CampaignRow[],
  metaByBrief: Map<string, BriefMeta>,
  alerts: CampaignAlert[],
  salesByBrief: Map<string, SalesResults>,
  submissionsByBrief: Map<string, number>,
): CampaignTableRow[] {
  return rows.map((r) => {
    const meta = metaByBrief.get(r.id) ?? null;
    const stage = briefStage(r);
    const leads = r._count.leads;
    const spend = meta ? meta.spend : null;
    const flags: CampaignFlag[] = [];
    const live = stage === "APPROVED" || stage === "RUNNING";
    if (live && r.code && meta && meta.campaigns.length === 0) flags.push("noMeta");
    for (const kind of ["overCap", "overCost", "afterEnd"] as const) {
      if (alerts.some((a) => a.kind === kind && a.briefId === r.id)) flags.push(kind);
    }
    const market = marketOf(r.countryCode);
    const setup = [
      AD_CHANNEL_LABEL[r.channel],
      market.label,
      r.objective ? OBJECTIVE_LABEL[r.objective] : null,
      r.destination ? `← ${DESTINATION_LABEL[r.destination as Destination] ?? r.destination}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      stage,
      approval: r.approval,
      setup,
      period: `${day.format(r.startAt)} — ${r.endAt ? day.format(r.endAt) : "مستمرّة"}`,
      createdBy: r.createdBy?.name ?? null,
      brief: r.brief,
      creativeUrl: r.creativeUrl,
      decisionNote: r.approval === "REJECTED" ? r.decisionNote : null,
      currency: meta?.currency || r.currency,
      capCurrency: r.currency,
      cap: r.spendCap,
      target: isLeadObjective(r.objective) ? r.targetCostPerLead : null,
      spend,
      metaCampaigns: (meta?.campaigns ?? []).map((c) => ({ name: c.name, status: c.status, spend: c.spend })),
      metaActive: meta?.active ?? 0,
      submissions: submissionsByBrief.get(r.id) ?? 0,
      leads,
      costPerLead: leads > 0 && spend ? spend / leads : null,
      platformName:
        flags.includes("noMeta") && r.code
          ? platformCampaignName({ code: r.code, channel: r.channel, objective: r.objective, countryCode: r.countryCode, startAt: r.startAt })
          : null,
      flags,
      sales: salesByBrief.get(r.id) ?? null,
      searchText: [r.code, r.name, r.brief, r.createdBy?.name].filter(Boolean).join(" "),
    };
  });
}
