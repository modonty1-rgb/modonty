import { z } from "zod";

import { searchFacilities } from "../../data/search-facilities";

const querySchema = z.string().trim().min(2).max(60);

/** `/modonty/health/api/facilities?q=` — the facility lookup — سباهي and مجلس الضمان الصحي from the open data platform. */
export async function GET(request: Request) {
  const parsed = querySchema.safeParse(new URL(request.url).searchParams.get("q") ?? "");
  if (!parsed.success) {
    return Response.json({ error: "q must be 2 to 60 characters" }, { status: 400 });
  }
  try {
    return Response.json(await searchFacilities(parsed.data), { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch (error) {
    console.error("[health] facilities", error instanceof Error ? error.message : error);
    return Response.json({ error: "source unavailable" }, { status: 502 });
  }
}
