import { SITE_URL } from "@/constants";

export function generateFAQPageStructuredData(faqs: any[]) {
  const siteUrl = SITE_URL;
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

      if (faq.dateCreated) {
        question.dateCreated = new Date(faq.dateCreated).toISOString();
      }
      if (faq.datePublished) {
        question.datePublished = new Date(faq.datePublished).toISOString();
      }
      if (faq.author) {
        question.author = {
          "@type": "Person",
          name: faq.author,
        };
        question.acceptedAnswer.author = {
          "@type": "Person",
          name: faq.author,
        };
      }
      if (faq.upvoteCount !== null && faq.upvoteCount !== undefined) {
        question.upvoteCount = faq.upvoteCount;
        question.acceptedAnswer.upvoteCount = faq.upvoteCount;
      }
      if (faq.dateCreated) {
        question.acceptedAnswer.dateCreated = new Date(faq.dateCreated).toISOString();
      }

      return question;
    }),
  };

  const lastReviewedDates = faqs
    .map((f) => f.lastReviewed)
    .filter((d) => d !== null && d !== undefined)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  if (lastReviewedDates.length > 0) {
    structuredData.lastReviewed = lastReviewedDates[0].toISOString();
  }

  const speakableSelectors: string[] = [];
  faqs.forEach((faq, index) => {
    if (faq.speakable && typeof faq.speakable === "object") {
      const speakable = faq.speakable as any;
      if (speakable.cssSelector && Array.isArray(speakable.cssSelector)) {
        speakableSelectors.push(...speakable.cssSelector);
      }
    } else {
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
