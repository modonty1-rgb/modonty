import { SectionCard } from "./section-card";

export interface ClientAchievementItem {
  value: string;
  label: string;
  icon?: string | null;
}

interface Props {
  achievements: ClientAchievementItem[];
}

/**
 * «إنجازاتنا بالأرقام» — optional metrics grid. Real numbers only (the partner
 * enters them from console); the whole section disappears when empty per the
 * project golden rule (no fabricated numbers). Server, zero JS.
 */
export function ClientResultsSection({ achievements }: Props) {
  const items = achievements.filter((a) => a.value?.trim() && a.label?.trim());
  if (items.length === 0) return null;

  return (
    <SectionCard id="results" icon="📈" title="إنجازاتنا بالأرقام">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((a, i) => (
          <div key={i} className="rounded-md border bg-card p-4 text-center">
            <b className="block text-[27px] font-black leading-none text-primary">{a.value}</b>
            <div className="mt-[7px] text-[11.5px] text-muted-foreground">{a.label}</div>
            {a.icon?.trim() && (
              <div className="mt-[5px] inline-flex items-center gap-[3px] text-[10px] font-extrabold text-success">
                {a.icon}
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
