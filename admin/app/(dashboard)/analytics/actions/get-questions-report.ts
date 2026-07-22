"use server";

import { db } from "@/lib/db";

/**
 * Questions report — the drill-down behind the strip's "questions waiting on your clients".
 *
 * Every PENDING FAQ is work the CLIENT still owes, split by who created it:
 *   team    → source "manual" (or null): the modonty team wrote the FAQ WITH an answer;
 *             it sits PENDING until the CLIENT approves/publishes it from their console.
 *   visitor → source "user"/"chatbot": a real reader asked it; it waits for the client
 *             to write an answer.
 * Both are "pending on the client" — the admin only sees and nudges. No time window:
 * a 200-day-old FAQ the client never approved is still a backlog item (Khalid 2026-07-22).
 */

export type QuestionOrigin = "ARTICLE" | "CLIENT_PAGE";
export type QuestionKind = "team" | "visitor";

export interface QuestionRow {
  id: string;
  origin: QuestionOrigin;
  kind: QuestionKind;
  question: string;
  clientName: string;
  articleTitle: string | null;
  submittedBy: string | null;
  createdAt: string;
  waitingDays: number;
  /** Where the admin opens it (article editor / client) to check or nudge. */
  href: string;
}

export interface QuestionsReport {
  rows: QuestionRow[];
  kpi: { pending: number; team: number; visitor: number; oldestWaitingDays: number | null; clientsWaiting: number };
  byClient: Array<{ name: string; team: number; visitor: number }>;
  byOrigin: Array<{ origin: QuestionOrigin; pending: number }>;
}

const dayGap = (from: Date): number => Math.floor((Date.now() - from.getTime()) / (24 * 60 * 60 * 1000));
const kindOf = (source: string | null): QuestionKind =>
  source === "user" || source === "chatbot" ? "visitor" : "team";

export async function getQuestionsReport(): Promise<QuestionsReport> {
  const [articleQs, clientQs] = await Promise.all([
    db.articleFAQ.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        question: true,
        source: true,
        submittedByName: true,
        createdAt: true,
        articleId: true,
        article: { select: { title: true, client: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    db.clientFAQ.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        question: true,
        source: true,
        submittedByName: true,
        createdAt: true,
        clientId: true,
        client: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);

  const rows: QuestionRow[] = [
    ...articleQs.map((q) => ({
      id: q.id,
      origin: "ARTICLE" as const,
      kind: kindOf(q.source),
      question: q.question,
      clientName: q.article?.client?.name ?? "—",
      articleTitle: q.article?.title ?? null,
      submittedBy: q.submittedByName,
      createdAt: q.createdAt.toISOString(),
      waitingDays: dayGap(q.createdAt),
      href: `/articles/${q.articleId}/edit`,
    })),
    ...clientQs.map((q) => ({
      id: q.id,
      origin: "CLIENT_PAGE" as const,
      kind: kindOf(q.source),
      question: q.question,
      clientName: q.client?.name ?? "—",
      articleTitle: null,
      submittedBy: q.submittedByName,
      createdAt: q.createdAt.toISOString(),
      waitingDays: dayGap(q.createdAt),
      href: `/clients/${q.clientId}/edit`,
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const byClientMap = new Map<string, { team: number; visitor: number }>();
  for (const r of rows) {
    const c = byClientMap.get(r.clientName) ?? { team: 0, visitor: 0 };
    c[r.kind] += 1;
    byClientMap.set(r.clientName, c);
  }

  const origins: QuestionOrigin[] = ["ARTICLE", "CLIENT_PAGE"];

  return {
    rows,
    kpi: {
      pending: rows.length,
      team: rows.filter((r) => r.kind === "team").length,
      visitor: rows.filter((r) => r.kind === "visitor").length,
      oldestWaitingDays: rows.length ? Math.max(...rows.map((r) => r.waitingDays)) : null,
      clientsWaiting: new Set(rows.map((r) => r.clientName)).size,
    },
    byClient: [...byClientMap.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.team + b.visitor - (a.team + a.visitor)),
    byOrigin: origins.map((origin) => ({
      origin,
      pending: rows.filter((r) => r.origin === origin).length,
    })),
  };
}
