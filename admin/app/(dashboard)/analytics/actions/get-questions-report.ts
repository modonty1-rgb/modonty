"use server";

import { db } from "@/lib/db";

/**
 * Questions report — the drill-down behind the "Unanswered questions" card.
 *
 * A question counts here only when a visitor actually wrote it: source === "user".
 * Verified 2026-07-13 — do not widen this filter without re-reading the write paths:
 *   "manual"  → FAQ we authored ourselves in the article editor.
 *   "chatbot" → admin-authored from a chatbot transcript (convertToArticleFaq),
 *               and it is created WITH an answer. Counting it as an unanswered
 *               visitor question would inflate the number with our own drafts.
 *
 * Asking requires login on both surfaces (ask-client-actions.ts / client-faq-actions.ts),
 * so every row here is a registered member — there is no guest/member split to show.
 */

const WINDOW_DAYS = 90;
const VISITOR_SOURCE = "user";

export type QuestionOrigin = "ARTICLE" | "CLIENT_PAGE";

export interface QuestionRow {
  id: string;
  origin: QuestionOrigin;
  question: string;
  clientName: string;
  articleTitle: string | null;
  askedByName: string;
  askedByEmail: string | null;
  status: string;
  createdAt: string;
  waitingDays: number;
  /** Where the admin goes to act on it. Article FAQs are answered in the article
   *  editor; client-page FAQs belong to the client and are answered in the console,
   *  so we can only open the client here. */
  href: string;
  canAnswerHere: boolean;
}

export interface QuestionsReport {
  rows: QuestionRow[];
  kpi: { unanswered: number; answered: number; oldestWaitingDays: number | null; clientsWaiting: number };
  byClient: Array<{ name: string; unanswered: number; answered: number }>;
  byOrigin: Array<{ origin: QuestionOrigin; unanswered: number; total: number }>;
}

const dayGap = (from: Date): number => Math.floor((Date.now() - from.getTime()) / (24 * 60 * 60 * 1000));

export async function getQuestionsReport(): Promise<QuestionsReport> {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const w = { createdAt: { gte: since }, source: VISITOR_SOURCE };

  const [articleQs, clientQs] = await Promise.all([
    db.articleFAQ.findMany({
      where: w,
      select: {
        id: true,
        question: true,
        status: true,
        submittedByName: true,
        submittedByEmail: true,
        createdAt: true,
        articleId: true,
        article: { select: { title: true, client: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    db.clientFAQ.findMany({
      where: w,
      select: {
        id: true,
        question: true,
        status: true,
        submittedByName: true,
        submittedByEmail: true,
        createdAt: true,
        clientId: true,
        client: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
  ]);

  const rows: QuestionRow[] = [
    ...articleQs.map((q) => ({
      id: q.id,
      origin: "ARTICLE" as const,
      question: q.question,
      clientName: q.article?.client?.name ?? "—",
      articleTitle: q.article?.title ?? null,
      askedByName: q.submittedByName ?? "—",
      askedByEmail: q.submittedByEmail,
      status: String(q.status),
      createdAt: q.createdAt.toISOString(),
      waitingDays: dayGap(q.createdAt),
      href: `/articles/${q.articleId}/edit`,
      canAnswerHere: true,
    })),
    ...clientQs.map((q) => ({
      id: q.id,
      origin: "CLIENT_PAGE" as const,
      question: q.question,
      clientName: q.client?.name ?? "—",
      articleTitle: null,
      askedByName: q.submittedByName ?? "—",
      askedByEmail: q.submittedByEmail,
      status: String(q.status),
      createdAt: q.createdAt.toISOString(),
      waitingDays: dayGap(q.createdAt),
      href: `/clients/${q.clientId}`,
      canAnswerHere: false,
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const isPending = (r: QuestionRow) => r.status === "PENDING";
  const pending = rows.filter(isPending);

  const byClientMap = new Map<string, { unanswered: number; answered: number }>();
  for (const r of rows) {
    const c = byClientMap.get(r.clientName) ?? { unanswered: 0, answered: 0 };
    if (isPending(r)) c.unanswered += 1;
    else if (r.status === "PUBLISHED") c.answered += 1;
    byClientMap.set(r.clientName, c);
  }

  const origins: QuestionOrigin[] = ["ARTICLE", "CLIENT_PAGE"];

  return {
    rows,
    kpi: {
      unanswered: pending.length,
      answered: rows.filter((r) => r.status === "PUBLISHED").length,
      oldestWaitingDays: pending.length ? Math.max(...pending.map((r) => r.waitingDays)) : null,
      clientsWaiting: new Set(pending.map((r) => r.clientName)).size,
    },
    byClient: [...byClientMap.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.unanswered - a.unanswered || b.answered - a.answered),
    byOrigin: origins.map((origin) => ({
      origin,
      unanswered: pending.filter((r) => r.origin === origin).length,
      total: rows.filter((r) => r.origin === origin).length,
    })),
  };
}
