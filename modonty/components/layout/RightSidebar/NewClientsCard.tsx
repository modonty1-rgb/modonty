import type { CSSProperties } from "react";

import Link from "@/components/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NewClientItem } from "./NewClientItem";
import { IconChevronLeft, IconClients, IconFilter } from "@/lib/icons";
import type { SidebarClient } from "@/app/api/helpers/client-queries";

// Server component (was 'use client'): this partners sidebar is `hidden lg:block` — never
// shown on mobile — yet its client JS (Radix dropdown/scroll + list rendering) shipped +
// hydrated on the mobile initial load. Rebuilt as pure server output: industry filter and
// partner sort are CSS-only (radio + :checked sibling rules → zero JS), the list is fully
// SSR (all partner links stay in the HTML for SEO on every viewport). Trade-off: the minor
// "ترتيب الصناعات" (chip reorder) control was dropped — chips render in most-partners order.

interface NewClientsCardProps {
  clients: SidebarClient[];
}

const PARTNER_SORT = [
  { value: "newest", label: "الأحدث" },
  { value: "name", label: "أبجدي" },
  { value: "articles", label: "الأكثر" },
] as const;

const chipClass =
  "nc-chip inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-border";
const sortLabelClass =
  "nc-sortlabel cursor-pointer rounded-full px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground";

function buildCss(tokens: string[]): string {
  const active = "background:hsl(var(--accent));color:hsl(var(--accent-foreground));font-weight:700";
  const sortActive = "background:hsl(var(--muted));color:hsl(var(--foreground));font-weight:600";
  const parts: string[] = [];
  // filter: hide partners whose industry != the checked one
  for (const t of tokens) {
    parts.push(`#pf-${t}:checked~.nc-pcard .plist>li:not(.ind-${t}){display:none}`);
    parts.push(`#pf-${t}:checked~.nc-fcard label[for="pf-${t}"]{${active}}`);
  }
  parts.push(`#pf-all:checked~.nc-fcard label[for="pf-all"]{${active}}`);
  // sort: reorder via precomputed order vars (newest = DOM order)
  parts.push(`#ps-name:checked~.nc-pcard .plist>li{order:var(--on)}`);
  parts.push(`#ps-articles:checked~.nc-pcard .plist>li{order:var(--oa)}`);
  parts.push(`#ps-newest:checked~.nc-pcard label[for="ps-newest"]{${sortActive}}`);
  parts.push(`#ps-name:checked~.nc-pcard label[for="ps-name"]{${sortActive}}`);
  parts.push(`#ps-articles:checked~.nc-pcard label[for="ps-articles"]{${sortActive}}`);
  return parts.join("");
}

export function NewClientsCard({ clients }: NewClientsCardProps) {
  // Industries (stable index tokens), most-partners first.
  const industryMap = new Map<string, number>();
  for (const c of clients) {
    if (c.industry) industryMap.set(c.industry, (industryMap.get(c.industry) ?? 0) + 1);
  }
  const industries = [...industryMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .map((ind, i) => ({ ...ind, token: `i${i}` }));
  const tokenOf = new Map(industries.map((ind) => [ind.name, ind.token]));
  const showFilter = industries.length > 1;

  // Precomputed sort ranks → CSS `order`. newest = DOM order (query is createdAt-desc).
  const nameRank = new Map([...clients].sort((a, b) => a.name.localeCompare(b.name, "ar")).map((c, i) => [c.id, i]));
  const artRank = new Map([...clients].sort((a, b) => b.articleCount - a.articleCount).map((c, i) => [c.id, i]));

  return (
    <div className="nc-root flex h-full flex-col gap-3">
      {/* CSS-only controls: radios drive the :checked sibling rules (zero JS). */}
      <input type="radio" name="nc-filter" id="pf-all" defaultChecked className="sr-only" />
      {industries.map((ind) => (
        <input key={ind.token} type="radio" name="nc-filter" id={`pf-${ind.token}`} className="sr-only" />
      ))}
      <input type="radio" name="nc-sort" id="ps-newest" defaultChecked className="sr-only" />
      <input type="radio" name="nc-sort" id="ps-name" className="sr-only" />
      <input type="radio" name="nc-sort" id="ps-articles" className="sr-only" />

      {showFilter && (
        <Card className="nc-fcard flex-none">
          <CardContent className="p-3">
            <div className="mb-2 flex items-center gap-2">
              <IconFilter className="h-3.5 w-3.5 shrink-0 text-accent" />
              <h2 className="truncate text-xs font-semibold uppercase text-muted-foreground">تصفية حسب الصناعة</h2>
            </div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1" role="tablist" aria-label="تصفية الشركاء حسب الصناعة">
              <label htmlFor="pf-all" className={chipClass}>
                الكل
                <span className="text-[10px] font-bold opacity-60">{clients.length}</span>
              </label>
              {industries.map((ind) => (
                <label key={ind.token} htmlFor={`pf-${ind.token}`} className={chipClass}>
                  {ind.name}
                  <span className="text-[10px] font-bold opacity-60">{ind.count}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="nc-pcard flex min-h-0 flex-1 flex-col">
        <CardContent className="flex min-h-0 flex-1 flex-col p-4">
          <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <IconClients className="h-4 w-4 shrink-0 text-primary" />
              <h2 className="text-xs font-semibold uppercase text-muted-foreground">الشركاء</h2>
            </div>
            <Link href="/clients" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <IconChevronLeft className="h-3.5 w-3.5" aria-hidden />
              استكشف
            </Link>
          </div>

          <div className="mb-2 flex shrink-0 items-center gap-1 overflow-x-auto scrollbar-thin">
            <span className="shrink-0 text-[11px] text-muted-foreground">ترتيب:</span>
            {PARTNER_SORT.map((s) => (
              <label key={s.value} htmlFor={`ps-${s.value}`} className={sortLabelClass}>
                {s.label}
              </label>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin" dir="rtl">
            {clients.length > 0 ? (
              <ul className="plist flex flex-col pb-4">
                {clients.map((client) => {
                  const token = client.industry ? tokenOf.get(client.industry) : undefined;
                  const style = {
                    "--on": String(nameRank.get(client.id) ?? 0),
                    "--oa": String(artRank.get(client.id) ?? 0),
                  } as CSSProperties;
                  return (
                    <li key={client.id} className={cn("partner", token && `ind-${token}`)} style={style}>
                      <NewClientItem
                        clientName={client.name}
                        clientSlug={client.slug}
                        clientLogo={client.logo}
                        industry={client.industry}
                        articleCount={client.articleCount}
                      />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">لا يوجد شركاء حالياً</p>
            )}
          </div>
        </CardContent>
      </Card>

      <style dangerouslySetInnerHTML={{ __html: buildCss(industries.map((i) => i.token)) }} />
    </div>
  );
}
