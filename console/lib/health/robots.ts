/**
 * robots.txt check — no external API.
 */

import type { HealthCheckResult } from "./types";

const TIMEOUT_MS = 5000;

export async function checkRobots(url: string): Promise<HealthCheckResult[]> {
  const base = url.startsWith("http") ? url : `https://${url}`;
  const robotsUrl = `${new URL(base).origin}/robots.txt`;

  try {
    const res = await fetch(robotsUrl, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      return [
        {
          metric: "robots_present",
          status: "warn",
          message: `robots.txt غير موجود (HTTP ${res.status})`,
          recommendation: "أنشئ ملف robots.txt حتى لو فاضي — جوجل يتوقعه",
        },
      ];
    }
    const text = await res.text();

    const presentResult: HealthCheckResult<{ size: number }> = {
      metric: "robots_present",
      status: "pass",
      value: { size: text.length },
      message: `robots.txt موجود (${text.length} حرف)`,
    };

    // Quick checks: does it mention sitemap?
    const lower = text.toLowerCase();
    const hasSitemapRef = /^\s*sitemap\s*:/im.test(text);

    const sitemapRefResult: HealthCheckResult = hasSitemapRef
      ? {
          metric: "robots_sitemap_ref",
          status: "pass",
          message: "robots.txt يشير لـ sitemap",
        }
      : {
          metric: "robots_sitemap_ref",
          status: "warn",
          message: "robots.txt لا يحتوي على Sitemap:",
          recommendation: "أضف سطر `Sitemap: https://yourdomain.com/sitemap.xml`",
        };

    // Check for accidental Disallow: /
    const blocksAll = /^disallow:\s*\/\s*$/im.test(text) && !lower.includes("user-agent: googlebot");
    if (blocksAll) {
      return [
        presentResult,
        sitemapRefResult,
        {
          metric: "robots_not_blocking_all",
          status: "fail",
          message: "robots.txt يحظر كل الموقع! (Disallow: /)",
          recommendation: "أزل سطر `Disallow: /` فوراً — جوجل ما يقدر يفهرس موقعك",
        },
      ];
    }

    return [
      presentResult,
      sitemapRefResult,
      {
        metric: "robots_not_blocking_all",
        status: "pass",
        message: "robots.txt لا يحظر الموقع بالكامل",
      },
    ];
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return [
      {
        metric: "robots_present",
        status: "warn",
        message: `لا يمكن جلب robots.txt (${message})`,
      },
    ];
  }
}
