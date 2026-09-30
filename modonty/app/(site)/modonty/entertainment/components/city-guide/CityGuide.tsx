"use client";

import { useState } from "react";

import type { EntertainmentPlace } from "@modonty/shared/lib/sectors/entertainment-places";
import { fill } from "@/lib/i18n/fill";

import { GoogleTranslateBadge } from "../../../components/translation-credit/GoogleTranslateBadge";
import type { CityOption, CityPlaces } from "../../helpers/types";

export interface CityGuideLabels {
  title: string;
  note: string;
  tabs: { experiences: string; restaurants: string; family: string };
  map: string;
  details: string;
  hours: string;
  loading: string;
  error: string;
  more: string;
}

type Tab = keyof CityGuideLabels["tabs"];
const TABS: Tab[] = ["experiences", "family", "restaurants"];
/** Seventy places in one list made the phone page twelve screens long; a dozen, then more on request. */
const PAGE = 12;

/**
 * «وين تروح مع أهلك؟» — pick a city, then places and experiences, family venues or restaurants. The
 * first city arrives with the page (so it is in the HTML Google reads); the others are fetched when
 * picked.
 */
export function CityGuide({ cities, initial, labels: t }: { cities: CityOption[]; initial: CityPlaces; labels: CityGuideLabels }) {
  const [data, setData] = useState<CityPlaces>(initial);
  const [tab, setTab] = useState<Tab>("experiences");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [shown, setShown] = useState(PAGE);
  const cityName = cities.find((c) => c.key === data.city)?.name ?? "";

  const pick = async (key: string) => {
    if (key === data.city) return;
    setState("loading");
    try {
      const res = await fetch(`/modonty/entertainment/api/places?city=${encodeURIComponent(key)}`);
      if (!res.ok) throw new Error(String(res.status));
      const next = (await res.json()) as CityPlaces;
      setData(next);
      setShown(PAGE);
      // Stay on the reader's tab when the new city has it; otherwise the first one it has.
      setTab((current) => (next[current].length ? current : TABS.find((x) => next[x].length) ?? "experiences"));
      setState("idle");
    } catch {
      setState("error");
    }
  };

  const tabs = TABS.filter((x) => data[x].length);
  const list = data[tab];

  return (
    <section aria-labelledby="city-guide" className="rounded-lg bg-card p-5 ring-1 ring-border">
      <h2 id="city-guide" className="text-lg font-bold">
        {fill(t.title, { city: cityName })}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{t.note}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {cities.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => pick(c.key)}
            aria-pressed={c.key === data.city}
            className={`rounded-full px-3 py-1 text-xs font-semibold max-md:min-h-11 max-md:min-w-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              c.key === data.city ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div role="tablist" className="mt-4 flex gap-4 border-b border-border">
        {tabs.map((x) => (
          <button
            key={x}
            type="button"
            role="tab"
            aria-selected={x === tab}
            onClick={() => {
              setTab(x);
              setShown(PAGE);
            }}
            className={`-mb-px border-b-2 pb-2 text-sm font-semibold max-md:min-h-11 ${x === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.tabs[x]} <span className="text-xs font-normal text-muted-foreground">({data[x].length})</span>
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-3">
        {state === "loading" && <p className="text-sm text-muted-foreground">{t.loading}</p>}
        {state === "error" && <p className="text-sm text-destructive">{t.error}</p>}
        {state === "idle" && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {list.slice(0, shown).map((p) => (
              <PlaceItem key={p.id} place={p} labels={t} />
            ))}
          </ul>
        )}
        {state === "idle" && list.length > shown && (
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE)}
            className="mt-3 w-full rounded-md border border-border py-2 text-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {fill(t.more, { n: String(list.length - shown) })}
          </button>
        )}
      </div>
      {state === "idle" && tab !== "family" && list.length > 0 && <GoogleTranslateBadge />}
    </section>
  );
}

function PlaceItem({ place: p, labels: t }: { place: EntertainmentPlace; labels: CityGuideLabels }) {
  const link = "text-xs font-semibold text-link underline-offset-2 hover:underline";
  return (
    <li className="rounded-md bg-muted/40 p-3">
      <p className="text-sm font-bold leading-snug" lang={p.nameEn ? "ar-x-mtfrom-en" : undefined}>
        {p.name}
      </p>
      {p.nameEn && (
        <bdi dir="ltr" className="block text-start text-xs text-muted-foreground">
          {p.nameEn}
        </bdi>
      )}
      {p.area && p.hours && <p className="mt-0.5 text-xs text-muted-foreground">{fill(t.hours, { area: p.area, hours: p.hours })}</p>}
      {p.description && (
        <p lang="ar-x-mtfrom-en" className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-foreground/80">
          {p.description}
        </p>
      )}
      {(p.map || p.link) && (
        <p className="mt-2 flex gap-3">
          {p.map && (
            <a href={p.map} target="_blank" rel="noopener noreferrer" className={link}>
              {t.map}
            </a>
          )}
          {p.link && (
            <a href={p.link} target="_blank" rel="noopener noreferrer" className={link}>
              {t.details}
            </a>
          )}
        </p>
      )}
    </li>
  );
}
