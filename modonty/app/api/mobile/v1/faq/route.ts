import { getActiveFAQs } from "@/app/(site)/help/faq/actions/faq-actions";
import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";

/**
 * GET /api/mobile/v1/faq · public — the help screen's questions.
 * `getActiveFAQs` — what `/help/faq` renders: active FAQs in the editor's order, with the
 * helpful / not-helpful counts recomputed from the feedback rows. Like the web, a failed read
 * is logged inside the function and answers an empty list.
 */
export const GET = handle("faq", async () => {
  const faqs = await getActiveFAQs();
  return ok(
    {
      items: faqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        lastReviewed: f.lastReviewed ?? null,
        updatedAt: f.updatedAt,
        upvoteCount: f.upvoteCount,
        downvoteCount: f.downvoteCount,
      })),
    },
    PUBLIC_CACHE,
  );
});
