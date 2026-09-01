/**
 * Modonty JSON-LD validator (standalone): Adobe + Ajv + jsonld.js + custom rules.
 * No imports from admin/lib/seo or clients.
 */

import Validator from "@adobe/structured-data-validator";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import * as jsonld from "jsonld";

import { schemaOrgDocumentLoader } from "@/lib/seo/schema-org-document-loader";

export interface ModontyValidationReport {
  adobe: { valid: boolean; errors: Array<{ message: string; path?: string }>; warnings: unknown[] };
  ajv: { valid: boolean; errors: string[]; warnings: string[] };
  jsonldJs: { valid: boolean; errors: string[] };
  custom: { errors: string[]; warnings: string[] };
}

let cachedSchemaOrg: unknown = null;
const CACHE_TTL = 1000 * 60 * 60 * 24;

async function getSchemaOrg(): Promise<unknown> {
  const now = Date.now();
  const g = globalThis as unknown as { _schemaOrgTime?: number };
  if (cachedSchemaOrg && g._schemaOrgTime) {
    const t = g._schemaOrgTime;
    if (now - t < CACHE_TTL) return cachedSchemaOrg;
  }
  const res = await fetch("https://schema.org/version/latest/schemaorg-all-https.jsonld", {
    next: { revalidate: CACHE_TTL / 1000 },
  });
  if (!res.ok) throw new Error(`schema.org fetch: ${res.status}`);
  cachedSchemaOrg = await res.json();
  (globalThis as unknown as { _schemaOrgTime: number })._schemaOrgTime = now;
  return cachedSchemaOrg;
}

function jsonLdToWaeFormat(jsonLd: object): { jsonld: Record<string, unknown[]>; microdata: Record<string, never>; rdfa: Record<string, never> } {
  const graph = (jsonLd as { "@graph"?: unknown[] })["@graph"];
  const items = Array.isArray(graph) ? graph : [jsonLd];
  const byType: Record<string, unknown[]> = {};
  for (const item of items) {
    const obj = item as Record<string, unknown>;
    const type = obj["@type"];
    const key = Array.isArray(type) ? type[0] : type;
    const k = typeof key === "string" ? key : "Thing";
    if (!byType[k]) byType[k] = [];
    byType[k].push({ ...obj });
  }
  return { jsonld: byType, microdata: {}, rdfa: {} };
}

async function validateWithAdobe(jsonLd: object): Promise<ModontyValidationReport["adobe"]> {
  // الشبكة ليست شرطاً للفحص — نفس إصلاح `admin/lib/seo/jsonld-validator.ts`.
  //
  // مصدر الحزمة المثبَّتة (`@adobe/structured-data-validator@1.6.0/src/validator.js:13-18`):
  // حارس schema.org يُضاف **فقط إن مُرِّر التعريف**، وتبقى الحرّاس النوعيّة كلها عاملة
  // بدونه. فانقطاع الشبكة كان يُسقط الفحص كلّه ويُخزَّن `valid: false` على محتوى سليم —
  // خطأٌ في الشبكة يُقرأ لاحقاً عطلاً في المحتوى.
  let schemaOrg: unknown = null;
  let unavailable = false;
  try {
    schemaOrg = await getSchemaOrg();
  } catch (e) {
    unavailable = true;
    console.error("schema.org unavailable — validating without it:", e);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- @adobe/structured-data-validator has no typed constructor
    const validator = new Validator((schemaOrg ?? undefined) as any);
    const waeData = jsonLdToWaeFormat(jsonLd);
    const issues = await validator.validate(waeData);
    const errors = (Array.isArray(issues) ? issues : []).map((i: { issueMessage?: string; message?: string; location?: string }) => ({
      message: i.issueMessage || i.message || "Validation issue",
      path: i.location,
    }));
    return {
      valid: errors.length === 0,
      errors,
      warnings: unavailable
        ? ["تعذّر جلب تعريف schema.org — فُحصت القواعد النوعيّة وحدها"]
        : [],
    };
  } catch (e) {
    // عطلٌ في الفاحص نفسه لا في المحتوى: لا نُعلن المحتوى خاطئاً لأننا لم نقِسه.
    return {
      valid: true,
      errors: [],
      warnings: [`تعذّر الفحص (لم يُقَس المحتوى): ${e instanceof Error ? e.message : String(e)}`],
    };
  }
}

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const webPageGraphSchema = {
  type: "object",
  required: ["@context", "@graph"],
  properties: {
    "@context": { type: "string" },
    "@graph": {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["@type"],
        properties: {
          "@type": { type: "string" },
          "@id": { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          url: { type: "string", format: "uri" },
          inLanguage: {
            oneOf: [
              { type: "string" },
              { type: "array", items: { type: "string" }, minItems: 1 },
            ],
          },
          availableLanguage: {
            oneOf: [
              { type: "string" },
              { type: "array", items: { type: "string" }, minItems: 1 },
            ],
          },
          dateModified: { type: "string" },
          primaryImageOfPage: { type: "object" },
        },
      },
    },
  },
};

const validateAjv = ajv.compile(webPageGraphSchema);

function validateWithAjv(jsonLd: object): ModontyValidationReport["ajv"] {
  const valid = validateAjv(jsonLd);
  const errors = (validateAjv.errors || []).map((e) => `${e.instancePath ?? ""} ${e.message ?? ""}`.trim());
  return { valid: !!valid, errors, warnings: [] };
}

async function validateWithJsonLdJs(jsonLd: object): Promise<ModontyValidationReport["jsonldJs"]> {
  try {
    // Local context — a network hiccup must not be reported to the editor as invalid JSON-LD.
    await jsonld.expand(jsonLd, { documentLoader: schemaOrgDocumentLoader });
    return { valid: true, errors: [] };
  } catch (e) {
    return {
      valid: false,
      errors: [e instanceof Error ? e.message : String(e)],
    };
  }
}

function resolveType(obj: unknown): string | undefined {
  const t = (obj as { "@type"?: string | string[] })["@type"];
  if (Array.isArray(t)) return t[0];
  return typeof t === "string" ? t : undefined;
}

// The rule is "the graph must describe a page", and CollectionPage is only ONE of the
// schema.org WebPage subtypes that does. /help/faq legitimately uses FAQPage, and this
// rule warned on it forever — the dashboard read «1 تحذير» on a page that was correct.
// (FAQPage no longer earns a rich result: Google retired the FAQ feature 2026-05-07 and
// removed its docs 2026-06-15. The markup stays valid, it just buys no rich result.)
const PAGE_TYPES = ["CollectionPage", "FAQPage", "WebPage", "AboutPage", "ItemPage"];

/**
 * Is this graph the site HOME PAGE? Read from the page node's own `url`: the home page's
 * CollectionPage carries the bare site root, every list page carries a sub-path
 * (…/articles, …/clients). Google draws the same line — it defines the home page as
 * "the domain or subdomain level root URI".
 */
function isHomePageGraph(graph: unknown[]): boolean {
  const pageNode = graph.find(
    (n: unknown) =>
      typeof n === "object" && n !== null && PAGE_TYPES.includes(resolveType(n) ?? "")
  ) as { url?: unknown } | undefined;
  const url = typeof pageNode?.url === "string" ? pageNode.url : undefined;
  if (!url) return false;
  try {
    return new URL(url).pathname === "/";
  } catch {
    return false;
  }
}

function validateModontyPageBusinessRules(jsonLd: object): ModontyValidationReport["custom"] {
  const errors: string[] = [];
  const warnings: string[] = [];
  const graph = (jsonLd as { "@graph"?: unknown[] })["@graph"];
  if (!graph || !Array.isArray(graph)) {
    errors.push("JSON-LD must contain @graph array");
    return { errors, warnings };
  }
  const pageNode = graph.find((n: unknown) => {
    const type = resolveType(n);
    return type === "WebPage" || type === "AboutPage";
  }) as Record<string, unknown> | undefined;
  if (!pageNode) {
    errors.push("Missing WebPage or AboutPage node in @graph");
    return { errors, warnings };
  }
  if (!pageNode.name && !pageNode.description) {
    warnings.push("WebPage or AboutPage should have name or description");
  }
  return { errors, warnings };
}

/** Exported so the WebSite/home-page rule can be exercised without the network validators. */
export function validateHomeOrListPageBusinessRules(jsonLd: object): ModontyValidationReport["custom"] {
  const errors: string[] = [];
  const warnings: string[] = [];
  const graph = (jsonLd as { "@graph"?: unknown[] })["@graph"];
  if (!graph || !Array.isArray(graph)) {
    errors.push("JSON-LD must contain @graph array");
    return { errors, warnings };
  }
  const hasOrg = graph.some((n: unknown) => resolveType(n) === "Organization");
  const hasWebSite = graph.some((n: unknown) => resolveType(n) === "WebSite");
  const hasPageNode = graph.some((n: unknown) => PAGE_TYPES.includes(resolveType(n) ?? ""));
  if (!hasOrg) errors.push("Missing Organization node in @graph");

  // Origin: GOOGLE, official — and this rule used to contradict it. Google's Site names page
  // says: "The WebSite structured data must be on the home page of the site" and "You don't
  // need to include this markup on every page of your site; you only need to add this markup
  // to the home page of your site."
  // https://developers.google.com/search/docs/appearance/site-names
  // So a MISSING WebSite node is an error on the home page only. On a list page the defect is
  // the opposite one — a WebSite node that should not be there — reported as a warning so the
  // list-page builders can be corrected (this error previously pinned them to the violation).
  if (isHomePageGraph(graph)) {
    if (!hasWebSite) {
      errors.push(
        "Missing WebSite node in @graph — Google requires the WebSite structured data on the home page"
      );
    }
  } else if (hasWebSite) {
    warnings.push(
      "WebSite node on a non-home page — Google: the WebSite structured data must be on the home page of the site only"
    );
  }

  if (!hasPageNode) warnings.push("Home/list JSON-LD should have a page node (CollectionPage, FAQPage…)");
  return { errors, warnings };
}

export async function validateHomeOrListPageJsonLd(
  jsonLd: object
): Promise<ModontyValidationReport> {
  const [adobe, ajvResult, jsonldJsResult] = await Promise.all([
    validateWithAdobe(jsonLd),
    Promise.resolve(validateWithAjv(jsonLd)),
    validateWithJsonLdJs(jsonLd),
  ]);
  const custom = validateHomeOrListPageBusinessRules(jsonLd);
  return { adobe, ajv: ajvResult, jsonldJs: jsonldJsResult, custom };
}

export async function validateModontyPageJsonLdComplete(
  jsonLd: object,
  _options?: { skipAdobe?: boolean }
): Promise<ModontyValidationReport> {
  const [adobe, ajvResult, jsonldJsResult] = await Promise.all([
    validateWithAdobe(jsonLd),
    Promise.resolve(validateWithAjv(jsonLd)),
    validateWithJsonLdJs(jsonLd),
  ]);
  const custom = validateModontyPageBusinessRules(jsonLd);
  return { adobe, ajv: ajvResult, jsonldJs: jsonldJsResult, custom };
}

const META_REQUIRED_KEYS = [
  "title",
  "description",
  "canonical",
  "robots",
  "openGraph",
  "twitter",
  "hreflang",
] as const;

export interface MetaValidationReport {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateMetaTags(meta: unknown): MetaValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (meta == null || typeof meta !== "object") {
    return { valid: false, errors: ["Meta tags must be an object"], warnings: [] };
  }
  const obj = meta as Record<string, unknown>;
  for (const key of META_REQUIRED_KEYS) {
    if (!(key in obj)) {
      errors.push(`Missing required key: ${key}`);
    }
  }
  if (obj.openGraph != null && typeof obj.openGraph === "object") {
    const og = obj.openGraph as Record<string, unknown>;
    if (!("title" in og) || !("url" in og) || !("locale" in og)) {
      warnings.push("openGraph should have title, url, locale");
    }
  }
  if (obj.twitter != null && typeof obj.twitter === "object") {
    const tw = obj.twitter as Record<string, unknown>;
    if (!("card" in tw)) {
      warnings.push("twitter should have card");
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}
