"use client";

import { DataTable, type Column } from "@/components/admin/data-table";
import { DetailCard, Fact, FactGroup } from "@/components/shared/advanced-table";
import { cn } from "@/lib/utils";
import type { SeasonRow } from "../helpers/get-seasons";

/** جدول «المواسم» — متى المناسبة، ومتى نجهّز، وماذا جاءنا منها الموسم الماضي. معلومةٌ لا قرار. */
const NUM = new Intl.NumberFormat("ar-EG");
const dayFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh" });
const hijriFmt = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh" });

/** الحالة من المسافة إلى موعد التجهيز (٣ أسابيع قبل المناسبة). */
const stage = (r: SeasonRow) => {
  const toPrepare = r.daysLeft - 21;
  if (toPrepare <= 0) return { label: "جهّز الآن", tone: "bg-rose-500/15 text-rose-700 dark:text-rose-300" };
  if (toPrepare <= 30) return { label: `جهّز خلال ${NUM.format(toPrepare)} يوماً`, tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300" };
  return { label: "لاحقاً", tone: "bg-muted text-muted-foreground" };
};

const columns: Column<SeasonRow>[] = [
  { key: "name", header: "الموسم", render: (r) => <span className="font-semibold">{r.name}</span> },
  {
    key: "nextDate",
    header: "موعده",
    render: (r) => (
      <span className="flex flex-col">
        <span className="text-sm">{dayFmt.format(new Date(r.nextDate))}</span>
        {r.hijri && <span className="text-xs text-muted-foreground">{hijriFmt.format(new Date(r.nextDate))} · قد يختلف يوماً بالرؤية</span>}
      </span>
    ),
  },
  {
    key: "daysLeft",
    header: "باقي",
    sortable: true,
    sortFn: (a, b) => a.daysLeft - b.daysLeft,
    className: "text-center",
    render: (r) => <span className="tabular-nums">{NUM.format(r.daysLeft)} يوماً</span>,
  },
  {
    key: "prepareBy",
    header: "التجهيز",
    render: (r) => {
      const s = stage(r);
      return <span className={cn("whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", s.tone)}>{s.label}</span>;
    },
  },
  {
    key: "lastSeason",
    header: "ظهورنا الموسم الماضي",
    className: "text-center",
    render: (r) => (
      <span className={cn("tabular-nums", r.lastSeason?.impressions ? "font-semibold" : "text-muted-foreground")}>
        {r.lastSeason === null ? "—" : r.lastSeason.impressions > 0 ? NUM.format(r.lastSeason.impressions) : "لا ظهور"}
      </span>
    ),
  },
  {
    key: "articles",
    header: "مقالاتنا عنه",
    className: "text-center",
    render: (r) => <span className="tabular-nums">{NUM.format(r.articles)}</span>,
  },
];

function SeasonDetails({ r }: { r: SeasonRow }) {
  const ls = r.lastSeason;
  return (
    <DetailCard
      columns="lg:grid-cols-[minmax(0,2fr)_1px_minmax(0,1fr)]"
      groups={[
        <FactGroup key="queries" title="أكثر ما بُحث عنه الموسم الماضي">
          {ls === null ? (
            <p className="text-sm text-muted-foreground">Search Console غير متاح الآن.</p>
          ) : ls.topQueries.length === 0 ? (
            <p className="text-sm text-muted-foreground">لم نظهر في قوقل على كلمات هذا الموسم العام الماضي — فرصة لم نلمسها بعد.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {ls.topQueries.map((q) => (
                <li key={q.query} className="flex justify-between gap-4">
                  <span dir="auto">{q.query}</span>
                  <span className="tabular-nums text-muted-foreground">{NUM.format(q.impressions)}</span>
                </li>
              ))}
            </ul>
          )}
        </FactGroup>,
        <FactGroup key="numbers" title="الأرقام">
          <Fact label="جهّز قبل" value={dayFmt.format(new Date(r.prepareBy))} />
          {ls && <Fact label="الموسم الماضي" value={`${dayFmt.format(new Date(ls.date))} · ${NUM.format(ls.clicks)} نقرة`} />}
        </FactGroup>,
      ]}
    />
  );
}

export function SeasonsTable({ items }: { items: SeasonRow[] }) {
  return (
    <DataTable
      data={items}
      columns={columns}
      pageSize={25}
      emptyText="لا مواسم"
      arabic
      renderExpanded={(r) => <SeasonDetails r={r} />}
      expandLabel={(r) => `تفاصيل ${r.name}`}
    />
  );
}
