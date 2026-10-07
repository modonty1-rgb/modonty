/**
 * Reader-submitted questions = articleFAQ rows whose source is `chatbot` or
 * `user`. Manual FAQs (created by the modonty team) live under /dashboard/faqs;
 * this page is the **inbox** for actual reader interactions.
 */
export function readerSourceFilter() {
  return { OR: [{ source: "chatbot" }, { source: "user" }] };
}
