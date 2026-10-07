import { SectionCard } from "../sections/section-card";
import { parseOpeningHoursSpecs } from "../../helpers/parse-opening-hours-specs";
import { buildOpeningHoursRows } from "../../helpers/build-opening-hours-rows";
import { getServerTodayName } from "../../helpers/get-server-today-name";

import { ClientOpenNowBadge } from "./client-open-now-badge";

interface ClientHoursProps {
  openingHours: unknown;
}

/** Opening hours sidebar card — hides entirely when the data is unparseable/empty. */
export function ClientHours({ openingHours }: ClientHoursProps) {
  const specs = parseOpeningHoursSpecs(openingHours);
  if (specs.length === 0) return null;

  const rows = buildOpeningHoursRows(specs, getServerTodayName());
  if (rows.length === 0) return null;

  return (
    <SectionCard id="hours" icon="🕐" title="ساعات العمل">
      <ClientOpenNowBadge specs={specs} />
      <div className="flex flex-col gap-1.5">
        {rows.map((row, idx) => (
          <div
            key={`${row.label}-${idx}`}
            className="flex items-center justify-between border-b border-dashed border-border py-[5px] text-[12.5px] last:border-0"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className={row.isToday ? "font-extrabold text-success" : "font-extrabold text-foreground"}>
              {row.time}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
