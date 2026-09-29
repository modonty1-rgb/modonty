import "server-only";

import { cache } from "react";

import { readMetaCredentials, type MetaBrand } from "./read-meta-credentials";

export type MetaAccountCampaign = {
  id: string;
  name: string;
  /** Meta's `effective_status` — ACTIVE, PAUSED, CAMPAIGN_PAUSED, ARCHIVED… */
  status: string;
  startAt: string | null;
  /** Lifetime spend in the account currency (`date_preset=maximum`). */
  spend: number;
};

/**
 * كلّ حملات حساب ميتا لموقعٍ واحد، بصرف كلٍّ منها طوال عمرها — طلبان وعملة الحساب، لا طلبٌ لكلّ
 * حملة. منها تُجمع الحملات تحت بريفها بالكود في اسمها، ويُكشف ما يعمل بلا موافقة (خالد ٢٩ سبتمبر
 * ٢٠٢٦). `ok: false` يقول السبب ولا يُسقط الصفحة.
 */
export const getMetaAccountCampaigns = cache(
  async (
    brand: MetaBrand,
  ): Promise<{ ok: true; currency: string; campaigns: MetaAccountCampaign[] } | { ok: false; error: string }> => {
    const credentials = await readMetaCredentials(brand);
    if (!credentials) return { ok: false, error: "ربط ميتا لهذا الموقع غير مكتمل — من إعدادات منصّات الإعلان." };

    const account = `https://graph.facebook.com/act_${encodeURIComponent(credentials.accountId)}`;
    const token = credentials.accessToken;
    const campaignsUrl = new URL(`${account}/campaigns`);
    campaignsUrl.search = new URLSearchParams({
      fields: "id,name,effective_status,start_time",
      limit: "500",
      access_token: token,
    }).toString();
    const insightsUrl = new URL(`${account}/insights`);
    insightsUrl.search = new URLSearchParams({
      level: "campaign",
      fields: "campaign_id,spend",
      date_preset: "maximum",
      limit: "500",
      access_token: token,
    }).toString();
    const currencyUrl = new URL(account);
    currencyUrl.search = new URLSearchParams({ fields: "currency", access_token: token }).toString();

    try {
      const [cRes, iRes, aRes] = await Promise.all([
        fetch(campaignsUrl, { cache: "no-store" }),
        fetch(insightsUrl, { cache: "no-store" }),
        fetch(currencyUrl, { cache: "no-store" }),
      ]);
      const campaigns = (await cRes.json()) as {
        data?: { id?: string; name?: string; effective_status?: string; start_time?: string }[];
        error?: { message?: string };
      };
      if (!cRes.ok || campaigns.error) return { ok: false, error: campaigns.error?.message ?? "لم تُعد ميتا قائمة الحملات." };
      const insights = iRes.ok ? ((await iRes.json()) as { data?: { campaign_id?: string; spend?: string }[] }) : { data: [] };
      const currency = aRes.ok ? (((await aRes.json()) as { currency?: string }).currency ?? "") : "";
      const spend = new Map((insights.data ?? []).map((r) => [r.campaign_id ?? "", Number(r.spend) || 0]));

      return {
        ok: true,
        currency,
        campaigns: (campaigns.data ?? [])
          .filter((c) => c.id)
          .map((c) => ({
            id: c.id!,
            name: c.name ?? c.id!,
            status: c.effective_status ?? "",
            startAt: c.start_time ?? null,
            spend: spend.get(c.id!) ?? 0,
          })),
      };
    } catch {
      return { ok: false, error: "تعذّر الوصول إلى ميتا الآن." };
    }
  },
);
