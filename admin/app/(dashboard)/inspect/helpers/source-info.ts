import type { InspectPayload } from "./constants";
import { isDescOk, isTitleOk, META_DESCRIPTION, META_TITLE } from "./seo-rules";

export function countJsonNodes(value: unknown): number {
  if (value === null || typeof value !== "object") return 0;
  let n = 1;
  for (const v of Object.values(value)) {
    if (v !== null && typeof v === "object") n += countJsonNodes(v);
  }
  return n;
}

export function countNodesFromJsonString(str: string): number {
  try {
    return countJsonNodes(JSON.parse(str));
  } catch {
    return 0;
  }
}

function findItemListCount(obj: unknown): number | null {
  if (obj === null || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  if (o["mainEntity"] && typeof o["mainEntity"] === "object") {
    const me = o["mainEntity"] as Record<string, unknown>;
    if (typeof me["numberOfItems"] === "number") return me["numberOfItems"];
    const arr = me["itemListElement"];
    if (Array.isArray(arr)) return arr.length;
  }
  const graph = o["@graph"];
  if (Array.isArray(graph)) {
    for (const node of graph) {
      const n = findItemListCount(node);
      if (n != null) return n;
    }
  }
  return null;
}

/** Returns [numberOfItems, actualLength] or null */
function findItemListConsistency(obj: unknown): { declared: number; actual: number } | null {
  if (obj === null || typeof obj !== "object") return null;
  const graph = (obj as Record<string, unknown>)?.["@graph"];
  if (!Array.isArray(graph)) return null;
  for (const node of graph) {
    const n = node as Record<string, unknown>;
    if (n["@type"] !== "CollectionPage") continue;
    const main = n.mainEntity as Record<string, unknown> | undefined;
    if (!main) continue;
    const declared = typeof main["numberOfItems"] === "number" ? main["numberOfItems"] : null;
    const arr = main["itemListElement"];
    const actual = Array.isArray(arr) ? arr.length : 0;
    if (declared != null && actual > 0) return { declared, actual };
  }
  return null;
}

export function getItemListCountFromJson(str: string): number | null {
  try {
    return findItemListCount(JSON.parse(str));
  } catch {
    return null;
  }
}

export type SeoInsightType = "jsonld" | "meta" | "unknown";

export interface SeoInsights {
  type: SeoInsightType;
  /** Rule ranges used for checks (from seo-rules.ts) */
  rules?: {
    titleRange: string;
    descRange: string;
  };
  jsonld?: {
    schemaTypes: string[];
    primaryUrl: string | null;
    languages: string[];
    graphCount: number;
    mainItemType: string | null;
    /** numberOfItems matches itemListElement.length */
    itemCountOk: boolean | null;
  };
  meta?: {
    titleLength: number;
    titleOk: boolean;
    descLength: number;
    descOk: boolean;
    robots: string | null;
  };
}

function collectSchemaTypes(obj: unknown, out: Set<string>): void {
  if (obj === null || typeof obj !== "object") return;
  const o = obj as Record<string, unknown>;
  const t = o["@type"];
  if (typeof t === "string") out.add(t);
  if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && out.add(x));
  for (const v of Object.values(o)) collectSchemaTypes(v, out);
}

function collectLanguages(obj: unknown, out: Set<string>): void {
  if (obj === null || typeof obj !== "object") return;
  const o = obj as Record<string, unknown>;
  const lang = o["inLanguage"];
  if (typeof lang === "string") out.add(lang);
  if (Array.isArray(lang)) lang.forEach((x) => typeof x === "string" && out.add(x));
  for (const v of Object.values(o)) collectLanguages(v, out);
}

function getMainItemType(obj: unknown): string | null {
  const graph = (obj as Record<string, unknown>)?.["@graph"];
  if (!Array.isArray(graph)) return null;
  const collection = graph.find((n) => (n as Record<string, unknown>)?.["@type"] === "CollectionPage") as Record<string, unknown> | undefined;
  if (!collection) return null;
  const main = collection.mainEntity as Record<string, unknown> | undefined;
  const items = main?.itemListElement;
  if (!Array.isArray(items) || items.length === 0) return null;
  const first = items[0] as Record<string, unknown> | undefined;
  const item = first?.item as Record<string, unknown> | undefined;
  const t = item?.["@type"];
  return typeof t === "string" ? t : null;
}

export function extractSeoInsights(content: string): SeoInsights {
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    if (parsed["@context"] && Array.isArray(parsed["@graph"])) {
      const graph = parsed["@graph"];
      const schemaTypes = new Set<string>();
      const languages = new Set<string>();
      collectSchemaTypes(parsed, schemaTypes);
      collectLanguages(parsed, languages);
      let primaryUrl: string | null = null;
      if (Array.isArray(graph)) {
        const cp = graph.find((n) => (n as Record<string, unknown>)?.["@type"] === "CollectionPage") as Record<string, unknown> | undefined;
        const ws = graph.find((n) => (n as Record<string, unknown>)?.["@type"] === "WebSite") as Record<string, unknown> | undefined;
        primaryUrl = (cp?.url ?? ws?.url ?? null) as string | null;
      }
      const consistency = findItemListConsistency(parsed);
      const itemCountOk = consistency
        ? consistency.declared === consistency.actual
        : null;

      return {
        type: "jsonld",
        rules: {
          titleRange: `${META_TITLE.MIN}–${META_TITLE.MAX} chars`,
          descRange: `${META_DESCRIPTION.MIN}–${META_DESCRIPTION.MAX} chars`,
        },
        jsonld: {
          schemaTypes: [...schemaTypes].filter(Boolean).sort(),
          primaryUrl,
          languages: [...languages].filter(Boolean).sort(),
          graphCount: Array.isArray(graph) ? graph.length : 0,
          mainItemType: getMainItemType(parsed),
          itemCountOk,
        },
      };
    }
    if (typeof parsed.title === "string" || typeof parsed.description === "string") {
      const title = String(parsed.title ?? "").trim();
      const desc = String(parsed.description ?? "").trim();
      return {
        type: "meta",
        rules: {
          titleRange: `${META_TITLE.MIN}–${META_TITLE.MAX} chars`,
          descRange: `${META_DESCRIPTION.MIN}–${META_DESCRIPTION.MAX} chars`,
        },
        meta: {
          titleLength: title.length,
          titleOk: isTitleOk(title.length),
          descLength: desc.length,
          descOk: isDescOk(desc.length),
          robots: typeof parsed.robots === "string" ? parsed.robots : null,
        },
      };
    }
  } catch {
    /* ignore */
  }
  return { type: "unknown" };
}

export interface SourceInfo {
  label: string;
  field: string | null;
  feeds: string;
  originPath: string;
}

export function buildSourceInfoFromPayload(payload: InspectPayload): SourceInfo {
  return {
    originPath: payload.source,
    label: payload.sourceType === "saved" ? "Saved" : "Preview (unsaved)",
    field: payload.field ?? null,
    feeds: payload.description ?? "—",
  };
}
