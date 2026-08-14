/** The cut-off date for the trending window — articles older than this are not scored. */
export function getTrendingTimeRange(days: number = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}
