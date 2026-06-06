import { db } from "@/lib/db";

export interface ProfileBooking {
  id: string;
  status: string;
  phone: string;
  message: string | null;
  preferredAt: Date | null;
  createdAt: Date;
  client: { name: string; slug: string; logo: string | null };
  article: { title: string; slug: string } | null;
}

/**
 * Server-side query — the logged-in visitor's own booking requests across all clients.
 * Per-request (not cached): profile is noindex and bookings change interactively.
 */
export async function getProfileBookings(
  userId: string,
  limit = 20
): Promise<ProfileBooking[]> {
  const safeLimit = Math.max(1, Math.min(limit, 50));

  const rows = await db.bookingRequest.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      phone: true,
      message: true,
      preferredAt: true,
      createdAt: true,
      client: {
        select: { name: true, slug: true, logoMedia: { select: { url: true } } },
      },
      article: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: safeLimit,
  });

  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    phone: r.phone,
    message: r.message,
    preferredAt: r.preferredAt,
    createdAt: r.createdAt,
    client: {
      name: r.client.name,
      slug: r.client.slug,
      logo: r.client.logoMedia?.url ?? null,
    },
    article: r.article,
  }));
}
