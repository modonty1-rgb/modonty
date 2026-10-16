import "server-only";

import { db } from "@/lib/db";

const tail = (phone: string | null | undefined) => (phone ?? "").replace(/\D/g, "").slice(-9);

/**
 * مَن سجّل من الإعلان وما له عميل محتمل في المبيعات — بآخر ٩ أرقام من الجوال، لأن الصيغ تختلف
 * (+966 · 05 · 5). يُبحث في كل العملاء المحتملين لا المربوطين بالبريف فقط: المندوب قد يضيفه بلا ربط.
 */
export async function findSubmissionsWithoutLead(subs: { businessName: string; phone: string }[]) {
  const tails = [...new Set(subs.map((s) => tail(s.phone)).filter((t) => t.length === 9))];
  if (tails.length === 0) return [];
  const leads = await db.salesLead.findMany({
    where: { OR: tails.map((t) => ({ phone: { endsWith: t } })) },
    select: { phone: true },
    take: 500,
  });
  const known = new Set(leads.map((l) => tail(l.phone)));
  return subs.filter((s) => !known.has(tail(s.phone)));
}
