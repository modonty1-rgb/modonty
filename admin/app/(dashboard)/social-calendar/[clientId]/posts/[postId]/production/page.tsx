import { notFound } from "next/navigation";

import { SubPageHeader } from "../../../components/sub-page-header";
import { MONTH_LABELS, monthParamOfDate } from "../../../../helpers/dates";
import { canSocial } from "../../../../helpers/post-permissions";
import { getCalendarClient, getPostDetail } from "../../../../helpers/queries";
import { requireSocialActor } from "../../../../helpers/require-social-actor";
import { ProductionForm } from "./components/production-form";
import { UploadTipsCard } from "./components/upload-tips-card";

type Props = { params: Promise<{ clientId: string; postId: string }> };

/** صفحة الـ Creative (القديم `calendar/[month]/production/[id]/page.tsx`). */
export default async function SocialPostProductionPage({ params }: Props) {
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
          <span className="shrink-0 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            صفحة الـ Creative
          </span>
        }
        title={`يوم ${post.scheduledFor.getUTCDate()} — ${post.idea || "بدون فكرة"}`}
        clientName={client.name}
        maxWidth="max-w-4xl"
        showFlowLink
      />
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-5 pt-6 lg:grid-cols-[1fr_280px]">
        <ProductionForm
          key={post.updatedAt.toISOString()}
          post={post}
          canProduce={canSocial(actor.role, "produce")}
          backHref={backHref}
        />
        <UploadTipsCard />
      </div>
    </div>
  );
}
