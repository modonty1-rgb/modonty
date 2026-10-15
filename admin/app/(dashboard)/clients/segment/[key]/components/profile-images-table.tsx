"use client";

import Link from "next/link";
import { useState } from "react";
import { Image as ImageIcon, PanelTop } from "lucide-react";

import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DetailCard, Fact, FactGroup } from "@/components/shared/advanced-table";
import { cn } from "@/lib/utils";
import { imageChannelFlags } from "../../image-channel-rules";

/**
 * Every client's profile picture, per channel — logo / cover. Same recipe as
 * contact-channels-table.tsx (built 15 Oct 2026): problems only, KPI tiles double as
 * the only filter, no toggle row.
 *
 * «غلاف» و«صورة مشاركة» ليسا عمودين (Khalid, 15 Oct 2026: «عمود واحد… يكون واضح»):
 * الشير إيمج تُبنى حصراً من heroImageMedia — لا مصدر ثانٍ، لا فولباك للشعار
 * (generate-client-seo-bundle.ts:356-366). عمود "غلاف" الواحد هو الإشارة؛ التفصيل
 * تحت «+» يذكر لو الغلاف موجود لكن السيو ما تولّد بعده (فجوة تحديث، لا نقص أصل).
 */
export interface ProfileImagesClient {
  id: string;
  name: string;
  isYmyl: boolean;
  logoMediaId: string | null;
  heroImageMediaId: string | null;
  nextjsMetadata: unknown;
}

interface Row extends ProfileImagesClient {
  hasLogo: boolean;
  hasHero: boolean;
  hasOg: boolean;
  /** Stale, not missing: cover uploaded but SEO never regenerated to bake the share image. */
  coverNotBaked: boolean;
  missingCount: number;
}

function toRow(c: ProfileImagesClient): Row {
  const { hasLogo, hasHero, hasOg } = imageChannelFlags(c);
  const missingCount = [hasLogo, hasHero].filter((v) => !v).length;
  return { ...c, hasLogo, hasHero, hasOg, coverNotBaked: hasHero && !hasOg, missingCount };
}

/** ✓/✗ cell — green check or muted dash, never a scary red X. */
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
  { key: "hasLogo", header: "شعار", className: "text-center", render: (r) => <Mark ok={r.hasLogo} /> },
  { key: "hasHero", header: "غلاف", className: "text-center", render: (r) => <Mark ok={r.hasHero} /> },
  {
    key: "missingCount",
    header: "صور ناقصة",
    sortable: true,
    sortFn: (a, b) => a.missingCount - b.missingCount,
    className: "text-center tabular-nums",
    render: (r) => (
      <span className={cn("font-bold", r.missingCount >= 2 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400")}>{r.missingCount}</span>
    ),
  },
];

function ImageDetails({ r }: { r: Row }) {
  return (
    <DetailCard
      columns="lg:grid-cols-[minmax(0,1fr)]"
      groups={[
        <FactGroup key="images" title="صور البروفايل" spread>
          <Fact label="شعار" value={r.hasLogo ? "موجود" : <span className="text-muted-foreground">غير موجود</span>} tone={r.hasLogo ? "text-emerald-600 dark:text-emerald-400" : undefined} />
          <Fact label="غلاف" value={r.hasHero ? "موجود" : <span className="text-muted-foreground">غير موجود</span>} tone={r.hasHero ? "text-emerald-600 dark:text-emerald-400" : undefined} hint="نفس مصدر صورة المشاركة في روابط الواتساب/السوشال" />
        </FactGroup>,
      ]}
      footer={
        r.coverNotBaked ? (
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            الغلاف موجود لكن السيو ما تولّد بعده — روابطه لسه بلا معاينة. شغّل «توليد السيو» من صفحة العميل.
          </p>
        ) : null
      }
    />
  );
}

type KpiKey = "logo" | "hero";
const KPIS: Record<KpiKey, KpiMeta & { icon: React.ComponentType<{ className?: string }>; test: (r: Row) => boolean }> = {
  logo: { label: "بلا شعار", tone: "bg-rose-500/15 text-rose-600 dark:text-rose-400", ring: "ring-rose-500", icon: ImageIcon, test: (r) => !r.hasLogo },
  hero: { label: "بلا غلاف", tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400", ring: "ring-sky-500", icon: PanelTop, test: (r) => !r.hasHero },
};

export function ProfileImagesTable({ clients }: { clients: ProfileImagesClient[] }) {
  const rows = clients.map(toRow);
  // Problems only, no filter row — same call as contact-channels (Khalid, 15 Oct 2026).
  const byStatus = rows.filter((r) => r.missingCount > 0);
  const [kpi, setKpi] = useState<KpiKey | null>(null);
  const visible = kpi ? byStatus.filter(KPIS[kpi].test) : byStatus;

  // KPI row + search on one line (Khalid, 15 Oct 2026) — same move as contact-channels.
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
      rowClassName={(r) => (r.missingCount >= 2 ? "text-rose-600 dark:text-rose-400" : undefined)}
      renderExpanded={(r) => <ImageDetails r={r} />}
      expandLabel={(r) => `صور بروفايل ${r.name.trim()}`}
    />
  );
}
