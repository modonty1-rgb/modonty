// Ring, not border+shadow: a ring takes no layout space, so hover can thicken it
// without the card jumping. Design system §2.
const card = "rounded-lg bg-card p-3 ring-1 ring-border";
const pulse = "bg-muted animate-pulse rounded";

export default function HomeLoading() {
  return (
    <div className="container mx-auto max-w-[1128px] px-3 py-3 sm:px-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <aside className="hidden lg:block w-[240px] sticky top-[3.5rem] self-start space-y-4">
            <div className={card}><div className={`${pulse} h-24`} /></div>
            <div className={card}><div className={`${pulse} h-40`} /></div>
            <div className={card}><div className={`${pulse} h-20`} /></div>
          </aside>
          <div className="w-full lg:flex-1 lg:max-w-[600px] space-y-4 pb-20 lg:pb-0">
            <h2 id="loading-articles-heading" className="sr-only">نحمّل لك آخر المقالات…</h2>
            {/* PHONE skeleton (23 Aug): drawn to the shape the phone actually gets — the
                search box and the three reading-time tiles, then `MobilePostCard`: publisher
                line · title lines beside a 124×93 thumb · one 32px footer row · rounded-2xl.
                It used to draw the old card (avatar + wide 16:9 image), so the page jumped the
                moment real cards arrived. Desktop keeps its own skeleton below, untouched. */}
            <div className="space-y-3 lg:hidden">
              <div className={`${pulse} h-12 rounded-xl`} />
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`${pulse} h-[69px] rounded-lg`} />
                ))}
              </div>
              {/* Card 1 is the hero: cover on top, two title lines, two excerpt lines, footer. */}
              <article className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className={`${pulse} aspect-video rounded-none`} />
                <div className="p-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`${pulse} size-5 rounded-full shrink-0`} />
                    <div className={`${pulse} h-3 w-28`} />
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className={`${pulse} h-4 w-full`} />
                    <div className={`${pulse} h-4 w-3/4`} />
                    <div className={`${pulse} mt-3 h-3 w-full`} />
                    <div className={`${pulse} h-3 w-5/6`} />
                  </div>
                  <div className="mt-2 flex h-8 items-center gap-3">
                    <div className={`${pulse} h-4 w-16`} />
                    <span className="flex-1" />
                    <div className={`${pulse} size-8 rounded-lg`} />
                  </div>
                </div>
              </article>
              {[2, 3, 4].map((i) => (
                <article key={i} className="rounded-2xl border border-border bg-card p-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`${pulse} size-5 rounded-full shrink-0`} />
                    <div className={`${pulse} h-3 w-28`} />
                  </div>
                  <div className="mt-2 flex items-start gap-2.5">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className={`${pulse} h-3.5 w-full`} />
                      <div className={`${pulse} h-3.5 w-11/12`} />
                      <div className={`${pulse} h-3.5 w-2/3`} />
                      <div className={`${pulse} mt-3 h-3 w-full`} />
                      <div className={`${pulse} h-3 w-4/5`} />
                    </div>
                    <div className={`${pulse} aspect-[4/3] w-[124px] shrink-0 rounded-lg`} />
                  </div>
                  <div className="mt-2 flex h-8 items-center gap-3">
                    <div className={`${pulse} h-4 w-16`} />
                    <span className="flex-1" />
                    <div className={`${pulse} size-8 rounded-lg`} />
                  </div>
                </article>
              ))}
            </div>
            {[1, 2, 3, 4].map((i) => (
              <article key={i} className={`${card} max-lg:hidden`}>
                <div className="flex gap-3 mb-3">
                  <div className={`${pulse} h-10 w-10 rounded-full shrink-0`} />
                  <div className="flex-1 space-y-2">
                    <div className={`${pulse} h-4 w-32`} />
                    <div className={`${pulse} h-3 w-24`} />
                  </div>
                </div>
                <div className={`${pulse} aspect-video w-full rounded-lg mb-3`} />
                <div className="space-y-2">
                  <div className={`${pulse} h-4 w-full`} />
                  <div className={`${pulse} h-4 w-5/6`} />
                </div>
              </article>
            ))}
          </div>
          <aside className="hidden lg:flex flex-col w-[300px] sticky top-[3.5rem] self-start h-[calc(100dvh-4rem)] space-y-4">
            <div className={`${card} flex justify-center gap-2`}><div className={`${pulse} h-8 w-8 rounded-sm`} /><div className={`${pulse} h-8 w-8 rounded-sm`} /><div className={`${pulse} h-8 w-8 rounded-sm`} /></div>
            <div className={card}><div className={`${pulse} h-3 w-20 mb-1`} /><div className={`${pulse} h-3 w-full`} /><div className={`${pulse} h-3 w-full`} /><div className={`${pulse} h-3 w-4/5`} /></div>
            <div className={`${card} flex-1 min-h-0 flex flex-col gap-2`}><div className={`${pulse} h-3 w-24`} />{[1,2,3].map(i=> <div key={i} className="flex gap-3"><div className={`${pulse} h-7 w-7 rounded-full shrink-0`} /><div className={`${pulse} h-3 flex-1`} /></div>)}</div>
            <div className={card}><div className={`${pulse} h-3 w-12 mb-1`} /><div className={`${pulse} h-6 w-full`} /><div className={`${pulse} h-6 w-full`} /></div>
          </aside>
        </div>
      </div>
  );
}
