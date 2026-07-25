/**
 * Phone → E.164 for the two markets we serve: Saudi Arabia (+966) and Egypt (+20).
 *
 * WhatsApp deep-links (`wa.me/<digits>`) need the full international number with NO `+`,
 * spaces, or separators. Client phones are entered in every shape imaginable
 * (`0501…`, `+966 55 …`, `‏+20 10 …‏` with RTL marks, two numbers with a dash, landlines).
 * This is the ONE place that turns any of them into a canonical `+CCXXXXXXXXX`, or reports
 * WHY it can't — so the dashboard can surface the un-fixable ones for a human.
 *
 * Mobile only: WhatsApp doesn't work on landlines, so an Egyptian Cairo landline (`+202…`)
 * is rejected on purpose.
 */

export interface E164Result {
  /** Canonical `+966…` / `+20…`, or null when it can't be normalized confidently. */
  e164: string | null;
  /** Arabic reason when e164 is null — shown in the «Errors to fix» card. */
  reason?: string;
}

// Saudi mobile: 9 digits starting 5 (05XXXXXXXX locally). Egyptian mobile: 10 digits
// starting 1 (01XXXXXXXXX locally). Landlines/short codes are intentionally rejected.
const SA_MOBILE = /^5\d{8}$/;
const EG_MOBILE = /^1\d{9}$/;

export function toE164(raw: string | null | undefined): E164Result {
  if (!raw || !raw.trim()) return { e164: null, reason: "لا يوجد رقم" };

  // Drop bidi/RTL control marks that Arabic inputs often smuggle in.
  const cleaned = raw.replace(/[‎‏‪-‮؜]/g, "").trim();

  // Two numbers glued together (dash / comma / slash / «أو») can't be auto-picked.
  if (/[,/]|\bor\b|\bأو\b|\d\s*[-–]\s*(?:\+|00|0?\d{2,})?\d{6,}/i.test(cleaned)) {
    // Only flag when there really are two long digit runs (not a dash inside one number).
    const runs = cleaned.match(/\d[\d\s]{6,}\d/g) ?? [];
    if (runs.length > 1) return { e164: null, reason: "أكثر من رقم — اختر واحداً" };
  }

  let digits = cleaned.replace(/\D/g, "");
  if (cleaned.startsWith("00")) digits = digits.replace(/^00/, ""); // 00966… → 966…
  if (!digits) return { e164: null, reason: "بلا أرقام" };

  let cc: "966" | "20" | null = null;
  let national = "";

  if (digits.startsWith("966")) {
    cc = "966";
    national = digits.slice(3);
  } else if (digits.startsWith("20")) {
    cc = "20";
    national = digits.slice(2);
  } else if (digits.startsWith("0")) {
    // Local number — infer the country from the mobile prefix.
    if (SA_MOBILE.test(digits.slice(1))) {
      cc = "966";
      national = digits.slice(1);
    } else if (EG_MOBILE.test(digits.slice(1))) {
      cc = "20";
      national = digits.slice(1);
    } else {
      return { e164: null, reason: "رقم محلي غير معروف الدولة أو غير جوال" };
    }
  } else {
    return { e164: null, reason: "صيغة غير معروفة (بلا رمز دولة)" };
  }

  const ok = cc === "966" ? SA_MOBILE.test(national) : EG_MOBILE.test(national);
  if (!ok) {
    return { e164: null, reason: cc === "966" ? "رقم سعودي غير صالح (جوال 05…)" : "رقم مصري غير صالح (جوال 01…)" };
  }

  return { e164: `+${cc}${national}` };
}

/** Convenience: the normalized value or null (drops the reason). */
export function normalizePhone(raw: string | null | undefined): string | null {
  return toE164(raw).e164;
}
