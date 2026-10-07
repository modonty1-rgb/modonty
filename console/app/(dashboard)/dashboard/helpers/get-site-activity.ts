import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

interface SiteActivity {
  /** Article views + partner-page views in the window. */
  views: number;
  viewsPrev: number;
  /** Booking requests + contact messages in the window — people who reached out. */
  contacts: number;
  contactsPrev: number;
  /** Views per day (YYYY-MM-DD) in the window, for the chart. */
  viewsByDay: Record<string, number>;
  /** Articles the team published for him in the window — «شغلنا لك هالفترة». */
  published: number;
}

/**
 * What happened on modonty for this client in the chosen window, and the same length before it.
 *
 * Views are article views + partner-page views — the dashboard once charted articles alone and
 * drew 11 under a «101» card (30 Sep 2026: 11 article + 90 page views). Contacts are the two
 * ways a reader actually reaches the client: a booking request and a contact message.
 */
export async function getSiteActivity(clientId: string, days: number): Promise<SiteActivity> {
  const now = new Date();
  const start = new Date(now.getTime() - days * 86_400_000);
  const prevStart = new Date(start.getTime() - days * 86_400_000);
  const cur = { gte: start };
  const prev = { gte: prevStart, lt: start };

  const [articleViews, pageViews, articleViewsPrev, pageViewsPrev, bookings, bookingsPrev, messages, messagesPrev, published] =
    await Promise.all([
      db.articleView.findMany({ where: { article: { clientId }, createdAt: cur }, select: { createdAt: true } }),
      db.clientView.findMany({ where: { clientId, createdAt: cur }, select: { createdAt: true } }),
      db.articleView.count({ where: { article: { clientId }, createdAt: prev } }),
      db.clientView.count({ where: { clientId, createdAt: prev } }),
      db.bookingRequest.count({ where: { clientId, createdAt: cur } }),
      db.bookingRequest.count({ where: { clientId, createdAt: prev } }),
      db.contactMessage.count({ where: { clientId, createdAt: cur } }),
      db.contactMessage.count({ where: { clientId, createdAt: prev } }),
      db.article.count({ where: { clientId, status: ArticleStatus.PUBLISHED, datePublished: cur } }),
    ]);

  const viewsByDay: Record<string, number> = {};
  for (const v of [...articleViews, ...pageViews]) {
    const d = v.createdAt.toISOString().slice(0, 10);
    viewsByDay[d] = (viewsByDay[d] ?? 0) + 1;
  }

  return {
    views: articleViews.length + pageViews.length,
    viewsPrev: articleViewsPrev + pageViewsPrev,
    contacts: bookings + messages,
    contactsPrev: bookingsPrev + messagesPrev,
    viewsByDay,
    published,
  };
}
