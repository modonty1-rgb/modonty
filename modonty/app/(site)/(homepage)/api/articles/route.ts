import { getMoreArticles } from "@/app/(site)/(homepage)/data/get-more-articles";

// Public endpoint for the coming mobile app. It only opens the door — the
// fetching lives in getMoreArticles, the same function the web already calls.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const page = Number(params.get("page") ?? 1);

  if (!Number.isInteger(page) || page < 1) {
    return Response.json({ error: "page must be a positive whole number" }, { status: 400 });
  }

  const result = await getMoreArticles(
    page,
    params.get("category") ?? undefined,
    params.get("client") ?? undefined
  );

  return Response.json(result);
}
