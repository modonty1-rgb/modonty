import { toArabicDigits } from "@/lib/audio/to-arabic-digits";
import type { ListenQueueLabels } from "../components/listen-queue/ListenQueue";

/** «ساعتان و١٣ دقيقة» — a total is read, not counted, so it is said in words. */
export function totalPhrase(seconds: number, labels: ListenQueueLabels) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  const hours =
    h === 0 ? "" : h === 1 ? labels.hourForms.one : h === 2 ? labels.hourForms.two : `${toArabicDigits(String(h))} ${labels.hourForms.many}`;
  const mins =
    m === 0 ? "" : m === 1 ? labels.minuteForms.one : m === 2 ? labels.minuteForms.two : `${toArabicDigits(String(m))} ${labels.minuteForms.many}`;
  return [hours, mins].filter(Boolean).join(labels.joiner) || labels.underMinute;
}
