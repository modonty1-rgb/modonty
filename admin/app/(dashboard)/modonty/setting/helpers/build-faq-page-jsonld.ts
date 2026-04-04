/**
 * Build FAQPage JSON-LD structured data from active FAQs.
 */

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
  siteUrl: string,
  faqs: FaqForJsonLd[]
): Record<string, unknown> {
  const faqPageUrl = `${siteUrl}/help/faq`;

  const mainEntity = faqs.map((faq) => {
    const question: Record<string, unknown> = {
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
        ...(faq.dateCreated && { dateCreated: faq.dateCreated.toISOString() }),
        ...(faq.upvoteCount != null && { upvoteCount: faq.upvoteCount }),
        ...(faq.author && { author: { "@type": "Person", name: faq.author } }),
      },
    };

    if (faq.dateCreated) question.dateCreated = faq.dateCreated.toISOString();
    if (faq.datePublished) question.datePublished = faq.datePublished.toISOString();
    if (faq.upvoteCount != null) question.upvoteCount = faq.upvoteCount;
    if (faq.author) question.author = { "@type": "Person", name: faq.author };

    return question;
  });

  const lastReviewedDates = faqs
    .map((f) => f.lastReviewed)
    .filter((d): d is Date => d != null)
    .sort((a, b) => b.getTime() - a.getTime());

  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${faqPageUrl}#faqpage`,
    url: faqPageUrl,
    mainEntity,
    ...(lastReviewedDates.length > 0 && {
      lastReviewed: lastReviewedDates[0].toISOString(),
    }),
  };

  return structuredData;
}
