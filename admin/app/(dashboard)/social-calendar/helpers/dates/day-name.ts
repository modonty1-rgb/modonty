import { DAY_NAMES } from "./month-labels";

/** اسم اليوم بالعربية من السنة الحقيقية — لا من «السنة الحالية» كما كان القديم يفعل. */
export function dayName(year: number, month: number, day: number): string {
  return DAY_NAMES[new Date(Date.UTC(year, month, day)).getUTCDay()];
}
