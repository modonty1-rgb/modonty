"use client";

import { useMemo, useState } from "react";

import Link from "@/components/link";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { NewClientItem } from "./NewClientItem";
import { IconChevronLeft, IconClients, IconFilter } from "@/lib/icons";
import type { SidebarClient } from "@/app/api/helpers/client-queries";

interface NewClientsCardProps {
  clients: SidebarClient[];
}

interface IndustryChip {
  name: string;
  count: number;
}

export function NewClientsCard({ clients }: NewClientsCardProps) {
  const [active, setActive] = useState<string | null>(null);

  // Industries present among the loaded partners (+ count). Sorted by count.
  const industries = useMemo<IndustryChip[]>(() => {
    const map = new Map<string, number>();
    for (const c of clients) {
      if (!c.industry) continue;
      map.set(c.industry, (map.get(c.industry) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [clients]);

  const filtered = useMemo(
    () => (active ? clients.filter((c) => c.industry === active) : clients),
    [clients, active]
  );

  // No point showing a one-button filter.
  const showFilter = industries.length > 1;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Industry filter — client-side, instant, no reload. */}
      {showFilter && (
        <Card className="flex-none">
          <CardContent className="p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <IconFilter className="h-3.5 w-3.5 shrink-0 text-accent" />
                <h2 className="text-xs font-semibold uppercase text-muted-foreground">
                  تصفية حسب الصناعة
                </h2>
              </div>
              {/* "الكل" = reset — appears only once a specific industry is selected. */}
              {active !== null && (
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  aria-label="عرض كل الشركاء"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-border"
                >
                  <span aria-hidden className="text-[13px] leading-none">×</span>
                  الكل
                  <span className="text-[10px] font-bold opacity-60">{clients.length}</span>
                </button>
              )}
            </div>
            <div
              className="flex flex-wrap gap-1.5"
              role="tablist"
              aria-label="تصفية الشركاء حسب الصناعة"
            >
              {industries.map((ind) => (
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

      {/* Partners list (unchanged rows) — filtered in place. */}
      <Card className="flex min-h-0 flex-1 flex-col">
        <CardContent className="flex min-h-0 flex-1 flex-col p-4">
          <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <IconClients className="h-4 w-4 shrink-0 text-primary" />
              <h2 className="text-xs font-semibold uppercase text-muted-foreground">
                الشركاء
              </h2>
            </div>
            <Link
              href="/clients"
              className="inline-flex shrink-0 items-center gap-1 text-xs text-primary hover:underline"
            >
              <IconChevronLeft className="h-3.5 w-3.5" aria-hidden />
              استكشف
            </Link>
          </div>
          <ScrollArea className="min-h-0 flex-1" dir="rtl">
            <div className="pb-4">
              {filtered.length > 0 ? (
                filtered.map((client) => (
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] transition-colors",
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
