import { db } from "@/lib/db";

/** Published, actually-answered questions for an article. An empty answer is not a FAQ. */
export async function getArticleFaqs(articleId: string) {
  const faqs = await db.articleFAQ.findMany({
    where: {
      articleId,
      status: "PUBLISHED",
      AND: [{ answer: { not: null } }, { answer: { not: "" } }],
    },
    orderBy: { position: "asc" },
    select: { id: true, question: true, answer: true, position: true },
  });
  return faqs.filter(
    (f): f is typeof f & { answer: string } => typeof f.answer === "string" && f.answer.length > 0
  );
}
