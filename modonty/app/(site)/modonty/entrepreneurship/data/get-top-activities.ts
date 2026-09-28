import type { ActivityMatch } from "../helpers/types";
import { activities } from "./activities";

/** The most registered activities — the rail's list of the crowded markets. */
export function getTopActivities(n: number): ActivityMatch[] {
  return activities.rows.slice(0, n).map(({ code, name, count, rank, level }) => ({ code, name, count, rank, level }));
}
