/**
 * تحقّق Cloudflare Turnstile على السيرفر — «هل الذي يملأ النموذج إنسان؟».
 *
 * منقول من جبر سيو كما هو. سببه هناك ليس السخام بل **اختبار البطاقات**: مسارٌ ينشئ طلباً
 * ويحاول دفعةً هو أرخص آلة لتجريب أرقام بطاقات مسروقة بالجملة، والثمن يقع علينا رسوم
 * رفضٍ وسمعةَ حسابٍ لدى المزوّد.
 *
 * السرّ الغائب: مفتوحٌ في التطوير ومغلقٌ في الإنتاج. عكسه — أن يمرّ بلا مفتاح في الإنتاج —
 * يعني بوّابةً موجودةً في الكود ومعطَّلةً في الواقع، وهي أسوأ من غيابها لأنها تُطمئن.
 */

const VERIFY_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileVerifyResult = {
  success: boolean;
  errorCodes?: string[];
  hostname?: string;
  challengeTs?: string;
  action?: string;
};

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string | null,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return { success: false, errorCodes: ["missing-server-secret"] };
    }
    return { success: true, errorCodes: ["dev-bypass-no-secret"] };
  }

  if (!token || !token.trim()) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(VERIFY_ENDPOINT, { method: "POST", body, cache: "no-store" });
    if (!res.ok) return { success: false, errorCodes: [`http-${res.status}`] };
    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
      hostname?: string;
      challenge_ts?: string;
      action?: string;
    };
    return {
      success: !!data.success,
      errorCodes: data["error-codes"],
      hostname: data.hostname,
      challengeTs: data.challenge_ts,
      action: data.action,
    };
  } catch (e) {
    return { success: false, errorCodes: ["network-error", e instanceof Error ? e.message : "unknown"] };
  }
}
