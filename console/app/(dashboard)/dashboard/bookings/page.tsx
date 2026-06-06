import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ar } from "@/lib/ar";
import {
  getBookings,
  getBookingStats,
  type BookingStats,
} from "./helpers/booking-queries";
import { BookingsList } from "./components/bookings-list";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, PhoneCall, CheckCheck, Archive, CalendarCheck, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const [bookings, stats] = await Promise.all([
    getBookings(clientId),
    getBookingStats(clientId),
  ]);

  const s = ar.bookings;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">{s.title}</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">{s.subtitle}</p>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p className="text-xs leading-relaxed text-foreground">{s.pageHint}</p>
        </div>
      </header>

      <KpiGrid stats={stats} />

      <BookingsList bookings={bookings} />
    </div>
  );
}

function KpiGrid({ stats }: { stats: BookingStats }) {
  const s = ar.bookings;
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      <KpiCard icon={CalendarClock} tone="primary" label={s.new} value={stats.new} hint={s.newHint} />
      <KpiCard icon={PhoneCall} tone="amber" label={s.contacted} value={stats.contacted} hint={s.contactedHint} />
      <KpiCard icon={CheckCheck} tone="emerald" label={s.done} value={stats.done} hint={s.doneHint} />
      <KpiCard icon={Archive} tone="slate" label={s.archived} value={stats.archived} hint={s.archivedHint} />
      <KpiCard icon={CalendarCheck} tone="muted" label={s.total} value={stats.total} hint={s.totalHint} />
    </div>
  );
}

function KpiCard({
  icon: Icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "amber" | "emerald" | "slate" | "muted";
  label: string;
  value: number;
  hint: string;
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary ring-primary/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
    muted: "bg-muted text-muted-foreground ring-border",
  }[tone];
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${toneClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-tight tabular-nums">{value}</p>
          <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
