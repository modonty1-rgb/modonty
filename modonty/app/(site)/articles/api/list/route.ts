import { getArticlesArchive, type ArchiveSort } from "@/lib/articles/archive/get-articles-archive";
import { filterByReadingTime, type ReadingTimeBucket } from "@/lib/articles/archive/reading-time-buckets";
import { ARCHIVE_PAGE_SIZE } from "@/app/(site)/articles/helpers/archive-page-size";

const SORTS: ArchiveSort[] = ["newest", "mostRead", "mostEngaged"];
const TIMES: ReadingTimeBucket[] = ["short", "medium", "long"];

/**
 * One chunk of the archive, with the visitor's filters applied.
 *
 * A Route Handler, not a Server Action: Next.js queues actions one at a time per client, so a
 * scroll fetch running through an action would sit behind every other action on the page. It is
 * also the door the mobile app will use — same function the page itself calls, no second query.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const page = Number(params.get("page") ?? 1);

  if (!Number.isInteger(page) || page < 1) {
    return Response.json({ error: "page must be a positive whole number" }, { status: 400 });
  }

  const sortParam = params.get("sort");
  const timeParam = params.get("time");

  const matches = await getArticlesArchive({
    industrySlug: params.get("industry") ?? undefined,
    categorySlug: params.get("category") ?? undefined,
    tagSlug: params.get("tag") ?? undefined,
    search: params.get("search") ?? undefined,
    sort: SORTS.includes(sortParam as ArchiveSort) ? (sortParam as ArchiveSort) : undefined,
  });

  // Reading time is applied here, exactly as the page does it, so scrolled chunks and the
  // server-rendered first chunk can never disagree about what the list contains.
  const articles = filterByReadingTime(
    matches,
    TIMES.includes(timeParam as ReadingTimeBucket) ? (timeParam as ReadingTimeBucket) : undefined
  );

  const start = (page - 1) * ARCHIVE_PAGE_SIZE;
  const items = articles.slice(start, start + ARCHIVE_PAGE_SIZE);

  return Response.json({ items, hasMore: articles.length > start + items.length });
}
