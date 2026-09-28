import { z } from "zod";

import { searchDrugs } from "../../data/search-drugs";

const querySchema = z.string().trim().min(2).max(60);

/** `/modonty/health/api/drugs?q=` — the drug lookup — هيئة الغذاء والدواء's registered drugs from the open data platform. */
export async function GET(request: Request) {
  const parsed = querySchema.safeParse(new URL(request.url).searchParams.get("q") ?? "");
  if (!parsed.success) {
    return Response.json({ error: "q must be 2 to 60 characters" }, { status: 400 });
  }
  try {
    return Response.json(await searchDrugs(parsed.data), { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch (error) {
    console.error("[health] drugs", error instanceof Error ? error.message : error);
    return Response.json({ error: "source unavailable" }, { status: 502 });
  }
}
