import { formatMonthParam } from "./format-month-param";

/** شهر `scheduledFor` (المخزَّن منتصف ليل UTC) بصيغة الرابط. */
export function monthParamOfDate(date: Date): string {
  return formatMonthParam(date.getUTCFullYear(), date.getUTCMonth());
}
