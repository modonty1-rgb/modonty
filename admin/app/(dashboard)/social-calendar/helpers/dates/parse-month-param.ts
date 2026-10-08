export interface CalendarMonth {
  year: number;
  /** 0-11 */
  month: number;
}

/**
 * `2026-10` → `{ year: 2026, month: 9 }`. أي صيغة أخرى → null (الصفحة تردّ notFound).
 * السنة محصورة في مدى معقول كي لا يصير الرابط بوّابة لتواريخ عبثية.
 */
export function parseMonthParam(param: string): CalendarMonth | null {
  const m = /^(d{4})-(d{2})$/.exec(param);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  if (year < 2020 || year > 2100 || month < 0 || month > 11) return null;
  return { year, month };
}
