import { db } from "@/lib/db";

export interface ClientPageFaq {
  id: string;
  question: string;
  answer: string | null;
  status: string;
  source: string | null;
  position: number;
  submittedByName: string | null;
  submittedByEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PAGE_LIMIT = 200;

/**
 * Client-page FAQ (ClientFAQ / `client_faqs`) — the Q&A shown on the client's
 * Modonty mini-site. PENDING first (reader submissions awaiting an answer),
 * then by position. Distinct from /dashboard/faqs which is ARTICLE-level FAQ.
 */
export async function getClientPageFaqs(clientId: string): Promise<ClientPageFaq[]> {
  return db.clientFAQ.findMany({
    where: { clientId },
    orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "desc" }],
    take: PAGE_LIMIT,
    select: {
      id: true,
      question: true,
      answer: true,
      status: true,
      source: true,
      position: true,
      submittedByName: true,
      submittedByEmail: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/** Unanswered reader submissions awaiting the client's reply (sidebar badge). */
export async function getPendingPageFaqCount(clientId: string): Promise<number> {
  return db.clientFAQ.count({ where: { clientId, status: "PENDING" } });
}
