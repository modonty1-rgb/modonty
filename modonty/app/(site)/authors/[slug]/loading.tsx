import { Skeleton } from "@/components/ui/skeleton";

/**
 * The author page as `page.tsx` draws it: `max-w-4xl` container, breadcrumb, a centred
 * profile card (logo · name · line · bio · channels), then the articles in two columns.
 *
 * Until 24 Sep 2026 it drew a left-aligned avatar row and full-width bars in a 1128px box —
 * the page is 896px, centred, and the first thing on it is the card.
 */
export default function AuthorLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8" aria-hidden>
      <Skeleton className="h-4 w-32" />
      <div className="mb-10 mt-8 flex flex-col items-center gap-4 rounded-2xl border px-6 py-10">
        <Skeleton className="h-24 w-24 rounded-2xl" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="mt-1 flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>
      <Skeleton className="mb-6 h-6 w-36" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-60 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
