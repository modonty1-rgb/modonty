import { entertainmentPlaces } from "@modonty/shared/lib/sectors/entertainment-places";

import type { CityPlaces } from "../helpers/types";

/** One city's places without the ones the editor hid, in the source's order. */
export function getCityPlaces(city: string, hidden: string[]): CityPlaces {
  const skip = new Set(hidden);
  const here = entertainmentPlaces.places.filter((p) => p.city === city && !skip.has(p.id));
  return {
    city,
    experiences: here.filter((p) => p.kind === "experience"),
    restaurants: here.filter((p) => p.kind === "restaurant"),
    family: here.filter((p) => p.kind === "family"),
  };
}
