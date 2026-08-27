import { notFound } from "next/navigation";

import { mediaSrc } from "@modonty/shared/lib/media-src";
import { getPlatformDefaultImages } from "@modonty/shared/lib/platform-defaults";

import { generateBreadcrumbStructuredData } from "@/lib/seo";
import { getPlatformSocialLinks, getPlatformImageLicensing } from "@/lib/settings/get-platform-social-links";

import { sanitizeHtml } from "./sanitize-html";
import { readArticleOutline } from "./read-article-outline";
import { getArticleDefaultsFromSettings } from "./get-article-defaults-from-settings";
import { generateArticleStructuredData } from "./generate-article-structured-data";
import {
  getArticleBySlugMinimal,
  getArticleFaqs,
  getRelatedArticlesByArticleId,
  getRelatedArticlesByClient,
  getRelatedArticlesByAuthor,
} from "../data";

// Consolidated "اقرأ أيضاً" — merge the 4 related sources, dedupe, NO cap (Khalid 2026-06-04:
// "ما في انتهاء" → max internal linking for SEO; pool already bounded by source query takes).
type RelatedLike = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  // `bunnyUrl` MUST stay on this type. Narrowing it away silently strips the Bunny copy
  // before `mediaSrc()` ever sees it — the component still calls mediaSrc, gets undefined,
  // and falls back to Cloudinary. tsc is happy either way (2026-07-30).
  featuredImage?: { url: string; bunnyUrl: string | null; blurDataURL: string | null; altText: string | null } | null;
  client?: { name: string } | null;
};

interface ReadMoreItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  // `bunnyUrl` MUST stay on this type. Narrowing it away silently strips the Bunny copy
  // before `mediaSrc()` ever sees it — the component still calls mediaSrc, gets undefined,
  // and falls back to Cloudinary. tsc is happy either way (2026-07-30).
  featuredImage?: { url: string; bunnyUrl: string | null; blurDataURL: string | null; altText: string | null } | null;
  clientName?: string | null;
}

// Trimmed to a whole number of rows. The grid is three across, and an uncapped pool left a
// seventh card alone on the last row — measured 3+3+1.
const READ_MORE_COLUMNS = 3;

/**
 * Everything `/articles/[slug]` reads and derives before it renders anything — the reads, the
 * body pass, the "read more" merge, and the JSON-LD builders. It lives beside the page rather
 * than inside it so the page file is composition only; nothing here changes what ships.
 *
 * Not `'use cache'` on purpose: the cacheable reads are already cached one level down
 * (`getArticleContentBySlug` carries `"use cache"` + `cacheTag("articles")`), while the live
 * counts underneath them must stay uncached. Wrapping this would freeze both together.
 *
 * Calls `notFound()` itself. The page's catch re-throws navigation signals through
 * `unstable_rethrow`, so that behaviour is unchanged by the move.
 */
export async function getArticlePageData(slug: string) {
  // No `auth()` here, deliberately. Next is explicit that touching the session at the top of a
  // route «forces the entire page into dynamic rendering» — and this article is the same bytes
  // for every reader. The five parts that genuinely differ per person read the session inside
  // their own Suspense boundaries in the page, so the article prerenders and only they stream.
  // The article read joins the settings reads instead of queuing behind them: it needs only
  // the slug, so awaiting it second cost a second round trip for nothing. `notFound()` still
  // runs the moment the article resolves — Promise.all settles them together, it does not
  // delay the check (Vercel react-best-practices, `async-parallel`).
  const [articleRaw, articleDefaults, platformSocialLinks, platformImageLicensing] =
    await Promise.all([
      getArticleBySlugMinimal(slug),
      getArticleDefaultsFromSettings(),
      getPlatformSocialLinks(),
      getPlatformImageLicensing(),
    ]);

  if (!articleRaw) {
    // Archived → 410 handled by proxy.ts (Next.js 16 — proxy runs before page).
    // Reaching here means slug genuinely doesn't exist → 404.
    notFound();
  }
  const article = { ...articleRaw, ...articleDefaults };

  // Fetch FAQs + related articles + pending FAQs server-side
  // → Q&A text + internal links appear in raw HTML (Googlebot + AI engines can read them)
  const [
    articleFaqsForJsonLd,
    relatedArticles,
    moreFromClient,
    moreFromAuthor,
  ] = await Promise.all([
    articleRaw._count.faqs > 0 ? getArticleFaqs(articleRaw.id) : Promise.resolve([]),
    getRelatedArticlesByArticleId(articleRaw.id),
    articleRaw.clientId
      ? getRelatedArticlesByClient(articleRaw.clientId, articleRaw.id)
      : Promise.resolve([]),
    articleRaw.authorId
      ? getRelatedArticlesByAuthor(articleRaw.authorId, articleRaw.id)
      : Promise.resolve([]),
  ]);

  // No featured image → platform default (admin /settings/defaults). Fetched only when
  // actually missing — the common path pays nothing.
  const defaultImages = article.featuredImage ? null : await getPlatformDefaultImages();
  const featuredImage =
    article.featuredImage ??
    (defaultImages?.post
      ? {
          url: defaultImages.post,
          bunnyUrl: defaultImages.post,
          altText: article.title,
          // The resolver returns a url only, so there is no stored blur for this branch.
          blurDataURL: null,
        }
      : null);

  // One pass over the body gives the three things derived from its structure: heading ids,
  // the outline the contents list links to, and the summary box's lines.
  const outline = readArticleOutline(sanitizeHtml(article.content));
  const safeHtml = outline.html;

  // derived
  const galleryImages = (article.gallery ?? [])
    .filter((g) => g.media && mediaSrc(g.media))
    .map((g) => ({
      // The media ROW goes through untouched. Two separate bugs lived in this mapping:
      // it read `.url` and dropped the Bunny copy (2026-07-30), then it resolved to a
      // string and dropped the stored blur (2026-08-07). Neither is possible now — the
      // component receives the row and resolves both itself.
      media: g.media!,
      alt: g.media?.altText || article.title,
      caption: g.media?.caption || g.media?.altText || null,
    }));
  const allTags = (article.tags ?? []).map((t) => t.tag).filter(Boolean);
  const visibleTags = allTags.slice(0, 5);
  const extraTags = Math.max(0, allTags.length - visibleTags.length);
  // Was the first three H2s copied verbatim — a box called "أهم النقاط" that asked three
  // questions and answered none, and repeated the contents list word for word. Now it is the
  // first sentence of each of those sections: the answer, not the question.
  const keyPoints = outline.summary;

  const seenReadMore = new Set<string>([article.id]);
  const readMoreItems: ReadMoreItem[] = [];
  const collectReadMore = (arr: RelatedLike[] | undefined, fallbackClient?: string | null) => {
    for (const a of arr ?? []) {
      if (!a || seenReadMore.has(a.id)) continue;
      seenReadMore.add(a.id);
      readMoreItems.push({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt ?? null,
        featuredImage: a.featuredImage ?? null,
        clientName: a.client?.name ?? fallbackClient ?? null,
      });
    }
  };
  collectReadMore(article.relatedTo?.map((r) => r.related), article.client?.name);
  collectReadMore(moreFromClient, article.client?.name);
  collectReadMore(moreFromAuthor);
  collectReadMore(relatedArticles);
  const readMoreTop = readMoreItems.slice(
    0,
    Math.floor(readMoreItems.length / READ_MORE_COLUMNS) * READ_MORE_COLUMNS || readMoreItems.length
  );

  // The stored knowledge-graph card (admin-generated on publish/update) is the designed
  // model: publisher = the CLIENT, YMYL doctor reviewer, citations. Serve it when present —
  // the live generator below is only the fallback for articles that predate generation.
  // (GEO audit 2026-07-13, القسم ٣ — the rich card was stored but never served.)
  const storedCard = article.jsonLdStructuredData?.trim() || null;
  // The stored @graph carries its own BreadcrumbList + FAQPage nodes — suppress the
  // separate live scripts when serving it, or the same entities ship twice. The live
  // FAQPage still ships when visitor questions were approved AFTER the last regeneration.
  const storedHasFaq = storedCard?.includes('"FAQPage"') ?? false;

  // Live fallback JSON-LD, built ONLY when no stored card exists (see the branch in the page).
  // Every published article carries a stored card, so on the normal path this never runs —
  // and it is the heaviest builder on the page (three image crops + tags + semantic keywords).
  // No featured image → substitute the platform POST default (already resolved above as
  // `featuredImage`) so Article JSON-LD never ships without `image` — Google Article
  // rich results require it. The default is admin-enforced 1200×630 (/settings/defaults).
  const buildFallbackArticleJsonLd = (): object =>
    generateArticleStructuredData(
      article.featuredImage || !featuredImage
        ? article
        : { ...article, featuredImage: { ...featuredImage, width: 1200, height: 630 } }
    );
  const buildFallbackBreadcrumb = () =>
    generateBreadcrumbStructuredData([
      { name: "الرئيسية", url: "/" },
      { name: "الشركاء", url: "/clients" },
      { name: article.client.name, url: `/clients/${article.client.slug}` },
      { name: article.title, url: `/articles/${article.slug}` },
    ]);
  return {
    article,
    articleFaqsForJsonLd,
    platformSocialLinks,
    featuredImage,
    outline,
    safeHtml,
    galleryImages,
    allTags,
    visibleTags,
    extraTags,
    keyPoints,
    readMoreTop,
    storedCard,
    storedHasFaq,
    buildFallbackArticleJsonLd,
    buildFallbackBreadcrumb,
  };
}
