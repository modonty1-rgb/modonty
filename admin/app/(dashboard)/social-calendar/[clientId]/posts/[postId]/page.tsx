import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, Clapperboard, Pencil, Send } from "lucide-react";

import { PostSummary } from "../../components/post-summary";
import { SubPageHeader } from "../../components/sub-page-header";
import { AssetMedia } from "../../../components/asset-media";
import { StatusBadge } from "../../../components/status-badge";
import { CALENDAR_TIME_ZONE, MONTH_LABELS, monthParamOfDate } from "../../../helpers/dates";
import { canSocial } from "../../../helpers/post-permissions";
import { postHref } from "../../../helpers/post-href";
import { getCalendarClient, getPostAuditTrail, getPostDetail } from "../../../helpers/queries";
import { AUDIT_ACTION_LABEL } from "../../../helpers/social-labels";
import { requireSocialActor } from "../../../helpers/require-social-actor";

type Props = { params: Promise<{ clientId: string; postId: string }> };

function stamp(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleString("ar-SA", { timeZone: CALENDAR_TIME_ZONE, dateStyle: "medium", timeStyle: "short" });
}

/**
 * صفحة المنشور — قراءة كاملة: البريف وبيانات النشر والأصول والخطّ الزمني وسجلّ التدقيق.
 * تحلّ محلّ نافذة «عرض التفاصيل» وصفحة المشاركة العامّة القديمة `/view/entry/[id]` (س١١)،
 * وهي ما يفتحه «نسخ رابط المنشور» وإشعار الجرس.
 */
export default async function SocialPostDetailPage({ params }: Props) {
  const { clientId, postId } = await params;

  const actor = await requireSocialActor("view");
  if ("error" in actor) return <p className="p-6 text-sm text-destructive">{actor.error}</p>;

  const [client, post] = await Promise.all([getCalendarClient(clientId), getPostDetail(clientId, postId)]);
  if (!client || !post) notFound();
  const audit = await getPostAuditTrail(post.id);

  const month = post.scheduledFor.getUTCMonth();
  const year = post.scheduledFor.getUTCFullYear();
  const backHref = post.archivedAt
    ? `/social-calendar/${client.id}/archive`
    : `/social-calendar/${client.id}/${monthParamOfDate(post.scheduledFor)}`;

  const timeline = [
    { label: "بدأ الإنتاج", at: post.productionStartedAt },
    { label: "جاهز للمراجعة", at: post.productionCompletedAt },
    { label: "تم النشر", at: post.publishedAt },
    { label: "آخر تغيير حالة", at: post.statusUpdatedAt },
  ];

  return (
    <div className="min-h-full bg-muted/30">
      <SubPageHeader
        backHref={backHref}
        backLabel={post.archivedAt ? "الأرشيف" : `${MONTH_LABELS[month]} ${year}`}
        badge={<StatusBadge status={post.status} />}
        title={`يوم ${post.scheduledFor.getUTCDate()} — ${post.idea || "بدون فكرة"}`}
        clientName={client.name}
        maxWidth="max-w-4xl"
      />

      <div className="mx-auto max-w-4xl space-y-5 pb-10 pt-6">
        {post.archivedAt && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <Archive className="h-4 w-4 shrink-0" />
            هذا المنشور في الأرشيف — يُسترجع من صفحة الأرشيف.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Link
            href={postHref(client.id, post.id, "production")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Clapperboard className="h-3.5 w-3.5" />
            صفحة الإنتاج
          </Link>
          {(post.status === "READY_TO_PUBLISH" || post.status === "PUBLISHED") && (
            <Link
              href={postHref(client.id, post.id, "publish")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Send className="h-3.5 w-3.5" />
              صفحة النشر
            </Link>
          )}
          {canSocial(actor.role, "editBrief") && (
            <Link
              href={postHref(client.id, post.id, "edit")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
              تعديل
            </Link>
          )}
        </div>

        {post.rejectionNote && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-800 dark:bg-red-950/30">
            <p className="font-semibold text-red-700 dark:text-red-400">سبب الرفض الأخير</p>
            <p className="mt-0.5 whitespace-pre-wrap leading-relaxed text-red-600 dark:text-red-300">{post.rejectionNote}</p>
          </div>
        )}

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 border-b border-border/60 pb-3 text-sm font-bold text-foreground">البريف وبيانات النشر</h2>
          <PostSummary post={post} />
        </section>

        {post.assets.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 border-b border-border/60 pb-3 text-sm font-bold text-foreground">
              الإبداع ({post.assets.length})
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {post.assets.map((a, i) => (
                <div key={a.id} className="overflow-hidden rounded-xl border border-border">
                  <AssetMedia asset={a} className="h-auto max-h-72 w-full bg-black/5" />
                  <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">{a.label || `ملف ${i + 1}`}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-foreground">الخطّ الزمني</h2>
            <dl className="space-y-2 text-xs">
              {timeline.map((t) => (
                <div key={t.label} className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">{t.label}</dt>
                  <dd className="tabular-nums text-foreground">{stamp(t.at)}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">مرّات الرفض</dt>
                <dd className="tabular-nums text-foreground">{post.rejectionCount}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-foreground">السجلّ — مَن فعل ماذا</h2>
            {audit.length === 0 ? (
              <p className="text-xs text-muted-foreground">لا سجلّ بعد.</p>
            ) : (
              <ol className="space-y-2 text-xs">
                {audit.map((row) => (
                  <li key={row.id} className="flex items-start justify-between gap-3 border-b border-border/50 pb-2 last:border-0">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{AUDIT_ACTION_LABEL[row.action] ?? row.action}</p>
                      <p className="truncate text-muted-foreground">
                        {row.userName || row.userEmail}
                        {row.userRole ? ` · ${row.userRole}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{stamp(row.createdAt)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
