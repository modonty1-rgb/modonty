/** يوم التقويم كما يُخزَّن في `scheduledFor`: منتصف ليل UTC لذلك اليوم. */
export function utcDay(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}
