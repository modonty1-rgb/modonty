import { notFound } from "next/navigation";

import { PostForm } from "../../../components/post-form";
import { PostPageShell } from "../../../components/post-page-shell";
import { MONTH_LABELS, dayName, monthParamOfDate, riyadhToday } from "../../../../helpers/dates";
import { getCalendar, getMonthPostDays, getPostDetail } from "../../../../helpers/queries";
import { requireSocialActor } from "../../../../helpers/require-social-actor";

type Props = { params: Promise<{ calendarId: string; postId: string }> };

/** تعديل البريف + نقل التاريخ (القديم `calendar/[month]/edit/[id]/page.tsx`). */
export default async function EditSocialPostPage({ params }: Props) {
  const { calendarId, postId } = await params;

  const actor = await requireSocialActor("editBrief");
  if ("error" in actor) return <p className="p-6 text-sm text-destructive">{actor.error}</p>;

  const [calendar, post] = await Promise.all([getCalendar(calendarId), getPostDetail(calendarId, postId)]);
  if (!calendar || !post) notFound();

  const year = post.scheduledFor.getUTCFullYear();
  const month = post.scheduledFor.getUTCMonth();
  const day = post.scheduledFor.getUTCDate();
  const postDays = await getMonthPostDays(calendar.id, year, month);
  const backHref = `/social-calendar/${calendar.id}/${monthParamOfDate(post.scheduledFor)}`;

  return (
    <PostPageShell
      calendar={calendar}
      backHref={backHref}
      subtitle={`تعديل منشور · ${dayName(year, month, day)} ${day} ${MONTH_LABELS[month]} ${year}`}
    >
        <PostForm
          mode="edit"
          calendarId={calendar.id}
          postId={post.id}
          initial={{
            year,
            month,
            day,
            idea: post.idea,
            format: post.format,
            funnelStages: post.funnelStages,
            channels: post.channels,
            text: post.text ?? "",
            hook: post.hook ?? "",
            cta: post.cta ?? "",
            scriptUrl: post.scriptUrl ?? "",
            voiceTone: post.voiceTone ?? "",
            inspiration: post.inspiration ?? "",
            notes: post.notes ?? "",
          }}
          postDays={postDays}
          todayYmd={riyadhToday()}
          cancelHref={backHref}
        />
    </PostPageShell>
  );
}
