import "server-only";

import { db } from "@/lib/db";

/**
 * تسجيلات صفحات الهبوط لكل بريف — بالـ`utm_campaign` اللي يبدأ بكوده («B-002.Instagram…» ← B-002)
 * أو بوسمه («b-002»). نفس قاعدة النسبة في صفحة التحليل (`[id]/helpers/get-brief-submissions.ts`).
 * طلبٌ واحد للقائمة كلّها، لا طلبٌ لكل صفّ.
 */
export async function countBriefSubmissions(briefs: { id: string; code: string | null; utmCampaign: string }[]) {
  const out = new Map<string, number>();
  if (briefs.length === 0) return out;
  const tagged = await db.campaignSubmission.findMany({
    where: { utmCampaign: { not: null } },
    select: { utmCampaign: true },
    take: 10000,
  });
  for (const b of briefs) {
    const keys = [...new Set([b.code, b.utmCampaign].filter(Boolean) as string[])].map((k) => k.toLowerCase());
    out.set(b.id, tagged.filter((s) => keys.some((k) => s.utmCampaign?.toLowerCase().startsWith(k))).length);
  }
  return out;
}
