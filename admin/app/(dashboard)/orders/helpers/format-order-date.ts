const dateFmt = new Intl.DateTimeFormat("ar-SA", { year: "numeric", month: "long", day: "numeric" });

export function formatOrderDate(value: Date): string {
  return dateFmt.format(value);
}
