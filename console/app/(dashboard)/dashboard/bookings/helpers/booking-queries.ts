import { db } from "@/lib/db";

export type BookingStatus = "new" | "contacted" | "done" | "archived";

export interface BookingWithDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  message: string | null;
  preferredAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
  article: { title: string; slug: string } | null;
}

export interface BookingStats {
  total: number;
  new: number;
  contacted: number;
  done: number;
  archived: number;
}

export async function getBookings(clientId: string): Promise<BookingWithDetails[]> {
  return db.bookingRequest.findMany({
    where: { clientId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      source: true,
      status: true,
      message: true,
      preferredAt: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
      updatedAt: true,
      article: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function getNewBookingsCount(clientId: string): Promise<number> {
  return db.bookingRequest.count({ where: { clientId, status: "new" } });
}

export async function getBookingStats(clientId: string): Promise<BookingStats> {
  const [total, newCount, contacted, done, archived] = await Promise.all([
    db.bookingRequest.count({ where: { clientId } }),
    db.bookingRequest.count({ where: { clientId, status: "new" } }),
    db.bookingRequest.count({ where: { clientId, status: "contacted" } }),
    db.bookingRequest.count({ where: { clientId, status: "done" } }),
    db.bookingRequest.count({ where: { clientId, status: "archived" } }),
  ]);
  return { total, new: newCount, contacted, done, archived };
}
