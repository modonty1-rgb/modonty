import { AR_DIGITS } from "@/lib/arabic-digits";

/** Western digits → Arabic-Indic, for a number or a string that carries digits. */
export const toArabicDigits = (v: number | string) => String(v).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
