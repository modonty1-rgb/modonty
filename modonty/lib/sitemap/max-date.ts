export function maxDate(dates: Array<Date | null | undefined>): Date | undefined {
  const valid = dates.filter((d): d is Date => d instanceof Date);
  if (valid.length === 0) return undefined;
  return new Date(Math.max(...valid.map((d) => d.getTime())));
}
