"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Video } from "lucide-react";
import { SubscriptionStatus } from "@prisma/client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { ClientsPageClient } from "./clients-page-client";
import type { ClientForList } from "../actions/clients-actions/types";
import { hasExternalIntroVideo, type StatusFilterKey } from "./client-table";

/** Status tab split into two segments: label | count, divided by a splitter.
 *  Same shape as the Articles status tabs. Count inverts colour when active. */
function CountTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center overflow-hidden rounded-full border text-xs font-medium transition-colors",
        active ? "border-primary" : "border-border hover:bg-accent",
      )}
    >
      <span className={cn("px-2.5 py-1", active ? "bg-primary text-primary-foreground" : "text-foreground")}>
        {label}
      </span>
      <span
        className={cn(
          "border-s px-2 py-1 font-bold tabular-nums",
          active
            ? "border-primary-foreground/30 bg-primary-foreground text-primary"
            : "border-border bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}

const STATUS_TABS: Array<{ key: StatusFilterKey; label: string }> = [
  { key: "ALL", label: "All" },
  { key: SubscriptionStatus.ACTIVE, label: "Active" },
  { key: SubscriptionStatus.PENDING, label: "Pending" },
  { key: SubscriptionStatus.EXPIRED, label: "Expired" },
  { key: SubscriptionStatus.CANCELLED, label: "Cancelled" },
];

/**
 * سقط تبويبُ «مشترِكو jbrseo» (١٧ سبتمبر ٢٠٢٦) وبقي تبويبُ العملاء وحده.
 *
 * تكامُلُ جبر سيو أُلغي من أوّله، وظلّ التبويبُ يعرض ٢٧ صفّاً مرآةً لنظامٍ لم يعد
 * يُستعمل — وفيه **بابُ ميلادٍ رابع** للعميل يتجاوز الطلبَ المدفوع (خالد ١٧ سبتمبر:
 * «لغيناه من أوّل، فهذه سقطت في الجرد»).
 *
 * وسقط معه ما لم يكن إلّا له: مزامنةٌ تلقائيّة عند فتح التبويب · شريطُ حالتها ·
 * `TierDistribution` (كان يُرسم في ذلك التبويب وحده) · و`clientByEmail` الذي لم
 * يكن إلّا لإخفاء مَن صار عميلاً من قائمة التحويل.
 *
 * والغلافُ `Tabs` باقٍ: صفُّ مرشِّحات الحالة مبنيٌّ داخله.
 */
interface Props {
  clientsCount: number;
  clients: ClientForList[];
  defaultLogoUrl?: string | null;
}

export function ClientsTabs({
  clientsCount,
  clients,
  defaultLogoUrl,
}: Props) {
  const [tab, setTab] = useState("clients");
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>("ALL");
  const [externalVideoOnly, setExternalVideoOnly] = useState(false);
  const [isFiltering, startFilter] = useTransition();

  // Status counts over ALL clients (search-independent, like the Articles status tabs).
  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilterKey, number> = {
      ALL: clients.length,
      [SubscriptionStatus.ACTIVE]: 0,
      [SubscriptionStatus.PENDING]: 0,
      [SubscriptionStatus.EXPIRED]: 0,
      [SubscriptionStatus.CANCELLED]: 0,
    };
    for (const c of clients) counts[c.subscriptionStatus] += 1;
    return counts;
  }, [clients]);

  // أ٦ — how many clients still run on someone else's hosted video. The pill hides
  // itself at zero, so it disappears for good once the last one migrates.
  const externalVideoCount = useMemo(
    () => clients.filter(hasExternalIntroVideo).length,
    [clients],
  );

  const handleStatusFilter = (key: StatusFilterKey) => {
    startFilter(() => setStatusFilter(key));
  };


  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <TabsList className="h-auto p-1 bg-muted/40 border">
          <TabsTrigger value="clients" className="gap-2">
            Clients
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted-foreground/15 tabular-nums font-bold">
              {clientsCount}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Status filter tabs — same row as the top tabs (clients tab only) */}
        {tab === "clients" && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_TABS.map((s) => (
              <CountTab
                key={s.key}
                label={s.label}
                count={statusCounts[s.key]}
                active={statusFilter === s.key}
                onClick={() => handleStatusFilter(s.key)}
              />
            ))}
            {/* Operational follow-up list — separate from subscription status, so it
                toggles on top of whichever status tab is selected. */}
            {externalVideoCount > 0 && (
              <button
                type="button"
                onClick={() => startFilter(() => setExternalVideoOnly((v) => !v))}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  externalVideoOnly
                    ? "border-amber-500 bg-amber-500 text-white"
                    : "border-amber-500/40 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400",
                )}
                title="عملاء فيديو التعريف عندهم رابط خارجي على قناة ما يملكونها"
              >
                <Video className="h-3.5 w-3.5" aria-hidden="true" />
                فيديو خارجي
                <span className="font-bold tabular-nums">{externalVideoCount}</span>
              </button>
            )}
          </div>
        )}


      </div>

      <TabsContent value="clients" className="mt-3">
        <div className="relative">
          {isFiltering && (
            <div className="absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-background/50 pt-20 backdrop-blur-[1px]">
              <span className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                جارٍ التحميل…
              </span>
            </div>
          )}
          <div className={isFiltering ? "pointer-events-none opacity-50 transition-opacity" : "transition-opacity"}>
            <ClientsPageClient
              clients={clients}
              defaultLogoUrl={defaultLogoUrl}
              statusFilter={statusFilter}
              externalVideoOnly={externalVideoOnly}
            />
          </div>
        </div>
      </TabsContent>

    </Tabs>
  );
}
