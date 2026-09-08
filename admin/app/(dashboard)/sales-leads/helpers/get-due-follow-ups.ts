import "server-only";

import { db } from "@/lib/db";
import type { Stage } from "./funnel";

export interface FollowUpTimelineRow {
  id: string;
  channel: string;
  body: string;
  happenedAt: Date;
  nextActionAt: Date | null;
  nextActionNote: string | null;
  doneAt: Date | null;
}

export interface LeadJourney {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  countryCode: string | null;
  stage: Stage;
  ownerName: string | null;
  followUps: FollowUpTimelineRow[];
}

const CEILING = 500;

/**
 * تقرير رحلة العميل، لا قائمة مواعيد اليوم.
 *
 * كل عميل غير مفقود يظهر مرةً واحدة مع سجلّه كله: المكتمل، القديم، بلا موعد، والقادم.
 * لا يوجد هنا شرط بالمستخدم الحالي؛ هذه لوحة مشتركة للأدمن وفريق المبيعات.
 */
export async function getDueFollowUps(): Promise<{
  leads: LeadJourney[];
  total: number;
  truncated: boolean;
}> {
  const where = { stage: { not: "LOST" as const } };
  const [total, rows] = await Promise.all([
    db.salesLead.count({ where }),
    db.salesLead.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: CEILING,
      select: {
        id: true,
        name: true,
        company: true,
        phone: true,
        countryCode: true,
        stage: true,
        owner: { select: { name: true } },
        createdBy: { select: { name: true } },
        followUps: {
          select: {
            id: true,
            channel: true,
            body: true,
            happenedAt: true,
            nextActionAt: true,
            nextActionNote: true,
            doneAt: true,
          },
          orderBy: { happenedAt: "desc" },
        },
      },
    }),
  ]);

  return {
    leads: rows.map((lead) => ({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      phone: lead.phone,
      countryCode: lead.countryCode,
      stage: lead.stage as Stage,
      ownerName: lead.owner?.name ?? lead.createdBy?.name ?? null,
      followUps: lead.followUps,
    })),
    total,
    truncated: total > rows.length,
  };
}
