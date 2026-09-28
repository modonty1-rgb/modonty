import { z } from "zod";

import { entertainmentPlaces } from "@modonty/shared/lib/sectors/entertainment-places";

import { getCityPlaces } from "../../data/get-city-places";
import { getHiddenPlaces } from "../../data/get-hidden-places";

const citySchema = z.enum(entertainmentPlaces.cities.map((c) => c.key) as [string, ...string[]]);

/**
 * `/modonty/entertainment/api/places?city=` — the guide's other cities, fetched when the reader
 * picks one, so the page does not carry all fifteen. Short CDN life: the editor's hide shows within
 * minutes rather than a day.
 */
export async function GET(request: Request) {
  const parsed = citySchema.safeParse(new URL(request.url).searchParams.get("city"));
  if (!parsed.success) {
    return Response.json({ error: "unknown city" }, { status: 400 });
  }
  return Response.json(getCityPlaces(parsed.data, await getHiddenPlaces()), {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
