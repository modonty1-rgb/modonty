import { Skeleton } from "@/components/ui/skeleton";

/**
 * `/book` renders the booking block with no frame: eyebrow · title in the `max-w-[1128px] px-6
 * py-16` box, then one centred card (the form, or the WhatsApp card). It drew a lone narrow
 * form at the top of the page until 24 Sep 2026.
 */
export default function BookingLoading() {
  return (
    <div className="mx-auto max-w-[1128px] px-6 py-16" aria-hidden>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-8 w-48" />
      <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-border bg-card p-5">
        <Skeleton className="mx-auto h-4 w-3/4" />
        <Skeleton className="mx-auto mt-4 h-10 w-36 rounded-full" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
