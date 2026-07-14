"use server";

import { db } from "@/lib/db";
import { runReport } from "@/lib/analytics/ga4-data-api";
import { getBookPageOpens, getBookingFunnel } from "@/lib/analytics/book-funnel";

/**
 * Visitor Actions card row — approved mockup: documents/mockups/admin-visitor-actions-v1.html
 *
 * Our DB carries the headline number (it is the actionable one: name, phone, status).
 * GA4 stays the traffic signal — it still owns visitors/sessions.
 *
 * Verified against the write paths (2026-07-13), do not "improve" without re-checking:
 *   bookings + contact messages → open to guests (userId nullable) → guest/member is real
 *   questions + comments        → login is enforced → every one is a registered member
 *   FAQ source "chatbot"        → admin-authored from chatbot transcripts, ships WITH an
 *                                 answer. Not a visitor question, never counted as unanswered.
 */

const WINDOW_DAYS = 90;
/** The only FAQ rows a visitor actually wrote. "manual" and "chatbot" are ours. */
const VISITOR_SOURCE = "user";

export interface VisitorActionsSummary {
  needsAction: { total: number; bookings: number; questions: number; messages: number; comments: number };
  /**
   * `pageViews` = how many times the /clients/<slug>/book page was opened (GA4).
   * NOT the `booking_submit` event — that one ships in the pending batch and would
   * read a permanent 0, which is a dead number on a card. Page views are the real
   * top of the funnel we can measure today: opened ↔ actually booked.
   */
  bookings: {
    /** Rows actually written — the only number you can act on. */
    db: number;
    /** GA4: the /book page was opened. */
    pageViews: number;
    /** GA4: the submit button was pressed. `pageViews − attempts` never even clicked. */
    attempts: number;
    /** Attempts that died, by cause. Empty until `reason` is a registered GA4 dimension. */
    failed: Array<{ reason: string; count: number }>;
    /** Clients whose booking page got opened and produced zero bookings — biggest leak first. */
    leaks: Array<{ name: string; opened: number }>;
  };
  questions: {
    unanswered: number;
    total: number;
    ga4: number;
    fromArticle: number;
    fromClient: number;
    oldestWaitingDays: number | null;
  };
  messages: { db: number; ga4: number; newCount: number; replied: number; guest: number; member: number };
  comments: { db: number; ga4: number; pending: number; approved: number; onArticles: number; onClients: number };
  visitors: { users: number; sessions: number; actionRate: number | null; aiSessions: number };
}

interface Ga4Signal {
  messages: number;
  questions: number;
  comments: number;
  users: number;
  sessions: number;
  /** Sessions referred by AI answer engines (ChatGPT, Perplexity, Copilot…). */
  aiSessions: number;
}

const EMPTY_GA4: Ga4Signal = { messages: 0, questions: 0, comments: 0, users: 0, sessions: 0, aiSessions: 0 };

/**
 * GA4 sessionSource values of AI answer engines. This measurement did not exist
 * anywhere in the system until 2026-07-14 (GEO audit, بند ٣) — every AI referral
 * was silently flattened into the generic REFERRAL bucket.
 */
const AI_ANSWER_SOURCES = [
  "chatgpt.com",
  "chat.openai.com",
  "perplexity.ai",
  "www.perplexity.ai",
  "copilot.microsoft.com",
  "gemini.google.com",
  "claude.ai",
  "you.com",
  "phind.com",
];

/** GA4 is a secondary line here — an outage must never blank the operational cards. */
async function getGa4Signal(): Promise<Ga4Signal> {
  try {
    const dateRanges = [{ startDate: `${WINDOW_DAYS}daysAgo`, endDate: "today" }];
    const [events, traffic, aiTraffic] = await Promise.all([
      runReport({
        dateRanges,
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            inListFilter: {
              values: ["contact_submit", "ask_client_submit", "comment_submit", "client_comment_submit"],
            },
          },
        },
        limit: 10,
      }),
      // Traffic totals follow the locked convention: scope to real page_view events —
      // our server-side Measurement Protocol events carry no session context.
      runReport({
        dateRanges,
        metrics: [{ name: "totalUsers" }, { name: "sessions" }],
        dimensionFilter: {
          filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "page_view" } },
        },
        limit: 1,
      }),
      // Sessions referred by AI answer engines — the GEO signal (same page_view scope).
      runReport({
        dateRanges,
        metrics: [{ name: "sessions" }],
        dimensionFilter: {
          andGroup: {
            expressions: [
              { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "page_view" } } },
              { filter: { fieldName: "sessionSource", inListFilter: { values: AI_ANSWER_SOURCES } } },
            ],
          },
        },
        limit: 1,
      }),
    ]);

    const c: Record<string, number> = {};
    for (const r of events.rows ?? []) c[r.dimensionValues[0].value] = Number(r.metricValues[0].value) || 0;

    const totals = traffic.rows?.[0]?.metricValues ?? [];
    return {
      messages: c.contact_submit || 0,
      questions: c.ask_client_submit || 0,
      comments: (c.comment_submit || 0) + (c.client_comment_submit || 0),
      users: Number(totals[0]?.value) || 0,
      sessions: Number(totals[1]?.value) || 0,
      aiSessions: Number(aiTraffic.rows?.[0]?.metricValues?.[0]?.value) || 0,
    };
  } catch {
    return EMPTY_GA4;
  }
}

export async function getVisitorActionsSummary(): Promise<VisitorActionsSummary> {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const w = { createdAt: { gte: since } };
  const visitorQuestion = { ...w, source: VISITOR_SOURCE };

  const ga4Promise = getGa4Signal();
  const opensPromise = getBookPageOpens();

  const [
    bookingsTotal,
    bookingsNew,
    bookingsByClient,
    articleQTotal,
    articleQPending,
    clientQTotal,
    clientQPending,
    oldestPendingArticleQ,
    oldestPendingClientQ,
    messagesTotal,
    messagesNew,
    messagesReplied,
    messagesMember,
    commentsPending,
    commentsApproved,
    clientCommentsPending,
    clientCommentsApproved,
  ] = await Promise.all([
    db.bookingRequest.count({ where: w }),
    db.bookingRequest.count({ where: { ...w, status: "new" } }),
    db.bookingRequest.groupBy({ by: ["clientId"], where: w, _count: { _all: true } }),
    db.articleFAQ.count({ where: visitorQuestion }),
    db.articleFAQ.count({ where: { ...visitorQuestion, status: "PENDING" } }),
    db.clientFAQ.count({ where: visitorQuestion }),
    db.clientFAQ.count({ where: { ...visitorQuestion, status: "PENDING" } }),
    db.articleFAQ.findFirst({
      where: { ...visitorQuestion, status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    db.clientFAQ.findFirst({
      where: { ...visitorQuestion, status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    db.contactMessage.count({ where: w }),
    db.contactMessage.count({ where: { ...w, status: "new" } }),
    db.contactMessage.count({ where: { ...w, status: "replied" } }),
    db.contactMessage.count({ where: { ...w, userId: { not: null } } }),
    db.comment.count({ where: { ...w, status: "PENDING" } }),
    db.comment.count({ where: { ...w, status: "APPROVED" } }),
    db.clientComment.count({ where: { ...w, status: "PENDING" } }),
    db.clientComment.count({ where: { ...w, status: "APPROVED" } }),
  ]);

  // groupBy returns ids only — resolve slugs so we can line them up against GA4.
  const bookedClientIds = bookingsByClient.map((g) => g.clientId);
  const bookedClients = bookedClientIds.length
    ? await db.client.findMany({ where: { id: { in: bookedClientIds } }, select: { slug: true }, take: 200 })
    : [];
  const bookedSlugs = new Set(bookedClients.map((c) => c.slug));

  const opens = await opensPromise;
  const funnel = await getBookingFunnel(opens.matched);

  // Clients whose booking page drew traffic and produced nothing. Name them on the
  // card — "5 clients leaking" is a statistic; "سمايل تاون, 31 opens, 0 booked" is a decision.
  const leakSlugs = [...opens.bySlug.entries()]
    .filter(([slug, views]) => views > 0 && !bookedSlugs.has(slug))
    .sort((a, b) => b[1] - a[1]);
  const leakClients = leakSlugs.length
    ? await db.client.findMany({
        where: { slug: { in: leakSlugs.map(([slug]) => slug) } },
        select: { slug: true, name: true },
        take: 50,
      })
    : [];
  const leakNameBySlug = new Map(leakClients.map((c) => [c.slug, c.name]));
  const leaks = leakSlugs.map(([slug, opened]) => ({
    name: leakNameBySlug.get(slug) ?? slug,
    opened,
  }));

  const questionsPending = articleQPending + clientQPending;
  const commentsPendingTotal = commentsPending + clientCommentsPending;
  const commentsApprovedTotal = commentsApproved + clientCommentsApproved;
  const commentsTotal = commentsPendingTotal + commentsApprovedTotal;

  const oldestPending = [oldestPendingArticleQ?.createdAt, oldestPendingClientQ?.createdAt]
    .filter((d): d is Date => Boolean(d))
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const ga4 = await ga4Promise;
  const totalActions = bookingsTotal + articleQTotal + clientQTotal + messagesTotal + commentsTotal;

  return {
    needsAction: {
      total: bookingsNew + questionsPending + messagesNew + commentsPendingTotal,
      bookings: bookingsNew,
      questions: questionsPending,
      messages: messagesNew,
      comments: commentsPendingTotal,
    },
    bookings: {
      db: bookingsTotal,
      pageViews: opens.matched,
      attempts: funnel.attempts,
      failed: funnel.failed,
      leaks,
    },
    questions: {
      unanswered: questionsPending,
      total: articleQTotal + clientQTotal,
      ga4: ga4.questions,
      fromArticle: articleQPending,
      fromClient: clientQPending,
      oldestWaitingDays: oldestPending
        ? Math.floor((Date.now() - oldestPending.getTime()) / (24 * 60 * 60 * 1000))
        : null,
    },
    messages: {
      db: messagesTotal,
      ga4: ga4.messages,
      newCount: messagesNew,
      replied: messagesReplied,
      guest: messagesTotal - messagesMember,
      member: messagesMember,
    },
    comments: {
      db: commentsTotal,
      ga4: ga4.comments,
      pending: commentsPendingTotal,
      approved: commentsApprovedTotal,
      onArticles: commentsPending + commentsApproved,
      onClients: clientCommentsPending + clientCommentsApproved,
    },
    visitors: {
      users: ga4.users,
      sessions: ga4.sessions,
      // "how many of the people who came actually did something" — the one number
      // that ties this card to the rest of the row.
      actionRate: ga4.users > 0 ? (totalActions / ga4.users) * 100 : null,
      aiSessions: ga4.aiSessions,
    },
  };
}
