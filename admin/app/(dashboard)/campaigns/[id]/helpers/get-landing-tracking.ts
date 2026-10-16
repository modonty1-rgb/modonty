import "server-only";

import { createSign } from "node:crypto";

export type TrackingTag = { name: string; kind: string; paused: boolean; pixelId: string | null; events: string[]; firesOn: string[] };

export type LandingTracking =
  | { ok: false; error: string }
  | {
      ok: true;
      containerId: string;
      containerName: string;
      liveVersion: string;
      tags: TrackingTag[];
      pixelIds: string[];
      /** A live Lead tag fires on a click, not on a saved form — so Meta counts tries, we count saves. */
      leadOnClick: boolean;
    };

const API = "https://tagmanager.googleapis.com/tagmanager/v2";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

/**
 * Service-account token for GTM, read-only — signed here like `lib/analytics/ga4-data-api.ts` does
 * for GA4, because admin's local `google-auth-library` type stub hides `JWT.request`.
 */
async function getAccessToken(email: string, key: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const part = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${part({ alg: "RS256", typ: "JWT" })}.${part({
    iss: email,
    scope: "https://www.googleapis.com/auth/tagmanager.readonly",
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(key).toString("base64url");
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }),
    cache: "no-store",
  });
  const j = (await r.json().catch(() => ({}))) as { access_token?: string };
  if (!r.ok || !j.access_token) throw Object.assign(new Error("GTM token failed"), { response: { status: r.status } });
  return j.access_token;
}
const ALL_PAGES = "2147479553";
type Param = { key?: string; value?: string; list?: Param[]; map?: Param[] };
const param = (p: Param[] | undefined, k: string) => (p ?? []).find((x) => x.key === k)?.value;
const KIND: Record<string, string> = { html: "كود مخصّص", gaawe: "حدث GA4", googtag: "جوجل تاج", awct: "تحويل إعلانات جوجل" };

/**
 * ما يُطلق على صفحة هبوط البريف من تاقات — من نسخة GTM **المنشورة** (لا مسوّدة)، بحساب الخدمة
 * (`GA4_CLIENT_EMAIL`) وصلاحية قراءة فقط. الحاوية تُختار باسمها: كل صفحة هبوط لها حاوية اسمها
 * يحمل مسارها (`modonty.com/search-visibility`)، وإلا فحاوية الموقع نفسه.
 * حاويةٌ جديدة تحتاج إضافة إيميل حساب الخدمة عليها بصلاحية Read — وإلا لا تظهر في القائمة.
 */
export async function getLandingTracking(landingPath: string | null, domain: string): Promise<LandingTracking> {
  const email = process.env.GA4_CLIENT_EMAIL;
  const key = process.env.GA4_PRIVATE_KEY_BASE64
    ? Buffer.from(process.env.GA4_PRIVATE_KEY_BASE64, "base64").toString("utf8")
    : process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const account = process.env.GTM_ACCOUNT_ID;
  if (!email || !key || !account) return { ok: false, error: "مفاتيح GTM ناقصة على السيرفر (GA4_CLIENT_EMAIL · GA4_PRIVATE_KEY · GTM_ACCOUNT_ID)." };

  try {
    const token = await getAccessToken(email, key);
    const get = async <T,>(url: string): Promise<T> => {
      const r = await fetch(url, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!r.ok) throw Object.assign(new Error("GTM read failed"), { response: { status: r.status } });
      return (await r.json()) as T;
    };
    const { container = [] } = await get<{ container?: { path: string; publicId: string; name: string }[] }>(
      `${API}/accounts/${account}/containers`,
    );
    const path = landingPath?.replace(/\/+$/, "").toLowerCase() ?? "";
    const byPath = path ? container.find((c) => c.name.toLowerCase().replace(/\/+$/, "").endsWith(path)) : undefined;
    const site = container.find((c) => c.name.toLowerCase().replace(/\/+$/, "") === domain);
    const chosen = byPath ?? site;
    if (!chosen) return { ok: false, error: `ولا حاوية GTM مقروءة لـ ${domain}${path}.` };

    const live = await get<{
      containerVersionId?: string;
      tag?: { name: string; type: string; paused?: boolean; parameter?: Param[]; firingTriggerId?: string[] }[];
      trigger?: { triggerId: string; name: string; type: string; customEventFilter?: { parameter?: Param[] }[] }[];
    }>(`${API}/${chosen.path}/versions:live`);
    const triggers = new Map((live.trigger ?? []).map((t) => [t.triggerId, t]));
    const isClick = (id: string) => {
      const tr = triggers.get(id);
      if (!tr) return false;
      return /click/i.test(tr.type) || (tr.customEventFilter ?? []).some((f) => param(f.parameter, "arg1") === "gtm.click");
    };
    let leadOnClick = false;
    const tags: TrackingTag[] = (live.tag ?? []).map((t) => {
      const p = t.parameter;
      const html = param(p, "html") ?? "";
      // Custom HTML carries `fbq('init', …)`; Stape's Facebook template (cvt_…) carries `pixelIds`
      // and the event in `eventNameStandard` / `eventNameCustom` (read live, 16 Oct 2026).
      const pixelId = html.match(/fbq\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/)?.[1] ?? param(p, "pixelIds")?.split(",")[0]?.trim() ?? param(p, "pixelId") ?? null;
      const fb = [...html.matchAll(/fbq\(\s*['"](?:track|trackCustom)['"]\s*,\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
      const template = param(p, "eventName") === "custom" ? param(p, "eventNameCustom") : param(p, "eventNameStandard");
      const ga = t.type === "gaawe" ? param(p, "eventName") : undefined;
      const events = [...new Set([...fb, ...(template ? [template] : []), ...(ga ? [ga] : [])])];
      if (!t.paused && events.includes("Lead") && (t.firingTriggerId ?? []).some(isClick)) leadOnClick = true;
      return {
        name: t.name,
        kind: pixelId ? "بكسل ميتا" : (KIND[t.type] ?? t.type),
        paused: Boolean(t.paused),
        pixelId,
        events,
        firesOn: (t.firingTriggerId ?? []).map((id) => {
          if (id === ALL_PAGES) return "كل الصفحات";
          const tr = triggers.get(id);
          if (!tr) return id;
          const ev = (tr.customEventFilter ?? []).map((f) => param(f.parameter, "arg1")).filter(Boolean);
          return ev.length ? `${tr.name} (${ev.join("، ")})` : tr.name;
        }),
      };
    });
    return {
      ok: true,
      containerId: chosen.publicId,
      containerName: chosen.name,
      liveVersion: live.containerVersionId ?? "—",
      tags,
      pixelIds: [...new Set(tags.filter((t) => !t.paused && t.pixelId).map((t) => t.pixelId!))],
      leadOnClick,
    };
  } catch (e) {
    const status = (e as { response?: { status?: number } }).response?.status;
    return { ok: false, error: status === 403 ? "حساب الخدمة بلا صلاحية قراءة على حاوية GTM." : `تعذّرت قراءة GTM (${status ?? "شبكة"}).` };
  }
}
