import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Eye, Sparkles } from "lucide-react";
import { getClientOverview } from "@/lib/analytics/ga4-data-api";

const EVENT_LABEL_AR: Record<string, string> = {
  article_view: "مشاهدة مقال",
  article_like: "إعجاب بمقال",
  article_dislike: "عدم إعجاب",
  article_favorite: "حفظ مقال",
  article_share: "مشاركة مقال",
  comment_submit: "تعليق جديد",
  comment_reply: "ردّ على تعليق",
  comment_like: "إعجاب بتعليق",
  comment_dislike: "عدم إعجاب بتعليق",
  client_view: "زيارة صفحتك",
  client_share: "مشاركة صفحتك",
  client_favorite: "حفظ صفحتك",
  client_comment_submit: "تعليق على صفحتك",
  newsletter_subscribe: "اشتراك في النشرة",
  follow_client: "متابعة جديدة",
  outbound_click: "نقرة CTA",
  contact_submit: "رسالة تواصل",
  ask_client_submit: "سؤال للعميل",
  campaign_interest: "اهتمام بحملة",
  conversion_complete: "تحويل مكتمل",
};

function arLabel(name: string): string {
  return EVENT_LABEL_AR[name] ?? name;
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("ar-SA").format(n);
}

async function GA4Stats({ clientId }: { clientId: string }) {
  let data;
  try {
    data = await getClientOverview(clientId);
  } catch (err) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>⚠️ تعذّر الاتصال بـ Google Analytics:</strong>{" "}
        {err instanceof Error ? err.message : "خطأ غير معروف"}.
        <div className="mt-2 text-xs">
          تأكّد من إعداد GA4 env vars في Vercel: GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY_BASE64.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-medium">نشط الآن</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-900">
            {formatNumber(data.activeUsers30Min)}
          </div>
          <div className="text-xs text-emerald-700/70">آخر 30 دقيقة</div>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100/50 p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Eye className="h-4 w-4" />
            <span className="text-xs font-medium">إجمالي الأحداث (7 أيام)</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-900">
            {formatNumber(data.totalEvents7d)}
          </div>
          <div className="text-xs text-blue-700/70">
            {formatNumber(data.totalEvents28d)} في آخر 28 يوم
          </div>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-violet-50 to-violet-100/50 p-4">
          <div className="flex items-center gap-2 text-violet-700">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">زوار فريدون (7 أيام)</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-violet-900">
            {formatNumber(data.uniqueUsers7d)}
          </div>
          <div className="text-xs text-violet-700/70">
            {formatNumber(data.uniqueUsers28d)} في آخر 28 يوم
          </div>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-amber-100/50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium">أنواع الأحداث</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-900">
            {data.topEvents.length}
          </div>
          <div className="text-xs text-amber-700/70">حدث مختلف نشط</div>
        </div>
      </div>

      {data.topEvents.length > 0 && (
        <div className="mt-4 rounded-lg border bg-card p-4">
          <h4 className="mb-3 text-sm font-semibold text-foreground">أهم الأحداث (7 أيام)</h4>
          <div className="space-y-2">
            {data.topEvents.slice(0, 5).map((evt) => {
              const max = data.topEvents[0]?.count || 1;
              const pct = (evt.count / max) * 100;
              return (
                <div key={evt.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{arLabel(evt.name)}</span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatNumber(evt.count)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-lg border bg-muted/30" />
      ))}
    </div>
  );
}

export function GA4RealtimeCard({ clientId }: { clientId: string }) {
  return (
    <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50/30 via-white to-blue-50/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-emerald-100 p-1.5">
            <Activity className="h-4 w-4 text-emerald-700" />
          </div>
          <div>
            <CardTitle className="text-base">إحصائيات Google Analytics المباشرة</CardTitle>
            <CardDescription className="text-xs">
              بيانات فعلية من زوّار موقعك على مودونتي · تُحدَّث كل دقيقة
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<LoadingSkeleton />}>
          <GA4Stats clientId={clientId} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
