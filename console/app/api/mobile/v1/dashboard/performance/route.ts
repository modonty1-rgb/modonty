import type { NextRequest } from "next/server";
import { arabicNumber } from "@/lib/mobile-api/arabic-format";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { getClientGooglePerformance } from "@/app/(dashboard)/dashboard/helpers/get-client-google-performance";
import { getSiteActivity } from "@/app/(dashboard)/dashboard/helpers/get-site-activity";

/**
 * بطاقة «زوّارك آخر ٢٨ يوماً» في رئيسية التطبيق — نفس أرقام رئيسية الكونسول على الويب
 * (`DashboardOverview`): ظهور جوجل ودخوله من Search Console، ومشاهدات مدونتي من القاعدة.
 *
 * مسار منفصل عن `/dashboard` عمداً: جوجل نداءٌ خارجي (مخزَّن لكنه قد يتأخّر)، فلا يجوز أن
 * يؤخّر بطل المهام. وفشل جوجل لا يُسقط البطاقة — يبقى رقم مدونتي ويُعلَّم جوجل «—».
 */
const DAYS = 28;

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const [google, site] = await Promise.all([
    getClientGooglePerformance(session.clientId, DAYS).catch(() => null),
    getSiteActivity(session.clientId, DAYS),
  ]);
  const g = google?.current ?? null;
  return ok({
    title: "زوّارك آخر ٢٨ يوماً",
    subtitle: "من بحث جوجل ومن مدونتي",
    stats: [
      { key: "impressions", value: g ? arabicNumber(g.impressions) : "—", label: "ظهرت في جوجل", tone: "primary" },
      { key: "clicks", value: g ? arabicNumber(g.clicks) : "—", label: "دخلوا من جوجل", tone: "positive" },
      { key: "views", value: arabicNumber(site.views), label: "قرأوا على مدونتي", tone: "neutral" },
    ],
  });
}
