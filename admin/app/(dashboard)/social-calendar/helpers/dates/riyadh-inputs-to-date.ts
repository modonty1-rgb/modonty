import { RIYADH_OFFSET_MINUTES } from "./month-labels";

/**
 * حقلا «موعد النشر» (تاريخ + وقت) كما يكتبهما الميديا باير بتوقيت الرياض → لحظة واحدة.
 * بلا وقت = منتصف الليل (نفس قرار PRD §٣.٣ لترحيل `scheduledTime` الفارغ).
 */
export function riyadhInputsToDate(date: string, time: string | null | undefined): Date | null {
  const d = /^(d{4})-(d{2})-(d{2})$/.exec(date);
  if (!d) return null;
  const t = time ? /^(d{2}):(d{2})$/.exec(time) : null;
  const hours = t ? Number(t[1]) : 0;
  const minutes = t ? Number(t[2]) : 0;
  const utc = Date.UTC(Number(d[1]), Number(d[2]) - 1, Number(d[3]), hours, minutes) - RIYADH_OFFSET_MINUTES * 60_000;
  const result = new Date(utc);
  return Number.isNaN(result.getTime()) ? null : result;
}
