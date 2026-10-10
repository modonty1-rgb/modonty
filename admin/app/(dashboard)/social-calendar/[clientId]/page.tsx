import { notFound, redirect } from "next/navigation";

import { formatMonthParam, riyadhToday } from "../helpers/dates";
import { getCalendarClient } from "../helpers/queries";

/** `/social-calendar/{clientId}` بلا شهر → الشهر الحالي بتوقيت الرياض. */
export default async function ClientCalendarIndex({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const client = await getCalendarClient(clientId);
  if (!client) notFound();
  const t = riyadhToday();
  redirect(`/social-calendar/${client.id}/${formatMonthParam(t.year, t.month)}`);
}
