/**
 * Shown only while the Settings row is read on a cold cache — the page itself reads no
 * runtime data and is normally served straight from the cache. The skeleton keeps the
 * page's own shape so nothing jumps when the links arrive.
 */
export default function AccountsLoading() {
  return (
    <main dir="rtl" className="min-h-dvh bg-background px-4 py-10" aria-busy="true">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <div className="size-20 animate-pulse rounded-2xl bg-muted" />
        <div className="mt-4 h-7 w-28 animate-pulse rounded bg-muted" />
        <div className="mt-8 flex w-full flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="mt-8 flex w-full flex-col gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </main>
  );
}
