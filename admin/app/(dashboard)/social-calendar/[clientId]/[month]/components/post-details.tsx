import type { SocialPostRow } from "../../../helpers/queries";
import { CALENDAR_TIME_ZONE } from "../../../helpers/dates";
import { FUNNEL_LABEL, PAID_LABEL } from "../../../helpers/social-labels";
import { DetailCard, Fact, FactGroup } from "@/components/shared/advanced-table";

const TIME = new Intl.DateTimeFormat("ar-SA", { timeZone: CALENDAR_TIME_ZONE, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

function TextFact({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-foreground">{value?.trim() || "—"}</dd>
    </div>
  );
}

/** ما تحت الصفّ المفتوح: البريف · بيانات النشر · ثم الأفعال بأسمائها. */
export function PostDetails({ post, actions }: { post: SocialPostRow; actions: React.ReactNode }) {
  return (
    <DetailCard
      columns="lg:grid-cols-[minmax(0,1.6fr)_1px_minmax(0,1fr)]"
      groups={[
        <FactGroup key="brief" title="البريف">
          <div className="grid w-full gap-3 sm:grid-cols-2">
            <TextFact label="الخطّاف" value={post.hook} />
            <TextFact label="الدعوة" value={post.cta} />
            <div className="sm:col-span-2">
              <TextFact label="النص" value={post.text} />
            </div>
          </div>
        </FactGroup>,
        <FactGroup key="publish" title="النشر" spread>
          <Fact label="هدف الحملة" value={post.funnelStages.length ? post.funnelStages.map((s) => FUNNEL_LABEL[s]).join("، ") : "—"} />
          <Fact label="نوع النشر" value={post.paidKind ? PAID_LABEL[post.paidKind] : "—"} />
          <Fact label="موعد النشر" value={post.publishAt ? TIME.format(post.publishAt) : "—"} />
          <Fact label="الملفات" value={post.assets.length} />
          {post.rejectionCount > 0 && <Fact label="مرّات الرفض" value={post.rejectionCount} tone="text-destructive" />}
        </FactGroup>,
      ]}
      footer={
        <>
          {post.rejectionNote && post.status === "IN_PRODUCTION" && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">سبب الرفض الأخير: {post.rejectionNote}</p>
          )}
          {actions}
        </>
      }
    />
  );
}
