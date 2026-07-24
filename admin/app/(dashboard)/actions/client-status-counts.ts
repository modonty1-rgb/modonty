"use server";

import { db } from "@/lib/db";
import { SubscriptionStatus, ClientCtaMode, ArticleStatus } from "@prisma/client";

import { getClientIdsMissingCtaMode, getClientImageGaps, getClientDataGaps, NOT_INTERNAL } from "../clients/segment/segments";

/**
 * Clients, by the states an admin actually acts on (Khalid 2026-07-13).
 * Money first — an expired or overdue client is the one that costs you today.
 */

export interface ClientStatusCounts {
  total: number;
  /** Things that cost you money or trust today. */
  needsYou: {
    overdue: number;
    expired: number;
    /** Expiring inside 7 days — the renewal call you make before it lapses. */
    expiringSoon: number;
    pending: number;
  };
  /**
   * Clients that no subscription status accounts for. The four statuses are exhaustive
   * by definition, so anything above zero here means the same missing-field trap that
   * hit ctaMode has hit subscriptionStatus too. Shown loudly — a total that does not
   * reconcile is a bug, not a rounding difference.
   */
  statusUnaccounted: number;
  /** What the book actually looks like. */
  portfolio: {
    active: number;
    /** Medical / legal / financial — every one of them carries a liability disclaimer. */
    ymyl: number;
    standard: number;
    cancelled: number;
  };
  /**
   * How a visitor can reach each client. Counted across ALL clients so the modes
   * add up to `total` — anything else silently drops the pending/expired ones.
   */
  contact: {
    /** ctaMode = FORM — books through our form, so the lead lands in our DB. */
    form: number;
    /** ctaMode = LINK — sends the visitor away (their site, WhatsApp). We see the click, never the lead. */
    link: number;
    /** ctaMode = NONE — no button at all. */
    none: number;
    /**
     * Clients whose document has NO ctaMode field at all — they predate the field,
     * and `db push` does not backfill. Prisma's default only applies on write, so no
     * enum filter matches them, not even a negated one. Counted with raw MongoDB
     * (`$exists: false`) — the same query the segment page runs, so the card and the
     * list agree. Deriving it as `total − form − link − none` gave the right number
     * and an empty page, which is worse than being wrong loudly.
     */
    unset: number;
  };
  /**
   * Where each client's content stands. A client is counted by the FURTHEST stage any
   * of their articles has reached, so "no articles" really means nothing at all — the
   * client is paying and has literally no content on the site.
   */
  content: {
    /** Not a single article. Paying for silence. */
    noArticles: number;
    /** Has at least one article live on modonty.com. */
    published: number;
    /** Waiting for the client to approve — the ball is in their court. */
    awaitingApproval: number;
    /** Articles exist but none are published or awaiting — still being written. */
    inProgress: number;
  };
  /**
   * The three pictures a client page and its link previews are built from. A client can
   * be in more than one of these — and `noImage` is the intersection: not one picture
   * anywhere. The OG gap is decided by the same function the SEO scorer uses, so this
   * count and the score in the table always agree.
   */
  images: {
    noLogo: number;
    noHero: number;
    noOg: number;
    noImage: number;
  };
  /**
   * Holes in the record itself. `noEndDate` is the one that lies loudest: an ACTIVE
   * client with no subscriptionEndDate can never match the `expiring-soon` date filter,
   * so the card prints a calm "0 expiring this week" that actually means "I cannot see".
   * Live test 2026-07-14 found 21 of 26 active clients in exactly that state.
   */
  data: {
    noEndDate: number;
    noAddress: number;
    noSocial: number;
    noDescription: number;
  };
}

export async function getClientStatusCounts(): Promise<ClientStatusCounts> {
  const inAWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const live = { subscriptionStatus: SubscriptionStatus.ACTIVE };

  const now = new Date();
  const [
    total,
    active,
    pending,
    expiredStatus,
    cancelled,
    overdue,
    expiredByDate,
    expiringSoon,
    ymyl,
    form,
    link,
    none,
    missingCta,
    noArticles,
    published,
    awaitingApproval,
    hasArticles,
    imageGaps,
    dataGaps,
  ] = await Promise.all([
      db.client.count(),
      db.client.count({ where: live }),
      db.client.count({ where: { subscriptionStatus: SubscriptionStatus.PENDING, ...NOT_INTERNAL } }),
      // Kept ONLY for the status reconciliation below. Nobody flips ACTIVE→EXPIRED, so
      // this flag is ~always 0 — the real expired clients are found by date, see next.
      db.client.count({ where: { subscriptionStatus: SubscriptionStatus.EXPIRED } }),
      db.client.count({ where: { subscriptionStatus: SubscriptionStatus.CANCELLED } }),
      // Clients carrying at least one unpaid invoice. This used to count
      // `paymentStatus === OVERDUE`, but nothing ever writes OVERDUE to that field —
      // «تحديد مدفوعة» only ever writes PAID — so the dashboard printed a reassuring 0
      // beside three unpaid invoices worth 43,164 EGP. The invoices are the truth
      // (same fix already applied to the Accounts page — Khalid 2026-07-24).
      db.invoice
        .findMany({
          // `archivedAt: null` would match nothing on Mongo for invoices written before
          // the field existed — see NOT_ARCHIVED in the account billing helper.
          where: {
            NOT: { paymentStatus: "PAID" },
            OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
          },
          select: { clientId: true },
        })
        .then(async (rows) => {
          const ids = [...new Set(rows.map((r) => r.clientId))];
          if (ids.length === 0) return 0;
          // Exclude platform/demo accounts — a free account never "owes money".
          return db.client.count({ where: { AND: [{ id: { in: ids } }, NOT_INTERNAL] } });
        }),
      // Really expired = still flagged ACTIVE (live on the site) but the paid period
      // ended in the PAST. The status flag never catches this, so we read the date.
      // `not: null` is REQUIRED: on Mongo `{ lt: now }` also matches an ABSENT date
      // (null sorts below any value), so without it the 10 no-date clients count as
      // "expired" — the inverse of the null-vs-absent trap. Verified: 3, not 13.
      db.client.count({
        where: { ...live, subscriptionEndDate: { lt: now, not: null }, ...NOT_INTERNAL },
      }),
      db.client.count({
        where: { ...live, subscriptionEndDate: { gte: now, lte: inAWeek }, ...NOT_INTERNAL },
      }),
      db.client.count({ where: { ...live, isYmyl: true } }),
      db.client.count({ where: { ctaMode: ClientCtaMode.FORM } }),
      db.client.count({ where: { ctaMode: ClientCtaMode.LINK } }),
      db.client.count({ where: { ctaMode: ClientCtaMode.NONE } }),
      getClientIdsMissingCtaMode(),
      // Content, by the furthest stage the client reached. `none`/`some` on the relation
      // is how Prisma asks "does this client have any article that…" without loading them.
      db.client.count({ where: { articles: { none: {} } } }),
      db.client.count({ where: { articles: { some: { status: ArticleStatus.PUBLISHED } } } }),
      db.client.count({
        where: { articles: { some: { status: ArticleStatus.AWAITING_APPROVAL } } },
      }),
      db.client.count({ where: { articles: { some: {} } } }),
      // Logo/hero are plain columns, but the share image lives inside the nextjsMetadata
      // JSON and Prisma cannot filter into it on MongoDB — so all four are decided in JS,
      // by the same function the segment pages use.
      getClientImageGaps(),
      // Record gaps — same JS-side decision as the images, for the same reason: an
      // absent field is invisible to every Prisma filter.
      getClientDataGaps(),
    ]);

  return {
    total,
    // Reconciliation uses the STATUS flags (they are meant to be exhaustive). The
    // date-expired clients are still flagged ACTIVE, so they are already inside `active`.
    statusUnaccounted: Math.max(0, total - active - pending - expiredStatus - cancelled),
    needsYou: { overdue, expired: expiredByDate, expiringSoon, pending },
    portfolio: { active, ymyl, standard: active - ymyl, cancelled },
    contact: { form, link, none, unset: missingCta.length },
    content: {
      noArticles,
      published,
      awaitingApproval,
      // Has content, but nothing live and nothing waiting on the client — it is on us.
      inProgress: Math.max(0, hasArticles - published - awaitingApproval),
    },
    images: {
      noLogo: imageGaps["no-logo"].length,
      noHero: imageGaps["no-hero"].length,
      noOg: imageGaps["no-og"].length,
      noImage: imageGaps["no-image"].length,
    },
    data: {
      noEndDate: dataGaps["no-end-date"].length,
      noAddress: dataGaps["no-address"].length,
      noSocial: dataGaps["no-social"].length,
      noDescription: dataGaps["no-description"].length,
    },
  };
}
