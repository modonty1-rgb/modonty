"use server";

import { db } from "@/lib/db";

/** Clients that have pending FAQs across their articles. */
export async function getClientsWithPendingFAQs() {
  try {
    // 1) Get all pending FAQs with their article→client mapping
    const pendingFaqs = await db.articleFAQ.findMany({
      where: { status: "PENDING" },
      select: { id: true, articleId: true, createdAt: true },
    });

    if (pendingFaqs.length === 0) return [];

    // 2) Resolve articles → clientIds
    const articleIds = Array.from(new Set(pendingFaqs.map((f) => f.articleId)));
    const articles = await db.article.findMany({
      where: { id: { in: articleIds } },
      select: { id: true, clientId: true },
    });
    const articleToClient = new Map(articles.map((a) => [a.id, a.clientId]));

    // 3) Group by client
    const byClient = new Map<
      string,
      { count: number; articleIds: Set<string>; lastSubmittedAt: Date }
    >();
    for (const faq of pendingFaqs) {
      const clientId = articleToClient.get(faq.articleId);
      if (!clientId) continue;
      const entry = byClient.get(clientId);
      if (!entry) {
        byClient.set(clientId, {
          count: 1,
          articleIds: new Set([faq.articleId]),
          lastSubmittedAt: faq.createdAt,
        });
      } else {
        entry.count += 1;
        entry.articleIds.add(faq.articleId);
        if (faq.createdAt > entry.lastSubmittedAt) {
          entry.lastSubmittedAt = faq.createdAt;
        }
      }
    }

    // 4) Fetch client details
    const clients = await db.client.findMany({
      where: { id: { in: Array.from(byClient.keys()) } },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
      },
    });

    return clients
      .map((c) => {
        const entry = byClient.get(c.id);
        if (!entry) return null;
        return {
          clientId: c.id,
          clientName: c.name,
          clientSlug: c.slug,
          clientEmail: c.email,
          clientPhone: c.phone,
          pendingCount: entry.count,
          articleCount: entry.articleIds.size,
          lastSubmittedAt: entry.lastSubmittedAt,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.lastSubmittedAt.getTime() - a.lastSubmittedAt.getTime());
  } catch (error) {
    console.error("getClientsWithPendingFAQs:", error);
    return [];
  }
}

/** Full inbox detail for one client — articles + their pending FAQs. */
export async function getClientInboxDetail(clientId: string) {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        url: true,
        legalName: true,
      },
    });

    if (!client) return null;

    // Articles owned by this client that have pending FAQs
    const articlesWithPending = await db.article.findMany({
      where: {
        clientId,
        faqs: { some: { status: "PENDING" } },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        datePublished: true,
        faqs: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            question: true,
            answer: true,
            position: true,
            source: true,
            submittedByName: true,
            submittedByEmail: true,
            createdAt: true,
          },
        },
      },
      orderBy: { datePublished: "desc" },
    });

    return { client, articles: articlesWithPending };
  } catch (error) {
    console.error("getClientInboxDetail:", error);
    return null;
  }
}

/** New (unread) contact messages. */
export async function getNewContactMessages() {
  try {
    return await db.contactMessage.findMany({
      where: { status: "new" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        createdAt: true,
        client: { select: { id: true, name: true, slug: true } },
      },
    });
  } catch (error) {
    console.error("getNewContactMessages:", error);
    return [];
  }
}
