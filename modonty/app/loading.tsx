const card = "rounded-lg border bg-card shadow-sm p-3";
const pulse = "bg-muted animate-pulse rounded";

export default function HomeLoading() {
  return (
    <div className="container mx-auto max-w-[1128px] px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <aside className="hidden lg:block w-[240px] sticky top-[3.5rem] self-start space-y-4">
            <div className={card}><div className={`${pulse} h-24`} /></div>
            <div className={card}><div className={`${pulse} h-40`} /></div>
            <div className={card}><div className={`${pulse} h-20`} /></div>
          </aside>
          <div className="w-full lg:flex-1 lg:max-w-[600px] space-y-4 pb-20 md:pb-0">
            <h2 id="loading-articles-heading" className="sr-only">جاري تحميل آخر المقالات</h2>
            {[1, 2, 3, 4].map((i) => (
              <article key={i} className={card}>
                <div className="flex gap-3 mb-3">
                  <div className={`${pulse} h-10 w-10 rounded-full shrink-0`} />
                  <div className="flex-1 space-y-2">
                    <div className={`${pulse} h-4 w-32`} />
                    <div className={`${pulse} h-3 w-24`} />
                  </div>
                </div>
                <div className={`${pulse} aspect-video w-full rounded-md mb-3`} />
                <div className="space-y-2">
                  <div className={`${pulse} h-4 w-full`} />
                  <div className={`${pulse} h-4 w-5/6`} />
                </div>
              </article>
            ))}
          </div>
          <aside className="hidden lg:flex flex-col w-[300px] sticky top-[3.5rem] self-start h-[calc(100vh-4rem)] space-y-4">
            <div className={`${card} flex justify-center gap-2`}><div className={`${pulse} h-8 w-8 rounded-md`} /><div className={`${pulse} h-8 w-8 rounded-md`} /><div className={`${pulse} h-8 w-8 rounded-md`} /></div>
            <div className={card}><div className={`${pulse} h-3 w-20 mb-1`} /><div className={`${pulse} h-3 w-full`} /><div className={`${pulse} h-3 w-full`} /><div className={`${pulse} h-3 w-4/5`} /></div>
            <div className={`${card} flex-1 min-h-0 flex flex-col gap-2`}><div className={`${pulse} h-3 w-24`} />{[1,2,3].map(i=> <div key={i} className="flex gap-3"><div className={`${pulse} h-7 w-7 rounded-full shrink-0`} /><div className={`${pulse} h-3 flex-1`} /></div>)}</div>
            <div className={card}><div className={`${pulse} h-3 w-12 mb-1`} /><div className={`${pulse} h-6 w-full`} /><div className={`${pulse} h-6 w-full`} /></div>
          </aside>
        </div>
      </div>
  );
}
