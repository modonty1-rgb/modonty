"use client";

import Link from "next/link";
import { useState } from "react";
import { Globe2, Mail, MessageCircle, MousePointerClick, Share2 } from "lucide-react";

import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DetailCard, Fact, FactGroup } from "@/components/shared/advanced-table";
import { cn } from "@/lib/utils";
import { contactChannelFlags } from "../../contact-channel-rules";

/**
 * Every known contact door, per client — not just the admin-chosen primary button.
 *
 * Built 15 Oct 2026 after «ما يوصلهم الزائر» (the ctaMode-only segment) turned out to
 * overstate the problem: a client with a phone number gets a working WhatsApp button
 * in his header/footer regardless of ctaMode (`WhatsAppButton`, shared/components/
 * partner-site/parts/whatsapp-button.tsx — fixed 4 Oct 2026, independent of the CTA
 * section entirely). This table answers the real question per channel, not one flag.
 */
export interface ContactChannelsClient {
  id: string;
  name: string;
  isYmyl: boolean;
  phone: string | null;
  email: string | null;
  url: string | null;
  sameAs: string[];
  ctaMode: "FORM" | "LINK" | "NONE" | string;
  ctaLabel: string | null;
  ctaUrl: string | null;
}

interface Row extends ContactChannelsClient {
  hasPhone: boolean;
  hasEmail: boolean;
  hasWebsite: boolean;
  hasSocial: boolean;
  hasButton: boolean;
  missingCount: number;
}

const CTA_LABEL: Record<string, string> = {
  FORM: "نموذج حجز",
  LINK: "رابط خارجي",
  NONE: "بلا إجراء محدد",
};

function toRow(c: ContactChannelsClient): Row {
  const { hasPhone, hasEmail, hasWebsite, hasSocial, hasButton } = contactChannelFlags(c);
  const missingCount = [hasPhone, hasEmail, hasWebsite, hasSocial, hasButton].filter((v) => !v).length;
  return { ...c, hasPhone, hasEmail, hasWebsite, hasSocial, hasButton, missingCount };
}

/** ✓/✗ cell — green check or muted dash, never a scary red X (a missing channel is a
 *  fact to notice, not an error state on every row of a 47-row table). */
function Mark({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="text-emerald-600 dark:text-emerald-400">✓</span>
  ) : (
    <span className="text-muted-foreground/40">—</span>
  );
}

const columns: Column<Row>[] = [
  {
    key: "name",
    header: "العميل",
    sortable: true,
    render: (r) => (
      <Link href={`/clients/${r.id}/edit`} title={r.name} className="flex max-w-[220px] items-center gap-1.5 truncate hover:text-primary hover:underline">
        <span className="truncate">{r.name}</span>
        {r.isYmyl && <span className="shrink-0 text-[10px] font-bold text-amber-600 dark:text-amber-400">YMYL</span>}
      </Link>
    ),
  },
  { key: "hasPhone", header: "جوال · واتساب", className: "text-center", render: (r) => <Mark ok={r.hasPhone} /> },
  { key: "hasEmail", header: "بريد", className: "text-center", render: (r) => <Mark ok={r.hasEmail} /> },
  { key: "hasWebsite", header: "موقع", className: "text-center", render: (r) => <Mark ok={r.hasWebsite} /> },
  { key: "hasSocial", header: "سوشال", className: "text-center", render: (r) => <Mark ok={r.hasSocial} /> },
  {
    key: "hasButton",
    header: "إجراء البروفايل",
    render: (r) => (
      <span className={r.hasButton ? "text-foreground" : "font-semibold text-amber-600 dark:text-amber-400"}>
        {CTA_LABEL[r.ctaMode] ?? "الحقل ناقص"}
      </span>
    ),
  },
  {
    key: "missingCount",
    header: "قنوات ناقصة",
    sortable: true,
    sortFn: (a, b) => a.missingCount - b.missingCount,
    className: "text-center tabular-nums",
    render: (r) => (
      <span className={cn("font-bold", r.missingCount === 0 ? "text-emerald-600 dark:text-emerald-400" : r.missingCount >= 3 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400")}>
        {r.missingCount}
      </span>
    ),
  },
];

function ChannelDetails({ r }: { r: Row }) {
  return (
    <DetailCard
      columns="lg:grid-cols-[auto_1px_minmax(0,1fr)_1px_auto]"
      groups={[
        <FactGroup key="direct" title="تواصل مباشر">
          <Fact label="جوال" value={r.phone ?? <span className="text-muted-foreground">غير موجود</span>} tone={r.hasPhone ? "text-emerald-600 dark:text-emerald-400" : undefined} />
          <Fact label="بريد" value={r.email ?? <span className="text-muted-foreground">غير موجود</span>} tone={r.hasEmail ? "text-emerald-600 dark:text-emerald-400" : undefined} />
        </FactGroup>,
        <FactGroup key="presence" title="الوجود الرقمي" spread>
          <Fact label="موقع" value={r.url ?? <span className="text-muted-foreground">غير موجود</span>} />
          <Fact label="سوشال" value={r.hasSocial ? `${r.sameAs.length} رابط` : <span className="text-muted-foreground">غير موجود</span>} />
        </FactGroup>,
        <FactGroup key="cta" title="إجراء البروفايل">
          <Fact label="النوع" value={CTA_LABEL[r.ctaMode] ?? "الحقل ناقص"} />
          {r.ctaMode === "LINK" && <Fact label="الوجهة" value={r.ctaUrl ?? <span className="text-muted-foreground">بلا رابط</span>} />}
        </FactGroup>,
      ]}
      footer={
        r.hasPhone && !r.hasButton ? (
          <p className="text-xs text-muted-foreground">
            عنده باب واتساب شغّال فعلياً في هيدر/فوتر موقعه — مستقل عن إجراء البروفايل، ويعمل بمجرد وجود الجوال.
          </p>
        ) : !r.hasPhone && !r.hasButton ? (
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            بلا جوال وبلا إجراء محدد — هذا العميل فعلياً بلا باب تواصل من صفحته.
          </p>
        ) : null
      }
    />
  );
}

type KpiKey = "phone" | "email" | "website" | "social" | "button";
const KPIS: Record<KpiKey, KpiMeta & { icon: React.ComponentType<{ className?: string }>; test: (r: Row) => boolean }> = {
  phone: { label: "بلا جوال/واتساب", tone: "bg-rose-500/15 text-rose-600 dark:text-rose-400", ring: "ring-rose-500", icon: MessageCircle, test: (r) => !r.hasPhone },
  email: { label: "بلا بريد", tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400", ring: "ring-amber-500", icon: Mail, test: (r) => !r.hasEmail },
  website: { label: "بلا موقع", tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400", ring: "ring-sky-500", icon: Globe2, test: (r) => !r.hasWebsite },
  social: { label: "بلا سوشال", tone: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400", ring: "ring-fuchsia-500", icon: Share2, test: (r) => !r.hasSocial },
  button: { label: "بلا إجراء بروفايل", tone: "bg-violet-500/15 text-violet-600 dark:text-violet-400", ring: "ring-violet-500", icon: MousePointerClick, test: (r) => !r.hasButton },
};

export function ContactChannelsTable({ clients }: { clients: ContactChannelsClient[] }) {
  const rows = clients.map(toRow);
  // Problems only, no filter row (Khalid, 15 Oct 2026: "الفالتر ما احتاجها") — a
  // healthy client never appears here at all, and the KPI tiles double as the only
  // filter: click one to narrow to that channel, click again to clear it.
  const byStatus = rows.filter((r) => r.missingCount > 0);
  const [kpi, setKpi] = useState<KpiKey | null>(null);
  const visible = kpi ? byStatus.filter(KPIS[kpi].test) : byStatus;

  // KPI row + search share one line (Khalid, 15 Oct 2026: "هدر المساحات… سطر واحد
  // بتنسيق نظيف") — the compact `row` tile, not the big `tile` variant, passed as the
  // table's own toolbar slot instead of a separate block above it.
  const kpiRow = (
    <div className="flex flex-wrap items-center gap-2">
      {(Object.keys(KPIS) as KpiKey[])
        .filter((key) => rows.some(KPIS[key].test))
        .map((key) => {
          const k = KPIS[key];
          const hits = byStatus.filter(k.test);
          return (
            <KpiToggle
              key={key}
              meta={k}
              icon={k.icon}
              value={hits.length}
              active={kpi === key}
              disabled={hits.length === 0}
              onClick={() => setKpi(kpi === key ? null : key)}
            />
          );
        })}
    </div>
  );

  return (
    <DataTable
      data={visible}
      columns={columns}
      searchKey="name"
      searchPlaceholder="ابحث بالاسم…"
      toolbar={kpiRow}
      pageSize={25}
      emptyText="ما في عميل يطابق"
      arabic
      rowClassName={(r) => (r.missingCount >= 4 ? "text-rose-600 dark:text-rose-400" : undefined)}
      renderExpanded={(r) => <ChannelDetails r={r} />}
      expandLabel={(r) => `قنوات تواصل ${r.name.trim()}`}
    />
  );
}
