export function formatResultsCount(count: number): string {
  if (count === 0) return "";
  if (count === 1) return "تم العثور على مقال واحد";
  if (count === 2) return "تم العثور على مقالين";
  if (count <= 10) return `تم العثور على ${count} مقالات`;
  return `تم العثور على ${count} مقال`;
}
