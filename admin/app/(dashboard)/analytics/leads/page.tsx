import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getLeadsDetail, type LeadRow } from "../actions/get-leads-detail";

// Leads drill-down (Khalid 2026-07-07: «أبغى أعرف المعلومات كاملة عشان أتعامل مع العملاء»).
// Numbers = GA4 SOT on the overview page; THIS page is the operational follow-up list (our DB).

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  BOOKING: { label: "حجز", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  MESSAGE: { label: "رسالة", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  QUESTION: { label: "سؤال", cls: "bg-violet-500/15 text-violet-700 dark:text-violet-400" },
  COMMENT: { label: "تعليق", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
};

/** Raw statuses from four tables (bookings · messages · questions · comments) in one language. */
const STATUS_LABEL: Record<string, string> = {
  new: "جديد",
  PENDING: "ينتظر",
  contacted: "تواصلنا",
  done: "انتهى",
  read: "مقروءة",
  replied: "رُدّ عليها",
  archived: "مؤرشفة",
  APPROVED: "معتمد",
  PUBLISHED: "منشور",
  REJECTED: "مرفوض",
  ANSWERED: "مُجاب",
};

function StatusBadge({ status }: { status: string }) {
  const isNew = status === "new" || status === "PENDING";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isNew ? "bg-red-500/15 text-red-700 dark:text-red-400" : "bg-muted text-muted-foreground"}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function fmt(iso: string): string {
  return iso.slice(0, 16).replace("T", " ");
}

function LeadTypeBadge({ type }: { type: LeadRow["type"] }) {
  const b = TYPE_BADGE[type];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${b.cls}`}>{b.label}</span>;
}

export default async function LeadsDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  const { type, status } = await searchParams;
  const { rows: allRows, counts, ga4Counts } = await getLeadsDetail();

  // Tiles double as filter tabs (Khalid 2026-07-07)
  const rows = allRows.filter((r) => {
    if (type && r.type !== type) return false;
    if (status === "new" && !(r.status === "new" || r.status === "PENDING")) return false;
    return true;
  });

  const tile = (active: boolean) =>
    `block h-full transition hover:shadow-md ${active ? "ring-2 ring-primary rounded-xl" : ""}`;

  return (
    <div dir="rtl" className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">أفعال الزوار</h1>
          <p className="mt-1 text-muted-foreground">
            الحجوزات والرسائل وأسئلة القراء والتعليقات (آخر 90 يوم) — كل ما تحتاجه للمتابعة
          </p>
        </div>
        <Link href="/analytics" className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">
          <ArrowRight className="size-4" aria-hidden />
          التحاليل
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        <Link href="/analytics/leads" className={tile(!type && !status)}>
          <Card className="h-full">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">كل الأفعال</p>
              <p className="text-2xl font-bold tabular-nums">{allRows.length}</p>
              <p className="text-xs text-muted-foreground">كل ما في الجدول</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics/leads?status=new" className={tile(status === "new")}>
          <Card className="h-full border-t-4 border-t-red-500">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">تحتاج متابعة (جديد)</p>
              <p className="text-2xl font-bold tabular-nums">{counts.newStatus}</p>
              <p className="text-xs text-muted-foreground">ما تواصلنا بعد</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics/leads?type=BOOKING" className={tile(type === "BOOKING")}>
          <Card className="h-full">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">الحجوزات · GA4</p>
              <p className="text-2xl font-bold tabular-nums">{ga4Counts.bookings}</p>
              <p className="text-xs text-muted-foreground">القاعدة: {counts.bookings} · من يوم الإطلاق</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics/leads?type=MESSAGE" className={tile(type === "MESSAGE")}>
          <Card className="h-full">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">رسائل التواصل · GA4</p>
              <p className="text-2xl font-bold tabular-nums">{ga4Counts.messages}</p>
              <p className="text-xs text-muted-foreground">القاعدة: {counts.messages}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics/leads?type=QUESTION" className={tile(type === "QUESTION")}>
          <Card className="h-full">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">أسئلة القراء · GA4</p>
              <p className="text-2xl font-bold tabular-nums">{ga4Counts.questions}</p>
              <p className="text-xs text-muted-foreground">القاعدة: {counts.questions}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics/leads?type=COMMENT" className={tile(type === "COMMENT")}>
          <Card className="h-full">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">التعليقات · GA4</p>
              <p className="text-2xl font-bold tabular-nums">{ga4Counts.comments}</p>
              <p className="text-xs text-muted-foreground">القاعدة: {counts.comments}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>كل أفعال الزوار — الأحدث أولاً</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">ما في أفعال في آخر 90 يوم.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="py-2 pe-3 text-start font-medium">النوع</th>
                    <th className="py-2 pe-3 text-start font-medium">الاسم</th>
                    <th className="py-2 pe-3 text-start font-medium">التواصل</th>
                    <th className="py-2 pe-3 text-start font-medium">العميل</th>
                    <th className="py-2 pe-3 text-start font-medium">التفاصيل / المقال</th>
                    <th className="py-2 pe-3 text-start font-medium">الحالة</th>
                    <th className="py-2 text-start font-medium">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.type}-${r.id}`} className="border-b align-top last:border-0">
                      <td className="py-2 pe-3">
                        <LeadTypeBadge type={r.type} />
                      </td>
                      <td className="py-2 pe-3 font-semibold">{r.name}</td>
                      <td className="py-2 pe-3">
                        {r.phone && <div dir="ltr" className="tabular-nums">{r.phone}</div>}
                        {r.email && <div dir="ltr" className="text-end text-xs text-muted-foreground">{r.email}</div>}
                      </td>
                      <td className="py-2 pe-3">{r.clientName ?? "—"}</td>
                      <td className="max-w-[340px] py-2 pe-3">
                        {r.articleTitle && (
                          <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <FileText className="size-3.5 shrink-0" aria-hidden />
                            {r.articleTitle}
                          </div>
                        )}
                        {r.text && <div className="line-clamp-2">{r.text}</div>}
                        {r.source && <div className="text-xs text-muted-foreground">عبر {r.source}</div>}
                        {r.href && (
                          <Link href={r.href} className="text-xs text-primary underline-offset-2 hover:underline">
                            افتح الرسالة ←
                          </Link>
                        )}
                      </td>
                      <td className="py-2 pe-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="whitespace-nowrap py-2 text-xs tabular-nums text-muted-foreground">{fmt(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
