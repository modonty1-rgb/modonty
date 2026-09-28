import type { EntertainmentPlace } from "@modonty/shared/lib/sectors/entertainment-places";

/** One city's guide, split the way the page shows it. */
export interface CityPlaces {
  city: string;
  experiences: EntertainmentPlace[];
  restaurants: EntertainmentPlace[];
  family: EntertainmentPlace[];
}

/** A city as the picker shows it, with how many places it has once hidden ones are out. */
export interface CityOption {
  key: string;
  name: string;
  count: number;
}
