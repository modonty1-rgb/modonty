import type { FAQ } from "@prisma/client";

interface FAQWithRelations extends FAQ {
  reviewedByUser?: { name: string } | null;
  authorUser?: { name: string } | null;
}

export function generateFAQPageStructuredData(faqs: FAQWithRelations[]) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
  const faqPageUrl = `${siteUrl}/help/faq`;

  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${faqPageUrl}#faqpage`,
    mainEntity: faqs.map((faq, index) => {
      const question: any = {
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      };

      // Add optional Schema.org fields
      if (faq.dateCreated) {
        question.dateCreated = faq.dateCreated.toISOString();
      }
      if (faq.datePublished) {
        question.datePublished = faq.datePublished.toISOString();
      }
      if (faq.author && faq.authorUser) {
        question.author = {
          "@type": "Person",
          name: faq.authorUser.name,
        };
        question.acceptedAnswer.author = {
          "@type": "Person",
          name: faq.authorUser.name,
        };
      }
      if (faq.upvoteCount !== null && faq.upvoteCount !== undefined) {
        question.upvoteCount = faq.upvoteCount;
        question.acceptedAnswer.upvoteCount = faq.upvoteCount;
      }
      if (faq.dateCreated) {
        question.acceptedAnswer.dateCreated = faq.dateCreated.toISOString();
      }

      return question;
    }),
  };

  // Add lastReviewed and reviewedBy at FAQPage level if available
  const lastReviewedDates = faqs
    .map((f) => f.lastReviewed)
    .filter((d): d is Date => d !== null && d !== undefined)
    .sort((a, b) => b.getTime() - a.getTime());

  if (lastReviewedDates.length > 0) {
    structuredData.lastReviewed = lastReviewedDates[0].toISOString();
  }

  // Add speakable structured data if any FAQ has speakable configuration
  const speakableSelectors: string[] = [];
  faqs.forEach((faq, index) => {
    if (faq.speakable && typeof faq.speakable === "object") {
      const speakable = faq.speakable as any;
      if (speakable.cssSelector && Array.isArray(speakable.cssSelector)) {
        speakableSelectors.push(...speakable.cssSelector);
      }
    } else {
      // Default speakable selectors
      speakableSelectors.push(`#faq-question-${index + 1}`, `#faq-answer-${index + 1}`);
    }
  });

  if (speakableSelectors.length > 0) {
    structuredData.speakable = {
      "@type": "SpeakableSpecification",
      cssSelector: speakableSelectors,
    };
  }

  return structuredData;
}
