import "server-only";
import type {
  ValidationCheck,
  ValidationResult,
  ValidationStatus,
} from "./article-validator";
import type { ValidationReport } from "./jsonld-validator";
import type { Prisma } from "@prisma/client";

// Google's ONLY quantitative requirement for Article rich results
const MIN_IMAGE_PIXELS = 50_000;

export interface DbArticleInput {
  id: string;
  slug: string;
  title: string;
  url: string;
  status: string;
  content: string;
  excerpt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  wordCount: number | null;
  articleBodyText: string | null;
  canonicalUrl: string | null;
  datePublished: Date | null;
  dateModified: Date | null;
  scheduledAt: Date | null;
  jsonLdStructuredData: string | null;
  jsonLdLastGenerated: Date | null;
  jsonLdValidationReport: Prisma.JsonValue | null;
  nextjsMetadata: Prisma.JsonValue | null;
  nextjsMetadataLastGenerated: Date | null;
  featuredImageId: string | null;
  featuredImage: {
    altText: string | null;
    width: number | null;
    height: number | null;
  } | null;
  author: { name: string | null } | null;
  client: {
    name: string | null;
    logoMedia: {
      url: string | null;
      width: number | null;
      height: number | null;
    } | null;
  } | null;
}

/**
 * Pre-publish validator — Google-strict 100% (no inventions, no third-party SEO blogs).
 * Every check has an explicit citation in `documents/tasks/QUALITY-GATE-AUDIT-2026-05-04.md`.
 *
 * What we do NOT enforce (Google explicitly says these aren't requirements):
 * - title length min/max          — "no limit" (Google Title Link docs)
 * - meta-description length       — "no limit" (Google Snippet docs)
 * - excerpt length                — invented (no source)
 * - word count minimum            — "we don't have a preferred word count" (Helpful Content)
 * - internal links count          — "no magical ideal number" (Links Crawlable docs)
 * - jsonld warnings = 0           — "warnings don't prevent rich results" (Article docs)
 * - jsonld-breadcrumb             — separate rich result, not required for Article
 *
 * All checks read from DB (no live URL needed). Used as the gate before
 * DRAFT → AWAITING_APPROVAL transition.
 */
export function validateArticleFromDb(article: DbArticleInput): ValidationResult {
  const checks: ValidationCheck[] = [];

  // ═══ Group 1: Google Indexability ═══
  pushStatusCheck(checks, article);
  pushSlugCheck(checks, article);

  // ═══ Group 2: Content ═══
  // NOTE: title-length, meta-description-length, word-count, excerpt-length are
  // NOT enforced — Google explicitly states "no length/count requirements".
  // We only keep the internal cache check (architecture concern, not Google).
  pushArticleBodyTextCheck(checks, article);

  // ═══ Group 3: Author + Publisher (E-E-A-T basic) ═══
  pushAuthorCheck(checks, article);
  pushPublisherCheck(checks, article);
  pushPublisherLogoCheck(checks, article);

  // ═══ Group 4: Images ═══
  pushFeaturedImageCheck(checks, article);
  pushFeaturedImageSizeCheck(checks, article);
  pushFeaturedImageAltCheck(checks, article);
  pushBodyImageAltCheck(checks, article);

  // ═══ Group 5: Internal Link quality (count NOT enforced — Google doesn't require it) ═══
  pushInternalLinksAnchorsCheck(checks, article);

  // ═══ Group 6: JSON-LD Schema ═══
  // NOTE removed checks (per Google official docs):
  // - jsonld-adobe-warnings: Google says warnings don't prevent rich results
  // - jsonld-breadcrumb: Recommended (separate rich result), not required for Article
  // Adobe ERRORS still block (they fail Article rich results).
  pushJsonLdCacheCheck(checks, article);
  pushJsonLdArticleCheck(checks, article);
  pushJsonLdAdobeErrorsCheck(checks, article);
  pushJsonLdCustomErrorsCheck(checks, article);
  pushJsonLdCacheFreshnessCheck(checks, article);

  // ═══ Group 7: Technical SEO ═══
  pushCanonicalCheck(checks, article);
  pushNextjsMetadataCacheCheck(checks, article);

  // ═══ Group 8: Dates ═══
  pushDatePublishedCheck(checks, article);
  pushDateModifiedCheck(checks, article);
  pushScheduledAtCheck(checks, article);

  return finalize(article, checks);
}

// ═══ Group 1: Indexability ═══

function pushStatusCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const ok = a.status === "DRAFT" || a.status === "AWAITING_APPROVAL" || a.status === "SCHEDULED" || a.status === "PUBLISHED";
  checks.push({
    id: "status-indexable",
    label: "Article status is publishable",
    severity: "critical",
    passed: ok,
    detail: ok ? undefined : `The article's status (${a.status}) can't be published yet`,
    fix: ok ? undefined : "Move article through normal workflow stages before publishing.",
  });
}

function pushSlugCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const slug = a.slug?.trim() ?? "";
  const ok = slug.length > 0 && /^[\p{L}\p{N}\-_/]+$/u.test(slug);
  checks.push({
    id: "slug-valid",
    label: "URL slug is valid",
    severity: "critical",
    passed: ok,
    detail: !slug
      ? "The article's URL (slug) is empty"
      : !ok
        ? `The article's URL contains invalid characters: ${slug}`
        : undefined,
    fix: ok ? undefined : "Edit slug — use Arabic letters, numbers, hyphens or underscores only.",
  });
}

// ═══ Group 2: Content ═══
// (title-length, meta-description, excerpt, word-count REMOVED — Google explicitly
//  states no length/count requirements. See QUALITY-GATE-AUDIT-2026-05-04.md.)

function pushArticleBodyTextCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const ok = !!a.articleBodyText && a.articleBodyText.trim().length >= 100;
  checks.push({
    id: "article-body-text",
    label: "Plain-text body cache populated",
    severity: "medium",
    passed: ok,
    detail: ok ? undefined : "The article's text hasn't been saved to cache yet",
    fix: ok ? undefined : "Auto-fix: re-save the article — system regenerates the plain-text cache.",
  });
}

// ═══ Group 3: Author + Publisher ═══

function pushAuthorCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const ok = !!a.author?.name?.trim();
  checks.push({
    id: "author-present",
    label: "Author assigned with name",
    severity: "critical",
    passed: ok,
    detail: ok ? undefined : "No author is assigned to this article",
    fix: ok ? undefined : "Assign an author in Article editor → Basic tab → Author field.",
  });
}

function pushPublisherCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const ok = !!a.client?.name?.trim();
  checks.push({
    id: "publisher-present",
    label: "Publisher (Client) assigned",
    severity: "critical",
    passed: ok,
    detail: ok ? undefined : "This article isn't linked to a client",
    fix: ok ? undefined : "Assign a client in Article editor → Basic tab → Client field.",
  });
}

function pushPublisherLogoCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const logo = a.client?.logoMedia;
  const hasUrl = !!logo?.url;
  const hasDims = !!(logo?.width && logo?.height);
  const ok = hasUrl && hasDims;
  checks.push({
    id: "publisher-logo",
    label: "Publisher logo present with dimensions",
    severity: "high",
    passed: ok,
    detail: !hasUrl
      ? "The client has no logo"
      : !hasDims
        ? "The client's logo is missing its width/height"
        : undefined,
    fix: ok
      ? undefined
      : !hasUrl
        ? "Open the client's profile and upload a logo — required for Article rich results."
        : "Logo is missing dimensions — re-upload via Media library to capture width/height.",
  });
}

// ═══ Group 4: Images ═══

function pushFeaturedImageCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const ok = !!a.featuredImageId && !!a.featuredImage;
  checks.push({
    id: "featured-image",
    label: "Featured image set",
    severity: "high",
    passed: ok,
    detail: ok ? undefined : "This article has no featured image",
    fix: ok ? undefined : "Add a featured image in Article editor → Media tab → Featured Image.",
  });
}

function pushFeaturedImageSizeCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const fi = a.featuredImage;
  const w = fi?.width ?? 0;
  const h = fi?.height ?? 0;
  const pixels = w * h;
  const ok = !a.featuredImageId || pixels >= MIN_IMAGE_PIXELS;
  checks.push({
    id: "featured-image-size",
    label: "Featured image ≥ 50,000 pixels (Google requirement)",
    severity: "high",
    passed: ok,
    detail: ok ? undefined : `The featured image is too small: ${w}×${h} (needs at least 50,000 pixels)`,
    fix: ok ? undefined : "Replace with a higher-resolution image. Recommended: ≥1200×675 (16:9).",
  });
}

function pushFeaturedImageAltCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const alt = a.featuredImage?.altText?.trim() ?? "";
  const ok = !a.featuredImageId || alt.length > 0;
  checks.push({
    id: "featured-image-alt",
    label: "Featured image has alt text",
    severity: "high",
    passed: ok,
    detail: ok ? undefined : "The featured image has no alt text",
    fix: ok ? undefined : "Edit the image in Media library and add descriptive alt text.",
  });
}

function pushBodyImageAltCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const images = extractImagesFromContent(a.content);
  const missing = images.filter((i) => !i.alt.trim());
  const ok = missing.length === 0;
  checks.push({
    id: "body-image-alt",
    label: `All body images have alt text (${images.length} found)`,
    severity: "high",
    passed: ok,
    detail: ok ? undefined : `${missing.length} of ${images.length} images in the article have no alt text`,
    fix: ok
      ? undefined
      : "Edit each body image in the article — set descriptive alt text in Media library.",
  });
}

// ═══ Group 5: Internal Link quality ═══

function pushInternalLinksAnchorsCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const links = extractLinksFromContent(a.content);
  const internal = links.filter((l) => isInternalHref(l.href));
  const generic = ["click here", "here", "read more", "اضغط هنا", "هنا", "اقرأ المزيد", "المزيد"];
  const bad = internal.filter((l) =>
    generic.some((g) => l.text.trim().toLowerCase() === g.toLowerCase()),
  );
  const ok = bad.length === 0;
  checks.push({
    id: "internal-links-anchors",
    label: "Descriptive anchor text",
    severity: "medium",
    passed: ok,
    detail: ok ? undefined : `${bad.length} internal link${bad.length === 1 ? "" : "s"} use vague text (e.g. "${bad[0]?.text}")`,
    fix: ok ? undefined : 'Replace generic anchors ("اضغط هنا", "click here") with descriptive keywords.',
  });
}

// ═══ Group 6: JSON-LD ═══

function pushJsonLdCacheCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const ok = !!a.jsonLdStructuredData;
  checks.push({
    id: "jsonld-cache",
    label: "JSON-LD cache populated",
    severity: "high",
    passed: ok,
    detail: ok ? undefined : "Search-engine data hasn't been generated for this article yet",
    fix: ok ? undefined : "Auto-fix: open Search Console → Auto-fix schema, OR re-save the article.",
  });
}

function pushJsonLdArticleCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const { hasArticle } = parseJsonLdTypes(a.jsonLdStructuredData);
  checks.push({
    id: "jsonld-article",
    label: "JSON-LD contains Article type",
    severity: "high",
    passed: hasArticle,
    detail: hasArticle ? undefined : "The search-engine data is missing the Article type",
    fix: hasArticle ? undefined : "Auto-fix: regenerate JSON-LD via Search Console pipeline.",
  });
}

// (jsonld-breadcrumb REMOVED — Google: BreadcrumbList is a SEPARATE rich result,
//  not required for Article rich result. See QUALITY-GATE-AUDIT-2026-05-04.md.)

function pushJsonLdAdobeErrorsCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const report = parseValidationReport(a.jsonLdValidationReport);
  const rawErrors = (report?.adobe?.errors ?? []) as unknown[];
  // Adobe entries may be strings or objects ({message}) — normalize, then drop any
  // error a clearer dedicated check already reports (no duplicate messages).
  const remaining = rawErrors
    .map((e) =>
      typeof e === "string" ? e : (e as { message?: string })?.message ?? "Invalid structured data",
    )
    .filter((msg) => !isCoveredByDedicatedCheck(msg, checks));
  const ok = remaining.length === 0;
  const messages = remaining.map(humanizeSchemaError);
  checks.push({
    id: "jsonld-adobe-errors",
    label: "Search-engine data passes the official validator",
    severity: "critical",
    passed: ok,
    detail: ok ? undefined : messages.join(" · "),
    fix: ok
      ? undefined
      : "Usually a missing client detail (logo, business type) or a stale schema. Fix the client's profile, then re-save the article or run Auto-fix schema.",
  });
}

// (jsonld-adobe-warnings REMOVED — Google: "warnings don't prevent rich results"
//  See QUALITY-GATE-AUDIT-2026-05-04.md.)

function pushJsonLdCustomErrorsCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const report = parseValidationReport(a.jsonLdValidationReport);
  const rawErrors = (report?.custom?.errors ?? []) as string[];
  // Drop any error a clearer dedicated check already reports (no duplicates).
  const remaining = rawErrors.filter((msg) => !isCoveredByDedicatedCheck(msg, checks));
  const ok = remaining.length === 0;
  checks.push({
    id: "jsonld-custom-errors",
    label: "Search-engine data passes Modonty's content rules",
    severity: "high",
    passed: ok,
    // Plain-language reason(s) — not the raw schema jargon.
    detail: ok ? undefined : remaining.map(humanizeSchemaError).join(" · "),
    fix: ok
      ? undefined
      : "Most of these come from the client's profile (business type, logo, details). Fix them there, then re-save the article or run Auto-fix schema.",
  });
}

function pushJsonLdCacheFreshnessCheck(checks: ValidationCheck[], a: DbArticleInput) {
  if (!a.jsonLdLastGenerated || !a.dateModified) {
    checks.push({
      id: "jsonld-cache-fresh",
      label: "JSON-LD cache up to date",
      severity: "high",
      passed: false,
      detail: "Search-engine data hasn't been generated yet",
      fix: "Auto-fix: open Search Console → Auto-fix schema OR re-save the article.",
    });
    return;
  }
  // Tolerance window for the Prisma @updatedAt race: when regenerateJsonLd writes
  // jsonLdLastGenerated, dateModified is auto-bumped a few ms later by the same write.
  // Anything within 60s of jsonLdLastGenerated is considered the same regen cycle.
  const TOLERANCE_MS = 60_000;
  const drift = a.dateModified.getTime() - a.jsonLdLastGenerated.getTime();
  const ok = drift <= TOLERANCE_MS;
  checks.push({
    id: "jsonld-cache-fresh",
    label: "JSON-LD cache up to date",
    severity: "high",
    passed: ok,
    detail: ok ? undefined : "The article changed after its search-engine data was generated — it's now out of date",
    fix: ok ? undefined : "Auto-fix: re-save the article OR run Auto-fix schema in Search Console.",
  });
}

// ═══ Group 7: Technical SEO ═══

function pushCanonicalCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const ok = !a.canonicalUrl || sameHost(a.canonicalUrl, a.url);
  checks.push({
    id: "canonical",
    label: "Canonical URL is valid (or auto-generated)",
    severity: "critical",
    passed: ok,
    detail: ok
      ? undefined
      : `The article's canonical link points to a different site (${a.canonicalUrl})`,
    fix: ok
      ? undefined
      : "Edit Article SEO tab → clear canonicalUrl OR set it to match the article URL exactly.",
  });
}

function pushNextjsMetadataCacheCheck(checks: ValidationCheck[], a: DbArticleInput) {
  const ok = !!a.nextjsMetadata && !!a.nextjsMetadataLastGenerated;
  checks.push({
    id: "nextjs-metadata",
    label: "Next.js metadata cache populated",
    severity: "medium",
    passed: ok,
    detail: ok ? undefined : "The page's metadata hasn't been generated yet",
    fix: ok ? undefined : "Auto-fix: re-save the article — system regenerates metadata cache.",
  });
}

// ═══ Group 8: Dates ═══

function pushDatePublishedCheck(checks: ValidationCheck[], a: DbArticleInput) {
  // Required only when transitioning to PUBLISHED. Pre-publish, pass if not yet published.
  const isPublished = a.status === "PUBLISHED";
  const ok = !isPublished || !!a.datePublished;
  checks.push({
    id: "date-published",
    label: "datePublished present (when published)",
    severity: "critical",
    passed: ok,
    detail: ok ? undefined : "The article is published but has no publish date",
    fix: ok ? undefined : "Set datePublished — usually auto-set on publish transition.",
  });
}

function pushDateModifiedCheck(checks: ValidationCheck[], a: DbArticleInput) {
  if (!a.dateModified) {
    checks.push({
      id: "date-modified",
      label: "dateModified ≥ datePublished",
      severity: "high",
      passed: false,
      detail: "The article has no 'last modified' date",
      fix: "Auto-fix: re-save the article.",
    });
    return;
  }
  if (!a.datePublished) {
    // No datePublished yet — pass (article isn't published)
    checks.push({
      id: "date-modified",
      label: "dateModified ≥ datePublished",
      severity: "high",
      passed: true,
    });
    return;
  }
  const ok = a.dateModified >= a.datePublished;
  checks.push({
    id: "date-modified",
    label: "dateModified ≥ datePublished",
    severity: "high",
    passed: ok,
    detail: ok ? undefined : "The article's 'last modified' date is before its publish date",
    fix: ok ? undefined : "Auto-fix: re-save the article to refresh dateModified.",
  });
}

function pushScheduledAtCheck(checks: ValidationCheck[], a: DbArticleInput) {
  if (a.status !== "SCHEDULED") {
    // Not applicable
    checks.push({
      id: "scheduled-at-future",
      label: "scheduledAt is in the future (when scheduled)",
      severity: "medium",
      passed: true,
    });
    return;
  }
  const ok = !!a.scheduledAt && a.scheduledAt > new Date();
  checks.push({
    id: "scheduled-at-future",
    label: "scheduledAt is in the future",
    severity: "medium",
    passed: ok,
    detail: ok ? undefined : "The article is scheduled, but its scheduled time is missing or already passed",
    fix: ok ? undefined : "Edit article → set a future date in Schedule field.",
  });
}

// ═══ Helpers ═══

function countWords(content: string): number {
  if (!content) return 0;
  const text = content
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(/\s+/).length : 0;
}

function extractImagesFromContent(html: string): { src: string; alt: string }[] {
  if (!html) return [];
  const out: { src: string; alt: string }[] = [];
  const matches = html.matchAll(/<img\b([^>]*)>/gi);
  for (const m of matches) {
    const attrs = m[1];
    const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/i);
    if (!srcMatch) continue;
    const src = srcMatch[1];
    if (/1x1|pixel/i.test(src)) continue;
    const altMatch = attrs.match(/\balt=["']([^"']*)["']/i);
    out.push({ src, alt: altMatch ? altMatch[1] : "" });
  }
  return out;
}

function extractLinksFromContent(html: string): { href: string; text: string }[] {
  if (!html) return [];
  const out: { href: string; text: string }[] = [];
  const matches = html.matchAll(/<a\b([^>]*?)>([\s\S]*?)<\/a>/gi);
  for (const m of matches) {
    const attrs = m[1];
    const inner = m[2];
    const hrefMatch = attrs.match(/\bhref=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    const href = hrefMatch[1];
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    const text = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    out.push({ href, text });
  }
  return out;
}

function isInternalHref(href: string): boolean {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  return /^https?:\/\/(www\.)?modonty\.com\b/i.test(href);
}

function sameHost(a: string, b: string): boolean {
  try {
    return new URL(a).host === new URL(b).host;
  } catch {
    return false;
  }
}

function parseJsonLdTypes(jsonLd: string | null): {
  hasArticle: boolean;
  hasBreadcrumb: boolean;
} {
  if (!jsonLd) return { hasArticle: false, hasBreadcrumb: false };
  let hasArticle = false;
  let hasBreadcrumb = false;
  const checkType = (type: string) => {
    if (type === "Article" || type === "NewsArticle" || type === "BlogPosting") hasArticle = true;
    if (type === "BreadcrumbList") hasBreadcrumb = true;
  };
  const walk = (node: unknown): void => {
    if (!node) return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    const t = obj["@type"];
    if (typeof t === "string") checkType(t);
    if (Array.isArray(t)) for (const sub of t) if (typeof sub === "string") checkType(sub);
    if (obj["@graph"]) walk(obj["@graph"]);
  };
  try {
    walk(JSON.parse(jsonLd));
  } catch {
    // malformed — both stay false
  }
  return { hasArticle, hasBreadcrumb };
}

/**
 * De-duplication. A schema-validator error is "covered" when a dedicated, clearer
 * data check already reports the same root cause (e.g. a missing client logo is
 * caught by the publisher-logo check). When covered, we suppress it on the schema
 * check so the admin sees ONE clear message — not the same problem twice in jargon.
 * Only suppresses against checks that ACTUALLY FAILED, so genuine schema/generation
 * problems (not explained by a missing field) still surface.
 */
function isCoveredByDedicatedCheck(raw: string, checks: ValidationCheck[]): boolean {
  const failed = (id: string) => checks.some((c) => c.id === id && !c.passed);
  const r = raw.toLowerCase();
  if (r.includes("logo") && failed("publisher-logo")) return true;
  if (r.includes("publisher reference") && failed("publisher-present")) return true;
  if (r.includes("author") && failed("author-present")) return true;
  if (r.includes("image") && failed("featured-image")) return true;
  if (
    (r.includes("missing article node") || r.includes("must contain @graph")) &&
    (failed("jsonld-cache") || failed("jsonld-article"))
  )
    return true;
  return false;
}

/**
 * Turn a raw schema-validator message (developer jargon) into a plain, actionable
 * sentence for the non-technical admin — and say WHERE to fix it.
 */
function humanizeSchemaError(raw: string): string {
  const map: Record<string, string> = {
    "Publisher Organization node not found in @graph":
      "The client's Organization Type is missing or invalid — open the client's profile and pick a valid Organization Type.",
    "Publisher logo missing (required for Article rich results)":
      "The client's logo is missing — upload it in the client's profile.",
    "Missing publisher reference in Article":
      "The article isn't linked to a client — assign one.",
    "Missing author reference in Article":
      "The article's author isn't set — assign an author.",
    "Author node not found in @graph (expected Person or Organization)":
      "The article's author isn't set correctly — re-assign the author.",
    "Author name missing": "The author has no name — set the author's name.",
    "Missing headline in Article": "The article title is missing.",
    "Missing Article node in @graph":
      "The search-engine data is malformed — re-generate it (Auto-fix schema or re-save).",
    "JSON-LD must contain @graph array":
      "The search-engine data is malformed — re-generate it (Auto-fix schema or re-save).",
  };
  if (map[raw]) return map[raw];
  // Ajv path-style / "must …" messages → generic, non-technical guidance.
  if (/^\//.test(raw) || /must (have|not|be)/i.test(raw)) {
    return "A required field is missing in the search-engine data — re-generate it (Auto-fix schema or re-save).";
  }
  return raw;
}

function parseValidationReport(value: Prisma.JsonValue | null): ValidationReport | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as unknown as ValidationReport;
}

function finalize(article: DbArticleInput, checks: ValidationCheck[]): ValidationResult {
  const failed = checks.filter((c) => !c.passed);
  const passedCount = checks.length - failed.length;
  const hasCritical = failed.some((c) => c.severity === "critical");
  const status: ValidationStatus = hasCritical
    ? "critical"
    : failed.length > 0
      ? "warnings"
      : "ready";
  return {
    url: article.url,
    articleId: article.id,
    slug: article.slug,
    title: article.title,
    status,
    fetchOk: true,
    fetchStatus: 0,
    passedCount,
    failedCount: failed.length,
    totalChecks: checks.length,
    checks,
    validatedAt: new Date().toISOString(),
  };
}
