import Link from "next/link";
import { format } from "date-fns";

import type { ReactNode } from "react";

export type ActivitySource = "GSC" | "GA4" | "DB";

export interface ActivityEvent {
  /** ISO string or Date — rendered as HH:mm. */
  time: Date | string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  source: ActivitySource;
  href?: string;
}

interface MiniActivityFeedProps {
  title?: string;
  events: ActivityEvent[];
  emptyMessage?: string;
}

const SOURCE_BADGE: Record<ActivitySource, string> = {
  GSC: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  GA4: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  DB: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

const SOURCE_ICON_BG: Record<ActivitySource, string> = {
  GSC: "bg-blue-500/15 text-blue-500",
  GA4: "bg-cyan-500/15 text-cyan-500",
  DB: "bg-emerald-500/15 text-emerald-500",
};

function EventRow({ event }: { event: ActivityEvent }) {
  const time = typeof event.time === "string" ? new Date(event.time) : event.time;
  const inner = (
    <div className="flex items-start gap-2.5">
      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 mt-1 w-10">
        {format(time, "HH:mm")}
      </span>
      <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${SOURCE_ICON_BG[event.source]}`}>
        {event.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-tight truncate">{event.title}</div>
        {event.subtitle && (
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{event.subtitle}</div>
        )}
      </div>
    </div>
  );

  if (event.href) {
    return (
      <Link href={event.href} className="block hover:bg-muted/40 -mx-2 px-2 py-1 rounded-md transition-colors">
        {inner}
      </Link>
    );
  }
  return <div className="py-1">{inner}</div>;
}

export function MiniActivityFeed({
  title = "Recent Activity",
  events,
  emptyMessage = "No recent events.",
}: MiniActivityFeedProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
          {title}
        </h3>
        {events.length > 0 && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${SOURCE_BADGE[events[0].source]}`}>
            {events[0].source}
          </span>
        )}
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {events.map((event, i) => (
            <EventRow key={`${event.title}-${i}`} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
