

interface AuditIssue {
  code: string;
  category: "content" | "seo" | "media" | "structured-data" | "eeat";
  message: string;
  fix?: string;
  field?: string;
}

interface ClientForCompliance {
  // Legacy scattered fields (Phase 4 will remove). Kept for fallback during migration.
  forbiddenKeywords?: string[] | null;
  forbiddenClaims?: string[] | null;
  // Unified intake JSON (new source of truth) — typed as unknown because Prisma returns JsonValue.
  intake?: unknown;
}

/** Safely read string[] from intake.policy.<key> JSON value. */
function readPolicyArray(intake: unknown, key: "forbiddenKeywords" | "forbiddenClaims"): string[] | null {
  if (!intake || typeof intake !== "object") return null;
  const policy = (intake as Record<string, unknown>).policy;
  if (!policy || typeof policy !== "object") return null;
  const arr = (policy as Record<string, unknown>)[key];
  if (!Array.isArray(arr)) return null;
  return arr.filter((x): x is string => typeof x === "string");
}

/** Resolve forbidden keywords from intake first, fallback to legacy field. */
function resolveForbiddenKeywords(client: ClientForCompliance | null | undefined): string[] {
  if (!client) return [];
  return readPolicyArray(client.intake, "forbiddenKeywords") ?? client.forbiddenKeywords ?? [];
}

/** Resolve forbidden claims from intake first, fallback to legacy field. */
function resolveForbiddenClaims(client: ClientForCompliance | null | undefined): string[] {
  if (!client) return [];
  return readPolicyArray(client.intake, "forbiddenClaims") ?? client.forbiddenClaims ?? [];
}

// Arabic diacritics (tashkeel) + tatweel — stripped so "رَخِيص" still matches "رخيص".
const ARABIC_DIACRITICS = /[ً-ْٰـ]/g;

function stripDiacritics(s: string): string {
  return s.replace(ARABIC_DIACRITICS, "");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Separable Arabic proclitics (و ف ب ك ل) + definite article (ال) and combos — longest first.
const PROCLITIC = "(?:وال|فال|بال|كال|ولل|فلل|لل|ال|و|ف|ب|ك|ل)?";
// Common inflectional/possessive enclitics — longest first.
const ENCLITIC = "(?:كما|هما|هم|هن|كم|كن|ها|نا|ين|ون|ات|ان|ة|ه|ك|ي|ا)?";

// Whole-word match: keyword must NOT be embedded inside another word.
// "رخيص" matches "رخيص" / "الرخيص" / "رخيصة" but NOT "ترخيص" / "وترخيصه".
// Allows Arabic clitics around the word; works for Latin keywords too (boundary only).
function buildKeywordRegex(keyword: string): RegExp | null {
  const kw = stripDiacritics(keyword).trim();
  if (!kw) return null;
  // Escape, then treat any internal whitespace as flexible (\s+) for multi-word phrases.
  const core = escapeRegex(kw).replace(/ +/g, "\\s+");
  return new RegExp(
    `(?<![\\p{L}\\p{M}\\p{N}])${PROCLITIC}${core}${ENCLITIC}(?![\\p{L}\\p{M}\\p{N}])`,
    "iu"
  );
}

function scanForbidden(
  text: string,
  list: string[]
): string[] {
  if (!text?.trim() || !list?.length) return [];
  const normText = stripDiacritics(text);
  const found: string[] = [];
  for (const item of list) {
    const re = buildKeywordRegex(item);
    if (!re) continue;
    if (re.test(normText)) found.push(item);
  }
  return found;
}

/**
 * Compliance-only check for forbidden keywords/claims.
 * Use before publishing when you have form data but not a full article.
 */
export function checkCompliance(
  data: {
    title?: string | null;
    content?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    excerpt?: string | null;
  },
  client: ClientForCompliance | null | undefined
): { blocked: boolean; issues: AuditIssue[] } {
  const issues: AuditIssue[] = [];
  if (!client) return { blocked: false, issues };

  const texts = [
    data.title ?? "",
    data.content ?? "",
    data.seoTitle ?? "",
    data.seoDescription ?? "",
    data.excerpt ?? "",
  ].join(" ");

  // Resolve from intake.policy first, fallback to legacy fields.
  const resolvedKeywords = resolveForbiddenKeywords(client);
  const resolvedClaims = resolveForbiddenClaims(client);

  if (resolvedKeywords.length) {
    const found = scanForbidden(texts, resolvedKeywords);
    for (const kw of found) {
      issues.push({
        code: "FORBIDDEN_KEYWORD",
        category: "content",
        message: `المحتوى يحتوي على كلمة ممنوعة: "${kw}"`,
        fix: "أزل الكلمة الممنوعة أو استبدلها",
      });
    }
  }

  if (resolvedClaims.length) {
    const found = scanForbidden(texts, resolvedClaims);
    for (const claim of found) {
      issues.push({
        code: "FORBIDDEN_CLAIM",
        category: "content",
        message: `المحتوى يحتوي على ادعاء ممنوع: "${claim}"`,
        fix: "أزل الادعاء الممنوع أو استبدله",
      });
    }
  }

  return { blocked: issues.length > 0, issues };
}
