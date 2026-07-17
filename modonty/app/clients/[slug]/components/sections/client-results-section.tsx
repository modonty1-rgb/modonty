import Image from "next/image";

import { SectionCard } from "./section-card";

export interface ClientAchievementItem {
  value: string;
  label: string;
  image?: string | null;
  description?: string | null;
}

interface Props {
  achievements: ClientAchievementItem[];
}

/**
 * «إنجازاتنا بالأرقام» — optional story cards. Real numbers only (the partner
 * enters them from console); the whole section disappears when empty per the
 * project golden rule (no fabricated numbers). Server, zero JS.
 * An achievement with an image + paragraph renders as a story card; without,
 * it degrades to a simple centered number tile.
 */
export function ClientResultsSection({ achievements }: Props) {
  const items = achievements.filter((a) => a.value?.trim() && a.label?.trim());
  if (items.length === 0) return null;

  return (
    <SectionCard id="results" icon="📈" title="إنجازاتنا بالأرقام">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a, i) => {
          const image = a.image?.trim();
          const description = a.description?.trim();
          return (
            <div key={i} className="flex flex-col overflow-hidden rounded-xl border bg-card">
              {image && (
                <div className="relative aspect-[16/10] w-full bg-muted">
                  <Image
                    src={image}
                    alt={a.label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
              <div
                className={
                  image
                    ? "flex flex-1 flex-col items-start p-4 text-start"
                    : "flex flex-1 flex-col items-center justify-center p-5 text-center"
                }
              >
                <b className="block text-[28px] font-black leading-none text-primary">{a.value}</b>
                <div className="mt-2 text-sm font-bold text-foreground">{a.label}</div>
                {description && (
                  <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
