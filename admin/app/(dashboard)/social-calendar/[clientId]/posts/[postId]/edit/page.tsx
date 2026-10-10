import { notFound } from "next/navigation";

import { PostForm } from "../../../components/post-form";
import { SubPageHeader } from "../../../components/sub-page-header";
import { MONTH_LABELS, monthParamOfDate, riyadhToday } from "../../../../helpers/dates";
import { getCalendarClient, getMonthPostDays, getPostDetail } from "../../../../helpers/queries";
import { requireSocialActor } from "../../../../helpers/require-social-actor";

type Props = { params: Promise<{ clientId: string; postId: string }> };

/** تعديل البريف + نقل التاريخ (القديم `calendar/[month]/edit/[id]/page.tsx`). */
export default async function EditSocialPostPage({ params }: Props) {
  const { clientId, postId } = await params;

  const actor = await requireSocialActor("editBrief");
  if ("error" in actor) return <p className="p-6 text-sm text-destructive">{actor.error}</p>;

  const [client, post] = await Promise.all([getCalendarClient(clientId), getPostDetail(clientId, postId)]);
  if (!client || !post) notFound();

  const year = post.scheduledFor.getUTCFullYear();
  const month = post.scheduledFor.getUTCMonth();
  const day = post.scheduledFor.getUTCDate();
  const postDays = await getMonthPostDays(client.id, year, month);
  const backHref = `/social-calendar/${client.id}/${monthParamOfDate(post.scheduledFor)}`;

  return (
    <div className="min-h-full bg-muted/30">
      <SubPageHeader
        backHref={backHref}
        backLabel={`${MONTH_LABELS[month]} ${year}`}
        title={`تعديل — يوم ${day} — ${post.idea || "بدون فكرة"}`}
        clientName={client.name}
      />
      <div className="mx-auto max-w-6xl pt-6">
        <PostForm
          mode="edit"
          clientId={client.id}
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
      </div>
    </div>
  );
}
