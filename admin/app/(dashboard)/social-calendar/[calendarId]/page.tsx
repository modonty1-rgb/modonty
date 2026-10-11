import { notFound, redirect } from "next/navigation";

import { formatMonthParam, riyadhToday } from "../helpers/dates";
import { getCalendar } from "../helpers/queries";

/** `/social-calendar/{calendarId}` بلا شهر → الشهر الحالي بتوقيت الرياض. */
export default async function ClientCalendarIndex({ params }: { params: Promise<{ calendarId: string }> }) {
  const { calendarId } = await params;
  const calendar = await getCalendar(calendarId);
  if (!calendar) notFound();
  const t = riyadhToday();
  redirect(`/social-calendar/${calendar.id}/${formatMonthParam(t.year, t.month)}`);
}
