import { notFound } from "next/navigation";

import { PostPageShell } from "../../../components/post-page-shell";
import { MONTH_LABELS, monthParamOfDate } from "../../../../helpers/dates";
import { canSocial } from "../../../../helpers/post-permissions";
import { getCalendar, getPostDetail } from "../../../../helpers/queries";
import { requireSocialActor } from "../../../../helpers/require-social-actor";
import { ProductionForm } from "./components/production-form";
import { UploadTipsCard } from "./components/upload-tips-card";

type Props = { params: Promise<{ calendarId: string; postId: string }> };

/** صفحة الـ Creative (القديم `calendar/[month]/production/[id]/page.tsx`). */
export default async function SocialPostProductionPage({ params }: Props) {
  const { calendarId, postId } = await params;

  const actor = await requireSocialActor("view");
  if ("error" in actor) return <p className="p-6 text-sm text-destructive">{actor.error}</p>;

  const [calendar, post] = await Promise.all([getCalendar(calendarId), getPostDetail(calendarId, postId)]);
  if (!calendar || !post) notFound();

  const month = post.scheduledFor.getUTCMonth();
  const year = post.scheduledFor.getUTCFullYear();
  const backHref = `/social-calendar/${calendar.id}/${monthParamOfDate(post.scheduledFor)}`;

  return (
    <PostPageShell calendar={calendar} backHref={backHref} subtitle={<span className="max-w-[560px] truncate">{`صفحة الإبداع · يوم ${post.scheduledFor.getUTCDate()} ${MONTH_LABELS[month]} — ${post.idea || "بدون فكرة"}`}</span>}>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_280px]">
        <ProductionForm
          key={post.updatedAt.toISOString()}
          post={post}
          canProduce={canSocial(actor.role, "produce")}
          backHref={backHref}
        />
        <UploadTipsCard />
      </div>
    </PostPageShell>
  );
}
