/**
 * «الجولة 9» (من 365Scores عبر سيرفر الرادار، ١٥ أكتوبر ٢٠٢٦) → 9. وما زال يقرأ «Regular Season - 8»
 * إن عادت. Null حين لا رقم للجولة.
 */
export function roundNumber(round: string | null): number | null {
  const n = round?.match(/(\d+)\s*$/)?.[1];
  return n ? Number(n) : null;
}
