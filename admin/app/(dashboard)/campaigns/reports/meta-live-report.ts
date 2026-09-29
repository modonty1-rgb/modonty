import "server-only";

import { requireAdmin } from "@/lib/admin-guard";
import { metaMinorToMajor } from "../helpers/meta-minor-to-major";
import { readMetaCredentials } from "../helpers/read-meta-credentials";

export type Brand = "modonty" | "jbrseo";
export type Platform = "all" | "facebook" | "instagram";

type MetaValue = { value?: string };
type MetaResult = { indicator?: string; values?: MetaValue[] };
type MetaAction = { action_type?: string; value?: string };
type MetaConfig = {
  id?: string;
  name?: string;
  objective?: string;
  effective_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  created_time?: string;
};
type MetaTargeting = {
  age_min?: number;
  age_max?: number;
  genders?: number[];
  geo_locations?: {
    countries?: string[];
    regions?: { name?: string }[];
    cities?: { name?: string }[];
  };
  flexible_spec?: { interests?: { name?: string }[] }[];
  targeting_automation?: { advantage_audience?: number };
};
type MetaInsight = {
  campaign_id?: string;
  age?: string;
  gender?: string;
  campaign_name?: string;
  publisher_platform?: string;
  date_start?: string;
  date_stop?: string;
  spend?: string;
  reach?: string;
  impressions?: string;
  inline_link_clicks?: string;
  cpm?: string;
  results?: MetaResult[];
  cost_per_result?: MetaResult[];
  actions?: MetaAction[];
};

export type ReportCampaign = {
  id: string;
  name: string;
  objective: string;
  /** Meta's `effective_status` — ACTIVE · PAUSED · WITH_ISSUES … */
  status: string;
  createdAt: string;
  dateStart: string;
  dateStop: string;
  spend: number;
  reach: number;
  impressions: number;
  linkClicks: number;
  cpm: number;
  /** Ads Manager's own «Results» column: what the campaign was optimised for, and how many. */
  result: { indicator: string; count: number; cost: number | null; derived: boolean } | null;
  /** Spend per placement; everything outside Facebook and Instagram is summed as `other`. */
  placements: { facebook: number; instagram: number; other: number };
  dailyBudget: number | null;
  lifetimeBudget: number | null;
  /** Who built it in Ads Manager — the `create_campaign_group` actor in the account activity log. */
  createdBy: string | null;
  /** Who the ad sets aimed at — merged across the campaign ad sets. */
  audience: Audience | null;
  /** Who it actually reached, by age × gender, most spend first. */
  segments: Segment[];
};

export type Audience = {
  ageMin: number | null;
  ageMax: number | null;
  /** Meta: 1 = men, 2 = women; empty = both. */
  genders: number[];
  countries: string[];
  places: string[];
  interests: string[];
  /** Advantage+ audience — Meta may widen past the targeting above. */
  metaMayWiden: boolean;
};
export type Segment = { age: string; gender: string; spend: number; results: number };

/**
 * When Meta returns no `results` for a campaign — measured on instant-form lead campaigns (29 Sep 2026:
 * «Lead Gen. | MO | Whitelist» results=null, 858 form leads) — the ad set optimisation goal says what it
 * was built for, and this is the action Ads Manager counts for it.
 */
const GOAL_ACTION: Record<string, string> = {
  LEAD_GENERATION: "onsite_conversion.lead_grouped",
  CONVERSATIONS: "onsite_conversion.messaging_conversation_started_7d",
  LINK_CLICKS: "link_click",
  LANDING_PAGE_VIEWS: "landing_page_view",
  POST_ENGAGEMENT: "post_engagement",
  PAGE_LIKES: "like",
};

/**
 * Five minutes of Meta (Khalid, 29 Sep 2026: yes to caching). Every filter used to re-read Meta — 2 s to
 * 26 s measured in the dev log — for figures Meta itself updates only every few minutes. The URL carries
 * the period and breakdown, so each filter combination is its own entry; the tag lets a refresh drop them.
 */
export const META_REPORT_TAG = "meta-report";
const META_CACHE = { next: { revalidate: 300, tags: [META_REPORT_TAG] } };

const num = (v: string | undefined) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function todayInRiyadh() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts();
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return { since: `${part("year")}-${part("month")}-01`, until: `${part("year")}-${part("month")}-${part("day")}` };
}

/**
 * تقرير ميتا بلغة الإدارة (خالد ٢٩ سبتمبر ٢٠٢٦: «أبغى داتا أفهمها أنا كإدارة»).
 *
 * • النتيجة وتكلفتها من عمودَي `results` و`cost_per_result` — نفس عمود «النتائج» في مدير الإعلانات،
 *   فلا نخمّن أيّ فعلٍ هو نتيجة الحملة.
 * • الصرف والوصول بلا تقسيم أماكن: التقسيم القديم كان يُسقط ما سوى فيسبوك وإنستقرام — ٤٦٧ ر.س
 *   (٧٪) من إجمالي الحساب ضاعت من التقرير. التقسيم الآن تفصيلٌ داخل الحملة فقط.
 * • الوصول الإجماليّ من مستوى الحساب: جمع وصول الحملات يعدّ الشخص الواحد مرّتين.
 */
export async function getMetaCampaignReport(
  brand: Brand,
  requestedPeriod?: { since: string; until: string } | "all",
  platform: Platform = "all",
) {
  const auth = await requireAdmin();
  const currentPeriod = todayInRiyadh();
  let period = currentPeriod;
  if ("error" in auth) return { ok: false as const, brand, period, error: auth.error };

  const credentials = await readMetaCredentials(brand);
  if (!credentials) return { ok: false as const, brand, period, error: "ربط Meta لهذا الحساب غير مكتمل." };
  const { accountId, accessToken } = credentials;

  const graph = async <T,>(path: string, params: Record<string, string>) => {
    const url = new URL(`https://graph.facebook.com/${path}`);
    url.search = new URLSearchParams({ ...params, access_token: accessToken }).toString();
    const response = await fetch(url, META_CACHE);
    return (await response.json()) as T & { error?: { message?: string } };
  };
  const act = `act_${encodeURIComponent(accountId)}`;

  try {
    const [configResult, accountResult] = await Promise.all([
      graph<{ data?: MetaConfig[] }>(`${act}/campaigns`, {
        fields: "id,name,objective,effective_status,daily_budget,lifetime_budget,created_time",
        limit: "500",
      }),
      graph<{ currency?: string }>(act, { fields: "currency" }),
    ]);
    if (configResult.error) return { ok: false as const, brand, period, error: configResult.error.message ?? "لم تُعد Meta الحملات." };
    const configs = new Map((configResult.data ?? []).filter((c) => c.id).map((c) => [c.id!, c]));
    const currency = accountResult.currency ?? "";
    const firstCampaignDate =
      (configResult.data ?? []).map((c) => c.created_time?.slice(0, 10)).filter((d): d is string => Boolean(d)).sort()[0] ?? null;

    if (requestedPeriod === "all") period = { since: firstCampaignDate ?? currentPeriod.since, until: currentPeriod.until };
    else if (requestedPeriod) period = requestedPeriod;
    const time_range = JSON.stringify(period);
    // One platform picked (Khalid, 29 Sep 2026: «إعلانات فيسبوك وإعلانات إنستقرام»): Meta splits spend,
    // reach and results per platform — reach stays de-duplicated within it. Measured: results come back
    // per platform; age × gender cannot be combined with it (#100), so that part stays all-platform.
    const split: Record<string, string> = platform === "all" ? {} : { breakdowns: "publisher_platform" };
    const onPlatform = <T extends { publisher_platform?: string }>(rows: T[] | undefined) =>
      platform === "all" ? (rows ?? []) : (rows ?? []).filter((r) => r.publisher_platform === platform);

    // Age × gender runs one row per bucket per campaign — past one page on long periods.
    const graphAll = async <T,>(path: string, params: Record<string, string>) => {
      const first = await graph<{ data?: T[]; paging?: { next?: string } }>(path, params);
      const rows = [...(first.data ?? [])];
      let next = first.paging?.next;
      for (let page = 0; next && page < 10; page++) {
        const more = (await (await fetch(next, META_CACHE)).json()) as { data?: T[]; paging?: { next?: string } };
        rows.push(...(more.data ?? []));
        next = more.paging?.next;
      }
      return rows;
    };

    const [insights, byPlacement, totals, adsets, byAgeGender, activities] = await Promise.all([
      graph<{ data?: MetaInsight[] }>(`${act}/insights`, {
        level: "campaign",
        fields: "campaign_id,campaign_name,date_start,date_stop,spend,reach,impressions,inline_link_clicks,cpm,results,cost_per_result,actions",
        ...split,
        time_range,
        limit: "500",
      }),
      graph<{ data?: MetaInsight[] }>(`${act}/insights`, {
        level: "campaign",
        fields: "campaign_id,spend",
        breakdowns: "publisher_platform",
        time_range,
        limit: "500",
      }),
      graph<{ data?: MetaInsight[] }>(`${act}/insights`, { level: "account", fields: "spend,reach,impressions,inline_link_clicks", ...split, time_range }),
      graph<{ data?: { campaign_id?: string; optimization_goal?: string; targeting?: MetaTargeting }[] }>(`${act}/adsets`, {
        fields: "campaign_id,optimization_goal,targeting",
        limit: "500",
      }),
      graphAll<MetaInsight>(`${act}/insights`, { level: "campaign", fields: "campaign_id,spend,results", breakdowns: "age,gender", time_range, limit: "1000" }),
      // The log answers «مين سوّى الإعلان» (Khalid, 29 Sep 2026). Read from the first campaign on, since a
      // campaign made before the report period still needs its maker.
      graphAll<{ actor_name?: string; event_type?: string; object_id?: string; object_name?: string }>(`${act}/activities`, {
        fields: "actor_name,event_type,object_id,object_name",
        since: firstCampaignDate ?? period.since,
        until: currentPeriod.until,
        limit: "500",
      }),
    ]);
    const makerById = new Map<string, string>();
    const makerByName = new Map<string, string>();
    for (const a of activities) {
      if (a.event_type !== "create_campaign_group" || !a.actor_name) continue;
      if (a.object_id) makerById.set(a.object_id, a.actor_name);
      if (a.object_name) makerByName.set(a.object_name, a.actor_name);
    }

    const audiences = new Map<string, Audience>();
    for (const a of adsets.data ?? []) {
      if (!a.campaign_id || !a.targeting) continue;
      const t = a.targeting;
      const cur = audiences.get(a.campaign_id) ?? { ageMin: null, ageMax: null, genders: [], countries: [], places: [], interests: [], metaMayWiden: false };
      if (t.age_min != null) cur.ageMin = cur.ageMin == null ? t.age_min : Math.min(cur.ageMin, t.age_min);
      if (t.age_max != null) cur.ageMax = cur.ageMax == null ? t.age_max : Math.max(cur.ageMax, t.age_max);
      const add = (list: string[], v: string | undefined) => { if (v && !list.includes(v)) list.push(v); };
      for (const g of t.genders ?? []) if (!cur.genders.includes(g)) cur.genders.push(g);
      for (const c of t.geo_locations?.countries ?? []) add(cur.countries, c);
      for (const r of [...(t.geo_locations?.regions ?? []), ...(t.geo_locations?.cities ?? [])]) add(cur.places, r.name?.replace(/ Governorate$/, ""));
      for (const f of t.flexible_spec ?? []) for (const i of f.interests ?? []) add(cur.interests, i.name);
      if (t.targeting_automation?.advantage_audience === 1) cur.metaMayWiden = true;
      audiences.set(a.campaign_id, cur);
    }
    const segments = new Map<string, Segment[]>();
    for (const row of byAgeGender) {
      const list = segments.get(row.campaign_id ?? "") ?? [];
      list.push({ age: row.age ?? "", gender: row.gender ?? "", spend: num(row.spend), results: num(row.results?.[0]?.values?.[0]?.value) });
      segments.set(row.campaign_id ?? "", list);
    }
    const goalOf = new Map<string, string>();
    for (const a of adsets.data ?? []) if (a.campaign_id && a.optimization_goal && !goalOf.has(a.campaign_id)) goalOf.set(a.campaign_id, a.optimization_goal);
    if (insights.error) return { ok: false as const, brand, period, error: insights.error.message ?? "لم تُعد Meta تقريراً لهذا الحساب." };

    const placements = new Map<string, ReportCampaign["placements"]>();
    for (const row of byPlacement.data ?? []) {
      const p = placements.get(row.campaign_id ?? "") ?? { facebook: 0, instagram: 0, other: 0 };
      const key = row.publisher_platform === "facebook" || row.publisher_platform === "instagram" ? row.publisher_platform : "other";
      p[key] += num(row.spend);
      placements.set(row.campaign_id ?? "", p);
    }

    // Campaigns that did not run in the period (Meta returns them with zero spend) are not part of it.
    const ran = onPlatform(insights.data).filter((row) => num(row.spend) > 0 || num(row.impressions) > 0);
    const campaigns: ReportCampaign[] = ran.map((row) => {
      const id = row.campaign_id ?? "";
      const config = configs.get(id);
      const res = row.results?.[0];
      const cost = row.cost_per_result?.[0]?.values?.[0]?.value;
      const spend = num(row.spend);
      const goalAction = GOAL_ACTION[goalOf.get(id) ?? ""];
      const derivedCount = goalAction ? num(row.actions?.find((a) => a.action_type === goalAction)?.value) : 0;
      return {
        id,
        name: row.campaign_name ?? config?.name ?? "(بلا اسم)",
        objective: config?.objective ?? "",
        status: config?.effective_status ?? "",
        createdAt: config?.created_time?.slice(0, 10) ?? "",
        dateStart: row.date_start ?? period.since,
        dateStop: row.date_stop ?? period.until,
        spend,
        reach: num(row.reach),
        impressions: num(row.impressions),
        linkClicks: num(row.inline_link_clicks),
        cpm: num(row.cpm),
        // An indicator with no `values` is a campaign that got none of what it was built for.
        result: res?.indicator
          ? { indicator: res.indicator, count: num(res.values?.[0]?.value), cost: cost ? num(cost) : null, derived: false }
          : goalAction
            ? { indicator: `actions:${goalAction}`, count: derivedCount, cost: derivedCount > 0 ? spend / derivedCount : null, derived: true }
            : null,
        placements: placements.get(id) ?? { facebook: 0, instagram: 0, other: 0 },
        createdBy: makerById.get(id) ?? makerByName.get(row.campaign_name ?? "") ?? null,
        audience: audiences.get(id) ?? null,
        segments: (segments.get(id) ?? []).filter((x) => x.spend > 0).sort((a, b) => b.spend - a.spend),
        dailyBudget: metaMinorToMajor(config?.daily_budget, currency),
        lifetimeBudget: metaMinorToMajor(config?.lifetime_budget, currency),
      };
    });

    const t = onPlatform(totals.data)[0];
    return {
      ok: true as const,
      brand,
      period,
      firstCampaignDate,
      currency,
      totals: { spend: num(t?.spend), reach: num(t?.reach), impressions: num(t?.impressions), linkClicks: num(t?.inline_link_clicks) },
      campaigns,
    };
  } catch {
    return { ok: false as const, brand, period, error: "تعذّر الوصول إلى Meta الآن." };
  }
}
