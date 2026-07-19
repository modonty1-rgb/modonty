import { db } from "@/lib/db";

export type BookingStatus = "new" | "contacted" | "done" | "archived";
export type BookingChannel = "form" | "whatsapp";

export interface BookingWithDetails {
  id: string;
  channel: string; // "form" (callback) | "whatsapp" (tracked click — anonymous)
  // Nullable: WhatsApp leads carry no contact details — the conversation is on WhatsApp itself.
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  message: string | null;
  preferredAt: Date | null;
  confirmedAt: Date | null; // appointment time the provider confirms from here
  country: string | null; // Vercel geo snapshot (shown on WhatsApp leads)
  city: string | null;
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
  whatsapp: number; // WhatsApp leads handed over (any status)
}

export async function getBookings(clientId: string): Promise<BookingWithDetails[]> {
  return db.bookingRequest.findMany({
    where: { clientId },
    select: {
      id: true,
      channel: true,
      name: true,
      email: true,
      phone: true,
      source: true,
      status: true,
      message: true,
      preferredAt: true,
      confirmedAt: true,
      country: true,
      city: true,
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
  const [total, newCount, contacted, done, archived, whatsapp] = await Promise.all([
    db.bookingRequest.count({ where: { clientId } }),
    db.bookingRequest.count({ where: { clientId, status: "new" } }),
    db.bookingRequest.count({ where: { clientId, status: "contacted" } }),
    db.bookingRequest.count({ where: { clientId, status: "done" } }),
    db.bookingRequest.count({ where: { clientId, status: "archived" } }),
    db.bookingRequest.count({ where: { clientId, channel: "whatsapp" } }),
  ]);
  return { total, new: newCount, contacted, done, archived, whatsapp };
}
