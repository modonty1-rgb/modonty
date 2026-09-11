const dateTimeFmt = new Intl.DateTimeFormat("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

export function formatOrderDateTime(value: Date): string {
  return dateTimeFmt.format(value);
}
