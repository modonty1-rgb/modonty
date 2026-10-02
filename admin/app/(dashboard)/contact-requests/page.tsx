import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { loadSiteUrl } from "@/lib/seo/site-url";
import {
  CONTACT_REQUEST_STATUSES,
  CONTACT_REQUEST_STATUS_LABEL,
  type ContactRequestStatus,
} from "@/lib/contact-requests/contact-request-statuses";
import { getContactRequestScope } from "@/lib/contact-requests/get-contact-request-scope";

import { StatusSelect } from "./components/status-select";

export const dynamic = "force-dynamic";

const n = (v: number) => v.toLocaleString("ar-EG");
const day = (d: Date) => d.toISOString().slice(0, 10);
const LIMIT = 300;

/**
 * **طلبات التواصل — متابعة المندوب** (خالد ٢ أكتوبر ٢٠٢٦، بند ج٨ في خطة المحتوى).
 *
 * قارئٌ يضغط «تواصل» في مقال عميل، فيُسجَّل طلب حالته «جديد» — وكان يبقى «جديد» للأبد
 * (٥٠ من ٥٢ على الإنتاج)، فلا أحد يقدر يقول للعميل «مقالاتنا جابت لك زبون». هنا المندوب
 * يسأل العميل ويحدّث الحالة: جديد ← تواصلوا معه ← صار زبون / ما صار زبون.
 *
 * المندوب يرى طلبات عملائه (`Client.salesRepId`) وحدها، والأدمن يرى الكلّ — قاعدة واحدة في
 * `getContactRequestScope` يقرؤها الرقم الأحمر في المنيو والحفظ معاً.
 */
export default async function ContactRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const staffId = ((await auth())?.user as { id?: string } | undefined)?.id;
  if (!staffId) redirect("/login");
  const scope = await getContactRequestScope(staffId);
  if (!scope) {
    return <p dir="rtl" className="px-5 py-10 text-sm text-muted-foreground">هذه الصفحة للمبيعات والأدمن.</p>;
  }
  const isAdmin = Object.keys(scope).length === 0;

  const { status: statusParam } = await searchParams;
  const activeStatus = CONTACT_REQUEST_STATUSES.find((s) => s === statusParam);

  const [grouped, requests, siteUrl] = await Promise.all([
    db.bookingRequest.groupBy({ by: ["status"], where: scope, _count: { _all: true } }),
    db.bookingRequest.findMany({
      where: activeStatus ? { AND: [scope, { status: activeStatus }] } : scope,
      orderBy: { createdAt: "desc" },
      take: LIMIT,
      select: {
        id: true,
        createdAt: true,
        channel: true,
        name: true,
        phone: true,
        status: true,
        client: { select: { name: true, salesRep: { select: { name: true } } } },
        article: { select: { title: true, slug: true } },
      },
    }),
    loadSiteUrl(),
  ]);

  const counts = new Map(grouped.map((g) => [g.status, g._count._all]));
  const total = grouped.reduce((sum, g) => sum + g._count._all, 0);
  const pills = [
    { key: undefined, label: "الكل", count: total },
    ...CONTACT_REQUEST_STATUSES.map((s) => ({ key: s, label: CONTACT_REQUEST_STATUS_LABEL[s], count: counts.get(s) ?? 0 })),
  ];

  return (
    <main dir="rtl" className="mx-auto flex max-w-6xl flex-col gap-5 pb-8">
      <header>
        <h1 className="text-xl font-semibold">طلبات التواصل</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          قارئ ضغط «تواصل» في مقال {isAdmin ? "عميل" : "أحد عملائك"}. كلّم العميل واسأله: تواصلوا معه؟ صار زبون؟ وغيّر الحالة.
        </p>
      </header>

      <nav className="flex flex-wrap gap-1.5" aria-label="الحالة">
        {pills.map((p) => {
          const isActive = p.key === activeStatus;
          return (
            <Link
              key={p.key ?? "all"}
              href={p.key ? `/contact-requests?status=${p.key}` : "/contact-requests"}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs",
                isActive ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
              )}
            >
              {p.label}
              <span className="tabular-nums opacity-80">{n(p.count)}</span>
            </Link>
          );
        })}
      </nav>

      <section className="overflow-x-auto rounded-xl border bg-card shadow-sm" aria-label="الطلبات">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-start font-semibold">التاريخ</th>
              <th className="px-3 py-2 text-start font-semibold">العميل</th>
              <th className="px-3 py-2 text-start font-semibold">من مقال</th>
              <th className="px-3 py-2 text-start font-semibold">الطريقة</th>
              {isAdmin ? <th className="px-3 py-2 text-start font-semibold">المندوب</th> : null}
              <th className="px-3 py-2 text-start font-semibold">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="px-3 py-8 text-center text-muted-foreground">
                  {activeStatus ? "ما فيه طلبات بهذي الحالة." : isAdmin ? "ما وصل أي طلب تواصل بعد." : "ما وصل طلب تواصل لعملائك بعد."}
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="border-b align-top last:border-0">
                  <td className="px-3 py-2.5 tabular-nums text-muted-foreground" dir="ltr">
                    {day(r.createdAt)}
                  </td>
                  <td className="px-3 py-2.5 font-medium">{r.client.name}</td>
                  <td className="max-w-[280px] px-3 py-2.5">
                    {r.article ? (
                      <a
                        href={`${siteUrl}/articles/${r.article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="line-clamp-2 hover:underline"
                      >
                        {r.article.title}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">من صفحة العميل</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {r.channel === "whatsapp" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <MessageCircle className="size-3.5 text-emerald-600" aria-hidden />
                        واتساب
                        <span className="text-muted-foreground">· المحادثة عند العميل</span>
                      </span>
                    ) : (
                      <span className="inline-flex flex-col gap-0.5 text-xs">
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="size-3.5 text-sky-600" aria-hidden />
                          اترك رقمك{r.name ? ` · ${r.name}` : ""}
                        </span>
                        {r.phone ? (
                          <span className="tabular-nums text-muted-foreground" dir="ltr">
                            {r.phone}
                          </span>
                        ) : null}
                      </span>
                    )}
                  </td>
                  {isAdmin ? <td className="px-3 py-2.5 text-xs text-muted-foreground">{r.client.salesRep?.name ?? "بلا مندوب"}</td> : null}
                  <td className="px-3 py-2.5">
                    <StatusSelect id={r.id} status={(CONTACT_REQUEST_STATUSES.find((s) => s === r.status) ?? "new") as ContactRequestStatus} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
      {requests.length === LIMIT ? (
        <p className="text-xs text-muted-foreground">يظهر أحدث {n(LIMIT)} طلب — اختر حالة من فوق لتضييق القائمة.</p>
      ) : null}
    </main>
  );
}
