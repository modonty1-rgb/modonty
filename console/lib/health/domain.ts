/**
 * Domain expiry check via RDAP (free, public registry data).
 *
 * RDAP replaces Whois — same info, JSON format, no API key needed.
 */

import type { HealthCheckResult } from "./types";

const TIMEOUT_MS = 8000;

interface RdapResponse {
  events?: Array<{
    eventAction?: string;
    eventDate?: string;
  }>;
}

function parseDomain(host: string): string {
  return host
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
}

export async function checkDomain(host: string): Promise<HealthCheckResult[]> {
  const domain = parseDomain(host);

  try {
    const res = await fetch(`https://rdap.org/domain/${domain}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { Accept: "application/rdap+json, application/json" },
    });
    if (!res.ok) {
      return [
        {
          metric: "domain_expiry",
          status: "skip",
          message: `لا يمكن جلب معلومات النطاق (HTTP ${res.status})`,
        },
      ];
    }
    const data = (await res.json()) as RdapResponse;
    const expirationEvent = data.events?.find(
      (e) => e.eventAction === "expiration"
    );

    if (!expirationEvent?.eventDate) {
      return [
        {
          metric: "domain_expiry",
          status: "skip",
          message: "تاريخ انتهاء النطاق غير متاح من السجل",
        },
      ];
    }

    const expiryDate = new Date(expirationEvent.eventDate);
    const daysUntilExpiry = Math.floor(
      (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    let status: HealthCheckResult["status"] = "pass";
    let message = `${daysUntilExpiry} يوم متبقّي`;
    let recommendation: string | undefined;

    if (daysUntilExpiry < 0) {
      status = "fail";
      message = `النطاق منتهي منذ ${Math.abs(daysUntilExpiry)} يوم!`;
      recommendation = "جدّد النطاق فوراً — الموقع معرّض للسقوط";
    } else if (daysUntilExpiry <= 14) {
      status = "fail";
      message = `النطاق ينتهي خلال ${daysUntilExpiry} يوم — جدّد الآن`;
      recommendation = "تواصل مع مسجّل النطاق وجدّد فوراً";
    } else if (daysUntilExpiry <= 60) {
      status = "warn";
      message = `النطاق ينتهي خلال ${daysUntilExpiry} يوم`;
      recommendation = "احرص على تجديده قبل الانتهاء";
    }

    return [
      {
        metric: "domain_expiry",
        status,
        value: {
          daysUntilExpiry,
          expiryDate: expiryDate.toISOString(),
        },
        message,
        recommendation,
      },
    ];
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "fetch failed";
    return [
      {
        metric: "domain_expiry",
        status: "skip",
        message: `لا يمكن التحقق من انتهاء النطاق (${errMsg})`,
      },
    ];
  }
}
