import { Bell } from "lucide-react";

import type { BriefNotification } from "../helpers/load-brief-detail";
import { BriefSection } from "./brief-section";
import { NotificationTable } from "./notification-table";

// Everything the team was told about this client, newest first.
//
// Delivery is shown, not assumed: a note Telegram refused is still a real note somebody
// wrote, and hiding the failure would let them believe the team saw it.
//
// A table, not a list (Khalid, 1 Sep 2026): the log is read by scanning one column at a time —
// «what came in urgent», «who reported», «what happened this week» — and a list answers none of
// those without reading every entry. Sorting lives in `notification-table.tsx`, which is the
// only part that needs client state; this section stays a server component.

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
        <NotificationTable items={items} />
      )}
    </BriefSection>
  );
}
