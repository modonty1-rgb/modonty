"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { messages } from "@/lib/messages";

type Result = { success: true } | { success: false; error: string };
type Status = "new" | "contacted" | "done" | "archived";

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

async function ensureOwnedBooking(
  bookingId: string,
  clientId: string
): Promise<{ id: string } | null> {
  return db.bookingRequest.findFirst({
    where: { id: bookingId, clientId },
    select: { id: true },
  });
}

export async function updateBookingStatus(
  bookingId: string,
  status: Status
): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const booking = await ensureOwnedBooking(bookingId, clientId);
  if (!booking) return { success: false, error: messages.error.notFound };

  try {
    await db.bookingRequest.update({ where: { id: bookingId }, data: { status } });
    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

/** Provider confirms (or clears) the appointment time for a callback lead. */
export async function setBookingConfirmedAt(
  bookingId: string,
  iso: string | null
): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const booking = await ensureOwnedBooking(bookingId, clientId);
  if (!booking) return { success: false, error: messages.error.notFound };

  let confirmedAt: Date | null = null;
  if (iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { success: false, error: messages.error.serverError };
    confirmedAt = d;
  }

  try {
    // Confirming a time implies the provider reached the visitor → mark as done unless archived.
    await db.bookingRequest.update({
      where: { id: bookingId },
      data: {
        confirmedAt,
        ...(confirmedAt ? { status: "done" } : {}),
      },
    });
    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function bulkUpdateBookings(
  bookingIds: string[],
  status: Status
): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  if (bookingIds.length === 0) return { success: false, error: messages.error.required };

  try {
    await db.bookingRequest.updateMany({
      where: { id: { in: bookingIds }, clientId },
      data: { status },
    });
    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function deleteBooking(bookingId: string): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const booking = await ensureOwnedBooking(bookingId, clientId);
  if (!booking) return { success: false, error: messages.error.notFound };

  try {
    await db.bookingRequest.delete({ where: { id: bookingId } });
    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function bulkDeleteBookings(bookingIds: string[]): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  if (bookingIds.length === 0) return { success: false, error: messages.error.required };

  try {
    await db.bookingRequest.deleteMany({
      where: { id: { in: bookingIds }, clientId },
    });
    revalidatePath("/dashboard/bookings");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
