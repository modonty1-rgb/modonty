import { jsonLdHtml, jsonLdHtmlFromString } from "@/lib/seo";

interface ArticleFaq {
  question: string;
  answer: string;
}

interface ArticleJsonLdProps {
  /** The admin-generated @graph card, when the article has one. */
  storedCard: string | null;
  /** True when that stored card already carries a FAQPage node. */
  storedHasFaq: boolean;
  /** Built only on the fallback branch — passed as functions so the heavy builders never run
   *  for an article that has a stored card. */
  buildFallbackArticleJsonLd: () => object;
  buildFallbackBreadcrumb: () => object;
  faqs: ArticleFaq[];
}

/**
 * Every structured-data block the article ships, in one place — the page composes, it does not
 * hand-write script tags.
 *
 * Placement is unchanged and deliberate: Google states JSON-LD may sit in the `<head>` **or the
 * `<body>`** ("A JavaScript notation embedded in a `<script>` tag in the `<head>` and `<body>`
 * elements of an HTML page" — Introduction to structured data markup, developers.google.com),
 * so rendering these from a component inside the page body is supported, not a workaround.
 *
 * The branching is copied verbatim from the page and must stay that way: what ships is a
 * contract with Google, and this component only decides WHERE the markup is written.
 */
export function ArticleJsonLd({
  storedCard,
  storedHasFaq,
  buildFallbackArticleJsonLd,
  buildFallbackBreadcrumb,
  faqs,
}: ArticleJsonLdProps) {
  return (
    <>
      {storedCard ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtmlFromString(storedCard) }} />
      ) : (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLdHtml(buildFallbackArticleJsonLd()) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLdHtml(buildFallbackBreadcrumb()) }}
          />
        </>
      )}
      {/* The site-identity script used to sit here. It was removed on 25 Aug 2026 for three
          reasons, in order of weight:

          1. It defined `/#organization` a second time on the page. The comment that justified
             it ("its @id does not collide with the stored card's nodes") had gone stale: the
             stored card now carries that node too, so one page shipped two different
             definitions of the same entity — measured on /articles/العلاج-الجدلي-السلوكي.
          2. It built the brand from constants in code (BRAND_AR, BRAND_EN, LOGO_URL), while
             the stored card builds it from Settings. The richer and editable one is the card:
             it carries the description, the licensing block and five sameAs links.
          3. Its `WebSite` node put site-level markup on an article. Google: "The WebSite
             structured data must be on the home page of the site" (Site names, 10 Dec 2025).

          Nothing is lost — `isPartOf` still references the site entity by @id. */}
      {faqs.length > 0 && !storedHasFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdHtml({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            }),
          }}
        />
      )}
    </>
  );
}
