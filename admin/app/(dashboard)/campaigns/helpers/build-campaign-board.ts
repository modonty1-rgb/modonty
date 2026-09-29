import "server-only";

import { codeInName } from "./code-in-name";
import { isLeadObjective } from "./target-metric-label";
import { isStopped } from "./brief-stage";
import type { CampaignRow } from "./get-campaigns";
import { getMetaAccountCampaigns, type MetaAccountCampaign } from "./get-meta-account-campaigns";

export type BriefMeta = {
  /** Meta campaigns whose name carries this brief's code. */
  campaigns: MetaAccountCampaign[];
  spend: number;
  currency: string;
  active: number;
};

export type CampaignAlert =
  | { kind: "unapproved"; site: string; campaign: MetaAccountCampaign; currency: string }
  | { kind: "afterEnd"; briefId: string; code: string; name: string; campaign: MetaAccountCampaign; currency: string }
  | { kind: "overCap"; briefId: string; code: string; name: string; spend: number; cap: number; currency: string }
  | { kind: "overCost"; briefId: string; code: string; name: string; costPerLead: number | null; spend: number; target: number; currency: string };

/**
 * لوحة الحملات: كلّ بريفٍ بحملات ميتا التي تحمل كوده وصرفها، وثلاثة تنبيهات (خالد ٢٩ سبتمبر ٢٠٢٦):
 *  • حملةٌ **شغّالة** في ميتا لا يحمل اسمها كود بريفٍ موافَقٍ عليه — صرفٌ بلا موافقة.
 *  • بريفٌ تجاوز صرفُه السقف الموافَق عليه.
 *  • بريفٌ تكلفةُ العميل فيه فوق المستهدف — أو صرف أكثر من تكلفة عميلٍ واحد ولم يجب أحداً.
 *
 * «شغّالة» لا «أيّ حملة»: الحساب فيه حملاتٌ من قبل هذا النظام بلا كود، وتنبيهٌ على كلّ قديمةٍ
 * موقوفة ضجيجٌ يُطفئ التنبيه الحقيقيّ.
 */
export async function buildCampaignBoard(rows: CampaignRow[]) {
  // Modonty's ad account only — every campaign here runs for Modonty (Khalid, 29 Sep 2026).
  const modonty = await getMetaAccountCampaigns("modonty");
  const accounts = { MODONTY: modonty } as const;

  const metaByBrief = new Map<string, BriefMeta>();
  for (const r of rows) {
    const acct = modonty;
    if (!r.code || !acct.ok) continue;
    const matched = acct.campaigns.filter((c) => codeInName(r.code!, c.name));
    metaByBrief.set(r.id, {
      campaigns: matched,
      spend: matched.reduce((s, c) => s + c.spend, 0),
      currency: acct.currency,
      active: matched.filter((c) => c.status === "ACTIVE").length,
    });
  }

  const alerts: CampaignAlert[] = [];
  for (const [site, acct] of Object.entries(accounts)) {
    if (!acct.ok) continue;
    const approved = rows.filter((r) => r.site === site && r.approval === "APPROVED" && r.code);
    for (const c of acct.campaigns) {
      if (c.status !== "ACTIVE") continue;
      const brief = approved.find((r) => codeInName(r.code!, c.name));
      // A stopped brief no longer covers its code — Meta still running it is spend after the stop.
      if (brief && isStopped(brief.status)) {
        alerts.push({ kind: "afterEnd", briefId: brief.id, code: brief.code!, name: brief.name, campaign: c, currency: acct.currency });
        continue;
      }
      if (brief) continue;
      alerts.push({ kind: "unapproved", site, campaign: c, currency: acct.currency });
    }
  }
  for (const r of rows) {
    const m = metaByBrief.get(r.id);
    if (!m || !r.code || r.approval !== "APPROVED") continue;
    if (r.spendCap && m.spend > r.spendCap) {
      alerts.push({ kind: "overCap", briefId: r.id, code: r.code, name: r.name, spend: m.spend, cap: r.spendCap, currency: m.currency });
    }
    // Cost per lead only means something for lead and sales briefs — an awareness brief is not
    // «over target» for bringing no leads (29 Sep 2026).
    if (r.targetCostPerLead && m.spend > 0 && isLeadObjective(r.objective)) {
      const leads = r._count.leads;
      const cpl = leads > 0 ? m.spend / leads : null;
      if ((cpl !== null && cpl > r.targetCostPerLead) || (cpl === null && m.spend > r.targetCostPerLead)) {
        alerts.push({ kind: "overCost", briefId: r.id, code: r.code, name: r.name, costPerLead: cpl, spend: m.spend, target: r.targetCostPerLead, currency: m.currency });
      }
    }
  }

  const metaErrors = Object.entries(accounts)
    .filter(([, a]) => !a.ok)
    .map(([, a]) => `ميتا: ${(a as { error: string }).error}`);

  return { metaByBrief, alerts, metaErrors };
}
