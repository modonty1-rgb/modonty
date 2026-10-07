import { AR_DIGITS as ARABIC_DIGITS } from "@/lib/arabic-digits";

/** «20 نوفمبر 2026» in Arabic — Gregorian on purpose: `ar-SA` alone formats on the Umm al-Qura calendar. */
const GREGORIAN = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** A calendar date as the reader reads it: the Gregorian day, and the ministry's Hijri date in Arabic digits. */
export function formatDates(iso: string, hijri: string): { gregorian: string; hijri: string } {
  return {
    gregorian: GREGORIAN.format(new Date(`${iso}T00:00:00Z`)),
    hijri: hijri.replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]),
  };
}
