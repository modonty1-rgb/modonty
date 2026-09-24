import { cacheLife, cacheTag } from "next/cache";

import { getGoogleServiceToken } from "./google-service-token";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const PROPERTY = process.env.GSC_MODONTY_PROPERTY ?? "sc-domain:modonty.com";

export interface SearchConsoleTotals {
  /** مرّاتُ ظهور مدونتي في نتائج بحث جوجل. */
  impressions: number;
  /** نقراتٌ من نتائج البحث إلى مدونتي — زياراتٌ من جوجل. */
  clicks: number;
}

/**
 * **ظهورُ مدونتي في بحث جوجل ونقراتُه — من Search Console مباشرةً** (خالد ٢٤ سبتمبر ٢٠٢٦).
 *
 * رقمُ الفوتر الكبير كان «الأثر الرقمي»: مجموعُ جلساتٍ ومشاهداتٍ وأحداثٍ وتفاعلات، والأحداثُ
 * تحوي المشاهدات والتفاعلات نفسها، و٦٠٪ منها قياسُ أداءٍ تقنيّ (`web_vitals`) — عدٌّ مكرَّر
 * بختم «بيانات حقيقية». والظهورُ رقمٌ كبيرٌ صادق يفتحه الشريكُ في جوجل نفسه.
 *
 * ⚠ Search Console يحتفظ بستّة عشر شهراً: المدى يبدأ من هناك، فالرقمُ «آخر ١٦ شهراً»
 * وقد ينقص حين يخرج شهرٌ قديم. وأيُّ فشل (مفتاح · حصّة · شبكة) يرجع `null` فيسقط الفوتر
 * على ما عنده ولا ينكسر. المفتاحُ نفسه الذي يقرؤه الأدمن (`admin/lib/gsc/client.ts`).
 */
export async function getSearchConsoleTotals(): Promise<SearchConsoleTotals | null> {
  "use cache";
  cacheTag("gsc-footer");
  cacheLife("hours");

  try {
    const b64 = process.env.GSC_MODONTY_KEY_BASE64;
    if (!b64) return null;
    const creds = JSON.parse(Buffer.from(b64, "base64").toString("utf8")) as { client_email: string; private_key: string };
    const token = await getGoogleServiceToken(creds.client_email, creds.private_key, SCOPE);

    const day = (d: Date) => d.toISOString().slice(0, 10);
    const end = new Date();
    const start = new Date(end);
    start.setMonth(start.getMonth() - 16);

    const resp = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: day(start), endDate: day(end), dataState: "all" }),
      },
    );
    if (!resp.ok) return null;
    const data = (await resp.json()) as { rows?: Array<{ clicks?: number; impressions?: number }> };
    const row = data.rows?.[0];
    if (!row?.impressions) return null;
    return { impressions: Math.round(row.impressions), clicks: Math.round(row.clicks ?? 0) };
  } catch {
    return null;
  }
}
