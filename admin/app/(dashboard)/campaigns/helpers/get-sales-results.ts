import "server-only";

import { db } from "@/lib/db";
import type { LostReason } from "@/lib/sales/lost-reason";

export type SalesResults = {
  leads: number;
  /** Past «جديد», or given a quality verdict — someone actually spoke to them. */
  contacted: number;
  good: number;
  weak: number;
  invalid: number;
  /** Reached a price: quoted, negotiating or won. */
  quoted: number;
  /** Won, or has a paid order — the contract closed. */
  closed: number;
  /** Paid orders of this brief's leads, in minor units, per currency — money actually in. */
  paidMinor: Record<string, number>;
  lost: Partial<Record<LostReason, number>>;
};

/**
 * نتائج المبيعات لكل بريف — فيدباك المبيعات للميديا باير (خالد ٢٩ سبتمبر ٢٠٢٦) بلا فورمٍ ثانٍ: كلّه
 * من شغل المندوب نفسه (المرحلة · جودة العميل · سبب الخسارة) ومن الطلبات المدفوعة.
 *
 * «قيمة العقود» من الطلبات **المدفوعة** المربوطة بالعميل (`CheckoutOrder.leadId`، يكتبه زرّ «حوّله إلى
 * عميل» ← `/orders/new?leadId=`) — لا المتوقَّع الذي يكتبه المندوب: المال الذي وصل هو الحكم.
 */
export async function getSalesResults(briefIds: string[]): Promise<Map<string, SalesResults>> {
  const out = new Map<string, SalesResults>();
  if (briefIds.length === 0) return out;

  const leads = await db.salesLead.findMany({
    where: { campaignId: { in: briefIds } },
    select: { id: true, campaignId: true, stage: true, quality: true, lostReason: true },
    take: 5000,
  });
  const paid = leads.length
    ? await db.checkoutOrder.findMany({
        where: { leadId: { in: leads.map((l) => l.id) }, status: "PAID" },
        select: { leadId: true, totalMinor: true, currency: true },
        take: 5000,
      })
    : [];
  const paidByLead = new Map<string, { totalMinor: number; currency: string }[]>();
  for (const o of paid) if (o.leadId) paidByLead.set(o.leadId, [...(paidByLead.get(o.leadId) ?? []), o]);

  for (const l of leads) {
    if (!l.campaignId) continue;
    const r = out.get(l.campaignId) ?? { leads: 0, contacted: 0, good: 0, weak: 0, invalid: 0, quoted: 0, closed: 0, paidMinor: {}, lost: {} };
    const orders = paidByLead.get(l.id) ?? [];
    r.leads += 1;
    if (l.stage !== "NEW" || l.quality) r.contacted += 1;
    if (l.quality === "GOOD") r.good += 1;
    if (l.quality === "WEAK") r.weak += 1;
    if (l.quality === "INVALID") r.invalid += 1;
    if (l.stage === "QUOTED" || l.stage === "NEGOTIATING" || l.stage === "WON") r.quoted += 1;
    if (l.stage === "WON" || orders.length > 0) r.closed += 1;
    for (const o of orders) r.paidMinor[o.currency] = (r.paidMinor[o.currency] ?? 0) + o.totalMinor;
    if (l.stage === "LOST" && l.lostReason) r.lost[l.lostReason] = (r.lost[l.lostReason] ?? 0) + 1;
    out.set(l.campaignId, r);
  }
  return out;
}
