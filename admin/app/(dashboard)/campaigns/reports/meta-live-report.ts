import "server-only";

import { createDecipheriv, createHash } from "crypto";

import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

export type Brand = "modonty" | "jbrseo";
type MetaAction = { action_type?: string; value?: string };
type MetaCampaignConfig = { id?: string; objective?: string; daily_budget?: string; lifetime_budget?: string; created_time?: string };
type MetaRow = {
  campaign_id?: string;
  campaign_name?: string;
  publisher_platform?: string;
  date_start?: string;
  date_stop?: string;
  impressions?: string;
  reach?: string;
  spend?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  actions?: MetaAction[];
  action_values?: MetaAction[];
};

export type MetaCampaignReport = {
  campaignId: string;
  campaignName: string;
  createdAt: string;
  platform: "facebook" | "instagram";
  dateStart: string;
  dateStop: string;
  impressions: string;
  reach: string;
  spend: string;
  clicks: string;
  ctr: string;
  cpc: string;
  cpm: string;
  actions: MetaAction[];
  actionValues: MetaAction[];
  objective: string;
  budget: string;
  currency: string;
};

function decrypt(value: string | undefined) {
  if (!value) return "";
  if (!value.startsWith("v1.")) return value;
  try {
    const [, iv, tag, body] = value.split(".");
    const key = createHash("sha256").update(process.env.AUTH_SECRET ?? "advertising-platforms").digest();
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(body, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

function todayInRiyadh() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts();
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  const today = `${part("year")}-${part("month")}-${part("day")}`;
  return { since: `${part("year")}-${part("month")}-01`, until: today };
}

function displayBudget(value: string | undefined, currency: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  // Meta stores budgets in the currency's smallest unit. These are the common no-decimal currencies.
  const divisor = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]).has(currency) ? 1 : 100;
  return String(amount / divisor);
}

/**
 * تقريرٌ حيّ من Meta فقط. لا يقرأ جدول الحملات المحلي، ولا يرسل أي مفتاح إلى المتصفح.
 * تُعاد حقول Meta كما هي؛ المؤشرات المشتقة تُحسب في العرض بقواعد معلنة.
 */
export async function getMetaCampaignReport(brand: Brand, requestedPeriod?: { since: string; until: string } | "all") {
  const auth = await requireAdmin();
  const currentPeriod = todayInRiyadh();
  let period = currentPeriod;
  if ("error" in auth) return { ok: false as const, brand, period, error: auth.error };

  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: { adPlatformAccounts: true },
  });
  const raw = settings?.adPlatformAccounts as {
    accounts?: { meta?: Record<Brand, { accountId?: string | null }> };
    credentials?: { meta?: { tokens?: Record<Brand, string | undefined> } };
  } | null;
  const accountId = raw?.accounts?.meta?.[brand]?.accountId?.trim() ?? "";
  const accessToken = decrypt(raw?.credentials?.meta?.tokens?.[brand]);
  if (!accountId || !accessToken) return { ok: false as const, brand, period, error: "ربط Meta لهذا الحساب غير مكتمل." };

  const configUrl = new URL(`https://graph.facebook.com/act_${encodeURIComponent(accountId)}/campaigns`);
  configUrl.search = new URLSearchParams({ fields: "id,objective,daily_budget,lifetime_budget,created_time", limit: "500", access_token: accessToken }).toString();

  // `publisher_platform` ينتجه `breakdowns` في استجابة Insights؛ Meta ترفض طلبه ضمن `fields`.
  const fields = ["campaign_id", "campaign_name", "date_start", "date_stop", "impressions", "reach", "spend", "clicks", "ctr", "cpc", "cpm", "actions", "action_values"].join(",");
  try {
    const configResponse = await fetch(configUrl, { cache: "no-store" });
    const configResult = configResponse.ok ? await configResponse.json() as { data?: MetaCampaignConfig[] } : { data: [] };
    const configs = new Map((configResult.data ?? []).filter((campaign) => campaign.id).map((campaign) => [campaign.id!, campaign]));
    const firstCampaignDate = (configResult.data ?? []).map((campaign) => campaign.created_time?.slice(0, 10)).filter((date): date is string => Boolean(date)).sort()[0];
    if (requestedPeriod === "all") {
      period = { since: firstCampaignDate ?? currentPeriod.since, until: currentPeriod.until };
    } else if (requestedPeriod) {
      period = requestedPeriod;
    }

    const url = new URL(`https://graph.facebook.com/act_${encodeURIComponent(accountId)}/insights`);
    url.search = new URLSearchParams({ fields, level: "campaign", breakdowns: "publisher_platform", time_range: JSON.stringify(period), limit: "500", access_token: accessToken }).toString();
    const response = await fetch(url, { cache: "no-store" });
    const result = await response.json() as { data?: MetaRow[]; error?: { message?: string } };
    if (!response.ok || result.error) return { ok: false as const, brand, period, error: result.error?.message ?? "لم تُعد Meta تقريراً لهذا الحساب." };

    const accountUrl = new URL(`https://graph.facebook.com/act_${encodeURIComponent(accountId)}`);
    accountUrl.search = new URLSearchParams({ fields: "currency", access_token: accessToken }).toString();
    const accountResponse = await fetch(accountUrl, { cache: "no-store" });
    const accountResult = accountResponse.ok ? await accountResponse.json() as { currency?: string } : {};
    const currency = accountResult.currency ?? "";

    const rows: MetaCampaignReport[] = (result.data ?? [])
      .filter((row): row is MetaRow & { publisher_platform: "facebook" | "instagram" } => row.publisher_platform === "facebook" || row.publisher_platform === "instagram")
      .map((row) => {
        const config = configs.get(row.campaign_id ?? "");
        return {
        campaignId: row.campaign_id ?? "",
        campaignName: row.campaign_name ?? "(بلا اسم من Meta)",
        createdAt: config?.created_time?.slice(0, 10) ?? "",
        platform: row.publisher_platform,
        dateStart: row.date_start ?? period.since,
        dateStop: row.date_stop ?? period.until,
        impressions: row.impressions ?? "0",
        reach: row.reach ?? "0",
        spend: row.spend ?? "0",
        clicks: row.clicks ?? "0",
        ctr: row.ctr ?? "0",
        cpc: row.cpc ?? "0",
        cpm: row.cpm ?? "0",
        actions: row.actions ?? [],
        actionValues: row.action_values ?? [],
        objective: config?.objective ?? "—",
        budget: displayBudget(config?.daily_budget ?? config?.lifetime_budget, currency),
        currency,
      };
      });
    return { ok: true as const, brand, period, firstCampaignDate: firstCampaignDate ?? null, rows };
  } catch {
    return { ok: false as const, brand, period, error: "تعذّر الوصول إلى Meta Graph API الآن." };
  }
}
