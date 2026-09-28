/**
 * «ما ردّ» — an attempt, not a conversation (Khalid, 28 Sep 2026).
 *
 * Measured on dev: 14 follow-ups typed «بدون رد» by hand in half an hour (7 Sep). Counted as
 * contact they would move every one of those leads to «تواصلنا» and colour its row, though no
 * one had spoken. So an attempt is a follow-up whose text is one of these phrases: it is kept in
 * the history, it does not move the stage, and it does not mark the row. The button writes
 * `NO_ANSWER_BODY`; the other phrases are how the team already typed it.
 */
export const NO_ANSWER_BODY = "ما ردّ";

const PHRASES = new Set(["ما رد", "بدون رد", "لم يرد", "لا يوجد رد", "مارد"]);

export function isNoAnswer(body: string | null | undefined): boolean {
  const t = (body ?? "").replace(/[ً-ْ]/g, "").replace(/[.،!]/g, "").trim();
  return PHRASES.has(t);
}
