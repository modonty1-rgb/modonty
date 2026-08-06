import "server-only";

import { mediaSrc } from "@modonty/database/lib/media-src";
import { bunnyAspectUrl, BUNNY_ASPECT_SUFFIX } from "@modonty/database/lib/bunny";
import { buildArticleUrlFromBase } from "@/lib/seo/url-builders";
import type { HeadChecker } from "@/lib/seo/head-check";
import type { HealthIssue, HealthTarget } from "./article-health-types";

/**
 * Article health engine — checks the OUTSIDE WORLD, not the database.
 *
 * The pre-publish gate (`article-validator-db.ts`, 22 checks) asks "is a featured image
 * SET?" and never sends a single network request. That is exactly how two article covers
 * sat published and 404-ing for weeks with nothing raising a hand — they were found by
 * accident when the Bunny migration tried to download them (Khalid 2026-08-04).
 *
 * So this engine only asks questions the gate cannot: does the URL actually resolve today,
 * and does the SEO we baked still describe the article we have? Anything already covered
 * at publish time is deliberately NOT repeated here.
 *
 * Read-only by contract — it reports, it never repairs. Replacing an image or dropping a
 * source is an editorial decision that belongs to a human, not to a sweep.
 */

// Vocabulary lives in a client-safe module — this file pulls in the Bunny client and the
// site-url loader, so anything a UI component needs must not be re-exported through here.
export type {
  HealthCheckId,
  HealthSeverity,
  HealthIssue,
  HealthTarget,
} from "./article-health-types";

/** Exactly the fields the checks read — nothing more travels out of the DB. */
export const ARTICLE_HEALTH_SELECT = {
  id: true,
  title: true,
  slug: true,
  status: true,
  content: true,
  citations: true,
  jsonLdStructuredData: true,
  featuredImage: { select: { url: true, bunnyUrl: true } },
  client: {
    select: {
      id: true,
      name: true,
      // The person to route a finding to. NOT `Article.author` — that relation is the
      // schema.org byline and is deliberately pinned to "مُدَوَّنَتِي" for every article
      // (see the comment on Client.editorId), so showing it as "the writer" told Khalid
      // that Modonty wrote his client's article. The staff editor is the real owner.
      editor: { select: { name: true } },
      logoMedia: { select: { url: true, bunnyUrl: true } },
    },
  },
} as const;

export interface HealthArticle {
  id: string;
  title: string;
  slug: string;
  status: string;
  content: string | null;
  citations: string[];
  jsonLdStructuredData: unknown;
  featuredImage: { url: string | null; bunnyUrl: string | null } | null;
  client: {
    id: string;
    name: string;
    editor: { name: string | null } | null;
    logoMedia: { url: string | null; bunnyUrl: string | null } | null;
  } | null;
}

export interface HealthContext {
  head: HeadChecker;
  siteUrl: string;
  /** Cap on body images probed per article — a photo essay must not stall the sweep. */
  bodyImageSample?: number;
  /** Cap on links of each kind probed per article. */
  linkSample?: number;
}

const DEFAULT_BODY_SAMPLE = 10;
const DEFAULT_LINK_SAMPLE = 15;

/** `<img src="…">` — quoted or bare, any attribute order. */
const IMG_SRC = /<img\b[^>]*?\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;
/** `<a href="…">` — same tolerance. */
const A_HREF = /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;

const CLOUDINARY_RE = /cloudinary\.com/i;

function extractAttr(html: string, re: RegExp): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(re)) {
    const v = (m[1] ?? m[2] ?? m[3] ?? "").trim();
    // Inline data URIs carry their own bytes — there is nothing to fetch.
    if (v && !v.startsWith("data:")) out.push(v);
  }
  return out;
}

function absolute(src: string, base: string): string | null {
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Every string in a JSON tree that looks like an image URL. */
function collectJsonLdImages(node: unknown, out: Set<string> = new Set()): Set<string> {
  if (typeof node === "string") {
    if (/^https?:\/\//.test(node) && /\.(jpe?g|png|webp|avif|gif|svg)(\?|$)/i.test(node)) {
      out.add(node);
    }
    return out;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectJsonLdImages(item, out);
    return out;
  }
  if (node && typeof node === "object") {
    for (const v of Object.values(node as Record<string, unknown>)) collectJsonLdImages(v, out);
  }
  return out;
}

/** Filename stem without extension or crop suffix: `.../a/b__16x9.webp` → `b`. */
function imageStem(url: string): string {
  const path = url.split("?")[0];
  const file = path.slice(path.lastIndexOf("/") + 1);
  return file.replace(/\.[a-z0-9]+$/i, "").replace(/__(?:1x1|4x3|16x9)$/i, "");
}

type PublicUrlRule = "must-load" | "must-be-gone" | "skip";

/**
 * What the public URL SHOULD answer, given the article's status.
 *
 * Drafts are skipped: they have no live page yet, so checking them would report 42 fake
 * failures for behaving correctly (scope = all statuses, Khalid 2026-08-04).
 *
 * Archived asks only "is it gone?", NOT "does it return exactly 410". An earlier version
 * demanded 410 and would have flagged a perfectly retired article that answers 404 —
 * but Google states plainly: "All 4xx errors, except 429, are treated the same: Google
 * crawlers inform the next processing system that the content doesn't exist"
 * (developers.google.com/search/docs/crawling-indexing/http-network-errors). 410 is our
 * internal preference, not a requirement, and a preference must never be reported as a
 * defect. The real defect is an archived article that still loads.
 */
function publicUrlRule(status: string): PublicUrlRule {
  if (status === "PUBLISHED") return "must-load";
  if (status === "ARCHIVED") return "must-be-gone";
  return "skip";
}

/** One article → its issues. Returns an empty array when everything resolves. */
export async function checkArticleHealth(
  article: HealthArticle,
  ctx: HealthContext
): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = [];
  const base = {
    articleId: article.id,
    articleTitle: article.title,
    articleSlug: article.slug,
    articleStatus: article.status,
    clientName: article.client?.name ?? null,
    editorName: article.client?.editor?.name ?? null,
  };
  const add = (i: Omit<HealthIssue, keyof typeof base>) => issues.push({ ...base, ...i });

  // ── collect every URL first, then resolve in ONE batch ────────────────────────────
  // The checker dedupes and caches, so the three crops of one original and a publisher
  // logo shared by twenty articles each cost a single request per run.
  const featuredUrl = mediaSrc(article.featuredImage);
  const cropUrls =
    // Crops are pre-generated FILES on Bunny only. Cloudinary crops on the fly, so
    // deriving `__16x9` for a Cloudinary original would invent a URL that never existed.
    article.featuredImage?.bunnyUrl
      ? Object.values(BUNNY_ASPECT_SUFFIX).map((s) =>
          bunnyAspectUrl(article.featuredImage!.bunnyUrl!, s)
        )
      : [];

  const html = article.content ?? "";
  const limit = ctx.linkSample ?? DEFAULT_LINK_SAMPLE;

  const bodyUrls = extractAttr(html, IMG_SRC)
    .map((src) => absolute(src, ctx.siteUrl))
    .filter((u): u is string => !!u)
    .slice(0, ctx.bodyImageSample ?? DEFAULT_BODY_SAMPLE);

  // Anchors split by destination: our own site vs everyone else. They fail for different
  // reasons and deserve different severities — a broken internal link is our bug, a
  // broken external one is usually someone else's site moving.
  const siteHost = hostOf(ctx.siteUrl);
  const anchors = [...new Set(extractAttr(html, A_HREF))].filter(
    (h) => !/^(mailto:|tel:|#)/i.test(h)
  );
  const internalUrls: string[] = [];
  const externalUrls: string[] = [];
  for (const href of anchors) {
    const abs = absolute(href, ctx.siteUrl);
    if (!abs || !/^https?:/i.test(abs)) continue;
    const host = hostOf(abs);
    if (host && host === siteHost) internalUrls.push(abs);
    else externalUrls.push(abs);
  }

  // Citation sources (`Article.citations` → schema.org citation / isBasedOn). These are
  // the authority links the article leans on; a dead one weakens the very claim it backs.
  const citationUrls = [...new Set(article.citations ?? [])]
    .filter((u) => /^https?:\/\//i.test(u))
    .slice(0, limit);

  const logoUrl = mediaSrc(article.client?.logoMedia);
  const urlRule = publicUrlRule(article.status);
  const publicUrl =
    urlRule === "skip" ? null : buildArticleUrlFromBase(article.slug, ctx.siteUrl);

  const results = await ctx.head.check(
    [
      featuredUrl,
      ...cropUrls,
      ...bodyUrls,
      ...internalUrls.slice(0, limit),
      ...externalUrls.slice(0, limit),
      ...citationUrls,
      logoUrl,
      publicUrl,
    ].filter((u): u is string => !!u)
  );

  // ── Reporting rule, non-negotiable ────────────────────────────────────────────────
  // This report can cost someone their pay or their job (Khalid 2026-08-04), so only a
  // verdict the checker PROVED — repeated across retries, from a server that answered
  // clearly — may be reported as a defect. Anything a robot merely failed to reach is
  // surfaced separately as "could not verify" and is never counted against anyone.
  const proven = (urls: string[]): HealthTarget[] =>
    urls
      .filter((u) => results.get(u)?.verdict === "dead")
      .map((u) => ({ url: u, httpStatus: results.get(u)?.status }));

  /**
   * Word a link finding by what the code actually proves — no more.
   *
   * RFC 9110 §15.5.11 reserves permanence for 410: the server "has knowledge that the
   * condition is likely to be permanent". MDN states the counterpart plainly: "A 404
   * status code only indicates that the resource is missing without indicating if this is
   * temporary or permanent." So calling a 404 "removed" is a claim the protocol does not
   * support — and on a report Khalid may act on, an overclaim is the same failure as a
   * wrong verdict.
   */
  const wordLinkFinding = (targets: HealthTarget[]): string => {
    const gone = targets.filter((t) => t.httpStatus === 410).length;
    const missing = targets.length - gone;
    if (missing === 0) return "الموقع يقول إنها انشالت نهائياً";
    if (gone === 0) return "ما فتحت معنا في ٣ محاولات — ممكن تكون انشالت وممكن يكون عطل عندهم";
    return `${gone} انشالت نهائياً و${missing} ما فتحت في ٣ محاولات`;
  };

  /**
   * Second gate for links we do not own.
   *
   * A `dead` verdict on someone else's site is not yet proof: some protection walls
   * answer 404 to automated requests exactly as they answer 403, and the page is fine in
   * a browser. So before reporting, ask the site's HOME page. If the home page refuses us
   * too, the wall is talking, not the page — stay silent. If the home page answers
   * normally while the article's link 404s, the page really is gone.
   */
  async function provenExternal(urls: string[]): Promise<HealthTarget[]> {
    const candidates = proven(urls);
    if (candidates.length === 0) return [];

    const origins = new Map<string, string>();
    for (const c of candidates) {
      try {
        origins.set(c.url, new URL(c.url).origin);
      } catch {
        /* unparseable — dropped below */
      }
    }
    const originResults = await ctx.head.check([...new Set(origins.values())]);
    return candidates.filter((c) => {
      const origin = origins.get(c.url);
      return !!origin && originResults.get(origin)?.verdict === "ok";
    });
  }

  // ── ف1 — featured image resolves. A missing image is the publish gate's business. ──
  if (featuredUrl) {
    const r = results.get(featuredUrl);
    if (r && !r.ok) {
      add({
        check: "featured-image",
        severity: "critical",
        detail: `صورة المقال الرئيسية ما تفتح (${r.status || "ما ردّ"}) — الزائر يشوف مربّع فاضي.`,
        targets: [{ url: featuredUrl, httpStatus: r.status }],
      });
    }
  }

  // ── ف2 — the three crops. The original can be alive while a crop is not, and the crop
  // is what Google's card and the share preview actually load. ───────────────────────
  const deadCrops = proven(cropUrls);
  if (deadCrops.length > 0) {
    add({
      check: "featured-crops",
      severity: "critical",
      detail: `${deadCrops.length} من ٣ نسخ الصورة ما تفتح — الصورة اللي تطلع في قوقل ولما أحد يشارك الرابط تنكسر.`,
      targets: deadCrops,
    });
  }

  // ── ف3 — the public page answers what its status promises (status-aware). ──────────
  if (publicUrl && urlRule !== "skip") {
    const r = results.get(publicUrl);
    // Published must load. Archived must NOT load — any 4xx counts as gone; only a page
    // that still serves 200 is a defect. `blocked`/`inconclusive` say nothing either way.
    const published = urlRule === "must-load";
    const failed = published
      ? r?.verdict === "dead"
      : r?.verdict === "ok";
    if (r && failed) {
      add({
        check: "public-url",
        severity: "critical",
        detail: published
          ? `المقال منشور بس صفحته ما تفتح — ترجّع ${r.status || "ما ردّ"}.`
          : "المقال مؤرشف بس صفحته لسه تفتح للزوّار.",
        targets: [{ url: publicUrl, httpStatus: r.status }],
      });
    }
  }

  // ── ف4 — body images resolve. ─────────────────────────────────────────────────────
  const deadBody = proven(bodyUrls);
  if (deadBody.length > 0) {
    add({
      check: "body-images",
      severity: "high",
      detail: `${deadBody.length} من ${bodyUrls.length} صورة جوّه المقال ما تفتح — فراغات وسط النص.`,
      targets: deadBody,
    });
  }

  // ── ف5 — publisher logo. One dead logo breaks the Organization node on every article
  // of that client at once, which is why it earns a line per article. ────────────────
  if (logoUrl) {
    const r = results.get(logoUrl);
    if (r && !r.ok) {
      add({
        check: "publisher-logo",
        severity: "high",
        detail: `شعار «${article.client?.name ?? "الشركة"}» ما يفتح (${r.status || "ما ردّ"}) — معلومات الشركة تطلع ناقصة على كل مقالاتها.`,
        targets: [{ url: logoUrl, httpStatus: r.status }],
      });
    }
  }

  // ── ف6 — Cloudinary remnants. Only what is actually SERVED counts: `Media.url` keeps
  // the old Cloudinary value by design (dual-field, zero-loss), so a row that already
  // has a Bunny copy is clean even though the old string is still stored. ────────────
  const cloudinaryHits: string[] = [];
  const cloudinaryTargets: HealthTarget[] = [];
  if (featuredUrl && CLOUDINARY_RE.test(featuredUrl)) {
    cloudinaryHits.push("الصورة البارزة");
    cloudinaryTargets.push({ url: featuredUrl });
  }
  const cloudinaryBody = bodyUrls.filter((u) => CLOUDINARY_RE.test(u));
  if (cloudinaryBody.length > 0) {
    cloudinaryHits.push("صور المتن");
    cloudinaryTargets.push(...cloudinaryBody.map((url) => ({ url })));
  }
  if (logoUrl && CLOUDINARY_RE.test(logoUrl)) {
    cloudinaryHits.push("شعار الناشر");
    cloudinaryTargets.push({ url: logoUrl });
  }
  const jsonLdText = article.jsonLdStructuredData
    ? JSON.stringify(article.jsonLdStructuredData)
    : "";
  if (CLOUDINARY_RE.test(jsonLdText)) cloudinaryHits.push("بيانات قوقل المخزّنة");
  if (cloudinaryHits.length > 0) {
    add({
      check: "cloudinary-remnant",
      severity: "high",
      detail: `لسه ياخذ الصور من الحساب القديم في: ${cloudinaryHits.join(" · ")}.`,
      targets: cloudinaryTargets,
    });
  }

  // ── ف7 — baked SEO still describes the CURRENT article. The stored data is a snapshot;
  // swapping the featured image without regenerating leaves Google reading the old one.
  // Compared by filename stem so the crop suffix and extension never cause false alarms.
  if (featuredUrl && article.jsonLdStructuredData) {
    const jsonImages = [...collectJsonLdImages(article.jsonLdStructuredData)];
    if (jsonImages.length > 0) {
      const current = imageStem(featuredUrl);
      const mentioned = jsonImages.some((u) => imageStem(u) === current);
      if (!mentioned) {
        add({
          check: "seo-drift",
          severity: "high",
          detail: "المعلومات المرسلة لقوقل تشير لصورة غير الصورة الحالية — أعد إرسال المعلومات لهذا المقال.",
          targets: jsonImages.slice(0, 3).map((url) => ({ url })),
        });
      }
    }
  }

  // ── ف9 — internal links. These point at OUR pages, so a dead one is our own bug and
  // it also bleeds link equity between articles. Higher severity than an external one.
  const sampledInternal = internalUrls.slice(0, limit);
  const deadInternal = proven(sampledInternal);
  if (deadInternal.length > 0) {
    add({
      check: "internal-links",
      severity: "high",
      detail: `${deadInternal.length} من ${sampledInternal.length} رابط يودّي لصفحة عندنا وما تفتح.`,
      targets: deadInternal,
    });
  }

  // ── ف8 — external links. A third-party site going down after publication is NOT the
  // writer's mistake, so this stays low and its wording says so explicitly. ──────────
  const sampledExternal = externalUrls.slice(0, limit);
  const deadExternal = await provenExternal(sampledExternal);
  if (deadExternal.length > 0) {
    add({
      check: "external-links",
      severity: "low",
      detail: `${deadExternal.length} من ${sampledExternal.length} رابط لموقع ثاني ما يفتح — ${wordLinkFinding(deadExternal)}. الموقع نفسه شغّال، الصفحة بس هي اللي ما تفتح.`,
      targets: deadExternal,
    });
  }

  // ── ف10 — citation sources. A dead source undermines the claim it was cited for, and
  // these are the links Google reads as the article's evidence trail. ────────────────
  const deadCitations = await provenExternal(citationUrls);
  if (deadCitations.length > 0) {
    add({
      check: "citations",
      severity: "high",
      detail: `${deadCitations.length} من ${citationUrls.length} مصدر ما يفتح — ${wordLinkFinding(deadCitations)}. الموقع نفسه شغّال، الصفحة بس هي اللي ما تفتح.`,
      targets: deadCitations,
    });
  }

  // ── What we could NOT prove is not reported. At all. ───────────────────────────────
  // A `blocked` verdict (403/429) means a bot wall refused us — vision2030.gov.sa is the
  // live example: it answers 403 to any server-side request no matter what User-Agent it
  // claims, because it fingerprints the TLS handshake and runs a JS challenge, while the
  // page opens perfectly in a real browser. An earlier version listed such links under
  // "could not verify"; Khalid opened one and it worked (2026-08-04). Being in the report
  // at all makes a healthy link look like a defect, and this report reaches people who
  // are judged by it. Same for timeouts and DNS failures: unproven is not a finding.
  //
  // The rule this file now obeys without exception: only `dead` — a server that answered
  // 404/410/5xx three times — is ever reported.

  return issues;
}
