import { RIYADH_OFFSET_MINUTES } from "./month-labels";

/** عكس `riyadhInputsToDate`: لحظة `publishAt` → قيمتا حقلَي التاريخ والوقت بتوقيت الرياض. */
export function dateToRiyadhInputs(date: Date | null | undefined): { date: string; time: string } {
  if (!date) return { date: "", time: "" };
  const s = new Date(date.getTime() + RIYADH_OFFSET_MINUTES * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const time = s.getUTCHours() === 0 && s.getUTCMinutes() === 0 ? "" : `${pad(s.getUTCHours())}:${pad(s.getUTCMinutes())}`;
  return { date: `${s.getUTCFullYear()}-${pad(s.getUTCMonth() + 1)}-${pad(s.getUTCDate())}`, time };
}
