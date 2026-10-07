import type { ArchiveSort } from "@/lib/articles/archive/get-articles-archive";
import type { ArchiveState } from "@/lib/articles/archive/build-archive-href";
import type { ReadingTimeBucket } from "@/lib/articles/archive/reading-time-buckets";

const SORTS: ArchiveSort[] = ["newest", "mostRead", "mostEngaged"];
const TIMES: ReadingTimeBucket[] = ["short", "medium", "long"];

/** What `/articles` accepts in its URL — the raw search params before `readState` narrows them. */
export type ArchiveSearchParams = {
  industry?: string;
  modonty?: string;
  category?: string;
  tag?: string;
  search?: string;
  time?: string;
  sort?: string;
  page?: string;
};

/** Anything the visitor can type into the URL is narrowed to what the page actually supports. */
export function readState(raw: ArchiveSearchParams): ArchiveState {
  const page = Number(raw.page);
  return {
    modonty: raw.modonty === "1" ? true : undefined,
    industry: raw.industry?.trim() || undefined,
    category: raw.category?.trim() || undefined,
    tag: raw.tag?.trim() || undefined,
    search: raw.search?.trim() || undefined,
    time: TIMES.includes(raw.time as ReadingTimeBucket) ? (raw.time as ReadingTimeBucket) : undefined,
    sort: SORTS.includes(raw.sort as ArchiveSort) ? (raw.sort as ArchiveSort) : undefined,
    page: Number.isFinite(page) && page > 1 ? Math.floor(page) : undefined,
  };
}
