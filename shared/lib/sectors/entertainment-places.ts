import raw from "./entertainment-places.json";

/**
 * The family guide behind `/modonty/entertainment`, written by
 * `modonty/scripts/import-entertainment-places.mjs`: هيئة السياحة's experiences and restaurants per
 * destination (translated to Arabic once, at import) and هيئة الترفيه's family venues. Two readers —
 * the page, and the admin screen where the editor hides a place — so it lives here.
 */
export type PlaceKind = "experience" | "restaurant" | "family";

export interface EntertainmentPlace {
  /** Stable across imports: source · city · name. What the editor's hidden list stores. */
  id: string;
  city: string;
  kind: PlaceKind;
  /** Arabic — machine-translated for هيئة السياحة's rows, original for هيئة الترفيه's. */
  name: string;
  /** هيئة السياحة's own English name, kept beside the translation. */
  nameEn?: string;
  description?: string | null;
  link?: string | null;
  map?: string | null;
  /** The open-data dataset a row came from (هيئة السياحة). */
  source?: string;
  /** هيئة الترفيه's venues: the city or town it is in, its hours, and the licence's end date. */
  area?: string;
  hours?: string;
  until?: string;
}

export interface EntertainmentCity {
  key: string;
  name: string;
}

export const entertainmentPlaces = raw as unknown as {
  updated: string;
  cities: EntertainmentCity[];
  places: EntertainmentPlace[];
};
