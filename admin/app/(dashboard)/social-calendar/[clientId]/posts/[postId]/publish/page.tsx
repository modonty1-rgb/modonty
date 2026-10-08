import { notFound } from "next/navigation";

import { SubPageHeader } from "../../../components/sub-page-header";
import { MONTH_LABELS, monthParamOfDate } from "../../../../helpers/dates";
import { canSocial } from "../../../../helpers/post-permissions";
import { getCalendarClient, getPostDetail } from "../../../../helpers/queries";
import { requireSocialActor } from "../../../../helpers/require-social-actor";
import { PublishForm } from "./components/publish-form";

type Props = { params: Promise<{ clientId: string; postId: string }> };

/** صفحة الميديا باير (القديم `calendar/[month]/publish/[id]/page.tsx`). */
export default async function SocialPostPublishPage({ params }: Props) {
  const { clientId, postId } = await params;

  const actor = await requireSocialActor("view");
  if ("error" in actor) return <p className="p-6 text-sm text-destructive">{actor.error}</p>;

  const [client, post] = await Promise.all([getCalendarClient(clientId), getPostDetail(clientId, postId)]);
  if (!client || !post) notFound();

  const month = post.scheduledFor.getUTCMonth();
  const year = post.scheduledFor.getUTCFullYear();
  const backHref = `/social-calendar/${client.id}/${monthParamOfDate(post.scheduledFor)}`;

  return (
    <div className="min-h-full bg-muted/30">
      <SubPageHeader
        backHref={backHref}
        backLabel={`${MONTH_LABELS[month]} ${year}`}
        badge={
          <span className="shrink-0 rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
            نشر
          </span>
        }
        title={`يوم ${post.scheduledFor.getUTCDate()} — ${post.idea || "بدون فكرة"}`}
        clientName={client.name}
        maxWidth="max-w-2xl"
      />
      <div className="mx-auto max-w-2xl pt-6">
        <PublishForm
          key={post.updatedAt.toISOString()}
          post={post}
          canPublish={canSocial(actor.role, "publish")}
          backHref={backHref}
        />
      </div>
    </div>
  );
}
