import { AlertTriangle, Bell, CheckCheck } from "lucide-react";
import type { NotificationPriority } from "@prisma/client";

import { cn } from "@/lib/utils";
import type { BriefNotification } from "../helpers/load-brief-detail";
import { BriefSection } from "./brief-section";

// Everything the team was told about this client, newest first.
//
// Delivery is shown, not assumed: a note Telegram refused is still a real note somebody
// wrote, and hiding the failure would let them believe the team saw it.

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const PRIORITY: Record<NotificationPriority, { label: string; className: string; bar: string }> = {
  NORMAL: {
    label: "عادي",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  IMPORTANT: {
    label: "مهم",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    bar: "bg-amber-500",
  },
  URGENT: {
    label: "عاجل",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
    bar: "bg-red-500",
  },
};

export function NotificationHistory({ items }: { items: BriefNotification[] }) {
  return (
    <BriefSection
      title="سجل التبليغات"
      icon={<Bell aria-hidden="true" />}
      meta={items.length > 0 ? `${items.length} تبليغ` : "ما انبعث شي بعد"}
      // The one section that changes what you do with the rest of the page — folded like
      // the others, but never lost among them.
      tone="highlight"
    >
      {items.length === 0 ? (
        <p className="px-4 py-8 text-center text-xs text-muted-foreground">
          أول ما تبلّغ الفريق عن هذا العميل، يظهر التبليغ هنا بوقته وصاحبه.
        </p>
      ) : (
        <ul className="divide-y">
          {items.map((n) => {
            const p = PRIORITY[n.priority];
            return (
              <li key={n.id} className="flex gap-3 px-4 py-3">
                {/* A colour bar reads faster down a list than a badge does */}
                <span className={cn("mt-0.5 w-1 shrink-0 rounded-full", p.bar)} aria-hidden="true" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", p.className)}>
                      {p.label}
                    </span>
                    {/* Names, not roles — the same words the Telegram message carried, so
                        the two records read as one thing rather than two. */}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                      {n.recipientNames.length > 0 ? `← ${n.recipientNames.join(" · ")}` : "📣 الكل"}
                    </span>
                    <span className="text-[11px] font-medium">{n.sentByName}</span>
                    <span className="text-[10.5px] text-muted-foreground" dir="ltr">
                      {dateFmt.format(new Date(n.createdAt))}
                    </span>
                    {n.delivered ? (
                      <span className="ms-auto inline-flex items-center gap-1 text-[10.5px] text-emerald-600 dark:text-emerald-400">
                        <CheckCheck className="h-3 w-3" aria-hidden="true" />
                        وصلت
                      </span>
                    ) : (
                      <span
                        className="ms-auto inline-flex items-center gap-1 text-[10.5px] text-red-600 dark:text-red-400"
                        title={n.error ?? undefined}
                      >
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        ما وصلت
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed">{n.message}</p>
                  {!n.delivered && n.error && (
                    <p className="rounded border border-red-500/25 bg-red-500/5 px-2 py-1 text-[10.5px] text-red-600 dark:text-red-400">
                      {n.error}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </BriefSection>
  );
}
