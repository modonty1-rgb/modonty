/**
 * HTTP security headers check via fetch — no external API.
 *
 * Validates the presence of recommended security headers per OWASP:
 *  - Strict-Transport-Security (HSTS)
 *  - X-Content-Type-Options
 *  - X-Frame-Options
 *  - Content-Security-Policy
 *  - Referrer-Policy
 *  - Permissions-Policy
 */

import type { HealthCheckResult } from "./types";

const TIMEOUT_MS = 6000;

interface HeaderRule {
  name: string;
  metric: string;
  label: string;
  recommendation: string;
}

const HEADERS_TO_CHECK: HeaderRule[] = [
  {
    name: "strict-transport-security",
    metric: "hdr_hsts",
    label: "HSTS",
    recommendation: "أضف Strict-Transport-Security: max-age=63072000; includeSubDomains",
  },
  {
    name: "x-content-type-options",
    metric: "hdr_xcto",
    label: "X-Content-Type-Options",
    recommendation: "أضف X-Content-Type-Options: nosniff",
  },
  {
    name: "x-frame-options",
    metric: "hdr_xfo",
    label: "X-Frame-Options",
    recommendation: "أضف X-Frame-Options: SAMEORIGIN",
  },
  {
    name: "content-security-policy",
    metric: "hdr_csp",
    label: "Content-Security-Policy",
    recommendation: "أضف CSP محكم — يقي من XSS والـ injection",
  },
  {
    name: "referrer-policy",
    metric: "hdr_referrer",
    label: "Referrer-Policy",
    recommendation: "أضف Referrer-Policy: strict-origin-when-cross-origin",
  },
  {
    name: "permissions-policy",
    metric: "hdr_permissions",
    label: "Permissions-Policy",
    recommendation: "أضف Permissions-Policy: camera=(), microphone=(), geolocation=()",
  },
];

export async function checkHeaders(url: string): Promise<HealthCheckResult[]> {
  const target = url.startsWith("http") ? url : `https://${url}`;

  let headers: Headers | null = null;
  let fetchError: string | null = null;
  try {
    const res = await fetch(target, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    headers = res.headers;
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "fetch failed";
  }

  if (!headers) {
    return HEADERS_TO_CHECK.map(
      (rule): HealthCheckResult => ({
        metric: rule.metric,
        status: "skip",
        message: `لا يمكن جلب headers (${fetchError ?? "غير معروف"})`,
      })
    );
  }

  return HEADERS_TO_CHECK.map((rule): HealthCheckResult<{ value: string }> => {
    const value = headers!.get(rule.name);
    if (value) {
      return {
        metric: rule.metric,
        status: "pass",
        value: { value },
        message: `${rule.label}: مُفعّل`,
      };
    }
    // CSP and Permissions-Policy are recommended but not critical
    const isCritical =
      rule.name === "strict-transport-security" ||
      rule.name === "x-content-type-options";
    return {
      metric: rule.metric,
      status: isCritical ? "fail" : "warn",
      message: `${rule.label}: غير موجود`,
      recommendation: rule.recommendation,
    };
  });
}
