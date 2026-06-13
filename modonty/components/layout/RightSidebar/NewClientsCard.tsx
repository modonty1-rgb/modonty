"use client";

import { useMemo, useState } from "react";

import Link from "@/components/link";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { NewClientItem } from "./NewClientItem";
import { SortMenu } from "./SortMenu";
import { IconChevronLeft, IconClients, IconFilter } from "@/lib/icons";
import type { SidebarClient } from "@/app/api/helpers/client-queries";

interface NewClientsCardProps {
  clients: SidebarClient[];
}

interface IndustryChip {
  name: string;
  count: number;
}

// Two independent, client-side sorts (zero fetch / zero DB):
const INDUSTRY_SORT = [
  { value: "most", label: "الأكثر شركاءً" },
  { value: "least", label: "الأقل شركاءً" },
  { value: "name", label: "أبجديًا" },
] as const;
type IndustrySort = (typeof INDUSTRY_SORT)[number]["value"];

const PARTNER_SORT = [
  { value: "newest", label: "الأحدث" },
  { value: "name", label: "حسب الاسم" },
  { value: "articles", label: "الأكثر مقالات" },
] as const;
type PartnerSort = (typeof PARTNER_SORT)[number]["value"];

export function NewClientsCard({ clients }: NewClientsCardProps) {
  const [active, setActive] = useState<string | null>(null);
  const [industrySort, setIndustrySort] = useState<IndustrySort>("most");
  const [partnerSort, setPartnerSort] = useState<PartnerSort>("newest");

  const industries = useMemo<IndustryChip[]>(() => {
    const map = new Map<string, number>();
    for (const c of clients) {
      if (!c.industry) continue;
      map.set(c.industry, (map.get(c.industry) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, count]) => ({ name, count }));
  }, [clients]);

  // Sort the INDUSTRY chips (filter box).
  const sortedIndustries = useMemo(() => {
    const arr = [...industries];
    if (industrySort === "name") arr.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    else if (industrySort === "least") arr.sort((a, b) => a.count - b.count);
    else arr.sort((a, b) => b.count - a.count);
    return arr;
  }, [industries, industrySort]);

  const filtered = useMemo(
    () => (active ? clients.filter((c) => c.industry === active) : clients),
    [clients, active]
  );

  // Sort the PARTNERS (partners box). "newest" = the query's original createdAt-desc order.
  const sortedPartners = useMemo(() => {
    if (partnerSort === "newest") return filtered;
    const arr = [...filtered];
    if (partnerSort === "name") arr.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    else arr.sort((a, b) => b.articleCount - a.articleCount);
    return arr;
  }, [filtered, partnerSort]);

  const showFilter = industries.length > 1;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* ── Filter box: industry chips (scroller) + industry Sort ── */}
      {showFilter && (
        <Card className="flex-none">
          <CardContent className="p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <IconFilter className="h-3.5 w-3.5 shrink-0 text-accent" />
                <h2 className="truncate text-xs font-semibold uppercase text-muted-foreground">
                  تصفية حسب الصناعة
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <SortMenu
                  ariaLabel="ترتيب الصناعات"
                  menuLabel="ترتيب الصناعات"
                  options={INDUSTRY_SORT}
                  value={industrySort}
                  onChange={(v) => setIndustrySort(v as IndustrySort)}
                />
                {active !== null && (
                  <button
                    type="button"
                    onClick={() => setActive(null)}
                    aria-label="عرض كل الشركاء"
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-border"
                  >
                    <span aria-hidden className="text-[13px] leading-none">×</span>
                    الكل
                    <span className="text-[10px] font-bold opacity-60">{clients.length}</span>
                  </button>
                )}
              </div>
            </div>

            <div
              className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1"
              role="tablist"
              aria-label="تصفية الشركاء حسب الصناعة"
            >
              {sortedIndustries.map((ind) => (
                <Chip
                  key={ind.name}
                  label={ind.name}
                  count={ind.count}
                  active={active === ind.name}
                  onClick={() => setActive(ind.name)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Partners box: list + its own (partner) Sort ── */}
      <Card className="flex min-h-0 flex-1 flex-col">
        <CardContent className="flex min-h-0 flex-1 flex-col p-4">
          <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <IconClients className="h-4 w-4 shrink-0 text-primary" />
              <h2 className="text-xs font-semibold uppercase text-muted-foreground">
                الشركاء
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <SortMenu
                ariaLabel="ترتيب الشركاء"
                menuLabel="ترتيب الشركاء"
                options={PARTNER_SORT}
                value={partnerSort}
                onChange={(v) => setPartnerSort(v as PartnerSort)}
              />
              <Link
                href="/clients"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <IconChevronLeft className="h-3.5 w-3.5" aria-hidden />
                استكشف
              </Link>
            </div>
          </div>
          <ScrollArea className="min-h-0 flex-1" dir="rtl">
            <div className="pb-4">
              {sortedPartners.length > 0 ? (
                sortedPartners.map((client) => (
                  <NewClientItem
                    key={client.id}
                    clientName={client.name}
                    clientSlug={client.slug}
                    clientLogo={client.logo}
                    industry={client.industry}
                    articleCount={client.articleCount}
                  />
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  {active ? "لا شركاء في هذا القطاع" : "لا يوجد شركاء حالياً"}
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function Chip({
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
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] transition-colors",
        active
          ? "bg-accent font-bold text-accent-foreground"
          : "bg-muted font-medium text-muted-foreground hover:bg-border"
      )}
    >
      {label}
      <span className={cn("text-[10px] font-bold", active ? "opacity-80" : "opacity-60")}>
        {count}
      </span>
    </button>
  );
}
