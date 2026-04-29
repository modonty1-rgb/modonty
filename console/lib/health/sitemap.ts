/**
 * sitemap.xml check — no external API.
 *
 * Validates:
 *  - sitemap.xml exists and is valid XML
 *  - Contains URLs (entry count)
 *  - Index sitemap detection (has <sitemapindex>)
 */

import type { HealthCheckResult } from "./types";

const TIMEOUT_MS = 6000;

export async function checkSitemap(url: string): Promise<HealthCheckResult[]> {
  const base = url.startsWith("http") ? url : `https://${url}`;
  const sitemapUrl = `${new URL(base).origin}/sitemap.xml`;

  try {
    const res = await fetch(sitemapUrl, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      return [
        {
          metric: "sitemap_present",
          status: "fail",
          message: `sitemap.xml غير موجود (HTTP ${res.status})`,
          recommendation:
            "أنشئ sitemap.xml — جوجل يستخدمه لفهرسة الصفحات بسرعة",
        },
      ];
    }
    const text = await res.text();
    const isXml = text.trim().startsWith("<?xml") || text.trim().startsWith("<urlset") || text.trim().startsWith("<sitemapindex");

    if (!isXml) {
      return [
        {
          metric: "sitemap_present",
          status: "fail",
          message: "sitemap.xml ليس XML صالح",
          recommendation: "تحقق من صيغة الـ sitemap عند مزوّد الاستضافة",
        },
      ];
    }

    // Count URLs (urlset) or index entries (sitemapindex)
    const isIndex = /<sitemapindex/i.test(text);
    const entryRegex = isIndex ? /<sitemap>/gi : /<url>/gi;
    const entryCount = (text.match(entryRegex) || []).length;

    const presentResult: HealthCheckResult<{ entries: number; isIndex: boolean }> = {
      metric: "sitemap_present",
      status: "pass",
      value: { entries: entryCount, isIndex },
      message: isIndex
        ? `sitemap.xml index موجود (${entryCount} sub-sitemap)`
        : `sitemap.xml موجود (${entryCount} URL)`,
    };

    // Warn if very small
    let countResult: HealthCheckResult;
    if (entryCount === 0) {
      countResult = {
        metric: "sitemap_has_urls",
        status: "fail",
        message: "sitemap.xml فاضي — لا يحتوي URLs",
        recommendation: "تأكد إن الـ sitemap يولّد بصورة صحيحة من الكود",
      };
    } else if (entryCount < 5) {
      countResult = {
        metric: "sitemap_has_urls",
        status: "warn",
        value: { count: entryCount },
        message: `${entryCount} URL فقط — هل المحتوى ناقص؟`,
      };
    } else {
      countResult = {
        metric: "sitemap_has_urls",
        status: "pass",
        value: { count: entryCount },
        message: `${entryCount} عنوان مُفهرس`,
      };
    }

    return [presentResult, countResult];
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return [
      {
        metric: "sitemap_present",
        status: "fail",
        message: `لا يمكن جلب sitemap.xml (${message})`,
      },
    ];
  }
}
