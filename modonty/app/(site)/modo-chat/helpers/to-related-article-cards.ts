/**
 * Floor for offering another article as «ذات صلة». PROVISIONAL like every reranker number in
 * the article route — the vendor prescribes calibrating on 30–50 real questions, which has not been run.
 */
const RELATED_MIN_SCORE = 0.15;

/**
 * Turns ranked candidates into cards, dropping anything the reranker did not actually find
 * relevant.
 *
 * The reranker returns its top N whatever their scores, so with no floor every question
 * produced five "related articles". Measured live 2026-08-18: «كم مدة التعافي بعد العلاج
 * التداخلي؟» — asked inside an article about exactly that treatment — was answered with
 * سلس البول · تكميم المعدة · التهاب اللثة · التهاب سقف الحلق · الطب النفسي. Offering a
 * visitor five unrelated articles is worse than offering none: it reads as "we have nothing".
 */
export const toRelatedArticleCards = <T extends { id: string; title: string; slug: string; excerpt: string | null; client: { name: string; slug: string } }>(
  candidates: T[],
  order: { index: number; relevanceScore?: number }[]
) =>
  order
    .filter((r) => (r.relevanceScore ?? 0) >= RELATED_MIN_SCORE)
    .map((r) => candidates[r.index])
    .filter((a): a is T => Boolean(a))
    .map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt ?? null,
      client: a.client,
    }));
