import { z } from "zod";

import { searchActivities } from "../data/search-activities";

const querySchema = z.string().trim().min(2).max(60);

/**
 * `/modonty/entrepreneurship/api?q=` — the activity lookup's search, on the server so the 2,738
 * activities are not shipped to every phone. The data changes once a quarter, so a CDN may keep an
 * answer for a day.
 */
export async function GET(request: Request) {
  const parsed = querySchema.safeParse(new URL(request.url).searchParams.get("q") ?? "");
  if (!parsed.success) {
    return Response.json({ error: "q must be 2 to 60 characters" }, { status: 400 });
  }
  return Response.json(searchActivities(parsed.data), {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
