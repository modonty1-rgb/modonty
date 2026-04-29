/**
 * Schema.org JSON-LD validation — light, no external API.
 *
 * Validates:
 *  - Number of JSON-LD blocks
 *  - Each block has @context + @type
 *  - Common schemas detected (Article, Organization, BreadcrumbList, FAQPage, etc.)
 */

import type { HealthCheckResult } from "./types";
import { fetchJsonLdBlocks } from "./meta";

interface JsonLd {
  "@context"?: string | string[];
  "@type"?: string | string[];
  "@graph"?: JsonLd[];
}

function flatten(blocks: unknown[]): JsonLd[] {
  const out: JsonLd[] = [];
  for (const b of blocks) {
    if (!b || typeof b !== "object") continue;
    const node = b as JsonLd;
    if (node["@graph"] && Array.isArray(node["@graph"])) {
      for (const child of node["@graph"]) out.push(child);
    } else {
      out.push(node);
    }
  }
  return out;
}

function getTypes(node: JsonLd): string[] {
  if (!node["@type"]) return [];
  return Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
}

export async function checkSchema(url: string): Promise<HealthCheckResult[]> {
  let blocks: unknown[];
  try {
    blocks = await fetchJsonLdBlocks(url);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "fetch failed";
    return [
      {
        metric: "schema_present",
        status: "skip",
        message: `لا يمكن جلب JSON-LD (${errMsg})`,
      },
    ];
  }

  if (blocks.length === 0) {
    return [
      {
        metric: "schema_present",
        status: "fail",
        message: "لا يوجد Schema.org على الصفحة",
        recommendation:
          "أضف JSON-LD structured data — تحسّن ظهورك في rich results جوجل",
      },
    ];
  }

  const flat = flatten(blocks);
  const detectedTypes = new Set<string>();
  let invalidCount = 0;

  for (const node of flat) {
    if (!node["@context"] || !node["@type"]) {
      invalidCount++;
      continue;
    }
    for (const t of getTypes(node)) {
      detectedTypes.add(t);
    }
  }

  const presentResult: HealthCheckResult<{ blocks: number; types: string[] }> = {
    metric: "schema_present",
    status: "pass",
    value: { blocks: flat.length, types: [...detectedTypes] },
    message: `${flat.length} schema موجود — أنواع: ${[...detectedTypes].slice(0, 5).join(", ")}`,
  };

  const validityResult: HealthCheckResult =
    invalidCount === 0
      ? {
          metric: "schema_valid",
          status: "pass",
          message: "كل الـ schemas صالحة",
        }
      : {
          metric: "schema_valid",
          status: "warn",
          message: `${invalidCount} schema بدون @context أو @type`,
          recommendation: "تأكد إن كل JSON-LD يحتوي @context و @type",
        };

  return [presentResult, validityResult];
}
