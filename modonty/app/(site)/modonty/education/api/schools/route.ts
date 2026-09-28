import { z } from "zod";

import { searchSchools } from "../../data/search-schools";

const querySchema = z.string().trim().min(2).max(80);

/** `/modonty/education/api/schools?q=` — the school lookup's search. The data changes once a year. */
export async function GET(request: Request) {
  const parsed = querySchema.safeParse(new URL(request.url).searchParams.get("q") ?? "");
  if (!parsed.success) {
    return Response.json({ error: "q must be 2 to 80 characters" }, { status: 400 });
  }
  return Response.json(searchSchools(parsed.data), {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
