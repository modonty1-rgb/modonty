import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { entertainmentPlaces, type PlaceKind } from "@modonty/shared/lib/sectors/entertainment-places";

import { PlaceHideToggle } from "./place-hide-toggle";

const N = new Intl.NumberFormat("ar-EG");
const KIND: Record<PlaceKind, string> = { experience: "مكان / تجربة", restaurant: "مطعم", family: "للأطفال والعائلة" };

/**
 * The guide's places, one city at a time, each with «ظاهر / مخفي» (Khalid, 28 Sep 2026: the editor
 * hides what the import's filter missed). Search and city live in the URL, like the articles tab.
 */
export function PlacesPanel({ base, city, q, hidden }: { base: string; city: string; q: string; hidden: string[] }) {
  const skip = new Set(hidden);
  const needle = q.trim().toLowerCase();
  const cities = entertainmentPlaces.cities;
  const current = cities.some((c) => c.key === city) ? city : cities[0]?.key;
  const rows = entertainmentPlaces.places.filter(
    (p) => p.city === current && (!needle || `${p.name} ${p.nameEn ?? ""}`.toLowerCase().includes(needle)),
  );
  const hiddenHere = rows.filter((p) => skip.has(p.id)).length;

  return (
    <section aria-label="الأماكن" className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {cities.map((c) => (
          <Link
            key={c.key}
            href={`${base}?tab=places&city=${c.key}`}
            aria-current={c.key === current ? "page" : undefined}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[12px] font-medium",
              c.key === current ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <form action={base} className="relative min-w-[220px] flex-1">
          <input type="hidden" name="tab" value="places" />
          <input type="hidden" name="city" value={current} />
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="ابحث باسم المكان"
            className="h-8 w-full rounded-md border bg-card ps-8 pe-2 text-[12.5px] outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </form>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {N.format(rows.length)} مكان · مخفي {N.format(hiddenHere)}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-[13px] text-muted-foreground">لا نتائج.</p>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {rows.map((p) => (
            <li key={p.id} className={cn("flex items-center gap-3 px-3 py-2", skip.has(p.id) && "bg-destructive/[0.04]")}>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-[13px] font-medium", skip.has(p.id) && "text-muted-foreground line-through")}>{p.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {KIND[p.kind]}
                  {p.nameEn ? ` · ${p.nameEn}` : ""}
                  {p.area ? ` · ${p.area}` : ""}
                </p>
              </div>
              {(p.link || p.map) && (
                <a href={p.link || p.map || undefined} target="_blank" rel="noopener noreferrer" aria-label="افتح المصدر" className="text-muted-foreground hover:text-foreground">
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              )}
              <PlaceHideToggle placeId={p.id} hidden={skip.has(p.id)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
