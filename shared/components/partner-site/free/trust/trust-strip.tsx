import { Award, ShieldCheck } from "lucide-react";

import type { HomeData } from "../home/home-data";

/** «شريط الثقة» — one quiet line under the hero: verified badge + credentials, the way logo clouds sit on a company site. */
export function TrustStrip({ data }: { data: HomeData; preview?: boolean }) {
  const { trust } = data;
  const items = trust.credentials.slice(0, 4);
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto flex max-w-[1128px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-4 text-sm text-muted-foreground">
        {trust.verified && (
          <span className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden /> شريك موثَّق في مدونتي
          </span>
        )}
        {items.map((c) => (
          <span key={c.name} className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" aria-hidden />
            <span className="text-foreground">{c.name}</span>
            {c.authority && <span>· {c.authority}</span>}
            {c.year && <span>· {c.year}</span>}
          </span>
        ))}
      </div>
    </section>
  );
}
