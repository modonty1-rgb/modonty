import { getNGeniusAccessToken } from "./get-ngenius-access-token";
import type { NGeniusOrderResponse } from "./types";

const API_BASE = process.env.NGENIUS_API_BASE
  ?? "https://api-gateway.sandbox.ksa.ngenius-payments.com";
const OUTLET_ID = process.env.NGENIUS_OUTLET_ID ?? "";

const PAYMENT_JSON = "application/vnd.ni-payment.v2+json";

/**
 * Fetch canonical order state from N-Genius — the source of truth.
 * Used in two places:
 *   1. Polling from /checkout/processing when webhook is late/missing
 *   2. Webhook handler secondary-verify (webhooks aren't cryptographically signed)
 *
 * `orderRef` is N-Genius' own `reference` field (NOT our merchantOrderReference).
 */
export async function findNGeniusOrder(orderRef: string): Promise<NGeniusOrderResponse> {
  if (!OUTLET_ID) throw new Error("NGENIUS_OUTLET_ID is not set");
  const token = await getNGeniusAccessToken();
  const url = `${API_BASE}/transactions/outlets/${OUTLET_ID}/orders/${encodeURIComponent(orderRef)}`;

  const ctrl = new AbortController();
  // ١٢ ثانية لا ٦: قيس حيّاً (١٤ سبتمبر ٢٠٢٦) أن النداء من iad1 إلى بوّابة الرياض
  // يتجاوز الستّ، فيُجهَض الاستعلام ويبقى طلبٌ **مدفوع** على «بانتظار الدفع». ومع
  // preferredRegion=fra1 تقصر المسافة، لكن المهلة تبقى واسعة: إجهاضُ استعلامٍ يصحّح
  // حالة طلبٍ أخطرُ من انتظار ثوانٍ.
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: PAYMENT_JSON,
      },
      cache: "no-store",
      signal: ctrl.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const reason = err instanceof Error ? err.name + ": " + err.message : String(err);
    throw new Error(`N-Genius findOrder network error: ${reason}`);
  }
  clearTimeout(timer);

  if (!res.ok) {
    const detail = await res.text().catch(() => "<no body>");
    throw new Error(`N-Genius findOrder failed: ${res.status} ${detail.slice(0, 300)}`);
  }

  return res.json() as Promise<NGeniusOrderResponse>;
}
