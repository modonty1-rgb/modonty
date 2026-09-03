import { getTasksByDay } from "./helpers/get-tasks-by-day";
import { DayPicker } from "./components/day-picker";
import { PersonFilter } from "./components/person-filter";
import { ReportTable, type ReportRow } from "./components/report-table";
import { ReportNewTaskButton } from "./components/report-new-task-button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const dayFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** `?date=YYYY-MM-DD` parsed in LOCAL time — `new Date("2026-09-02")` is UTC
 *  midnight, which lands on the previous day for anyone east of Greenwich. */
function parseDay(raw: string | undefined): Date {
  const m = raw?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return new Date();
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function isLate(due: Date | null, status: string) {
  return !!due && status !== "DONE" && new Date(due).setHours(23, 59, 59, 999) < Date.now();
}

/**
 * One day of the team's work.
 *
 * The team is remote, so this is the only place the work in someone's hands is
 * visible. It defaults to today because the routine it serves is a morning one:
 * each person writes down what they are taking on, and this reads it back.
 *
 * Two layers on purpose: a strip of per-person counts to answer "who is loaded,
 * who is late" at a glance, and one dense table under it for the detail. A card
 * per person answered neither — it spent 80px to show a single row, and printed
 * each task's status twice.
 */
export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; person?: string }>;
}) {
  const { date, person } = await searchParams;
  const day = parseDay(date);
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;
  const staff = await db.staff.findUnique({ where: { id: userId }, select: { role: true } });
  if (staff?.role !== "ADMIN") redirect("/");

  const assignees = await db.staff.findMany({
    // Older staff rows may not have `isActive` written; absent means active.
    where: { OR: [{ isActive: true }, { isActive: { isSet: false } }] },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  const lanes = await getTasksByDay(day);

  const laneKey = (l: (typeof lanes)[number]) => l.staffId ?? "unassigned";

  // The chips count EVERY lane; the table shows the selected one. Both read the
  // same grouping, so a chip cannot promise a number the table will not show.
  const people = lanes.map((l) => ({
    key: laneKey(l),
    name: l.name,
    total: l.tasks.length,
    late: l.counts.late,
  }));
  const totalAll = lanes.reduce((n, l) => n + l.tasks.length, 0);

  // An unknown `?person=` falls back to everything rather than an empty screen —
  // a stale bookmark should show the day, not look like a day with no work.
  const selected = person && people.some((p) => p.key === person) ? person : null;
  const shown = selected ? lanes.filter((l) => laneKey(l) === selected) : lanes;

  const rows: ReportRow[] = shown.flatMap((lane) =>
    lane.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      person: lane.name,
      personImage: lane.image,
      role: lane.role,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      late: isLate(t.dueDate, t.status),
    })),
  );

  return (
    <div className="flex min-h-0 flex-col gap-3 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold sm:text-xl">Report</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {dayFmt.format(day)} ·{" "}
            {selected
              ? `${rows.length} of ${totalAll} tasks`
              : `${totalAll} ${totalAll === 1 ? "task" : "tasks"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DayPicker />
          <ReportNewTaskButton assignees={assignees} />
        </div>
      </header>

      {totalAll === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm font-medium">Nobody logged tasks for this day</p>
          <p className="text-[13px] text-muted-foreground">
            Each person writes theirs in the morning — an empty page means it is early, or a day off.
          </p>
        </div>
      ) : (
        <>
          {/* Who is carrying what — and the table's filter. Ordered by load, so
              the person to look at first is first. */}
          <PersonFilter people={people} total={totalAll} />
          <ReportTable rows={rows} />
        </>
      )}
    </div>
  );
}
