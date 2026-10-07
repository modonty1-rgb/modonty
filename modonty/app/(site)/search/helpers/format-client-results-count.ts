export function formatClientResultsCount(count: number): string {
  if (count === 0) return "";
  if (count === 1) return "تم العثور على شريك واحد";
  if (count === 2) return "تم العثور على شريكين";
  if (count <= 10) return `تم العثور على ${count} شركاء`;
  return `تم العثور على ${count} شريك`;
}
