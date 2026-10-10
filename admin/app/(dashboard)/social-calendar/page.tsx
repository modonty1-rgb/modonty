import Link from "next/link";
import { Calendar, Sparkles } from "lucide-react";

import { formatMonthParam, riyadhToday } from "./helpers/dates";
import { getCalendarClients } from "./helpers/queries";
import { requireSocialActor } from "./helpers/require-social-actor";
import { ClientsView } from "./components/clients-view";

/**
 * لوحة العملاء — نسخة من الصفحة الرئيسية للتطبيق القديم (`JBRSEO/content/app/page.tsx`):
 * كروت/جدول، وكل كرت يفتح تقويم العميل.
 *
 * الفرق المفروض: العملاء هم عملاء مدونتي أنفسهم، فلا «إضافة/تعديل/أرشفة عميل» هنا —
 * العميل يُنشأ ويُدار من صفحة Clients (PRD §٤.٣أ).
 */
export default async function SocialCalendarPage() {
  const actor = await requireSocialActor("view");
  if ("error" in actor) return <p className="p-6 text-sm text-destructive">{actor.error}</p>;

  const clients = await getCalendarClients();
  const today = riyadhToday();
  const currentMonth = formatMonthParam(today.year, today.month);

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <header className="rounded-xl border border-border bg-card px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">تقويم السوشيال</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">أدِر محتوى عملاءك في مكان واحد</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="tabular-nums">{clients.length} عميل</span>
            </div>
            <Link
              href="/social-calendar/flow"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted hover:text-foreground"
            >
              <Sparkles className="h-3.5 w-3.5" />
              سير العمل
            </Link>
          </div>
        </div>
      </header>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-24 text-center">
          <p className="text-lg font-semibold text-foreground">لا عملاء بعد</p>
          <p className="text-sm text-muted-foreground">
            أضف عميلاً من صفحة{" "}
            <Link href="/clients" className="text-primary underline">
              Clients
            </Link>{" "}
            وسيظهر هنا تلقائياً.
          </p>
        </div>
      ) : (
        <ClientsView clients={clients} currentMonth={currentMonth} />
      )}
    </div>
  );
}
