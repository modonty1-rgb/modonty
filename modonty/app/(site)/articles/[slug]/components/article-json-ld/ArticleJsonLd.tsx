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
  siteIdentityJsonLd: object;
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
  siteIdentityJsonLd,
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(siteIdentityJsonLd) }} />
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
