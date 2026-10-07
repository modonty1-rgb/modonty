import type { getActiveFAQs } from "../actions/get-active-faqs";

export function getFaqLastUpdated(faqs: Awaited<ReturnType<typeof getActiveFAQs>>) {
  return faqs.length > 0
    ? faqs.reduce((latest, faq) => {
        const faqDate = faq.lastReviewed || faq.updatedAt;
        return !latest || (faqDate && faqDate > latest) ? faqDate : latest;
      }, faqs[0]?.lastReviewed || faqs[0]?.updatedAt)
    : null;
}
