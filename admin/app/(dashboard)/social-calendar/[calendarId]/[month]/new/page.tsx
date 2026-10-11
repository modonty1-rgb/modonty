import { notFound } from "next/navigation";

import { PostForm } from "../../components/post-form";
import { PostPageShell } from "../../components/post-page-shell";
import { MONTH_LABELS, daysInMonth, parseMonthParam, riyadhToday } from "../../../helpers/dates";
import { getCalendar, getMonthPostDays } from "../../../helpers/queries";
import { requireSocialActor } from "../../../helpers/require-social-actor";

type Props = {
  params: Promise<{ calendarId: string; month: string }>;
  searchParams: Promise<{ day?: string }>;
};

/**
 * منشور جديد (القديم `calendar/[month]/new/page.tsx`). اليوم الافتراضي = اليوم إن كان الشهر
 * الحالي، وإلّا الأوّل — و`?day=15` يحدّده مباشرة.
 */
export default async function NewSocialPostPage({ params, searchParams }: Props) {
  const [{ calendarId, month: monthParam }, { day: dayParam }] = await Promise.all([params, searchParams]);
  const cm = parseMonthParam(monthParam);
  if (!cm) notFound();

  const actor = await requireSocialActor("editBrief");
  if ("error" in actor) return <p className="p-6 text-sm text-destructive">{actor.error}</p>;

  const calendar = await getCalendar(calendarId);
  if (!calendar) notFound();

  const postDays = await getMonthPostDays(calendar.id, cm.year, cm.month);
  const today = riyadhToday();
  const requested = Number(dayParam);
  const day =
    Number.isInteger(requested) && requested >= 1 && requested <= daysInMonth(cm.year, cm.month)
      ? requested
      : today.year === cm.year && today.month === cm.month
        ? today.day
        : 1;

  const backHref = `/social-calendar/${calendar.id}/${monthParam}`;

  return (
    <PostPageShell calendar={calendar} backHref={backHref} subtitle={`منشور جديد · ${MONTH_LABELS[cm.month]} ${cm.year}`}>
        <PostForm
          mode="create"
          calendarId={calendar.id}
          initial={{
            year: cm.year,
            month: cm.month,
            day,
            idea: "",
            format: null,
            funnelStages: [],
            channels: [],
            text: "",
            hook: "",
            cta: "",
            scriptUrl: "",
            voiceTone: "",
            inspiration: "",
            notes: "",
          }}
          postDays={postDays}
          todayYmd={today}
          cancelHref={backHref}
        />
    </PostPageShell>
  );
}
