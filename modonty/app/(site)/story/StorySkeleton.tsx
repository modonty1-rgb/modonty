import { messages } from "@/lib/i18n/messages";

const pulse = "animate-pulse rounded bg-muted";

/**
 * The story's shell while it loads — the SAME three columns `SalesPitchPage` draws:
 * chapters menu (`md:w-64 lg:w-72`) · player (`flex-1`) · pitch card (`md:w-64 lg:w-80`),
 * inside `max-w-[1600px]` at `md:h-[calc(100dvh-56px)]`. Column classes are copied verbatim.
 *
 * Until 24 Sep 2026 it was one centred card with a spinner — measured at 1280px against a
 * page of 288/598/320, so the whole screen rearranged when the story arrived. Used by both
 * `loading.tsx` (route) and `StoryClientLoader` (the dynamic import), so they cannot drift.
 */
export function StorySkeleton() {
  return (
    <div
      className="relative py-3 md:h-[calc(100dvh-56px)] md:py-4"
      aria-label={messages.modonty.story.loadingLabel}
      role="status"
      dir="rtl"
    >
      <div className="mx-auto h-full max-w-[1600px] px-3 md:px-4">
        <div className="flex h-full flex-col gap-3 md:flex-row md:gap-4">
          <div className="flex w-full flex-col gap-2 rounded-2xl bg-card p-3 ring-1 ring-border/60 max-md:order-3 md:h-full md:w-64 md:shrink-0 lg:w-72">
            <div className={`${pulse} h-9 w-full rounded-lg`} />
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`${pulse} h-11 w-full rounded-lg`} />
            ))}
          </div>
          <div className="flex min-h-[60vh] w-full min-w-0 flex-1 flex-col rounded-3xl bg-card p-4 ring-2 ring-foreground/5 max-md:order-2 md:h-full">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`${pulse} h-6 w-24 rounded-full`} />
              ))}
            </div>
            <div className="flex flex-1 items-center justify-center">
              <div className={`${pulse} h-20 w-64 rounded-xl`} />
            </div>
            <div className={`${pulse} h-1.5 w-full rounded-full`} />
            <div className="mt-4 flex items-center justify-center gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`${pulse} size-11 rounded-full`} />
              ))}
            </div>
          </div>
          <div className="w-full space-y-4 rounded-2xl bg-card p-5 ring-1 ring-border/60 max-md:order-1 md:h-full md:w-64 md:shrink-0 md:p-6 lg:w-80">
            <div className={`${pulse} h-9 w-3/4`} />
            <div className={`${pulse} h-4 w-1/2`} />
            <div className={`${pulse} h-14 w-full`} />
            <div className={`${pulse} h-12 w-full rounded-xl`} />
            <div className={`${pulse} h-12 w-full rounded-lg`} />
          </div>
        </div>
      </div>
      <span className="sr-only">جاري تحميل القصة...</span>
    </div>
  );
}
