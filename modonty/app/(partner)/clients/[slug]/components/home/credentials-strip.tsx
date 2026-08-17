import { IconAward } from "@/lib/icons";
import type { PartnerSite } from "../../helpers/get-partner-site";

interface CredentialsStripProps {
  credentials: PartnerSite["credentials"];
}

/** «معتمدون لدى» — one quiet line under the hero, the way trust logos sit on a company site. */
export function CredentialsStrip({ credentials }: CredentialsStripProps) {
  const items = credentials.filter((c) => c.name?.trim()).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1216px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-4 text-sm text-muted-foreground">
        <span>عضويّات واعتمادات:</span>
        {items.map((c) => (
          <span key={c.name} className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-md bg-primary/10 text-primary"><IconAward className="h-4 w-4" aria-hidden /></span>
            <span className="text-foreground">{c.name}</span>
            {c.year ? <span>· {c.year}</span> : null}
          </span>
        ))}
      </div>
    </div>
  );
}
