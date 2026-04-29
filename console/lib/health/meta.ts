/**
 * HTML meta tags + Open Graph + canonical check via cheerio.
 *
 * Validates the homepage HTML (or any URL) for SEO essentials.
 */

import * as cheerio from "cheerio";
import type { HealthCheckResult } from "./types";

const TIMEOUT_MS = 8000;

export async function checkMeta(url: string): Promise<HealthCheckResult[]> {
  const target = url.startsWith("http") ? url : `https://${url}`;

  let html: string;
  try {
    const res = await fetch(target, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "follow",
    });
    if (!res.ok) {
      return [
        {
          metric: "meta_reachable",
          status: "fail",
          message: `الصفحة الرئيسية غير قابلة للوصول (HTTP ${res.status})`,
        },
      ];
    }
    html = await res.text();
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "fetch failed";
    return [
      {
        metric: "meta_reachable",
        status: "fail",
        message: `لا يمكن جلب الصفحة (${errMsg})`,
      },
    ];
  }

  const $ = cheerio.load(html);

  // Title
  const title = $("head > title").first().text().trim();
  const titleCheck: HealthCheckResult<{ length: number; text: string }> = (() => {
    if (!title) {
      return {
        metric: "meta_title",
        status: "fail",
        message: "لا يوجد <title>",
        recommendation: "أضف عنوان للصفحة في <head><title>",
      };
    }
    if (title.length < 10) {
      return {
        metric: "meta_title",
        status: "warn",
        value: { length: title.length, text: title },
        message: `العنوان قصير جداً (${title.length} حرف)`,
        recommendation: "اكتب عنواناً وصفياً 30-60 حرف",
      };
    }
    if (title.length > 70) {
      return {
        metric: "meta_title",
        status: "warn",
        value: { length: title.length, text: title },
        message: `العنوان طويل (${title.length} حرف) — قد يُقطع في جوجل`,
        recommendation: "اقصره لأقل من 60 حرف",
      };
    }
    return {
      metric: "meta_title",
      status: "pass",
      value: { length: title.length, text: title },
      message: `العنوان: "${title.slice(0, 60)}"`,
    };
  })();

  // Description
  const description = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const descCheck: HealthCheckResult<{ length: number; text: string }> = (() => {
    if (!description) {
      return {
        metric: "meta_description",
        status: "fail",
        message: "لا يوجد meta description",
        recommendation: "أضف <meta name=\"description\"> 120-160 حرف",
      };
    }
    if (description.length < 50) {
      return {
        metric: "meta_description",
        status: "warn",
        value: { length: description.length, text: description },
        message: `الوصف قصير (${description.length} حرف)`,
      };
    }
    if (description.length > 170) {
      return {
        metric: "meta_description",
        status: "warn",
        value: { length: description.length, text: description },
        message: `الوصف طويل (${description.length} حرف) — قد يُقطع`,
      };
    }
    return {
      metric: "meta_description",
      status: "pass",
      value: { length: description.length, text: description },
      message: `الوصف: ${description.length} حرف`,
    };
  })();

  // Canonical
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() ?? "";
  const canonicalCheck: HealthCheckResult = canonical
    ? {
        metric: "meta_canonical",
        status: "pass",
        message: "Canonical URL مُحدّد",
      }
    : {
        metric: "meta_canonical",
        status: "warn",
        message: "لا يوجد <link rel=\"canonical\">",
        recommendation: "أضف canonical URL لتجنّب duplicate content",
      };

  // Open Graph
  const ogTitle = $('meta[property="og:title"]').attr("content");
  const ogDescription = $('meta[property="og:description"]').attr("content");
  const ogImage = $('meta[property="og:image"]').attr("content");
  const ogCount = [ogTitle, ogDescription, ogImage].filter(Boolean).length;

  const ogCheck: HealthCheckResult<{ count: number }> =
    ogCount === 3
      ? {
          metric: "meta_og",
          status: "pass",
          value: { count: 3 },
          message: "Open Graph مكتمل (title + description + image)",
        }
      : ogCount > 0
        ? {
            metric: "meta_og",
            status: "warn",
            value: { count: ogCount },
            message: `${ogCount}/3 من Open Graph tags فقط`,
            recommendation: "أضف og:title + og:description + og:image",
          }
        : {
            metric: "meta_og",
            status: "fail",
            value: { count: 0 },
            message: "لا توجد Open Graph tags",
            recommendation:
              "أضف og:title و og:description و og:image — تحسّن المشاركة على السوشال",
          };

  // Twitter Card
  const twitterCard = $('meta[name="twitter:card"]').attr("content");
  const twitterCheck: HealthCheckResult = twitterCard
    ? {
        metric: "meta_twitter",
        status: "pass",
        message: `Twitter Card: ${twitterCard}`,
      }
    : {
        metric: "meta_twitter",
        status: "warn",
        message: "لا يوجد twitter:card",
        recommendation: "أضف <meta name=\"twitter:card\" content=\"summary_large_image\">",
      };

  // Lang attribute
  const lang = $("html").attr("lang");
  const langCheck: HealthCheckResult = lang
    ? {
        metric: "meta_lang",
        status: "pass",
        message: `<html lang="${lang}">`,
      }
    : {
        metric: "meta_lang",
        status: "warn",
        message: "لا يوجد lang attribute على <html>",
        recommendation: "أضف <html lang=\"ar\"> لمساعدة جوجل + قارئ الشاشة",
      };

  return [
    {
      metric: "meta_reachable",
      status: "pass",
      message: "الصفحة الرئيسية متاحة",
    },
    titleCheck,
    descCheck,
    canonicalCheck,
    ogCheck,
    twitterCheck,
    langCheck,
  ];
}

/**
 * Extract JSON-LD scripts from a fetched HTML page (used by schemaCheck.ts).
 */
export async function fetchJsonLdBlocks(url: string): Promise<unknown[]> {
  const target = url.startsWith("http") ? url : `https://${url}`;
  const res = await fetch(target, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: "follow",
  });
  if (!res.ok) return [];
  const html = await res.text();
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');
  const blocks: unknown[] = [];
  scripts.each((_, el) => {
    const txt = $(el).text().trim();
    if (!txt) return;
    try {
      blocks.push(JSON.parse(txt));
    } catch {
      // Invalid JSON-LD — ignore
    }
  });
  return blocks;
}
