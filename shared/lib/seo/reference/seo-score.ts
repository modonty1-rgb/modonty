// Reference-entity SEO score — categories, tags, industries, authors AND the seven
// modonty listing pages that live on the Settings singleton (0–100).
//
// The third scorer in the family, on the same contract as the other two:
//   shared/lib/seo/client/   → clients
//   shared/lib/seo/article/  → articles
//   shared/lib/seo/reference/→ this one
//
// These models share one shape (name + seoTitle/seoDescription + the standard SEO
// cache: nextjsMetadata, jsonLdStructuredData, jsonLdValidationReport), so they share
// one scorer. They are listing pages, not entities Google shows rich results for — but
// SEO is the product here, so "it parses" is not the bar: the stored meta must carry
// every directive Google reads, and the stored @graph must hold up on its own.
//
// Like its siblings it reads the STORED, published fields. Never score a form here.
//
// Sixteen checks in three groups (Khalid 2026-08-14, criteria drawn from the
// seo-senior-expert skill → Google Search Central, ogp.me, schema.org):
//   META    7 · 45 pts — title, description, canonical, OG, Twitter, robots, hreflang
//   JSON-LD 6 · 40 pts — parses, @type coverage, breadcrumb, Organization, items, report
//   SOURCE  3 · 15 pts — source copy present, cache not stale, site identity carried
//
// The three SOURCE checks need context only some callers have (the row's own seoTitle,
// its updatedAt). They are SKIPPED when that context is absent, and because the score is
// earned/max, skipping shrinks the denominator instead of punishing the caller. So the
// ten existing consumers keep scoring exactly what they scored before.

import type { SeoScore, SeoCheck, JsonLdValidationReport } from "../client/types";
import { countReportErrors, countReportWarnings } from "../client/types";

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 160;

/** og:image must be at least this big for a large card (Facebook sharing docs). */
const OG_IMAGE_MIN_WIDTH = 1200;
const OG_IMAGE_MIN_HEIGHT = 630;

/** Both markets Modonty targets — a page missing either is invisible to half the audience. */
const REQUIRED_HREFLANGS = ["ar-SA", "ar-EG"] as const;

export interface ReferenceSeoInput {
  /** Display name — to catch a title that is a bare echo of it. */
  name?: string | null;
  /** Stored Next.js Metadata object. */
  nextjsMetadata?: unknown;
  jsonLdStructuredData?: string | null;
  jsonLdValidationReport?: JsonLdValidationReport | null;

  // ── Optional context. Each unlocks one SOURCE check; omit it and the check is skipped. ──
  /** The row's own SEO title column — proves the copy is authored, not a generator fallback. */
  sourceTitle?: string | null;
  /** The row's own SEO description column. */
  sourceDescription?: string | null;
  /** When the SEO cache was last generated. */
  lastGenerated?: Date | string | null;
  /** When the row itself last changed — newer than lastGenerated means the cache is stale. */
  sourceUpdatedAt?: Date | string | null;
}

interface MetaTags {
  title?: unknown;
  description?: unknown;
  canonical?: unknown;
  robots?: unknown;
  authors?: unknown;
  author?: unknown;
  alternates?: { canonical?: unknown; languages?: unknown } | null;
  openGraph?: {
    title?: unknown;
    type?: unknown;
    url?: unknown;
    siteName?: unknown;
    locale?: unknown;
    images?: Array<{ url?: unknown }> | unknown;
  } | null;
  twitter?: {
    card?: unknown;
    title?: unknown;
    description?: unknown;
    site?: unknown;
    creator?: unknown;
    images?: unknown;
    image?: unknown;
  } | null;
}

const asMeta = (v: unknown): MetaTags => (v && typeof v === "object" ? (v as MetaTags) : {});
const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isAbsolute = (v: unknown): boolean => /^https:\/\//i.test(str(v));
const asDate = (v: Date | string | null | undefined): Date | null => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** First OG image entry, whatever shape it was stored in. */
function firstOgImage(m: MetaTags): Record<string, unknown> | null {
  const imgs = m.openGraph?.images;
  if (!Array.isArray(imgs) || imgs.length === 0) return null;
  const first = imgs[0];
  if (isObj(first)) return first;
  if (typeof first === "string") return { url: first };
  return null;
}

// ── JSON-LD graph inspection ───────────────────────────────────────────────────
// The stored value is a `{ "@context", "@graph": [...] }` string. These walk it once
// so every JSON-LD check reads the same parsed tree instead of re-parsing per check.

interface Graph {
  parsed: unknown;
  /** Every object in the tree, flattened. */
  nodes: Record<string, unknown>[];
  /** Objects that carry data but no @type — the shape Ahrefs flags. */
  untyped: number;
  context: string;
}

function walkGraph(raw: string | null | undefined): Graph | null {
  const text = raw?.trim();
  if (!text) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  const nodes: Record<string, unknown>[] = [];
  let untyped = 0;
  const visit = (v: unknown) => {
    if (Array.isArray(v)) {
      v.forEach(visit);
      return;
    }
    if (!isObj(v)) return;
    nodes.push(v);
    // An object carrying `@id` is a REFERENCE to a node typed elsewhere, and Google
    // sanctions that form explicitly for breadcrumb items — its own docs offer
    // `item` as either a URL string or "a Thing … use an @id to specify the URL",
    // with `name` alongside it and no @type:
    //   developers.google.com/search/docs/appearance/structured-data/breadcrumb
    // So only an object that carries data with NEITHER @id NOR @type is untyped.
    // `@graph` marks the document wrapper, which holds nodes rather than being one.
    const hasData = Object.keys(v).some(
      (k) => k !== "@id" && k !== "@context" && k !== "@type" && k !== "@graph",
    );
    if (hasData && !("@type" in v) && !("@id" in v)) untyped += 1;
    Object.values(v).forEach(visit);
  };
  visit(parsed);

  const context = isObj(parsed) ? str(parsed["@context"]) : "";
  return { parsed, nodes, untyped, context };
}

/** Nodes whose @type matches, tolerating the `@type: [A, B]` array form. */
function nodesOfType(graph: Graph, type: string): Record<string, unknown>[] {
  return graph.nodes.filter((n) => {
    const t = n["@type"];
    return Array.isArray(t) ? t.some((x) => str(x) === type) : str(t) === type;
  });
}

/**
 * First human-readable error out of the stored report. A bare count ("5 errors") tells the
 * reader nothing they can act on — the message names the missing node.
 */
function firstReportError(report: JsonLdValidationReport | null | undefined): string {
  if (!report) return "";
  const pools = [report.adobe?.errors, report.ajv?.errors, report.custom?.errors];
  for (const pool of pools) {
    if (!Array.isArray(pool)) continue;
    for (const e of pool) {
      if (typeof e === "string" && e.trim()) return e.trim();
      if (isObj(e) && typeof e.message === "string" && e.message.trim()) return e.message.trim();
    }
  }
  return "";
}

/** A breadcrumb `item` is either a URL string or an object carrying `@id`. */
function listItemUrl(item: unknown): string {
  if (typeof item === "string") return item.trim();
  if (isObj(item)) return str(item["@id"]) || str(item.url);
  return "";
}

/**
 * Weights (total 100 when every check runs):
 *
 *   META    45 — title 10 · description 10 · canonical 6 · OG 7 · Twitter 5 · robots 3 · hreflang 4
 *   JSON-LD 40 — parses 10 · @type 6 · breadcrumb 6 · Organization 6 · items 4 · report 8
 *   SOURCE  15 — copy 5 · freshness 5 · identity 5
 *
 * The copy still outweighs any single technical check, because the title and description
 * ARE the whole search snippet for a page like this. But no single check can now hide a
 * page that is structurally broken, which is what the old 5-check split allowed.
 */
export function computeReferenceSeoScore(input: ReferenceSeoInput): SeoScore {
  const m = asMeta(input.nextjsMetadata);
  const name = str(input.name);
  const graph = walkGraph(input.jsonLdStructuredData);
  const checks: SeoCheck[] = [];

  const push = (
    key: string,
    label: string,
    status: SeoCheck["status"],
    earned: number,
    max: number,
    hint?: string,
  ) => checks.push({ key, label, status, hint, earned, max });

  // ══ META (45) ══

  // ── Title (10) ──
  {
    const title = str(m.title) || str(m.openGraph?.title);
    if (!title) {
      push("title", "عنوان SEO", "error", 0, 10, "أضف عنوان SEO وصفيّاً (30–60 حرفاً)");
    } else if (name && title.toLowerCase() === name.toLowerCase()) {
      push("title", "عنوان SEO", "warning", 5, 10, "العنوان = الاسم فقط — اجعله وصفيّاً");
    } else if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
      const hint = title.length < TITLE_MIN ? "العنوان قصير (<30)" : "العنوان طويل (>60) سيُقصّ";
      push("title", "عنوان SEO", "warning", 6, 10, hint);
    } else {
      push("title", "عنوان SEO", "good", 10, 10);
    }
  }

  // ── Description (10) ──
  {
    const desc = str(m.description);
    if (!desc) {
      push("description", "وصف SEO", "error", 0, 10, "أضف وصف SEO (120–160 حرفاً)");
    } else if (desc.length < DESC_MIN || desc.length > DESC_MAX) {
      const hint = desc.length < DESC_MIN ? "الوصف قصير (<120)" : "الوصف طويل (>160) سيُقصّ";
      push("description", "وصف SEO", "warning", 6, 10, hint);
    } else {
      push("description", "وصف SEO", "good", 10, 10);
    }
  }

  // ── Canonical (6) — must be absolute: Google ignores a relative canonical. ──
  {
    const canonical = str(m.canonical) || str(m.alternates?.canonical);
    if (!canonical) {
      push("canonical", "الرابط الأساسي (Canonical)", "error", 0, 6, "لا يوجد canonical");
    } else if (!isAbsolute(canonical)) {
      push("canonical", "الرابط الأساسي (Canonical)", "error", 2, 6, "الرابط نسبيّ — لازم يبدأ بـ https://");
    } else {
      push("canonical", "الرابط الأساسي (Canonical)", "good", 6, 6);
    }
  }

  // ── Open Graph (7) — the share card: type, url, siteName, locale, and a real image. ──
  {
    const og = m.openGraph;
    const img = firstOgImage(m);
    const imgUrl = str(img?.url);
    const missing: string[] = [];
    if (!str(og?.type)) missing.push("النوع");
    if (!isAbsolute(og?.url)) missing.push("الرابط");
    if (!str(og?.siteName)) missing.push("اسم الموقع");
    // `ar` alone is not enough — Facebook wants the full locale.
    if (!/^[a-z]{2}_[A-Z]{2}$/.test(str(og?.locale))) missing.push("اللغة (ar_SA)");
    if (!imgUrl) missing.push("الصورة");
    else if (/\.svg($|\?)/i.test(imgUrl)) missing.push("صيغة الصورة (SVG مرفوضة)");
    else if (!str(img?.alt)) missing.push("النص البديل للصورة");

    const w = typeof img?.width === "number" ? img.width : 0;
    const h = typeof img?.height === "number" ? img.height : 0;
    const smallImage = Boolean(imgUrl) && w > 0 && h > 0 && (w < OG_IMAGE_MIN_WIDTH || h < OG_IMAGE_MIN_HEIGHT);
    if (smallImage) missing.push("مقاس الصورة (١٢٠٠×٦٣٠)");

    if (missing.length === 0) push("og", "بطاقة المشاركة (Open Graph)", "good", 7, 7);
    else if (missing.length <= 2) push("og", "بطاقة المشاركة (Open Graph)", "warning", 4, 7, `ناقص: ${missing.join(" · ")}`);
    else push("og", "بطاقة المشاركة (Open Graph)", "error", 0, 7, `ناقص: ${missing.join(" · ")}`);
  }

  // ── Twitter card (5) ──
  {
    const tw = m.twitter;
    const images = tw?.images;
    const hasImage =
      (Array.isArray(images) && images.length > 0) || Boolean(str(images)) || Boolean(str(tw?.image));
    const missing: string[] = [];
    if (!str(tw?.card)) missing.push("النوع");
    if (!str(tw?.title)) missing.push("العنوان");
    if (!str(tw?.description)) missing.push("الوصف");
    if (!hasImage) missing.push("الصورة");

    if (missing.length === 0) push("twitter", "بطاقة تويتر", "good", 5, 5);
    else if (missing.length <= 2) push("twitter", "بطاقة تويتر", "warning", 3, 5, `ناقص: ${missing.join(" · ")}`);
    else push("twitter", "بطاقة تويتر", "error", 0, 5, `ناقص: ${missing.join(" · ")}`);
  }

  // ── Robots (3) — must be stored, so a settings change actually reaches Google. ──
  {
    const robots = m.robots;
    const value = typeof robots === "string" ? robots.trim() : isObj(robots) ? "object" : "";
    if (!value) {
      push("robots", "توجيه الأرشفة (robots)", "error", 0, 3, "لا يوجد robots في الميتا المخزَّنة");
    } else if (/noindex/i.test(value)) {
      push("robots", "توجيه الأرشفة (robots)", "error", 0, 3, "الصفحة محجوبة عن الفهرسة (noindex)");
    } else {
      push("robots", "توجيه الأرشفة (robots)", "good", 3, 3);
    }
  }

  // ── hreflang (4) — Modonty serves ar-SA and ar-EG; both must be declared. ──
  //
  // Two stored shapes, both legitimate: the listing pages keep Next.js's
  // `alternates.languages` map, while the content pages keep the flat
  // `hreflang: [{ lang, href }]` array (build-meta-from-page.ts:317). Reading only the
  // first one reported "no hreflang" on pages that had it — a false alarm on real data.
  {
    const langs = m.alternates?.languages;
    const flat = (m as { hreflang?: unknown }).hreflang;
    const keys = isObj(langs)
      ? Object.keys(langs)
      : Array.isArray(flat)
        ? flat.map((e) => (isObj(e) ? str(e.lang) : "")).filter(Boolean)
        : [];
    const missing = REQUIRED_HREFLANGS.filter((l) => !keys.includes(l));
    if (keys.length === 0) {
      push("hreflang", "نسخ اللغة (hreflang)", "error", 0, 4, "لا يوجد hreflang — أضف ar-SA و ar-EG");
    } else if (missing.length > 0) {
      push("hreflang", "نسخ اللغة (hreflang)", "warning", 2, 4, `ناقص: ${missing.join(" · ")}`);
    } else {
      push("hreflang", "نسخ اللغة (hreflang)", "good", 4, 4);
    }
  }

  // ══ JSON-LD (40) ══

  // ── Parses (10) ── everything below depends on this one.
  {
    if (!input.jsonLdStructuredData?.trim()) {
      push("jsonld.present", "وجود JSON-LD", "error", 0, 10, "لا يوجد JSON-LD مخزّن — أعد توليده");
    } else if (!graph) {
      push("jsonld.present", "وجود JSON-LD", "error", 0, 10, "JSON-LD مخزّن لكنه لا يتحلّل — نصّ معطوب");
    } else {
      push("jsonld.present", "وجود JSON-LD", "good", 10, 10);
    }
  }

  // ── @type coverage (6) ──
  {
    if (!graph) {
      push("jsonld.types", "أنواع العقد (@type)", "error", 0, 6, "لا يوجد رسم بياني لفحصه");
    } else if (!/schema\.org/i.test(graph.context)) {
      push("jsonld.types", "أنواع العقد (@type)", "error", 2, 6, "@context ليس schema.org");
    } else if (graph.untyped > 0) {
      push("jsonld.types", "أنواع العقد (@type)", "error", 2, 6, `${graph.untyped} عقدة بلا @type`);
    } else {
      push("jsonld.types", "أنواع العقد (@type)", "good", 6, 6);
    }
  }

  // ── BreadcrumbList (6) — positions 1..N with no gaps, every item absolute. ──
  {
    const crumbs = graph ? nodesOfType(graph, "BreadcrumbList") : [];
    if (!graph) {
      push("jsonld.breadcrumb", "مسار التنقّل (Breadcrumb)", "error", 0, 6, "لا يوجد رسم بياني لفحصه");
    } else if (crumbs.length === 0) {
      push("jsonld.breadcrumb", "مسار التنقّل (Breadcrumb)", "warning", 2, 6, "لا يوجد BreadcrumbList");
    } else {
      const items = crumbs.flatMap((c) => (Array.isArray(c.itemListElement) ? c.itemListElement : []));
      const positions = items.map((it) => (isObj(it) && typeof it.position === "number" ? it.position : NaN));
      const sequential =
        positions.length > 0 && positions.every((p, i) => p === i + 1);
      const relative = items.filter((it) => {
        const url = listItemUrl(isObj(it) ? it.item : undefined);
        return url !== "" && !isAbsolute(url);
      }).length;

      if (!sequential) {
        push("jsonld.breadcrumb", "مسار التنقّل (Breadcrumb)", "error", 2, 6, "ترتيب المواضع مكسور — لازم ١، ٢، ٣ بلا قفزات");
      } else if (relative > 0) {
        push("jsonld.breadcrumb", "مسار التنقّل (Breadcrumb)", "error", 3, 6, `${relative} رابط نسبيّ — لازم يبدأ بـ https://`);
      } else {
        push("jsonld.breadcrumb", "مسار التنقّل (Breadcrumb)", "good", 6, 6);
      }
    }
  }

  // ── Organization (6) — Google reads name + url + a real ImageObject logo. ──
  {
    const orgs = graph ? nodesOfType(graph, "Organization") : [];
    if (!graph) {
      push("jsonld.org", "بطاقة المؤسّسة", "error", 0, 6, "لا يوجد رسم بياني لفحصه");
    } else if (orgs.length === 0) {
      push("jsonld.org", "بطاقة المؤسّسة", "error", 0, 6, "لا توجد عقدة Organization");
    } else {
      const org = orgs[0];
      const logo = org.logo;
      const missing: string[] = [];
      if (!str(org.name)) missing.push("الاسم");
      if (!isAbsolute(org.url)) missing.push("الرابط");
      if (!isObj(logo) || str(logo["@type"]) !== "ImageObject" || !isAbsolute(logo.url)) {
        missing.push("الشعار (ImageObject + url)");
      }
      if (!Array.isArray(org.sameAs) || org.sameAs.length === 0) missing.push("حسابات التواصل (sameAs)");

      if (missing.length === 0) push("jsonld.org", "بطاقة المؤسّسة", "good", 6, 6);
      else if (missing.length === 1) push("jsonld.org", "بطاقة المؤسّسة", "warning", 3, 6, `ناقص: ${missing[0]}`);
      else push("jsonld.org", "بطاقة المؤسّسة", "error", 0, 6, `ناقص: ${missing.join(" · ")}`);
    }
  }

  // ── The page's own content (4) — an ItemList with entries, or an FAQ with questions.
  //    A listing page whose list is empty tells Google there is nothing here.
  {
    if (!graph) {
      push("jsonld.items", "محتوى الصفحة في الرسم", "error", 0, 4, "لا يوجد رسم بياني لفحصه");
    } else {
      const lists = nodesOfType(graph, "ItemList");
      const faqs = nodesOfType(graph, "FAQPage");
      const listEntries = lists.flatMap((l) => (Array.isArray(l.itemListElement) ? l.itemListElement : []));
      const faqEntries = faqs.flatMap((f) => (Array.isArray(f.mainEntity) ? f.mainEntity : []));
      const total = listEntries.length + faqEntries.length;

      // A content page (about, terms, a policy) is prose, not a list — demanding an
      // ItemList there is demanding the wrong shape. It passes on having a page node that
      // carries a name; only a page that IS a list is judged on the list being filled.
      const pageNodes = ["CollectionPage", "WebPage", "AboutPage", "ItemPage"].flatMap((t) =>
        nodesOfType(graph, t),
      );
      const describedPage = pageNodes.some((n) => Boolean(str(n.name)) || Boolean(str(n.description)));

      if (lists.length === 0 && faqs.length === 0) {
        if (describedPage) {
          push("jsonld.items", "محتوى الصفحة في الرسم", "good", 4, 4);
        } else {
          push("jsonld.items", "محتوى الصفحة في الرسم", "warning", 1, 4, "الرسم بلا عقدة صفحة موصوفة");
        }
      } else if (total === 0) {
        push("jsonld.items", "محتوى الصفحة في الرسم", "error", 0, 4, "القائمة موجودة لكنها فارغة");
      } else {
        const relative = listEntries.filter((it) => {
          const url = isObj(it) ? listItemUrl(it.item) || str(it.url) : "";
          return url !== "" && !isAbsolute(url);
        }).length;
        if (relative > 0) {
          push("jsonld.items", "محتوى الصفحة في الرسم", "error", 2, 4, `${relative} رابط نسبيّ داخل القائمة`);
        } else {
          push("jsonld.items", "محتوى الصفحة في الرسم", "good", 4, 4);
        }
      }
    }
  }

  // ── Validator report (8) — the three validators that ran at generation time. ──
  {
    const report = input.jsonLdValidationReport;
    const errors = countReportErrors(report);
    const warnings = countReportWarnings(report);
    if (!graph) {
      push("jsonld.valid", "تقرير المدقّقات", "error", 0, 8, "لا يوجد JSON-LD ليُدقَّق");
    } else if (!report) {
      push("jsonld.valid", "تقرير المدقّقات", "warning", 4, 8, "JSON-LD موجود لكن لم يُتحقّق منه بعد");
    } else if (errors > 0) {
      const first = firstReportError(report);
      const suffix = errors > 1 ? ` (+${errors - 1})` : "";
      push("jsonld.valid", "تقرير المدقّقات", "error", 1, 8, first ? `${first}${suffix}` : `${errors} خطأ في JSON-LD`);
    } else if (warnings > 0) {
      push("jsonld.valid", "تقرير المدقّقات", "warning", 6, 8, `${warnings} تحذير في JSON-LD`);
    } else {
      push("jsonld.valid", "تقرير المدقّقات", "good", 8, 8);
    }
  }

  // ══ SOURCE (15) — skipped when the caller has no such context (see file header). ══

  // ── Authored copy (5) — the row's own columns, not a generator fallback. ──
  if (input.sourceTitle !== undefined || input.sourceDescription !== undefined) {
    const hasTitle = Boolean(str(input.sourceTitle));
    const hasDesc = Boolean(str(input.sourceDescription));
    if (hasTitle && hasDesc) push("source.copy", "النصّ مكتوب في الإعدادات", "good", 5, 5);
    else if (hasTitle || hasDesc) {
      push("source.copy", "النصّ مكتوب في الإعدادات", "warning", 2, 5, hasTitle ? "الوصف فارغ — يُستعمل نصّ احتياطي" : "العنوان فارغ — يُستعمل نصّ احتياطي");
    } else {
      push("source.copy", "النصّ مكتوب في الإعدادات", "error", 0, 5, "العنوان والوصف فارغان — الصفحة تعيش على نصّ احتياطي");
    }
  }

  // ── Freshness (5) — a cache older than the row it describes is serving stale SEO. ──
  //
  // The comparison needs a grace window, and not as a fudge: writing the SEO cache is
  // itself a write to the row, so `updatedAt` (@updatedAt) is stamped by the database a
  // few milliseconds AFTER `lastGenerated` was computed in JS. Comparing them strictly
  // marks every page stale the instant it is regenerated — measured live on the
  // dashboard: a page read "بائت" immediately after a successful fix. Real staleness is
  // an edit that was never regenerated, which is minutes or days out, never seconds.
  if (input.lastGenerated !== undefined || input.sourceUpdatedAt !== undefined) {
    const generated = asDate(input.lastGenerated);
    const updated = asDate(input.sourceUpdatedAt);
    const GRACE_MS = 5 * 60_000;
    const driftMs = generated && updated ? updated.getTime() - generated.getTime() : 0;
    if (!generated) {
      push("source.fresh", "حداثة التوليد", "error", 0, 5, "لم يُولَّد بعد — اضغط «إعادة توليد»");
    } else if (driftMs > GRACE_MS) {
      const days = Math.floor(driftMs / 86_400_000);
      const hours = Math.floor(driftMs / 3_600_000);
      const late = days > 0 ? `بـ${days} يوماً` : hours > 0 ? `بـ${hours} ساعة` : "";
      push("source.fresh", "حداثة التوليد", "error", 1, 5, `بائت ${late} — تغيّرت الإعدادات بعد التوليد`.replace(/\s+/g, " ").trim());
    } else {
      push("source.fresh", "حداثة التوليد", "good", 5, 5);
    }
  }

  // ── Site identity (5) — the handles and author Google attributes the page to. ──
  {
    const authors = m.authors;
    const hasAuthor =
      Boolean(str(m.author)) ||
      Boolean(str(authors)) ||
      (Array.isArray(authors) && authors.length > 0) ||
      (isObj(authors) && Boolean(str(authors.name)));
    const hasSite = Boolean(str(m.twitter?.site));
    if (hasSite && hasAuthor) push("source.identity", "هوية الموقع في الميتا", "good", 5, 5);
    else if (hasSite || hasAuthor) {
      push("source.identity", "هوية الموقع في الميتا", "warning", 2, 5, hasSite ? "لا يوجد author" : "لا يوجد twitter:site");
    } else {
      push("source.identity", "هوية الموقع في الميتا", "error", 0, 5, "ناقص: twitter:site · author");
    }
  }

  const earned = checks.reduce((s, c) => s + c.earned, 0);
  const max = checks.reduce((s, c) => s + c.max, 0);
  const score = max > 0 ? Math.round((earned / max) * 100) : 0;
  return { score, checks };
}
