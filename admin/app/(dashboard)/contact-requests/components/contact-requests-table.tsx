"use client";

import { useMemo, useState } from "react";
import { CircleCheck, CircleX, MessageCircle, Phone, PhoneCall, Sparkles } from "lucide-react";

import { CountTab } from "@/components/admin/count-tab";
import { DataTable, type Column } from "@/components/admin/data-table";
import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { DetailCard, FactGroup, FilterRow } from "@/components/shared/advanced-table";
import { cn } from "@/lib/utils";
import { CONTACT_REQUEST_STATUSES, CONTACT_REQUEST_STATUS_LABEL, type ContactRequestStatus } from "@/lib/contact-requests/contact-request-statuses";

import { StatusSelect } from "./status-select";

/** طلبٌ واحد كما يمرّ من الخادم — التاريخ نصّ لأنه يعبر حدّ الخادم/المتصفّح. */
export type ContactRequestRow = {
  id: string;
  createdAt: string;
  channel: string;
  name: string | null;
  phone: string | null;
  status: ContactRequestStatus;
  clientId: string;
  clientName: string;
  repId: string | null;
  repName: string | null;
  articleTitle: string | null;
  articleUrl: string | null;
};

type ClientGroup = {
  id: string;
  clientName: string;
  repName: string | null;
  requests: ContactRequestRow[];
  lastAt: string;
  /** للبحث: اسم العميل والمندوب وأسماء القرّاء وأرقامهم وعناوين المقالات — مخفيّ. */
  searchText: string;
};

const N = new Intl.NumberFormat("ar-EG");
const day = (iso: string) => iso.slice(0, 10);
const NO_REP = "none";

/** لونٌ واحد لكل حالة في الصفحة كلها (وصفة Advanced Table): نفس ألوان قائمة الحالة. */
const STATUS_KPI: Record<ContactRequestStatus, KpiMeta & { icon: React.ComponentType<{ className?: string }>; badge: string }> = {
  new: { label: "جديد", tone: "bg-rose-500/15 text-rose-600 dark:text-rose-400", ring: "ring-rose-500", icon: Sparkles, badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  contacted: { label: "تواصلوا معه", tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400", ring: "ring-amber-500", icon: PhoneCall, badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  done: { label: "صار زبون", tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500", icon: CircleCheck, badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  archived: { label: "ما صار زبون", tone: "bg-slate-500/15 text-slate-600 dark:text-slate-300", ring: "ring-slate-500", icon: CircleX, badge: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
};

function Method({ r }: { r: ContactRequestRow }) {
  return r.channel === "whatsapp" ? (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <MessageCircle className="size-3.5 text-emerald-600" aria-hidden />
      واتساب <span className="text-muted-foreground">· المحادثة عند العميل</span>
    </span>
  ) : (
    <span className="inline-flex flex-col gap-0.5 text-xs">
      <span className="inline-flex items-center gap-1.5">
        <Phone className="size-3.5 text-sky-600" aria-hidden />
        اترك رقمك{r.name ? ` · ${r.name}` : ""}
      </span>
      {r.phone ? <span className="tabular-nums text-muted-foreground" dir="ltr">{r.phone}</span> : null}
    </span>
  );
}

function Requests({ g }: { g: ClientGroup }) {
  return (
    <DetailCard
      columns="lg:grid-cols-[minmax(0,1fr)]"
      groups={[
        <FactGroup key="requests" title={`طلبات ${g.clientName} (${N.format(g.requests.length)})`}>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-1.5 text-start font-medium">التاريخ</th>
                <th className="py-1.5 text-start font-medium">من مقال</th>
                <th className="py-1.5 text-start font-medium">الطريقة</th>
                <th className="py-1.5 text-start font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {g.requests.map((r) => (
                <tr key={r.id} className="border-t align-top">
                  <td className="py-2 tabular-nums text-muted-foreground" dir="ltr">{day(r.createdAt)}</td>
                  <td className="max-w-[320px] py-2">
                    {r.articleUrl ? (
                      <a href={r.articleUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="line-clamp-2 hover:underline">
                        {r.articleTitle}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">من صفحة العميل</span>
                    )}
                  </td>
                  <td className="py-2"><Method r={r} /></td>
                  <td className="py-2" onClick={(e) => e.stopPropagation()}>
                    <StatusSelect id={r.id} status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FactGroup>,
      ]}
    />
  );
}

/**
 * **طلبات التواصل — Advanced Table** (خالد ١٦ أكتوبر ٢٠٢٦: «مختبرات الأطباء مكرّر أكثر من مرّة… استخدم
 * الادفانس تيبل»، وطلب فاتن: فلاتر + بحث). صفٌّ لكل **عميل** بعدد طلباته وحالاتها، و«+» يفتح طلباته
 * وتغيير حالة كلٍّ منها. فوق: الفلاتر يساراً (المندوب · الطريقة) والحالات يميناً — كل كرت فلتر.
 */
export function ContactRequestsTable({ rows, isAdmin }: { rows: ContactRequestRow[]; isAdmin: boolean }) {
  const [rep, setRep] = useState<string | null>(null);
  const [method, setMethod] = useState<"whatsapp" | "phone" | null>(null);
  const [status, setStatus] = useState<ContactRequestStatus | null>(null);

  const reps = useMemo(() => {
    const m = new Map<string, { id: string; name: string; count: number }>();
    for (const r of rows) {
      const id = r.repId ?? NO_REP;
      const e = m.get(id) ?? { id, name: r.repName ?? "بلا مندوب", count: 0 };
      e.count++;
      m.set(id, e);
    }
    return [...m.values()].sort((a, b) => (a.id === NO_REP ? 1 : b.id === NO_REP ? -1 : b.count - a.count));
  }, [rows]);

  // من العامّ إلى الخاصّ: المندوب ← الطريقة ← الحالة، وكل عدّادٍ يُحسب داخل ما فوقه
  const byRep = rep ? rows.filter((r) => (r.repId ?? NO_REP) === rep) : rows;
  const isWhatsApp = (r: ContactRequestRow) => r.channel === "whatsapp";
  const byMethod = method ? byRep.filter((r) => (method === "whatsapp" ? isWhatsApp(r) : !isWhatsApp(r))) : byRep;
  const byStatus = status ? byMethod.filter((r) => r.status === status) : byMethod;

  const groups: ClientGroup[] = useMemo(() => {
    const m = new Map<string, ClientGroup>();
    for (const r of byStatus) {
      const g = m.get(r.clientId) ?? { id: r.clientId, clientName: r.clientName, repName: r.repName, requests: [], lastAt: r.createdAt, searchText: "" };
      g.requests.push(r);
      if (r.createdAt > g.lastAt) g.lastAt = r.createdAt;
      m.set(r.clientId, g);
    }
    return [...m.values()]
      .map((g) => ({
        ...g,
        searchText: [g.clientName, g.repName, ...g.requests.flatMap((r) => [r.name, r.phone, r.articleTitle])].filter(Boolean).join(" "),
      }))
      .sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  }, [byStatus]);

  const count = (g: ClientGroup, s: ContactRequestStatus) => g.requests.filter((r) => r.status === s).length;

  const columns: Column<ClientGroup>[] = [
    {
      key: "clientName",
      header: "العميل",
      sortable: true,
      render: (g) => <span className="font-semibold">{g.clientName}</span>,
    },
    ...(isAdmin
      ? [{ key: "repName", header: "المندوب", render: (g: ClientGroup) => <span className="text-xs text-muted-foreground">{g.repName ?? "بلا مندوب"}</span> } satisfies Column<ClientGroup>]
      : []),
    {
      key: "requests",
      header: "الطلبات",
      sortable: true,
      sortFn: (a, b) => a.requests.length - b.requests.length,
      className: "text-center",
      render: (g) => <span className="font-bold tabular-nums">{N.format(g.requests.length)}</span>,
    },
    {
      key: "statuses",
      header: "الحالات",
      render: (g) => (
        <span className="flex flex-wrap gap-1">
          {CONTACT_REQUEST_STATUSES.map((s) => {
            const c = count(g, s);
            return c ? (
              <span key={s} className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold", STATUS_KPI[s].badge)}>
                {N.format(c)} {CONTACT_REQUEST_STATUS_LABEL[s]}
              </span>
            ) : null;
          })}
        </span>
      ),
    },
    {
      key: "lastAt",
      header: "آخر طلب",
      sortable: true,
      sortFn: (a, b) => a.lastAt.localeCompare(b.lastAt),
      render: (g) => <span className="tabular-nums text-sm text-muted-foreground" dir="ltr">{day(g.lastAt)}</span>,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)]">
        <section aria-label="الفلاتر" className="flex flex-col justify-center gap-2 rounded-lg border bg-card px-4 py-2.5">
          {isAdmin ? (
            <FilterRow label="المندوب">
              <CountTab label="الكل" count={N.format(rows.length)} active={!rep} onClick={() => setRep(null)} />
              {reps.map((r) => (
                <CountTab key={r.id} label={<span dir="auto">{r.name}</span>} count={N.format(r.count)} active={rep === r.id} onClick={() => setRep(rep === r.id ? null : r.id)} />
              ))}
            </FilterRow>
          ) : null}
          <FilterRow label="الطريقة">
            <CountTab label="الكل" count={N.format(byRep.length)} active={!method} onClick={() => setMethod(null)} />
            <CountTab label="واتساب" count={N.format(byRep.filter(isWhatsApp).length)} active={method === "whatsapp"} onClick={() => setMethod(method === "whatsapp" ? null : "whatsapp")} />
            <CountTab label="اترك رقمك" count={N.format(byRep.filter((r) => !isWhatsApp(r)).length)} active={method === "phone"} onClick={() => setMethod(method === "phone" ? null : "phone")} />
          </FilterRow>
        </section>
        <section aria-label="الحالات">
          <div className="grid h-full auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-4">
            {CONTACT_REQUEST_STATUSES.map((s) => {
              const hits = byMethod.filter((r) => r.status === s).length;
              return (
                <KpiToggle
                  key={s}
                  variant="tile"
                  meta={STATUS_KPI[s]}
                  icon={STATUS_KPI[s].icon}
                  value={N.format(hits)}
                  active={status === s}
                  disabled={hits === 0 && status !== s}
                  onClick={() => setStatus(status === s ? null : s)}
                />
              );
            })}
          </div>
        </section>
      </div>

      <DataTable
        data={groups}
        columns={columns}
        searchKey="searchText"
        searchPlaceholder="ابحث بالعميل أو المندوب أو رقم القارئ أو المقال…"
        pageSize={25}
        emptyText={status ? "ما فيه طلبات بهذي الحالة." : isAdmin ? "ما وصل أي طلب تواصل بعد." : "ما وصل طلب تواصل لعملائك بعد."}
        arabic
        renderExpanded={(g) => <Requests g={g} />}
        expandLabel={(g) => `طلبات ${g.clientName}`}
      />
    </div>
  );
}
