import { db } from "@/lib/db";
import type { IdeaBankStatus, Prisma } from "@prisma/client";

export const IDEA_STATUSES = ["NEW", "WATCH", "APPROVED", "REJECTED", "USED"] as const satisfies readonly IdeaBankStatus[];

export const IDEA_SELECT = {
  id: true, topic: true, suggestedAngle: true, whyItMatters: true, sector: true, fieldName: true,
  market: true, sourcePlatform: true, sourceUrl: true, sourceTitle: true, engagement: true,
  saudiRelevance: true, opportunityScore: true, status: true, firstSeenAt: true, lastSeenAt: true,
  daysSeen: true, intent: true, fieldType: true, fieldKey: true,
} satisfies Prisma.IdeaBankItemSelect;

export type IdeaBankRow = Prisma.IdeaBankItemGetPayload<{ select: typeof IDEA_SELECT }>;

/**
 * أفكار حالةٍ واحدة (ومجالٍ واحد إن اختير)، الأطول استمراراً ثم الأعلى درجةً، مع عدّاد كل حالة.
 * `field` بصيغة `type:key` كما يرسلها الرادار (`sector:football` · `category:<id>`).
 */
export async function getIdeaBank(
  status: IdeaBankStatus,
  opts: { field?: string; source?: string; fieldType?: string } = {},
) {
  const [fieldType, fieldKey] = opts.field ? opts.field.split(":") : [];
  const fieldWhere: Prisma.IdeaBankItemWhereInput = {
    ...(fieldType && fieldKey ? { fieldType, fieldKey } : opts.fieldType ? { fieldType: opts.fieldType } : {}),
    ...(opts.source ? { sourcePlatform: opts.source } : {}),
  };
  const [items, grouped] = await Promise.all([
    db.ideaBankItem.findMany({
      where: { status, ...fieldWhere },
      orderBy: [{ daysSeen: "desc" }, { opportunityScore: "desc" }, { firstSeenAt: "desc" }],
      take: 300,
      select: IDEA_SELECT,
    }),
    db.ideaBankItem.groupBy({ by: ["status"], where: fieldWhere, _count: { _all: true } }),
  ]);
  const counts = Object.fromEntries(IDEA_STATUSES.map((s) => [s, 0])) as Record<IdeaBankStatus, number>;
  for (const g of grouped) counts[g.status] = g._count._all;
  return { items, counts };
}
