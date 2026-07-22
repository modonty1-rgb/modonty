import { runReport } from "@/lib/analytics/ga4-data-api";

/**
 * Opens of the booking page, straight from GA4 — the single source both the
 * Bookings card and the Bookings report read, so they can never disagree.
 *
 * Careful about what this number is NOT: `screenPageViews` counts VIEWS, not
 * people. One visitor opening the page three times counts as three.
 *
 * GA4 can only be filtered with CONTAINS here, which is looser than the real
 * route (`/clients/<slug>/book`). So we match strictly in code and keep whatever
 * fails the match in `unmatched` — a path we silently dropped is a lie by omission.
 */

const WINDOW_DAYS = 90;

export interface BookPageOpens {
  /** slug → views, only for paths that really are /clients/<slug>/book */
  bySlug: Map<string, number>;
  /** Total of bySlug — the number both surfaces display. */
  matched: number;
  /** Paths GA4 returned that are not a client booking page. Shown, never hidden. */
  unmatched: Array<{ path: string; views: number }>;
}

const EMPTY: BookPageOpens = { bySlug: new Map(), matched: 0, unmatched: [] };

/**
 * The full booking funnel, three steps deep.
 *
 *   opened   → the /book page was loaded            (page_view)
 *   attempts → the visitor pressed the submit button (booking_attempt)
 *   booked   → a row landed in our DB               (booking_submit)
 *
 * `failed` breaks the attempts that went nowhere down by cause, so a drop-off is
 * a diagnosis and not a mystery. opened − attempts = people who never even managed
 * to press the button.
 */
export interface BookingFunnel {
  opened: number;
  attempts: number;
  booked: number;
  failed: Array<{ reason: string; count: number }>;
}

const EMPTY_FUNNEL: BookingFunnel = { opened: 0, attempts: 0, booked: 0, failed: [] };

/** Why an attempt died. Keys mirror BookingFailReason in modonty's events registry. */
export const FAIL_REASON_LABEL: Record<string, string> = {
  invalid_input: "Form had invalid fields",
  client_not_found: "Client no longer exists",
  cta_not_form: "Client is not in booking mode",
  disclaimer_required: "Did not accept the YMYL disclaimer",
  rate_limited: "Blocked by rate limit",
  db_write_failed: "Our database write failed",
};

export async function getBookingFunnel(opened: number): Promise<BookingFunnel> {
  try {
    const [counts, reasons] = await Promise.all([
      runReport({
        dateRanges: [{ startDate: `${WINDOW_DAYS}daysAgo`, endDate: "today" }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            inListFilter: { values: ["booking_attempt", "booking_submit"] },
          },
        },
        limit: 5,
      }),
      // `reason` is a custom event parameter — it only resolves once it is
      // registered as a custom dimension in the GA4 admin UI. Until then this
      // report comes back empty, which is why it must never break the page.
      runReport({
        dateRanges: [{ startDate: `${WINDOW_DAYS}daysAgo`, endDate: "today" }],
        dimensions: [{ name: "customEvent:reason" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "booking_failed" } },
        },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 20,
      }).catch(() => null),
    ]);

    const c: Record<string, number> = {};
    for (const r of counts.rows ?? []) c[r.dimensionValues[0].value] = Number(r.metricValues[0].value) || 0;

    const failed = (reasons?.rows ?? [])
      .map((r) => ({
        reason: r.dimensionValues[0]?.value ?? "unknown",
        count: Number(r.metricValues[0]?.value) || 0,
      }))
      .filter((f) => f.count > 0 && f.reason !== "(not set)");

    return {
      opened,
      attempts: c.booking_attempt || 0,
      booked: c.booking_submit || 0,
      failed,
    };
  } catch {
    return { ...EMPTY_FUNNEL, opened };
  }
}

/**
 * GA4 count of `booking_whatsapp_click` over the window — the demand side of the
 * WhatsApp funnel. Every click counts (repeats included), so this is always ≥ the
 * deduped DB whatsapp-lead count. GA4 down → 0 so it can never blank the strip.
 */
export async function getWhatsappClicks(): Promise<number> {
  try {
    const rep = await runReport({
      dateRanges: [{ startDate: `${WINDOW_DAYS}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "booking_whatsapp_click" } },
      },
      limit: 1,
    });
    return Number(rep.rows?.[0]?.metricValues?.[0]?.value) || 0;
  } catch {
    return 0;
  }
}

export async function getBookPageOpens(): Promise<BookPageOpens> {
  try {
    const rep = await runReport({
      dateRanges: [{ startDate: `${WINDOW_DAYS}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: {
        filter: { fieldName: "pagePath", stringFilter: { matchType: "CONTAINS", value: "/book" } },
      },
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 500,
    });

    const bySlug = new Map<string, number>();
    const unmatched: Array<{ path: string; views: number }> = [];
    let matched = 0;

    for (const row of rep.rows ?? []) {
      const path = row.dimensionValues[0]?.value ?? "";
      const views = Number(row.metricValues[0]?.value) || 0;
      const m = path.match(/^\/clients\/(.+?)\/book\/?$/);
      if (!m) {
        if (views > 0) unmatched.push({ path, views });
        continue;
      }
      const slug = decodeURIComponent(m[1]);
      bySlug.set(slug, (bySlug.get(slug) ?? 0) + views);
      matched += views;
    }

    unmatched.sort((a, b) => b.views - a.views);
    return { bySlug, matched, unmatched };
  } catch {
    // GA4 down must never blank the operational lists that sit next to this.
    return EMPTY;
  }
}
