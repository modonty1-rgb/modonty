import { z } from "zod";

import { searchPrograms } from "../../data/search-programs";

const querySchema = z.string().trim().min(2).max(80);

/** `/modonty/education/api/programs?q=` — the accreditation lookup's search. The data changes once a year. */
export async function GET(request: Request) {
  const parsed = querySchema.safeParse(new URL(request.url).searchParams.get("q") ?? "");
  if (!parsed.success) {
    return Response.json({ error: "q must be 2 to 80 characters" }, { status: 400 });
  }
  return Response.json(searchPrograms(parsed.data), {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
