import "server-only";

import { codeInName } from "../../helpers/code-in-name";
import { getMetaAccountCampaigns } from "../../helpers/get-meta-account-campaigns";
import { readMetaCredentials, type MetaBrand } from "../../helpers/read-meta-credentials";

type Action = { action_type?: string; value?: string };
type Row = {
  spend?: string;
  reach?: string;
  impressions?: string;
  inline_link_clicks?: string;
  actions?: Action[];
  publisher_platform?: string;
  age?: string;
  gender?: string;
  date_start?: string;
  ad_name?: string;
};

export type MetaSlice = { label: string; spend: number; clicks: number; impressions: number; leads: number };

export type BriefMeta =
  | { ok: false; error: string; campaigns: { id: string; name: string; status: string }[] }
  | {
      ok: true;
      currency: string;
      campaigns: { id: string; name: string; status: string; spend: number }[];
      totals: {
        spend: number;
        reach: number;
        impressions: number;
        clicks: number;
        landingViews: number;
        pixelLeads: number;
        conversations: number;
      };
      byPlatform: MetaSlice[];
      byAgeGender: MetaSlice[];
      byDay: { day: string; spend: number; clicks: number; leads: number }[];
      /** One row per ad — each ad can send to a different landing page («Land 1» · «Land 2»). */
      byAd: (MetaSlice & { landingViews: number })[];
    };

const n = (v?: string) => Number(v) || 0;
const act = (actions: Action[] | undefined, ...types: string[]) =>
  (actions ?? []).filter((a) => a.action_type && types.includes(a.action_type)).reduce((s, a) => s + n(a.value), 0);
/** عميل محتمل من البكسل أو من نموذج ميتا الفوري — أيّهما أكبر، لا مجموعهما (ميتا تعدّ الحدث نفسه تحت أسماء). */
const leadsOf = (a?: Action[]) => Math.max(act(a, "lead"), act(a, "offsite_conversion.fb_pixel_lead"), act(a, "onsite_web_lead"));
const GENDER: Record<string, string> = { male: "رجال", female: "نساء", unknown: "غير محدد" };
const PLATFORM: Record<string, string> = { facebook: "فيسبوك", instagram: "إنستقرام", audience_network: "شبكة الجمهور", messenger: "ماسنجر" };

/**
 * أرقام ميتا لبريفٍ واحد — كل حملات المنصّة اللي اسمها يحمل كوده (`codeInName`)، طوال عمرها:
 * الإجماليّ، والتوزيع على المنصّة والعمر والجنس، واليوميّ. نفس مفتاح الحساب وقراءته اللي في صفحة
 * الحملات (`readMetaCredentials`) — المفتاح لا يخرج من الخادم.
 */
export async function getBriefMeta(brand: MetaBrand, code: string | null): Promise<BriefMeta> {
  const account = await getMetaAccountCampaigns(brand);
  if (!account.ok) return { ok: false, error: account.error, campaigns: [] };
  const linked = code ? account.campaigns.filter((c) => codeInName(code, c.name)) : [];
  if (linked.length === 0) {
    return {
      ok: false,
      error: code
        ? `ولا حملة في ميتا اسمها يحمل الكود ${code} — اكتبه في اسم الحملة هناك كي تُربط هنا.`
        : "البريف بلا كود — ما ينربط بحملات ميتا.",
      campaigns: [],
    };
  }

  const creds = await readMetaCredentials(brand);
  if (!creds) return { ok: false, error: "ربط ميتا لهذا الموقع غير مكتمل.", campaigns: linked };
  const ids = linked.map((c) => c.id);
  const base = `https://graph.facebook.com/act_${encodeURIComponent(creds.accountId)}/insights`;
  const query = (extra: Record<string, string>) => {
    const u = new URL(base);
    u.search = new URLSearchParams({
      level: "account",
      fields: "spend,reach,impressions,inline_link_clicks,actions",
      date_preset: "maximum",
      filtering: JSON.stringify([{ field: "campaign.id", operator: "IN", value: ids }]),
      limit: "500",
      access_token: creds.accessToken,
      ...extra,
    }).toString();
    return u;
  };
  const get = async (u: URL) => {
    const r = await fetch(u, { cache: "no-store" });
    const j = (await r.json()) as { data?: Row[]; error?: { message?: string } };
    if (!r.ok || j.error) throw new Error(j.error?.message ?? "Meta insights failed");
    return j.data ?? [];
  };

  try {
    const [total, platform, ageGender, daily, perAd] = await Promise.all([
      get(query({})),
      get(query({ breakdowns: "publisher_platform" })),
      get(query({ breakdowns: "age,gender" })),
      get(query({ time_increment: "1" })),
      get(query({ level: "ad", fields: "ad_name,spend,impressions,inline_link_clicks,actions" })),
    ]);
    const t = total[0] ?? {};
    const slice = (label: string, r: Row): MetaSlice => ({
      label,
      spend: n(r.spend),
      clicks: n(r.inline_link_clicks),
      impressions: n(r.impressions),
      leads: leadsOf(r.actions),
    });
    return {
      ok: true,
      currency: account.currency,
      campaigns: linked,
      totals: {
        spend: n(t.spend),
        reach: n(t.reach),
        impressions: n(t.impressions),
        clicks: n(t.inline_link_clicks),
        landingViews: Math.max(act(t.actions, "landing_page_view"), act(t.actions, "omni_landing_page_view")),
        pixelLeads: leadsOf(t.actions),
        conversations: act(t.actions, "onsite_conversion.messaging_conversation_started_7d"),
      },
      byPlatform: platform
        .map((r) => slice(PLATFORM[r.publisher_platform ?? ""] ?? r.publisher_platform ?? "—", r))
        .sort((a, b) => b.spend - a.spend),
      byAgeGender: ageGender
        .map((r) => slice(`${r.age ?? "—"} · ${GENDER[r.gender ?? ""] ?? r.gender ?? "—"}`, r))
        .filter((s) => s.spend > 0 || s.leads > 0)
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 8),
      byDay: daily
        .map((r) => ({ day: r.date_start ?? "", spend: n(r.spend), clicks: n(r.inline_link_clicks), leads: leadsOf(r.actions) }))
        .sort((a, b) => a.day.localeCompare(b.day)),
      byAd: perAd
        .map((r) => ({
          ...slice(r.ad_name ?? "—", r),
          landingViews: Math.max(act(r.actions, "landing_page_view"), act(r.actions, "omni_landing_page_view")),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    };
  } catch (e) {
    return { ok: false, error: `ما ردّت ميتا: ${e instanceof Error ? e.message : String(e)}`, campaigns: linked };
  }
}
