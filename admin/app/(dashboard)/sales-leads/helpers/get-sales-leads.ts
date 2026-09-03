import "server-only";
import { db } from "@/lib/db";
import type { SalesLeadStatus } from "@prisma/client";

export interface SalesLeadRow {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  contactName: string | null;
  city: string | null;
  countryCode: string | null;
  website: string | null;
  source: string | null;
  status: SalesLeadStatus;
  industryName: string | null;
  createdAt: Date;
  convertedClientId: string | null;
}

/**
 * Every prospect the sales team has recorded, newest first.
 *
 * `take` bounds the query; it is not a display rule. The caller gets the true total as
 * well, so the screen can say it is showing part of a longer list instead of ending at a
 * number nobody chose — the failure mode that made four counters in this repo lie.
 */
const CEILING = 2000;

export async function getSalesLeads(): Promise<{
  rows: SalesLeadRow[];
  total: number;
  truncated: boolean;
  byStatus: Record<string, number>;
}> {
  const [total, leads, grouped] = await Promise.all([
    db.salesLead.count(),
    db.salesLead.findMany({
      orderBy: { createdAt: "desc" },
      take: CEILING,
      select: {
        id: true,
        name: true,
        company: true,
        phone: true,
        email: true,
        contactName: true,
        city: true,
        countryCode: true,
        website: true,
        source: true,
        status: true,
        createdAt: true,
        convertedClientId: true,
        industry: { select: { name: true } },
      },
    }),
    // Counted in the database, not from the page above it: a tile summing a capped list
    // stops being a total the moment the cap is reached.
    db.salesLead.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  return {
    rows: leads.map(({ industry, ...l }) => ({ ...l, industryName: industry?.name ?? null })),
    total,
    truncated: total > leads.length,
    byStatus: Object.fromEntries(grouped.map((g) => [g.status, g._count._all])),
  };
}
