// Shared SEO-score types — the contract every entity scorer (client now, article
// later) returns, so all surfaces render scores the same way. Keep this generic:
// it must NOT depend on any app (@/...) — only plain types.

export type SeoCheckStatus = "good" | "warning" | "error";

export interface SeoCheck {
  /** Stable key (e.g. "title", "ogImage", "jsonld.valid"). */
  key: string;
  /** Human label (Arabic) shown to the user. */
  label: string;
  status: SeoCheckStatus;
  /** Short why/fix hint (Arabic), shown on warning/error. */
  hint?: string;
  /** Points earned vs possible for this check (for transparency). */
  earned: number;
  max: number;
}

export interface SeoScore {
  /** 0–100, rounded. */
  score: number;
  checks: SeoCheck[];
}

/** A full entity SEO breakdown: independent validity scores + an overall. */
export interface EntitySeoScore {
  meta: SeoScore;
  jsonLd: SeoScore;
  /**
   * Internal linking. Present for ARTICLES only — a client page has no "related articles"
   * concept, so its breakdown stays two-dimensional and this stays undefined.
   */
  links?: SeoScore;
  /** Overall — see each scorer for its weighting; absent dimensions are not counted. */
  overall: number;
}

/** Shape of the stored JSON-LD validation report (Adobe + Ajv + custom rules). */
export interface JsonLdValidationReport {
  adobe?: { valid?: boolean; errors?: unknown[]; warnings?: unknown[] } | null;
  ajv?: { valid?: boolean; errors?: unknown[]; warnings?: unknown[] } | null;
  custom?: { valid?: boolean; errors?: unknown[]; warnings?: unknown[] } | null;
  /** Explicitly false when no validator ran — the row holds an attempt, not a measurement. */
  checked?: boolean;
  /** Why no validator ran, when `checked` is false. */
  uncheckedReason?: string;
}

/**
 * Did a validator actually run and leave its output here?
 *
 * A stored object is NOT proof of a measurement. Category, tag and industry rows spent
 * months holding a literal `{ valid: true, generatedAt }` written by their generators with
 * no validator behind it — zero `errors` arrays, so every counter below returned 0 and the
 * dashboard read «سليم» over data nothing had inspected. Those rows are still in the
 * database until each entity is regenerated, so the guard lives here rather than in the
 * writers: a report earns its score only by carrying a validator section.
 */
export function hasValidatorOutput(report: JsonLdValidationReport | null | undefined): boolean {
  if (!report) return false;
  if (report.checked === false) return false;
  const isSection = (s: unknown) => typeof s === "object" && s !== null;
  return isSection(report.adobe) || isSection(report.ajv) || isSection(report.custom);
}

/** Count total hard errors across all validators in a report. */
export function countReportErrors(report: JsonLdValidationReport | null | undefined): number {
  if (!report) return 0;
  const len = (e: unknown) => (Array.isArray(e) ? e.length : 0);
  return len(report.adobe?.errors) + len(report.ajv?.errors) + len(report.custom?.errors);
}

/** Count total warnings across all validators in a report. */
export function countReportWarnings(report: JsonLdValidationReport | null | undefined): number {
  if (!report) return 0;
  const len = (w: unknown) => (Array.isArray(w) ? w.length : 0);
  return len(report.adobe?.warnings) + len(report.ajv?.warnings) + len(report.custom?.warnings);
}

// ── The robots directive: three states, never two ──────────────────────────────

/** What the stored metadata says about indexing. `unknown` = nothing was stored to read. */
export type RobotsState = "index" | "noindex" | "unknown";

/**
 * Read the indexing directive out of a stored Next.js `Metadata.robots` field.
 *
 * BOTH documented shapes are real in this repo and must be read, not guessed at:
 *   · a plain directive string — `robots: "noindex, follow"`
 *     (generate-client-seo-bundle.ts:259, the *-seo-generator.ts family)
 *   · the `Robots` OBJECT — `{ index, follow, googleBot: { index, follow, ... } }`
 *     (admin/lib/seo/metadata-generator.ts:315, shared/lib/seo/build-content-page-metadata.ts:96,
 *      build-listing-page-metadata.ts:103). Next.js 16.2.9 types it as
 *      `Robots = RobotsInfo & { googleBot?: string | RobotsInfo }`.
 *
 * The scorer used to collapse the object form to the literal string "object", which then
 * failed a `/noindex/` test and scored 3/3 — a page Google drops entirely read as perfect.
 * A placeholder is not a reading: anything unrecognised returns `unknown` so the caller
 * shows «غير مقيس» instead of inventing a pass.
 */
export function readRobotsState(robots: unknown): RobotsState {
  if (typeof robots === "string") {
    const v = robots.trim().toLowerCase();
    if (!v) return "unknown";
    return /\bnoindex\b|\bnone\b/.test(v) ? "noindex" : "index";
  }
  if (typeof robots === "object" && robots !== null && !Array.isArray(robots)) {
    const r = robots as { index?: unknown; googleBot?: unknown };
    // Two directives are emitted: the generic one and Googlebot's. Either saying noindex
    // takes the page out of Google's results, so either one is enough to answer "blocked".
    const gb = r.googleBot;
    let googleBotIndex: unknown = undefined;
    if (typeof gb === "string") {
      const state = readRobotsState(gb);
      // An empty googleBot string is not a permission — it stays unread.
      if (state !== "unknown") googleBotIndex = state === "index";
    } else if (typeof gb === "object" && gb !== null) {
      googleBotIndex = (gb as { index?: unknown }).index;
    }
    const flags = [r.index, googleBotIndex];
    if (flags.some((f) => f === false)) return "noindex";
    if (flags.some((f) => f === true)) return "index";
    return "unknown";
  }
  return "unknown";
}

/**
 * Is the stored page blocked from Google's index?
 *
 * Google, "Block Search indexing with noindex": «Google will drop that page entirely from
 * Google Search results, regardless of whether other sites link to it.»
 * https://developers.google.com/search/docs/crawling-indexing/block-indexing
 *
 * A page Google drops entirely has no search performance to score, so every scorer zeroes
 * its number here rather than handing a blocked page a passing grade. The checklist still
 * renders in full, so the reader sees both the block and everything else about the page.
 */
export function isBlockedFromIndex(nextjsMetadata: unknown): boolean {
  if (typeof nextjsMetadata !== "object" || nextjsMetadata === null) return false;
  return readRobotsState((nextjsMetadata as { robots?: unknown }).robots) === "noindex";
}

/**
 * The canonical URL out of stored metadata, in every shape Next.js 16 allows.
 *
 * `AlternateURLs.canonical` is typed `null | string | URL | AlternateLinkDescriptor`, and
 * the RESOLVED form Next.js hands back is always the object (`ResolvedAlternateURLs.canonical:
 * null | AlternateLinkDescriptor`). Reading only the string shape reported "no canonical" on
 * a page that had one — a false alarm, and the kind that sends someone fixing what is fine.
 */
export function readCanonicalUrl(meta: unknown): string {
  if (typeof meta !== "object" || meta === null) return "";
  const m = meta as { canonical?: unknown; alternates?: { canonical?: unknown } | null };
  const pick = (v: unknown): string => {
    if (typeof v === "string") return v.trim();
    if (v instanceof URL) return v.href;
    if (typeof v === "object" && v !== null) {
      const url = (v as { url?: unknown }).url;
      if (typeof url === "string") return url.trim();
      if (url instanceof URL) return url.href;
    }
    return "";
  };
  return pick(m.canonical) || pick(m.alternates?.canonical);
}
