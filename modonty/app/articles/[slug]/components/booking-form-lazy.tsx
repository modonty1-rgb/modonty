"use client";

import dynamic from "next/dynamic";

/**
 * Lazy BookingForm — defers react-hook-form + zod (~20-25kb) off the initial bundle.
 * The form only loads when a booking dialog/sheet actually opens; the trigger buttons
 * stay static so there's no layout shift. Same public API as BookingForm, so callers
 * just swap the import. ssr:false is allowed here because this is a Client Component.
 */
export const BookingForm = dynamic(
  () => import("./booking-form").then((m) => ({ default: m.BookingForm })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 py-6" aria-hidden>
        <div className="h-12 animate-pulse rounded-md bg-muted" />
        <div className="h-12 animate-pulse rounded-md bg-muted" />
        <div className="h-20 animate-pulse rounded-md bg-muted" />
        <div className="h-12 animate-pulse rounded-md bg-muted" />
      </div>
    ),
  }
);
