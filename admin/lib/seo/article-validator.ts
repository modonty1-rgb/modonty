import "server-only";

export type CheckSeverity = "critical" | "high" | "medium";

export interface ValidationCheck {
  id: string;
  label: string;
  severity: CheckSeverity;
  passed: boolean;
  /** Short explanation of what's wrong. */
  detail?: string;
  /** Actionable instruction on how to fix. Shown when check fails. */
  fix?: string;
}

export type ValidationStatus = "ready" | "warnings" | "critical";

export interface ValidationResult {
  url: string;
  articleId: string;
  slug: string;
  title: string;
  status: ValidationStatus;
  fetchOk: boolean;
  fetchStatus: number;
  passedCount: number;
  failedCount: number;
  totalChecks: number;
  checks: ValidationCheck[];
  validatedAt: string;
}

interface InputArticle {
  id: string;
  slug: string;
  title: string;
  url: string;
}

interface ValidateOptions {
  /** Pre-fetched sitemap URLs — enables Stage 11 (Sitemap Inclusion) check. */
  sitemapEntries?: string[];
}

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESCRIPTION_MIN = 120;
const DESCRIPTION_MAX = 160;
const MIN_WORDS = 300;

export async function validateArticle(
  article: InputArticle,
  options: ValidateOptions = {},
): Promise<ValidationResult> {
  const checks: ValidationCheck[] = [];
  let html = "";
  let fetchStatus = 0;
  let fetchOk = false;
  let finalUrl = article.url;

  try {
    const res = await fetch(article.url, {
      cache: "no-store",
      redirect: "manual",
      headers: { "User-Agent": "Modonty-Admin-Validator/1.0" },
    });
    fetchStatus = res.status;
    finalUrl = res.url || article.url;

    if (res.status >= 300 && res.status < 400) {
      checks.push({
        id: "http-status",
        label: "HTTP 200 OK",
        severity: "critical",
        passed: false,
        detail: `Got HTTP ${res.status} (redirect). Direct 200 expected.`,
        fix: "Update the article slug in DB to match the live URL, OR remove the redirect rule causing the loop.",
      });
      checks.push({
        id: "no-redirect",
        label: "No redirect chain",
        severity: "critical",
        passed: false,
        detail: `URL redirects (${res.status}). Update DB slug to match the canonical URL.`,
        fix: "Open the article in admin → check the slug field matches the URL Google sees.",
      });
      return finalize(article, finalUrl, fetchOk, fetchStatus, checks);
    }

    if (res.status !== 200) {
      checks.push({
        id: "http-status",
        label: "HTTP 200 OK",
        severity: "critical",
        passed: false,
        detail: `Got HTTP ${res.status}. Page is not reachable.`,
        fix: "Visit the URL in browser. If 404, restore the article from archive or fix the slug. If 5xx, check server logs.",
      });
      return finalize(article, finalUrl, fetchOk, fetchStatus, checks);
    }

    fetchOk = true;
    html = await res.text();
  } catch (e) {
    checks.push({
      id: "http-status",
      label: "HTTP 200 OK",
      severity: "critical",
      passed: false,
      detail: e instanceof Error ? e.message : "Fetch failed",
      fix: "Check the site is online (visit homepage). If down, restart the modonty server or check Vercel deploy status.",
    });
    return finalize(article, finalUrl, fetchOk, fetchStatus, checks);
  }

  // From here we have html + 200 OK
  checks.push({
    id: "http-status",
    label: "HTTP 200 OK",
    severity: "critical",
    passed: true,
  });
  checks.push({
    id: "no-redirect",
    label: "No redirect chain",
    severity: "critical",
    passed: true,
  });

  // HTTPS
  const isHttps = article.url.startsWith("https://");
  checks.push({
    id: "https",
    label: "Served over HTTPS",
    severity: "critical",
    passed: isHttps,
    detail: isHttps ? undefined : "URL uses http:// — Google ranks HTTPS pages higher",
    fix: isHttps ? undefined : "Update NEXT_PUBLIC_SITE_URL env var to https://. Vercel auto-provides TLS for custom domains.",
  });

  // No noindex
  const robotsMeta = matchTag(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  const hasNoindex = robotsMeta ? /noindex/i.test(robotsMeta) : false;
  checks.push({
    id: "no-noindex",
    label: "No noindex meta tag",
    severity: "critical",
    passed: !hasNoindex,
    detail: hasNoindex ? `Found <meta name="robots" content="${robotsMeta}">` : undefined,
    fix: hasNoindex
      ? "Remove `<meta name=\"robots\" content=\"noindex\">` from the article template OR set `metadata.robots = { index: true }` in the page."
      : undefined,
  });

  // Document language — <html lang="ar">
  const htmlLang = matchTag(html, /<html\b[^>]*\blang=["']([^"']+)["']/i);
  const langOk = !!htmlLang && /^ar(-[A-Z]{2})?$/i.test(htmlLang);
  checks.push({
    id: "html-lang",
    label: "Document language declared (ar)",
    severity: "high",
    passed: langOk,
    detail: !htmlLang
      ? "Missing lang attribute on <html>"
      : !langOk
        ? `<html lang="${htmlLang}"> — expected "ar" or "ar-SA"`
        : undefined,
    fix: langOk
      ? undefined
      : "In modonty/app/layout.tsx → ensure `<html lang=\"ar\" dir=\"rtl\">` (Next.js root layout).",
  });

  // Viewport meta (mobile-friendliness signal)
  const viewport = matchTag(html, /<meta\s+name=["']viewport["']\s+content=["']([^"']+)["']/i);
  const viewportOk =
    !!viewport &&
    /width=device-width/i.test(viewport) &&
    !/user-scalable=no/i.test(viewport);
  checks.push({
    id: "viewport",
    label: "Mobile viewport meta tag",
    severity: "critical",
    passed: viewportOk,
    detail: !viewport
      ? "Missing <meta name=\"viewport\">"
      : !/width=device-width/i.test(viewport)
        ? `Viewport missing "width=device-width": ${viewport}`
        : /user-scalable=no/i.test(viewport)
          ? "user-scalable=no blocks zoom (accessibility/SEO issue)"
          : undefined,
    fix: viewportOk
      ? undefined
      : "Add to root layout metadata: `viewport: { width: \"device-width\", initialScale: 1 }`. Never set user-scalable=no.",
  });

  // Canonical
  const canonical = matchTag(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const canonicalMatches = canonical ? sameUrl(canonical, article.url) : false;
  checks.push({
    id: "canonical",
    label: "Canonical present and self-referential",
    severity: "critical",
    passed: !!canonical && canonicalMatches,
    detail: !canonical
      ? "No <link rel=\"canonical\"> found"
      : !canonicalMatches
        ? `Canonical points to ${canonical} (different from page URL)`
        : undefined,
    fix:
      !canonical || !canonicalMatches
        ? "In article page metadata: `alternates: { canonical: \"https://www.modonty.com/articles/[slug]\" }` matching the page URL exactly."
        : undefined,
  });

  // Title
  const titleText = matchTag(html, /<title[^>]*>([^<]+)<\/title>/i)?.trim();
  const titleLen = titleText ? titleText.length : 0;
  const titleOk = !!titleText && titleLen >= TITLE_MIN && titleLen <= TITLE_MAX;
  checks.push({
    id: "title",
    label: `Title length ${TITLE_MIN}-${TITLE_MAX} chars`,
    severity: "critical",
    passed: titleOk,
    detail: !titleText
      ? "No <title> tag"
      : titleLen < TITLE_MIN
        ? `Title is ${titleLen} chars (too short, min ${TITLE_MIN})`
        : titleLen > TITLE_MAX
          ? `Title is ${titleLen} chars (too long, max ${TITLE_MAX})`
          : undefined,
    fix: titleOk
      ? undefined
      : !titleText
        ? "Article must have a title — set it in admin → Article editor → Title field."
        : titleLen < TITLE_MIN
          ? `Edit article title in admin to be ${TITLE_MIN}-${TITLE_MAX} chars (currently ${titleLen}). Add 1-2 keywords or a benefit.`
          : `Shorten article title to ${TITLE_MAX} chars or less (currently ${titleLen}). Cut filler words; lead with the keyword.`,
  });

  // H1 — exactly one
  const h1Matches = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) ?? [];
  const h1Count = h1Matches.length;
  checks.push({
    id: "h1",
    label: "Exactly one H1",
    severity: "critical",
    passed: h1Count === 1,
    detail:
      h1Count === 0 ? "No <h1> found" : h1Count > 1 ? `Found ${h1Count} <h1> tags` : undefined,
    fix:
      h1Count === 0
        ? "The article template must render the title as <h1>. Check `modonty/app/articles/[slug]/page.tsx` — title should use <h1>."
        : h1Count > 1
          ? `Remove duplicate <h1> tags (found ${h1Count}). Only the article title is <h1>; subheadings are <h2>/<h3>.`
          : undefined,
  });

  // Meta description
  const metaDesc = matchTag(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  const descLen = metaDesc ? metaDesc.length : 0;
  const descOk = !!metaDesc && descLen >= DESCRIPTION_MIN && descLen <= DESCRIPTION_MAX;
  checks.push({
    id: "meta-description",
    label: `Meta description ${DESCRIPTION_MIN}-${DESCRIPTION_MAX} chars`,
    severity: "high",
    passed: descOk,
    detail: !metaDesc
      ? "No meta description"
      : descLen < DESCRIPTION_MIN
        ? `Description is ${descLen} chars (too short)`
        : descLen > DESCRIPTION_MAX
          ? `Description is ${descLen} chars (too long)`
          : undefined,
    fix: descOk
      ? undefined
      : !metaDesc
        ? "Set meta description in admin → Article editor → SEO tab → Meta Description field."
        : descLen < DESCRIPTION_MIN
          ? `Expand meta description to ${DESCRIPTION_MIN}-${DESCRIPTION_MAX} chars (currently ${descLen}). Include the main keyword + value prop.`
          : `Trim meta description to ${DESCRIPTION_MAX} chars or less (currently ${descLen}). Google truncates the rest.`,
  });

  // Word count (rough — strip tags then count whitespace-separated tokens)
  const text = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  checks.push({
    id: "word-count",
    label: `Word count ≥ ${MIN_WORDS}`,
    severity: "high",
    passed: wordCount >= MIN_WORDS,
    detail: wordCount < MIN_WORDS ? `Page has ${wordCount} words (thin content)` : undefined,
    fix:
      wordCount < MIN_WORDS
        ? `Add more content to the article body (currently ${wordCount}, target ≥ ${MIN_WORDS} words). Expand sections, add examples, or include a FAQ.`
        : undefined,
  });

  // hreflang
  const hreflangAr = /<link[^>]+hreflang=["']ar(?:-[A-Z]{2})?["']/i.test(html);
  const hreflangDefault = /<link[^>]+hreflang=["']x-default["']/i.test(html);
  checks.push({
    id: "hreflang",
    label: "hreflang ar + x-default",
    severity: "high",
    passed: hreflangAr && hreflangDefault,
    detail: !hreflangAr
      ? "Missing hreflang=\"ar\""
      : !hreflangDefault
        ? "Missing hreflang=\"x-default\""
        : undefined,
    fix:
      hreflangAr && hreflangDefault
        ? undefined
        : "In article metadata: `alternates: { languages: { 'ar': url, 'x-default': url } }` — both required for Arabic-first sites.",
  });

  // OG image
  const ogImage = matchTag(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  checks.push({
    id: "og-image",
    label: "OG image (og:image)",
    severity: "high",
    passed: !!ogImage,
    detail: !ogImage ? "Missing <meta property=\"og:image\">" : undefined,
    fix: ogImage
      ? undefined
      : "Add featured image to article (admin → Featured Image). Article metadata should include `openGraph.images: [{ url, width: 1200, height: 630 }]`.",
  });

  // Article JSON-LD — recursively walks @graph wrappers + arrays
  const jsonLdScripts = [
    ...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ];
  let articleSchema = false;
  let breadcrumbSchema = false;

  const checkType = (type: string) => {
    if (type === "Article" || type === "NewsArticle" || type === "BlogPosting") {
      articleSchema = true;
    }
    if (type === "BreadcrumbList") breadcrumbSchema = true;
  };

  const walkJsonLd = (node: unknown): void => {
    if (!node) return;
    if (Array.isArray(node)) {
      for (const item of node) walkJsonLd(item);
      return;
    }
    if (typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    const t = obj["@type"];
    if (typeof t === "string") checkType(t);
    if (Array.isArray(t)) for (const sub of t) if (typeof sub === "string") checkType(sub);
    if (obj["@graph"]) walkJsonLd(obj["@graph"]);
  };

  for (const m of jsonLdScripts) {
    try {
      walkJsonLd(JSON.parse(m[1].trim()));
    } catch {
      // ignore malformed
    }
  }
  checks.push({
    id: "schema-article",
    label: "Article JSON-LD",
    severity: "high",
    passed: articleSchema,
    detail: !articleSchema ? "No Article/NewsArticle/BlogPosting JSON-LD" : undefined,
    fix: articleSchema
      ? undefined
      : "Schema is auto-generated — admin doesn't touch it. Click 'Auto-fix schema' below to regenerate the DB cache. If it still fails after auto-fix, the bug is in `modonty/lib/seo/index.ts:generateArticleStructuredData` — investigate the code.",
  });
  checks.push({
    id: "schema-breadcrumb",
    label: "BreadcrumbList JSON-LD",
    severity: "medium",
    passed: breadcrumbSchema,
    detail: !breadcrumbSchema ? "No BreadcrumbList JSON-LD (rich results loss)" : undefined,
    fix: breadcrumbSchema
      ? undefined
      : "Schema is auto-generated. Click 'Auto-fix schema' to regenerate. If still missing, check the breadcrumb generator in `modonty/app/articles/[slug]/page.tsx` (generateBreadcrumbStructuredData call).",
  });

  // Sitemap inclusion (only if sitemap entries provided)
  if (options.sitemapEntries) {
    const inSitemap = options.sitemapEntries.some((entry) => sameUrl(entry, article.url));
    checks.push({
      id: "sitemap-inclusion",
      label: "Listed in sitemap.xml",
      severity: "high",
      passed: inSitemap,
      detail: inSitemap
        ? undefined
        : "URL not found in sitemap.xml — Google's primary discovery channel",
      fix: inSitemap
        ? undefined
        : "Verify article status=PUBLISHED. Check `modonty/app/sitemap.ts` includes published articles. Force regeneration via Vercel re-deploy if stale.",
    });
  }

  // ═══ Stages 8-10 — scope to <article> content (skip navbar/footer/sidebar) ═══
  const articleHtml = scopeToArticle(html);

  // ═══ Stage 8 — Media ═══
  const images = extractImages(articleHtml);
  const imagesWithoutAlt = images.filter((img) => !img.alt || img.alt.trim() === "");
  checks.push({
    id: "media-alt",
    label: `Article images have alt text (${images.length} found in article)`,
    severity: "high",
    passed: images.length === 0 || imagesWithoutAlt.length === 0,
    detail:
      imagesWithoutAlt.length > 0
        ? `${imagesWithoutAlt.length}/${images.length} article images missing alt text`
        : undefined,
    fix:
      imagesWithoutAlt.length > 0
        ? "Edit each article image in admin → Media library → set descriptive alt text. Scope: article body only (navbar/footer images are separate)."
        : undefined,
  });

  // Sample first 10 images and HEAD-check them
  const imagesSample = images.slice(0, 10);
  const imageStatuses = await batchHeadCheck(imagesSample.map((i) => i.src));
  const brokenImages = imageStatuses.filter((s) => !s.ok);
  checks.push({
    id: "media-images-load",
    label: `Article images load (sampled ${imagesSample.length})`,
    severity: "high",
    passed: brokenImages.length === 0,
    detail:
      brokenImages.length > 0
        ? `${brokenImages.length} article image${brokenImages.length === 1 ? "" : "s"} returned non-200 (e.g. ${brokenImages[0].url})`
        : undefined,
    fix:
      brokenImages.length > 0
        ? "Replace broken images in admin → Article editor → Content / Featured Image. Broken article images = 404s in Google Image Search."
        : undefined,
  });

  // ═══ Stage 9 — Internal Links ═══
  const articleHost = (() => {
    try {
      return new URL(article.url).host;
    } catch {
      return "";
    }
  })();
  const allLinks = extractLinks(articleHtml);
  const internalLinks = allLinks.filter((l) => isInternal(l.href, articleHost, article.url));
  const externalLinks = allLinks.filter((l) => !isInternal(l.href, articleHost, article.url) && /^https?:\/\//i.test(l.href));

  checks.push({
    id: "internal-links-count",
    label: "At least 2 internal links",
    severity: "high",
    passed: internalLinks.length >= 2,
    detail:
      internalLinks.length < 2
        ? `Only ${internalLinks.length} internal link${internalLinks.length === 1 ? "" : "s"} found`
        : undefined,
    fix:
      internalLinks.length < 2
        ? "Add 2+ internal links in article body — link to related articles, categories, or author page. Helps Google understand site structure and distributes PageRank."
        : undefined,
  });

  const genericAnchors = ["click here", "here", "read more", "اضغط هنا", "هنا", "اقرأ المزيد", "المزيد"];
  const genericInternal = internalLinks.filter((l) =>
    genericAnchors.some((g) => l.text.trim().toLowerCase() === g.toLowerCase()),
  );
  checks.push({
    id: "internal-links-anchors",
    label: "Descriptive anchor text",
    severity: "medium",
    passed: genericInternal.length === 0,
    detail:
      genericInternal.length > 0
        ? `${genericInternal.length} internal link${genericInternal.length === 1 ? "" : "s"} use generic text (e.g. "${genericInternal[0].text}")`
        : undefined,
    fix:
      genericInternal.length > 0
        ? 'Replace generic anchor text ("click here", "اضغط هنا") with descriptive keywords. Anchor text is a Google ranking signal.'
        : undefined,
  });

  // Sample 10 internal links + HEAD-check
  const internalSample = internalLinks.slice(0, 10);
  const internalStatuses = await batchHeadCheck(internalSample.map((l) => absoluteUrl(l.href, article.url)));
  const brokenInternal = internalStatuses.filter((s) => !s.ok);
  checks.push({
    id: "internal-links-broken",
    label: `Internal links return 200 (sampled ${internalSample.length})`,
    severity: "high",
    passed: brokenInternal.length === 0,
    detail:
      brokenInternal.length > 0
        ? `${brokenInternal.length} broken internal link${brokenInternal.length === 1 ? "" : "s"} (e.g. ${brokenInternal[0].url})`
        : undefined,
    fix:
      brokenInternal.length > 0
        ? "Edit article → fix or remove broken links. Broken internal links waste crawl budget and confuse Google."
        : undefined,
  });

  // ═══ Stage 10 — External Links ═══
  const externalSample = externalLinks.slice(0, 10);
  const externalStatuses = await batchHeadCheck(externalSample.map((l) => l.href));
  const brokenExternal = externalStatuses.filter((s) => !s.ok);
  checks.push({
    id: "external-links-broken",
    label: `External links return 200 (sampled ${externalSample.length})`,
    severity: "medium",
    passed: externalLinks.length === 0 || brokenExternal.length === 0,
    detail:
      brokenExternal.length > 0
        ? `${brokenExternal.length} broken external link${brokenExternal.length === 1 ? "" : "s"} (e.g. ${brokenExternal[0].url})`
        : externalLinks.length === 0
          ? "No external links in this article"
          : undefined,
    fix:
      brokenExternal.length > 0
        ? "Edit article → replace or remove dead external links. Broken external links hurt user experience and Google trust."
        : undefined,
  });

  const externalNoSafety = externalLinks.filter(
    (l) => l.target === "_blank" && !/no(opener|referrer)/i.test(l.rel ?? ""),
  );
  checks.push({
    id: "external-links-safety",
    label: "External links use rel=noopener (when target=_blank)",
    severity: "medium",
    passed: externalNoSafety.length === 0,
    detail:
      externalNoSafety.length > 0
        ? `${externalNoSafety.length} external link${externalNoSafety.length === 1 ? "" : "s"} open in new tab without rel="noopener" (security risk)`
        : undefined,
    fix:
      externalNoSafety.length > 0
        ? 'When using target="_blank" on external links, always add rel="noopener noreferrer" to prevent the new tab from accessing window.opener.'
        : undefined,
  });

  return finalize(article, finalUrl, fetchOk, fetchStatus, checks);
}

// ═══ Helpers for Stages 8-10 ═══

/**
 * Limits image/link audits to the article's own content area.
 * Tries `<article>` first, falls back to `<main>`, then the full HTML.
 * This prevents Stage 8/9/10 from flagging navbar/footer/sidebar issues
 * (those belong to a site-wide audit, not a per-article pipeline).
 */
function scopeToArticle(html: string): string {
  const articleMatch = html.match(/<article\b[\s\S]*?<\/article>/i);
  if (articleMatch) return articleMatch[0];
  const mainMatch = html.match(/<main\b[\s\S]*?<\/main>/i);
  if (mainMatch) return mainMatch[0];
  return html;
}

interface ImageRef {
  src: string;
  alt: string;
}

function extractImages(html: string): ImageRef[] {
  const out: ImageRef[] = [];
  const matches = html.matchAll(/<img\b([^>]*)>/gi);
  for (const m of matches) {
    const attrs = m[1];
    const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/i);
    if (!srcMatch) continue;
    const src = srcMatch[1];
    // Skip tracking pixels and tiny icons
    if (/1x1|pixel/i.test(src)) continue;
    const altMatch = attrs.match(/\balt=["']([^"']*)["']/i);
    out.push({ src, alt: altMatch ? altMatch[1] : "" });
  }
  return out;
}

interface LinkRef {
  href: string;
  text: string;
  target?: string;
  rel?: string;
}

function extractLinks(html: string): LinkRef[] {
  const out: LinkRef[] = [];
  const matches = html.matchAll(/<a\b([^>]*?)>([\s\S]*?)<\/a>/gi);
  for (const m of matches) {
    const attrs = m[1];
    const inner = m[2];
    const hrefMatch = attrs.match(/\bhref=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    const href = hrefMatch[1];
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    const text = inner
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const targetMatch = attrs.match(/\btarget=["']([^"']+)["']/i);
    const relMatch = attrs.match(/\brel=["']([^"']+)["']/i);
    out.push({
      href,
      text,
      target: targetMatch?.[1],
      rel: relMatch?.[1],
    });
  }
  return out;
}

function isInternal(href: string, articleHost: string, articleUrl: string): boolean {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const u = new URL(href, articleUrl);
    return u.host === articleHost;
  } catch {
    return false;
  }
}

function absoluteUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

interface HeadResult {
  url: string;
  ok: boolean;
  status: number;
}

async function batchHeadCheck(urls: string[], concurrency = 5, timeoutMs = 5000): Promise<HeadResult[]> {
  const results: HeadResult[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < urls.length) {
      const i = cursor++;
      const url = urls[i];
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(url, {
          method: "HEAD",
          cache: "no-store",
          signal: controller.signal,
          redirect: "follow",
        });
        clearTimeout(timer);
        results[i] = { url, ok: res.ok, status: res.status };
      } catch {
        // Try GET fallback (some servers reject HEAD)
        try {
          const controller2 = new AbortController();
          const timer2 = setTimeout(() => controller2.abort(), timeoutMs);
          const res2 = await fetch(url, {
            method: "GET",
            cache: "no-store",
            signal: controller2.signal,
            redirect: "follow",
          });
          clearTimeout(timer2);
          results[i] = { url, ok: res2.ok, status: res2.status };
        } catch {
          results[i] = { url, ok: false, status: 0 };
        }
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
  return results;
}

export async function validateArticles(
  articles: InputArticle[],
  concurrency = 3,
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < articles.length) {
      const idx = cursor++;
      const article = articles[idx];
      try {
        results[idx] = await validateArticle(article);
      } catch (e) {
        results[idx] = {
          url: article.url,
          articleId: article.id,
          slug: article.slug,
          title: article.title,
          status: "critical",
          fetchOk: false,
          fetchStatus: 0,
          passedCount: 0,
          failedCount: 1,
          totalChecks: 1,
          checks: [
            {
              id: "fetch",
              label: "Validation run",
              severity: "critical",
              passed: false,
              detail: e instanceof Error ? e.message : "Validator crashed",
            },
          ],
          validatedAt: new Date().toISOString(),
        };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, articles.length) }, worker));
  return results;
}

function matchTag(html: string, re: RegExp): string | undefined {
  const m = html.match(re);
  return m ? m[1] : undefined;
}

function sameUrl(a: string, b: string): boolean {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    return ua.host === ub.host && ua.pathname.replace(/\/$/, "") === ub.pathname.replace(/\/$/, "");
  } catch {
    return a === b;
  }
}

function finalize(
  article: InputArticle,
  finalUrl: string,
  fetchOk: boolean,
  fetchStatus: number,
  checks: ValidationCheck[],
): ValidationResult {
  const failed = checks.filter((c) => !c.passed);
  const passedCount = checks.length - failed.length;
  const hasCritical = failed.some((c) => c.severity === "critical");
  const status: ValidationStatus = hasCritical
    ? "critical"
    : failed.length > 0
      ? "warnings"
      : "ready";

  return {
    url: finalUrl,
    articleId: article.id,
    slug: article.slug,
    title: article.title,
    status,
    fetchOk,
    fetchStatus,
    passedCount,
    failedCount: failed.length,
    totalChecks: checks.length,
    checks,
    validatedAt: new Date().toISOString(),
  };
}
