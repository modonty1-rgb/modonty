import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { loadSiteUrl } from "@/lib/seo/site-url";
import {
  CONTACT_REQUEST_STATUSES,
  type ContactRequestStatus,
} from "@/lib/contact-requests/contact-request-statuses";
import { getContactRequestScope } from "@/lib/contact-requests/get-contact-request-scope";

import { ContactRequestsTable, type ContactRequestRow } from "./components/contact-requests-table";

export const dynamic = "force-dynamic";

const n = (v: number) => v.toLocaleString("ar-EG");
// كل طلبات النطاق — الفلترة والبحث والتجميع بالعميل في المتصفّح (Advanced Table)
const LIMIT = 2000;

/**
 * **طلبات التواصل — متابعة المندوب** (خالد ٢ أكتوبر ٢٠٢٦، بند ج٨ في خطة المحتوى).
 *
 * قارئٌ يضغط «تواصل» في مقال عميل، فيُسجَّل طلب حالته «جديد» — وكان يبقى «جديد» للأبد
 * (٥٠ من ٥٢ على الإنتاج)، فلا أحد يقدر يقول للعميل «مقالاتنا جابت لك زبون». هنا المندوب
 * يسأل العميل ويحدّث الحالة: جديد ← تواصلوا معه ← صار زبون / ما صار زبون.
 *
 * المندوب يرى طلبات عملائه (`Client.salesRepId`) وحدها، والأدمن يرى الكلّ — قاعدة واحدة في
 * `getContactRequestScope` يقرؤها الرقم الأحمر في المنيو والحفظ معاً.
 *
 * الجدول Advanced Table (خالد ١٦ أكتوبر ٢٠٢٦): صفٌّ لكل عميل لا لكل طلب — «مختبرات الأطباء» كان
 * يتكرّر — مع بحث وفلاتر المندوب والطريقة وكروت الحالة (`components/contact-requests-table.tsx`).
 */
export default async function ContactRequestsPage() {
  const staffId = ((await auth())?.user as { id?: string } | undefined)?.id;
  if (!staffId) redirect("/login");
  const scope = await getContactRequestScope(staffId);
  if (!scope) {
    return <p dir="rtl" className="px-5 py-10 text-sm text-muted-foreground">هذه الصفحة للمبيعات والأدمن.</p>;
  }
  const isAdmin = Object.keys(scope).length === 0;

  const [requests, siteUrl] = await Promise.all([
    db.bookingRequest.findMany({
      where: scope,
      orderBy: { createdAt: "desc" },
      take: LIMIT,
      select: {
        id: true,
        createdAt: true,
        channel: true,
        name: true,
        phone: true,
        status: true,
        clientId: true,
        client: { select: { name: true, salesRepId: true, salesRep: { select: { name: true } } } },
        article: { select: { title: true, slug: true } },
      },
    }),
    loadSiteUrl(),
  ]);

  const rows: ContactRequestRow[] = requests.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    channel: r.channel,
    name: r.name,
    phone: r.phone,
    status: (CONTACT_REQUEST_STATUSES.find((s) => s === r.status) ?? "new") as ContactRequestStatus,
    clientId: r.clientId,
    clientName: r.client.name,
    repId: r.client.salesRepId ?? null,
    repName: r.client.salesRep?.name ?? null,
    articleTitle: r.article?.title ?? null,
    articleUrl: r.article ? `${siteUrl}/articles/${r.article.slug}` : null,
  }));

  return (
    <main dir="rtl" className="mx-auto flex max-w-6xl flex-col gap-4 pb-8">
      <header>
        <h1 className="text-xl font-semibold">طلبات التواصل</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          قارئ ضغط «تواصل» في مقال {isAdmin ? "عميل" : "أحد عملائك"}. كلّم العميل واسأله: تواصلوا معه؟ صار زبون؟ وغيّر الحالة من «+».
        </p>
      </header>
      <ContactRequestsTable rows={rows} isAdmin={isAdmin} />
      {requests.length === LIMIT ? (
        <p className="text-xs text-muted-foreground">يظهر أحدث {n(LIMIT)} طلب.</p>
      ) : null}
    </main>
  );
}
