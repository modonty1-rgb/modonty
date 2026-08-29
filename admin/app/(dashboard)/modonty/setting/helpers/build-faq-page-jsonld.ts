/**
 * Build the FAQ page @graph JSON-LD from Settings + the active FAQs.
 *
 * Emits Organization + WebSite + FAQPage in one `@graph`, same as every other modonty listing
 * page. It used to return a bare `FAQPage` with no `@graph`, which meant the shared validator
 * (built around the @graph shape) rejected it — the page was the only one in the system shipping
 * an unvalidated card. FAQPage inside @graph is standard schema.org and keeps Google's FAQ rich
 * result working, while adding the publisher context the other pages already carry.
 */

import { absoluteUrl } from "@modonty/shared/lib/seo/absolute-url";
import { requireSiteUrl } from "@modonty/shared/lib/seo/require-site-url";
import type { SettingsForHomeJsonLd } from "./build-home-jsonld-from-settings";
import { buildSiteOrgAndWebSite } from "./build-clients-page-jsonld";

export interface FaqForJsonLd {
  question: string;
  answer: string;
  dateCreated: Date | null;
  datePublished: Date | null;
  author: string | null;
  upvoteCount: number | null;
  lastReviewed: Date | null;
}

export function buildFaqPageJsonLd(
  settings: SettingsForHomeJsonLd,
  faqs: FaqForJsonLd[]
): Record<string, unknown> {
  const siteUrl = requireSiteUrl(settings.siteUrl).replace(/\/$/, "");
  const faqPageUrl = absoluteUrl("/help/faq", siteUrl);
  const { org, website, inLangCodes } = buildSiteOrgAndWebSite(settings, siteUrl);
  const name =
    ((settings as Record<string, unknown>).faqSeoTitle as string | null)?.trim() || "الأسئلة الشائعة";
  const description =
    ((settings as Record<string, unknown>).faqSeoDescription as string | null)?.trim() ||
    "إجابات على الأسئلة الأكثر شيوعاً حول مدوّنتي.";

  const mainEntity = faqs.map((faq) => {
    const question: Record<string, unknown> = {
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
        ...(faq.dateCreated && { dateCreated: faq.dateCreated.toISOString() }),
        // No `upvoteCount` and no `author` here. `FaqForJsonLd` carries ONE of each, and they
        // describe the QUESTION — who asked it and how many people voted it up. Copying them
        // onto the Answer told Google that the person who asked also wrote the answer, and
        // that the answer had earned the question's votes. Two different entities, one set of
        // values, and the second claim was invented.
        //
        // schema.org gives Answer its own `upvoteCount` and `author`; when the row holds no
        // separate value for them, the honest markup is to omit them.
      },
    };

    if (faq.dateCreated) question.dateCreated = faq.dateCreated.toISOString();
    if (faq.datePublished) question.datePublished = faq.datePublished.toISOString();
    if (faq.upvoteCount != null) question.upvoteCount = faq.upvoteCount;
    // `FAQ.author` is declared `String? @db.ObjectId` — it holds a database id, never a name.
    // Writing it straight into `name` published the raw id to Google as a human's name:
    // {"@type":"Person","name":"69d0209fbe4b3c3ed2425ce6"} appeared twice on /help/faq
    // (measured live 28 Aug 2026). An id is not a name in any language, and marking one up as
    // a Person is both meaningless to a reader and an internal identifier leaked to a third
    // party. Until this column carries a resolvable name, the honest markup is no author at
    // all — same rule as `shareImageAlt`, which refuses a value that is not a description
    // rather than inventing a fallback.
    const authorName = faq.author?.trim();
    const looksLikeObjectId = !!authorName && /^[0-9a-f]{24}$/i.test(authorName);
    if (authorName && !looksLikeObjectId) {
      question.author = { "@type": "Person", name: authorName };
    }

    return question;
  });

  const lastReviewedDates = faqs
    .map((f) => f.lastReviewed)
    .filter((d): d is Date => d != null)
    .sort((a, b) => b.getTime() - a.getTime());

  const faqPage: Record<string, unknown> = {
    "@type": "FAQPage",
    "@id": `${faqPageUrl}#faqpage`,
    name,
    description,
    url: faqPageUrl,
    inLanguage: inLangCodes,
    isPartOf: { "@id": website["@id"] },
    mainEntity,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, item: { "@id": siteUrl, name: "الرئيسية" } },
        { "@type": "ListItem", position: 2, item: { "@id": faqPageUrl, name } },
      ],
    },
    ...(lastReviewedDates.length > 0 && {
      lastReviewed: lastReviewedDates[0].toISOString(),
    }),
  };

  return {
    "@context": "https://schema.org",
    // `website` is built above but deliberately NOT in this graph — /help/faq is not the home
    // page, and Google is explicit: "The WebSite structured data must be on the home page of
    // the site … you only need to add this markup to the home page of your site"
    // (developers.google.com/search/docs/appearance/site-names). `isPartOf` still carries its
    // `@id`, which is the correct cross-page reference. Removed 28 Aug 2026.
    "@graph": [org, faqPage],
  };
}
