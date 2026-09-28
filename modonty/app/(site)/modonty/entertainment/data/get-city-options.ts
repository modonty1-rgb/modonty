import { entertainmentPlaces } from "@modonty/shared/lib/sectors/entertainment-places";

import type { CityOption } from "../helpers/types";

/** The cities that still have places once hidden ones are out, busiest first. */
export function getCityOptions(hidden: string[]): CityOption[] {
  const skip = new Set(hidden);
  return entertainmentPlaces.cities
    .map((c) => ({ ...c, count: entertainmentPlaces.places.filter((p) => p.city === c.key && !skip.has(p.id)).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
}
