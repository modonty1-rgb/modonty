"use server";

import { db } from "@/lib/db";
import { runReport } from "@/lib/analytics/ga4-data-api";

/**
 * Visitor Actions drill-down — the actionable page behind the "Visitor Actions" KPI.
 * Khalid's architecture (2026-07-07): tile NUMBERS come from GA4 (the SOT);
 * clicking a tile filters the DETAIL LIST from our DB (names/phones/status —
 * personal data never reaches GA4). "Needs action" stays DB-only (GA4 has no statuses).
 */

export type LeadType = "BOOKING" | "MESSAGE" | "QUESTION" | "COMMENT";

export interface LeadRow {
  id: string;
  type: LeadType;
  name: string;
  email: string | null;
  phone: string | null;
  clientName: string | null;
  articleTitle: string | null;
  text: string | null;
  source: string | null;
  status: string;
  createdAt: string; // ISO
  href: string | null; // existing admin detail page when one exists
}

export interface LeadsDetail {
  rows: LeadRow[];
  /** Tile numbers — from GA4 (SOT). booking_submit starts counting from deploy day. */
  ga4Counts: { bookings: number; messages: number; questions: number; comments: number };
  /** DB-side counts — "needs action" + the table itself. */
  counts: { bookings: number; messages: number; questions: number; comments: number; newStatus: number };
}

const WINDOW_DAYS = 90;

async function getGA4TileCounts(): Promise<LeadsDetail["ga4Counts"]> {
  try {
    const rep = await runReport({
      dateRanges: [{ startDate: `${WINDOW_DAYS}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          inListFilter: { values: ["booking_submit", "contact_submit", "ask_client_submit", "comment_submit", "client_comment_submit"] },
        },
      },
      limit: 10,
    });
    const c: Record<string, number> = {};
    for (const r of rep.rows ?? []) c[r.dimensionValues[0].value] = Number(r.metricValues[0].value) || 0;
    return {
      bookings: c.booking_submit || 0,
      messages: c.contact_submit || 0,
      questions: c.ask_client_submit || 0,
      comments: (c.comment_submit || 0) + (c.client_comment_submit || 0),
    };
  } catch {
    // GA4 unreachable must never blank the operational page.
    return { bookings: 0, messages: 0, questions: 0, comments: 0 };
  }
}

export async function getLeadsDetail(): Promise<LeadsDetail> {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const w = { createdAt: { gte: since } };

  const ga4CountsPromise = getGA4TileCounts();
  const [bookings, messages, articleQuestions, clientQuestions, comments, clientComments] = await Promise.all([
    db.bookingRequest.findMany({
      where: w,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        source: true,
        message: true,
        status: true,
        preferredAt: true,
        createdAt: true,
        client: { select: { name: true } },
        article: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    db.contactMessage.findMany({
      where: w,
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        message: true,
        status: true,
        createdAt: true,
        client: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    // Article questions were missing entirely — the "Reader questions" count only
    // ever saw client-page FAQs. source "user" = a visitor wrote it ("manual" is
    // ours, "chatbot" is admin-authored from a transcript and ships with an answer).
    db.articleFAQ.findMany({
      where: { ...w, source: "user" },
      select: {
        id: true,
        question: true,
        status: true,
        submittedByName: true,
        submittedByEmail: true,
        createdAt: true,
        article: { select: { title: true, client: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    db.clientFAQ.findMany({
      where: { ...w, source: "user" },
      select: {
        id: true,
        question: true,
        status: true,
        submittedByName: true,
        submittedByEmail: true,
        createdAt: true,
        client: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    db.comment.findMany({
      where: w,
      select: {
        id: true,
        content: true,
        status: true,
        createdAt: true,
        author: { select: { name: true, email: true } },
        article: { select: { title: true, client: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    db.clientComment.findMany({
      where: w,
      select: {
        id: true,
        content: true,
        status: true,
        createdAt: true,
        author: { select: { name: true, email: true } },
        client: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
  ]);

  const rows: LeadRow[] = [
    ...bookings.map((b) => ({
      id: b.id,
      type: "BOOKING" as const,
      name: b.name,
      email: b.email,
      phone: b.phone,
      clientName: b.client?.name ?? null,
      articleTitle: b.article?.title ?? null,
      text: [b.message, b.preferredAt ? `Preferred: ${b.preferredAt.toISOString().slice(0, 16).replace("T", " ")}` : null]
        .filter(Boolean)
        .join(" · ") || null,
      source: b.source,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
      href: null,
    })),
    ...messages.map((m) => ({
      id: m.id,
      type: "MESSAGE" as const,
      name: m.name,
      email: m.email,
      phone: null,
      clientName: m.client?.name ?? null,
      articleTitle: null,
      text: `${m.subject} — ${m.message.slice(0, 120)}`,
      source: null,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
      href: `/contact-messages/${m.id}`,
    })),
    ...articleQuestions.map((q) => ({
      id: q.id,
      type: "QUESTION" as const,
      name: q.submittedByName ?? "—",
      email: q.submittedByEmail,
      phone: null,
      clientName: q.article?.client?.name ?? null,
      articleTitle: q.article?.title ?? null,
      text: q.question.slice(0, 160),
      source: "article",
      status: String(q.status),
      createdAt: q.createdAt.toISOString(),
      href: null,
    })),
    ...clientQuestions.map((q) => ({
      id: q.id,
      type: "QUESTION" as const,
      name: q.submittedByName ?? "—",
      email: q.submittedByEmail,
      phone: null,
      clientName: q.client?.name ?? null,
      articleTitle: null,
      text: q.question.slice(0, 160),
      source: "client-page",
      status: String(q.status),
      createdAt: q.createdAt.toISOString(),
      href: null,
    })),
    ...comments.map((c) => ({
      id: c.id,
      type: "COMMENT" as const,
      name: c.author?.name ?? "Anonymous",
      email: c.author?.email ?? null,
      phone: null,
      clientName: c.article?.client?.name ?? null,
      articleTitle: c.article?.title ?? null,
      text: c.content.slice(0, 160),
      source: "article",
      status: String(c.status),
      createdAt: c.createdAt.toISOString(),
      href: null,
    })),
    ...clientComments.map((c) => ({
      id: c.id,
      type: "COMMENT" as const,
      name: c.author?.name ?? "Anonymous",
      email: c.author?.email ?? null,
      phone: null,
      clientName: c.client?.name ?? null,
      articleTitle: null,
      text: c.content.slice(0, 160),
      source: "client-page",
      status: String(c.status),
      createdAt: c.createdAt.toISOString(),
      href: null,
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    rows,
    ga4Counts: await ga4CountsPromise,
    counts: {
      bookings: bookings.length,
      messages: messages.length,
      questions: articleQuestions.length + clientQuestions.length,
      comments: comments.length + clientComments.length,
      newStatus: rows.filter((r) => r.status === "new" || r.status === "PENDING").length,
    },
  };
}
