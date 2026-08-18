/**
 * Is the visitor asking something only the partner can answer — a price, or an appointment?
 *
 * ق١٩ (Khalid, 2026-08-19): these are the two questions Modo is structurally unable to answer.
 * No article states a price, and no article holds a calendar, so retrieval correctly returns
 * nothing and the visitor hits a dead end on the highest-intent question they will ever ask.
 *
 * Deliberately a word list, not a model call: it runs before we know whether the question can be
 * answered, so it must cost nothing. False positives are cheap here — the worst case is offering
 * to pass a question to a partner who could have answered it anyway.
 */
const PRICE_WORDS = ["سعر", "أسعار", "اسعار", "تكلفة", "التكلفة", "كام", "بكم", "التكاليف", "رسوم", "تكلف"];
const APPOINTMENT_WORDS = ["موعد", "مواعيد", "حجز", "احجز", "أحجز", "متاح", "متى أقدر", "دور", "الكشف"];

export function isPriceOrAppointmentQuestion(question: string): boolean {
  const q = question.trim();
  return [...PRICE_WORDS, ...APPOINTMENT_WORDS].some((word) => q.includes(word));
}
