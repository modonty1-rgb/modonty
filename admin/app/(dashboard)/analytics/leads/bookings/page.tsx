import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getBookingsReport } from "../../actions/get-bookings-report";
import { FAIL_REASON_LABEL } from "../../helpers/book-funnel";

// Bookings & leads — rebuilt decision-first (Khalid 2026-07-23: «تديني حاجة أعرف
// أتخذ عليها قرار، مش صفحة فيها حشو»). The page answers ONE question: who needs
// contact now, and which clients are leaking (opens, zero bookings). Everything
// else (funnel, sources, reconciliation) is diagnostics — folded away, not deleted.

const SOURCE_LABEL: Record<string, string> = {
  article_dock: "الشريط الثابت في المقال",
  article_card: "بطاقة المقال",
  client_page: "صفحة العميل",
  client_list: "قائمة العملاء",
};

function fmt(iso: string): string {
  return iso.slice(0, 16).replace("T", " ");
}

const STATUS_LABEL: Record<string, string> = { new: "جديد", contacted: "تواصلنا", done: "انتهى" };

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "new"
      ? "bg-red-500/15 text-red-700 dark:text-red-400"
      : status === "contacted"
        ? "bg-amber-500/15 text-amber-800 dark:text-amber-400"
        : status === "done"
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
          : "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{STATUS_LABEL[status] ?? status}</span>;
}

function Bar({ value, max }: { value: number; max: number }) {
  if (value === 0 || max === 0) return null;
  const pct = Math.max(4, Math.round((value / max) * 100));
  return <span className="block h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} aria-hidden="true" />;
}

export default async function BookingsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; client?: string; channel?: string }>;
}) {
  const { status, client, channel } = await searchParams;
  const { rows: allRows, byClient, bySource, unaccountedOpens, funnel } = await getBookingsReport();

  const isWhatsApp = channel === "whatsapp";
  const scoped = channel ? allRows.filter((r) => r.channel === channel) : allRows;
  const rows = scoped.filter((r) => {
    if (status && r.status !== status) return false;
    if (client && r.clientName !== client) return false;
    return true;
  });

  const nNew = scoped.filter((r) => r.status === "new").length;
  const nContacted = scoped.filter((r) => r.status === "contacted").length;
  const nDone = scoped.filter((r) => r.status === "done").length;

  // Leaking clients — a FORM journey (book page opened, nothing booked). WhatsApp has
  // no page funnel, so this concept does not apply there.
  const leaks = isWhatsApp
    ? []
    : byClient.filter((c) => (c.opened ?? 0) > 0 && c.total === 0).sort((a, b) => (b.opened ?? 0) - (a.opened ?? 0));
  const maxLeak = leaks[0]?.opened ?? 0;

  // Merge-preserving query builder: change one facet, keep the rest. Pass `undefined` to drop one.
  const q = (next: { status?: string; client?: string; channel?: string }) => {
    const merged = { status, client, channel, ...next };
    const p = new URLSearchParams();
    if (merged.status) p.set("status", merged.status);
    if (merged.client) p.set("client", merged.client);
    if (merged.channel) p.set("channel", merged.channel);
    const s = p.toString();
    return `/analytics/leads/bookings${s ? `?${s}` : ""}`;
  };

  const tab = (active: boolean) =>
    `rounded-md border px-3 py-1 text-xs transition ${
      active ? "border-foreground bg-foreground font-semibold text-background" : "border-input hover:bg-muted"
    }`;

  return (
    <div dir="rtl" className="mx-auto max-w-[1000px] space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">الحجوزات والليدز</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            آخر 90 يوم · مين تتصل فيه الآن، ومين من العملاء يتسرّب منه الحجز
          </p>
        </div>
        <Link href="/" className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">
          <ArrowRight className="size-4" aria-hidden />
          لوحة التحكم
        </Link>
      </div>

      {/* The decision — two numbers, not five. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-s-4 border-s-red-500">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">تحتاج اتصال</p>
            <p className="text-3xl font-bold tabular-nums text-red-600 dark:text-red-400">{nNew}</p>
            <p className="text-xs text-muted-foreground">
              {isWhatsApp
                ? "ليدز واتساب جديدة — المحادثة راحت للعميل يتابعها"
                : "حجوزات جديدة ما أحد اتصل فيها بعد"}
            </p>
          </CardContent>
        </Card>

        {isWhatsApp ? (
          <Card className="border-s-4 border-s-[#25d366]">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">ليدز واتساب (90 يوم)</p>
              <p className="text-3xl font-bold tabular-nums text-[#1a7f4b] dark:text-[#3ddc84]">{scoped.length}</p>
              <p className="text-xs text-muted-foreground">محادثات بلا اسم وصلت للعملاء</p>
            </CardContent>
          </Card>
        ) : (
          <Card className={`border-s-4 ${leaks.length ? "border-s-amber-500" : "border-s-emerald-500"}`}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">عملاء يتسرّب منهم الحجز</p>
              <p
                className={`text-3xl font-bold tabular-nums ${
                  leaks.length ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {leaks.length}
              </p>
              <p className="text-xs text-muted-foreground">صفحة الحجز انفتحت وصفر حجوزات — فلوس تمشي</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Leaking clients — the single most fixable loss. Only when there is one. */}
      {!isWhatsApp && leaks.length > 0 && (
        <Card className="border-amber-500/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">عملاء يتسرّب منهم الحجز — أصلحهم أولاً</CardTitle>
            <p className="text-xs text-muted-foreground">
              زيارات حقيقية لصفحة حجزهم وما انحجز شي — غالباً زر التواصل معطّل أو ناقص
            </p>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pe-3 text-start font-medium">العميل</th>
                  <th className="py-2 pe-3 text-start font-medium">فتحوا الصفحة</th>
                  <th className="w-[40%] py-2 text-start font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {leaks.map((c) => (
                  <tr key={c.name} className="border-b last:border-0">
                    <td className="py-2 pe-3 font-semibold">{c.name}</td>
                    <td className="py-2 pe-3 font-bold tabular-nums text-amber-600 dark:text-amber-400">{c.opened}</td>
                    <td className="py-2">
                      <Bar value={c.opened ?? 0} max={maxLeak} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* The leads — the act-now list. Defaults to everything; New tab is the queue. */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {isWhatsApp ? "ليدز واتساب — أي عميل استلمها" : "الليدز"}
          </CardTitle>
          {isWhatsApp && (
            <p className="text-xs text-muted-foreground">
              بلا اسم — المحادثة هي وسيلة التواصل، فما في اسم ولا جوال. هذا اللي وصل كل عميل.
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 pt-2">
            <Link href={q({ status: undefined })} className={tab(!status)}>
              الكل {scoped.length}
            </Link>
            <Link href={q({ status: "new" })} className={tab(status === "new")}>
              جديد {nNew}
            </Link>
            <Link href={q({ status: "contacted" })} className={tab(status === "contacted")}>
              تواصلنا {nContacted}
            </Link>
            <Link href={q({ status: "done" })} className={tab(status === "done")}>
              انتهى {nDone}
            </Link>
            {channel && !isWhatsApp && (
              <Link href={q({ channel: undefined })} className={tab(true)}>
                القناة: {channel === "form" ? "نموذج الحجز" : channel} ✕
              </Link>
            )}
            {client && (
              <Link href={q({ client: undefined })} className={tab(true)}>
                العميل: {client} ✕
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">ما في ليدز بهذا الفلتر.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="py-2 pe-3 text-start font-medium">الليد</th>
                    <th className="py-2 pe-3 text-start font-medium">العميل</th>
                    <th className="py-2 pe-3 text-start font-medium">التواصل</th>
                    <th className="py-2 pe-3 text-start font-medium">المصدر</th>
                    <th className="py-2 pe-3 text-start font-medium">التاريخ</th>
                    <th className="py-2 text-start font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b align-top last:border-0">
                      <td className="py-2 pe-3 font-semibold">
                        {r.name ?? (
                          <span className="font-normal text-muted-foreground">
                            {r.channel === "whatsapp" ? "ليد واتساب" : "—"}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pe-3">{r.clientName}</td>
                      <td className="py-2 pe-3">
                        {r.phone ? (
                          <div dir="ltr" className="tabular-nums">
                            {r.phone}
                          </div>
                        ) : r.channel === "whatsapp" ? (
                          <span className="rounded-full bg-[#25d366]/15 px-2 py-0.5 text-xs font-semibold text-[#1a7f4b] dark:text-[#3ddc84]">
                            عبر واتساب
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                        {r.email && <div dir="ltr" className="text-end text-xs text-muted-foreground">{r.email}</div>}
                      </td>
                      <td className="py-2 pe-3">
                        <div className="text-xs">{SOURCE_LABEL[r.source] ?? r.source}</div>
                      </td>
                      <td className="whitespace-nowrap py-2 pe-3 text-xs tabular-nums text-muted-foreground">
                        {fmt(r.createdAt)}
                      </td>
                      <td className="py-2">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnostics — folded away. The funnel is a FORM journey, so it stays hidden for WhatsApp. */}
      {!isWhatsApp && (
        <details className="group rounded-xl border bg-card">
          <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold">
            تحليل أكثر — المسار والمصادر والمطابقة
            <span className="text-xs font-normal text-muted-foreground group-open:hidden">اعرض</span>
            <span className="hidden text-xs font-normal text-muted-foreground group-open:inline">أخفِ</span>
          </summary>

          <div className="space-y-5 border-t p-4">
            {/* Funnel */}
            <div>
              <p className="text-sm font-semibold">المسار — وين يطيح الناس</p>
              <p className="mb-3 text-xs text-muted-foreground">فتح الصفحة ← ضغط إرسال ← انحفظ</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border p-3">
                  <p className="text-2xl font-bold tabular-nums">{funnel.opened}</p>
                  <p className="text-xs text-muted-foreground">فتحوا · GA4</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-2xl font-bold tabular-nums">{funnel.attempts}</p>
                  <p className="text-xs text-muted-foreground">ضغطوا إرسال · GA4</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {funnel.booked}
                  </p>
                  <p className="text-xs text-muted-foreground">انحفظ · قاعدتنا</p>
                </div>
              </div>
              {funnel.attempts === 0 && funnel.opened > 0 && (
                <p className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs">
                  ما في أحداث <code className="rounded bg-muted px-1" dir="ltr">booking_attempt</code> بعد — لين توصل،
                  الرقم الأوسط يبقى 0.
                </p>
              )}
              {funnel.failed.length > 0 && (
                <table className="mt-3 w-full text-sm">
                  <tbody>
                    {funnel.failed.map((f) => (
                      <tr key={f.reason} className="border-b last:border-0">
                        <td className="py-1.5 pe-3">{FAIL_REASON_LABEL[f.reason] ?? f.reason}</td>
                        <td className="py-1.5 text-end font-bold tabular-nums text-red-600 dark:text-red-400">
                          {f.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* By source */}
            <div>
              <p className="mb-2 text-sm font-semibold">حسب المصدر — أي مكان يحوّل</p>
              <table className="w-full text-sm">
                <tbody>
                  {bySource.map((s) => (
                    <tr key={s.source} className="border-b last:border-0">
                      <td className="py-1.5 pe-3">
                        {SOURCE_LABEL[s.source] ?? s.source}
                      </td>
                      <td className="py-1.5 text-end font-bold tabular-nums">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Unaccounted opens */}
            {unaccountedOpens.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold">
                  مشاهدات صفحة حجز ما ترتبط بعميل حيّ ·{" "}
                  {unaccountedOpens.reduce((a, b) => a + b.views, 0)} مشاهدة
                </p>
                <table className="w-full text-sm">
                  <tbody>
                    {unaccountedOpens.map((u) => (
                      <tr key={u.path} className="border-b last:border-0">
                        <td className="py-1.5 pe-3">
                          <code dir="ltr" className="rounded bg-muted px-1.5 py-0.5 text-xs">{u.path}</code>
                        </td>
                        <td className="py-1.5 text-end font-bold tabular-nums">{u.views}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
