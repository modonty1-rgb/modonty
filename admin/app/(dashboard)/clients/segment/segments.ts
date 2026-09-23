import { ClientCtaMode,
  ArticleStatus,
  type Prisma, InvoicePaymentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { clientIdsWhere, getClientSubscriptions, type ClientSubscription } from "@/lib/subscription/get-client-subscriptions";
import { hasStoredOgImage } from "@modonty/shared/lib/seo/client/meta-score";

/**
 * Every clickable number on the dashboard's Clients section maps to a segment key
 * here, and each key owns the exact Prisma `where` that produced it. One definition,
 * used by both the count and the list — so the card and the page can never disagree.
 *
 * Two families of keys cannot be expressed as a `where`, and they are why this file
 * is async:
 *
 *   · `unset` — those clients have NO ctaMode field on the document at all (they
 *     predate it, and a schema push does not backfill). Prisma's `NOT { in: [...] }`
 *     does not match an absent field, so a normal `where` finds zero of them while the
 *     arithmetic finds seven. Only a raw `$exists: false` sees them.
 *
 *   · the image gaps — the share image lives INSIDE the `nextjsMetadata` JSON, and
 *     Prisma cannot filter into a JSON field on MongoDB. So the rows are read once and
 *     the gap is decided in JS, using the very rule the SEO scorer uses (hasStoredOgImage).
 *
 * Both resolve to an id list and are handed back as `{ id: { in: ids } }`.
 */

export type SegmentKey =
  | "overdue"
  | "expired"
  | "expiring-soon"
  | "expiring-month"
  | "pending"
  | "form"
  | "link"
  | "none"
  | "unset"
  | "active"
  | "ymyl"
  | "standard"
  | "cancelled"
  | "no-articles"
  | "has-published"
  | "awaiting-approval"
  | "content-in-progress"
  | "no-logo"
  | "no-hero"
  | "no-og"
  | "no-image"
  | "no-end-date"
  | "no-address"
  | "no-social"
  | "no-description"
  | "seo-imperfect"
  | "seo-perfect"
  | "unreachable";

/** Where a row's action button lands — the page where THIS segment's problem is fixed. */
export type SegmentAction = { label: string; path: "account" | "edit" | "seo" | "technical" };

interface Segment {
  title: string;
  description: string;
  where: Prisma.ClientWhereInput;
  // SEO score is COMPUTED (round((meta+jsonLd)/2)), not a Prisma column, so it can't
  // live in `where`. When set, the segment page keeps only clients on this side of 100
  // AFTER scoring — the exact split the dashboard count uses, so list === number.
  scoreFilter?: "perfect" | "imperfect";
  /** Defaults to «Open · edit». Set it wherever the fix lives somewhere else. */
  action?: SegmentAction;
}

/**
 * A segment answers «who has this problem»; its action has to answer «where do I fix it».
 * Sending every row to the generic edit form made the money segments a dead end — you
 * landed on a profile form with no invoice in sight (Khalid 2026-07-24). So each family
 * points at its own repair bench:
 *
 *   money (unpaid · expired · expiring · pending) → the account statement
 *   reach + content + data gaps                    → the client edit form
 *   SEO score + description                        → the SEO workspace
 */
const MONEY_ACTION: SegmentAction = { label: "Statement", path: "account" };
const SEO_ACTION: SegmentAction = { label: "Fix SEO", path: "seo" };
// The contact button and the logo/hero/share images are all set on the client edit
// workspace, so these gaps send the admin straight there with a label that says what
// to fix — not the blind «Edit» that started this (Khalid 2026-07-24).
const CTA_ACTION: SegmentAction = { label: "Fix CTA", path: "edit" };
const IMAGE_ACTION: SegmentAction = { label: "Add image", path: "edit" };


/**
 * «Not a platform/demo account» — the money views must never show مدونتي/جبر/بسيطة as
 * expired or unpaid (they are free by nature). The field is optional and legacy docs
 * lack it, so — like every other Mongo optional — `{ isInternal: false }` alone matches
 * NOTHING (absent ≠ false) and `{ not: true }` matches NOTHING either. The three-way OR
 * is the only form that catches false + null + absent. Verified: returns all 28 before
 * anyone is marked, 23 after the 5 internals are flagged. Spread into a `where` only when
 * it has no other top-level OR; otherwise AND-wrap it.
 */
export const NOT_INTERNAL: Prisma.ClientWhereInput = {
  OR: [{ isInternal: false }, { isInternal: null }, { isInternal: { isSet: false } }],
};

/**
 * Active clients whose subscription ends within the current calendar month — the
 * renewal (money) queue. **The end date is the active order's** (serviceStartedAt + months,
 * `lib/subscription/get-client-subscriptions.ts`), not the card copy — 23 Sep 2026. Shared by the clients-page counter chip and this segment's
 * list, so the number and the table can never disagree.
 *
 * `NOT_INTERNAL` is INSIDE the function, not added by each caller (Khalid 2026-09-19).
 * It used to sit on the segment only, so the chip counted our own demo accounts and its
 * own list did not — the exact split this file exists to prevent. Measured the day it
 * was fixed: 6 = 6, equal only because neither internal account happened to end this
 * month. A number that agrees by luck is not a number that agrees.
 */
export async function expiringThisMonthWhere(): Promise<Prisma.ClientWhereInput> {
  const n = new Date();
  const start = new Date(n.getFullYear(), n.getMonth(), 1);
  const end = new Date(n.getFullYear(), n.getMonth() + 1, 0, 23, 59, 59, 999);
  const subs = await getClientSubscriptions(NOT_INTERNAL, n);
  return {
    id: {
      in: clientIdsWhere(subs, (x) => x.status === "ACTIVE" && !!x.endsAt && x.endsAt >= start && x.endsAt <= end),
    },
  };
}

/**
 * Live clients whose paid period ALREADY ended — money owed, still being served.
 *
 * **Now derived from the active order** (23 Sep 2026): the card's end date disagreed with
 * the order for 9 of 43 clients and its ACTIVE flag never flips, so the order decides.
 *
 * By DATE, not by the status flag: nothing in the repository ever flips ACTIVE→EXPIRED,
 * so `subscriptionStatus` stays ACTIVE while the end date slips into the past — which is
 * why the `Expired` tab on /clients reads 0 while four clients are overdue (measured
 * 2026-09-19 on modonty_dev). `not: null` is REQUIRED: on Mongo `{ lt: now }` also matches
 * an ABSENT date, which would drag in every client who has no date at all.
 *
 * Disjoint from the renewal queue above (that one starts at the first of this month), so
 * a client who lapsed in an EARLIER month appears here and nowhere else.
 */
export async function expiredByDateWhere(): Promise<Prisma.ClientWhereInput> {
  const subs = await getClientSubscriptions(NOT_INTERNAL);
  return { id: { in: clientIdsWhere(subs, (x) => x.status === "EXPIRED") } };
}

/**
 * Ids of clients whose document has no `ctaMode` key. Prisma cannot express this —
 * an absent field matches no enum filter, not even a negated one — so we drop to raw
 * MongoDB. Returns [] on failure so a broken segment page never takes the app down.
 */
export async function getClientIdsMissingCtaMode(): Promise<string[]> {
  try {
    const rows = (await db.client.findRaw({
      filter: { ctaMode: { $exists: false } },
      options: { projection: { _id: 1 } },
    })) as unknown as Array<{ _id: { $oid: string } | string }>;

    return rows.map((r) => (typeof r._id === "string" ? r._id : r._id.$oid));
  } catch {
    return [];
  }
}

/** The record fields that keep the money and the schema honest. */
export type DataGapKey = "no-end-date" | "no-address" | "no-social" | "no-description";

/**
 * Which clients have holes in their record (Khalid 2026-07-14, live test: the dashboard
 * printed a reassuring «0 expiring this week» while 21 of 26 active clients had NO
 * subscriptionEndDate at all — a date filter can never match an absent field, so renewal
 * monitoring was blind to 81% of the book and said everything was fine).
 *
 *   end-date    → subscriptionEndDate on an ACTIVE client THAT HAS A PUBLISHED ARTICLE.
 *                 The subscription clock starts at the first published article, so a
 *                 client with none simply has not started yet — that is normal, not a
 *                 gap. Only a client whose content is LIVE but whose renewal date is
 *                 missing is a real admin failure (invoice never issued / data not
 *                 filled). Mixing the two made the card blame us for clients who are
 *                 correctly waiting to be switched on (Khalid 2026-07-24).
 *   address     → addressCity (the one address field the LocalBusiness/PostalAddress
 *                 node cannot be built without).
 *   social      → sameAs[] — what ties the client to their real-world profiles in the
 *                 knowledge graph.
 *   description → Organization description in JSON-LD.
 *
 * Decided in JS for the same reason as the image gaps: `!value` catches a null AND a
 * field that was never written, which is exactly the trap Prisma filters walk into.
 */
export async function getClientDataGaps(): Promise<Record<DataGapKey, string[]>> {
  const [rows, publishedGroups] = await Promise.all([
    db.client.findMany({
      select: {
        id: true,
        isInternal: true,
        addressCity: true,
        sameAs: true,
        description: true,
      },
      take: 500,
    }),
    // Clients whose subscription clock has actually started (≥1 published article).
    db.article.groupBy({
      by: ["clientId"],
      where: { status: ArticleStatus.PUBLISHED, datePublished: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const hasPublished = new Set(publishedGroups.map((g) => g.clientId));
  // النهايةُ من الطلب الساري — لا من نسخة الكرت.
  const subs = await getClientSubscriptions();

  const gaps: Record<DataGapKey, string[]> = {
    "no-end-date": [],
    "no-address": [],
    "no-social": [],
    "no-description": [],
  };

  for (const r of rows) {
    // A missing renewal date is only a PROBLEM once the client's content is live —
    // before the first published article the subscription hasn't started, so no date is
    // expected. This is the real admin failure: article published, but no invoice/date.
    const sub = subs.get(r.id);
    if (
      sub?.status === "ACTIVE" &&
      !sub.endsAt &&
      hasPublished.has(r.id) &&
      r.isInternal !== true // platform/demo accounts are free — no renewal date expected
    ) {
      gaps["no-end-date"].push(r.id);
    }
    if (!r.addressCity?.trim()) gaps["no-address"].push(r.id);
    if (!r.sameAs?.length) gaps["no-social"].push(r.id);
    if (!r.description?.trim()) gaps["no-description"].push(r.id);
  }

  return gaps;
}

/** The three pictures a client page and its search/social preview are built from. */
export type ImageGapKey = "no-logo" | "no-hero" | "no-og" | "no-image";

/**
 * Which clients are missing which image (Khalid 2026-07-13: «العميل اللي ما عنده logo
 * وما عنده OG، ما عنده hero — كيف نطلّع معلومته؟»).
 *
 *   logo  → Client.logoMediaId — the mark on their page, and what Organization JSON-LD
 *           hands Google. Missing it costs a knowledge-panel field.
 *   hero  → Client.heroImageMediaId — the banner at the top of their page.
 *   og    → the share image inside the stored nextjsMetadata. This is the 25-point
 *           check in the client META score, so the SAME function decides both — the
 *           count on the card and the score in the table cannot tell two stories.
 *
 * `no-image` is the intersection: not one picture anywhere. That is the client whose
 * page is text on white and whose link previews are blank.
 *
 * One read of every client (there are dozens, not thousands) — Prisma cannot filter
 * into a JSON field on MongoDB, so the OG gap has to be decided in JS anyway.
 */
export async function getClientImageGaps(): Promise<Record<ImageGapKey, string[]>> {
  const rows = await db.client.findMany({
    select: { id: true, logoMediaId: true, heroImageMediaId: true, nextjsMetadata: true },
    take: 500,
  });

  const gaps: Record<ImageGapKey, string[]> = {
    "no-logo": [],
    "no-hero": [],
    "no-og": [],
    "no-image": [],
  };

  for (const r of rows) {
    // `!id` covers both null and a field that was never written — the same trap ctaMode fell into.
    const noLogo = !r.logoMediaId;
    const noHero = !r.heroImageMediaId;
    const noOg = !hasStoredOgImage(r.nextjsMetadata);

    if (noLogo) gaps["no-logo"].push(r.id);
    if (noHero) gaps["no-hero"].push(r.id);
    if (noOg) gaps["no-og"].push(r.id);
    if (noLogo && noHero && noOg) gaps["no-image"].push(r.id);
  }

  return gaps;
}

export async function getSegment(key: string): Promise<Segment | null> {
  const segments: Record<SegmentKey, Segment> = {
    overdue: {
      title: "Unpaid invoices",
      description: "They have at least one invoice still outstanding.",
      // Resolved from the invoices below — `Client.paymentStatus` is never written
      // OVERDUE by anything, so this page listed nothing while the card counted two.
      where: {},
      action: MONEY_ACTION,
    },
    expired: {
      title: "Subscription expired",
      description: "Still live on the site, but the paid period ended — a renewal is overdue.",
      // One definition, shared with the /clients overdue chip — see expiredByDateWhere.
      where: {}, // resolved below from the active order
      action: MONEY_ACTION,
    },
    "expiring-soon": {
      title: "Expiring this week",
      description: "Call them before it lapses.",
      where: {}, // resolved below from the active order
      action: MONEY_ACTION,
    },
    "expiring-month": {
      title: "Expiring this month",
      description: "Subscription ends this month — renew before it lapses (money).",
      where: {}, // resolved below from the active order
      action: MONEY_ACTION,
    },
    pending: {
      title: "Waiting to be activated",
      description: "Signed up, not switched on yet.",
      where: {}, // resolved below from the active order
      action: MONEY_ACTION,
    },
    form: {
      title: "Booking form",
      description: "Books through our form — the lead lands in our database.",
      where: { ctaMode: ClientCtaMode.FORM },
    },
    link: {
      title: "External link",
      description:
        "Their button sends the visitor away (their site, WhatsApp). We see the click, never the lead.",
      where: { ctaMode: ClientCtaMode.LINK },
    },
    none: {
      title: "No button at all",
      description: "The visitor has no way to reach them.",
      where: { ctaMode: ClientCtaMode.NONE },
      action: CTA_ACTION,
    },
    unset: {
      title: "CTA never set",
      description:
        "Their record has no ctaMode field — it predates the field, and a schema push does not backfill. On the site they behave as if they had no button.",
      // Resolved below via raw MongoDB: no Prisma filter can match an absent field.
      where: {},
      action: CTA_ACTION,
    },
    active: { title: "Active", description: "Paying and live.", where: {} },
    ymyl: {
      title: "YMYL clients",
      description: "Medical, legal or financial — their booking form carries a liability disclaimer.",
      where: {}, // resolved below: active (from the order) AND isYmyl
    },
    standard: {
      title: "Standard clients",
      description: "Everyone who is not YMYL.",
      where: {}, // resolved below: active (from the order) AND not isYmyl
    },
    cancelled: {
      title: "Cancelled",
      description: "They left us.",
      where: {}, // resolved below — the one status still set by hand on the card
      action: MONEY_ACTION,
    },
    "no-articles": {
      title: "No articles at all",
      description: "Not one article exists for them. They are paying for silence.",
      where: { articles: { none: {} } },
    },
    "has-published": {
      title: "Has published articles",
      description: "At least one of their articles is live on modonty.com.",
      where: { articles: { some: { status: ArticleStatus.PUBLISHED } } },
    },
    "awaiting-approval": {
      title: "Waiting for the client to approve",
      description: "We wrote it, they have not signed off. The ball is in their court — chase them.",
      where: { articles: { some: { status: ArticleStatus.AWAITING_APPROVAL } } },
    },
    "content-in-progress": {
      title: "Content in progress",
      description:
        "They have articles, but nothing is live and nothing is waiting on them — the work is still on our side.",
      where: {
        articles: { some: {} },
        NOT: {
          articles: {
            some: {
              status: { in: [ArticleStatus.PUBLISHED, ArticleStatus.AWAITING_APPROVAL] },
            },
          },
        },
      },
    },
    // Image gaps — resolved to id lists below (see getClientImageGaps).
    "no-logo": {
      title: "No logo",
      description:
        "No logo on their record. It is what their page shows as the brand mark, and what Organization JSON-LD hands Google for the knowledge panel.",
      where: {},
      action: IMAGE_ACTION,
    },
    "no-hero": {
      title: "No hero image",
      description: "The banner at the top of their client page is empty.",
      where: {},
      action: IMAGE_ACTION,
    },
    "no-og": {
      title: "No share image",
      description:
        "Their published metadata carries no og:image, so every link to them — WhatsApp, X, LinkedIn — previews blank. Worth 25 points of their SEO score.",
      where: {},
      action: IMAGE_ACTION,
    },
    "no-image": {
      title: "No image at all",
      description:
        "No logo, no hero, no share image. Their page is text on white and their links preview blank. Start here.",
      where: {},
      action: IMAGE_ACTION,
    },
    // Record gaps — resolved to id lists below (see getClientDataGaps).
    "no-end-date": {
      title: "Renewal date missing",
      description:
        "Clients whose content is LIVE (at least one published article) but who have no subscription end date — the invoice was never issued or the date was never filled. They can never show in «Expiring this week», so the renewal watch is blind to them. Clients with no published article are excluded: their subscription simply hasn't started.",
      where: {},
      action: MONEY_ACTION, // the end date lives on the account statement, not the profile form
    },
    "no-address": {
      title: "No address",
      description:
        "No city on their record. Their JSON-LD cannot carry a PostalAddress, so Google gets no location for them — and local search is where their customers are.",
      where: {},
      action: SEO_ACTION,
    },
    "no-social": {
      title: "No social links",
      description:
        "Empty sameAs. Nothing ties their page to their real profiles, so the knowledge graph never connects the two.",
      where: {},
      action: SEO_ACTION,
    },
    "no-description": {
      title: "No description",
      description: "No Organization description — their JSON-LD says who they are and nothing about them.",
      where: {},
      action: SEO_ACTION,
    },
    // SEO health of EVERY client, any status (Khalid 2026-07-23: a client is a client —
    // the only question is whether it has an SEO problem). where:{} = same all-client scope
    // as the dashboard count; the page filters by the computed score, so list === number.
    "seo-imperfect": {
      title: "Clients with SEO problems",
      description:
        "Any client that isn't a perfect 100 on the shared SEO rubric (meta + JSON-LD). Open each to see which checks are missing — most are the client's own data (logo, description, contact).",
      where: {},
      scoreFilter: "imperfect",
      action: SEO_ACTION,
    },
    "seo-perfect": {
      title: "Clients with perfect SEO",
      description: "Any client that passes every check on the shared SEO rubric — nothing to fix.",
      where: {},
      scoreFilter: "perfect",
    },
    // The Today strip's business number: NONE plus the missing-field ones — every
    // client a visitor has no way to reach. Resolved to an id list below.
    unreachable: {
      title: "Unreachable clients",
      description:
        "No working contact button: ctaMode is NONE, or the field is missing entirely. A visitor who wants them has no way in — this is the conversion leak.",
      where: {},
      action: CTA_ACTION,
    },
  };

  const segment = segments[key as SegmentKey];
  if (!segment) return null;

  /**
   * **شرائحُ الاشتراك من الطلب الساري** (٢٣ سبتمبر ٢٠٢٦ — مصدرٌ واحد). كانت تقرأ
   * `subscriptionStatus`/`subscriptionEndDate` من الكرت؛ والعدّادُ والقائمةُ يقرآن الآن نفسَ
   * `getClientSubscriptions`، فلا يختلفان.
   */
  if (key === "expired") return { ...segment, where: await expiredByDateWhere() };
  if (key === "expiring-month") return { ...segment, where: await expiringThisMonthWhere() };
  if (key === "expiring-soon" || key === "pending" || key === "cancelled") {
    const subs = await getClientSubscriptions(NOT_INTERNAL);
    const test =
      key === "expiring-soon"
        ? (x: ClientSubscription) => x.status === "ACTIVE" && x.daysLeft !== null && x.daysLeft >= 0 && x.daysLeft <= 7
        : key === "pending"
          ? (x: ClientSubscription) => x.status === "PENDING"
          : (x: ClientSubscription) => x.status === "CANCELLED";
    return { ...segment, where: { id: { in: clientIdsWhere(subs, test) } } };
  }
  if (key === "active" || key === "ymyl" || key === "standard") {
    const [subs, ymylRows] = await Promise.all([
      getClientSubscriptions(),
      db.client.findMany({ where: { isYmyl: true }, select: { id: true } }),
    ]);
    const ymyl = new Set(ymylRows.map((c) => c.id));
    const ids = clientIdsWhere(
      subs,
      (x) => x.status === "ACTIVE" && (key === "active" || (key === "ymyl" ? ymyl.has(x.clientId) : !ymyl.has(x.clientId))),
    );
    return { ...segment, where: { id: { in: ids } } };
  }

  if (key === "unset") {
    const ids = await getClientIdsMissingCtaMode();
    return { ...segment, where: { id: { in: ids } } };
  }

  // Same rule as the dashboard counter and the Accounts page: the invoices are the
  // truth. Archived invoices are void, and `archivedAt: null` alone matches nothing on
  // Mongo for rows written before that field existed — both forms have to be asked for.
  if (key === "overdue") {
    const rows = await db.invoice.findMany({
      where: {
        NOT: { paymentStatus: InvoicePaymentStatus.PAID },
        OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
      },
      select: { clientId: true },
      take: 500,
    });
    // AND NOT_INTERNAL so a platform/demo account with an unpaid demo invoice never
    // shows as owing money.
    return {
      ...segment,
      where: { AND: [{ id: { in: [...new Set(rows.map((r) => r.clientId))] } }, NOT_INTERNAL] },
    };
  }

  if (key === "no-logo" || key === "no-hero" || key === "no-og" || key === "no-image") {
    const gaps = await getClientImageGaps();
    return { ...segment, where: { id: { in: gaps[key] } } };
  }

  if (
    key === "no-end-date" ||
    key === "no-address" ||
    key === "no-social" ||
    key === "no-description"
  ) {
    const gaps = await getClientDataGaps();
    return { ...segment, where: { id: { in: gaps[key] } } };
  }

  if (key === "unreachable") {
    const [missing, noneRows] = await Promise.all([
      getClientIdsMissingCtaMode(),
      db.client.findMany({ where: { ctaMode: ClientCtaMode.NONE }, select: { id: true }, take: 500 }),
    ]);
    const ids = [...new Set([...missing, ...noneRows.map((c) => c.id)])];
    return { ...segment, where: { id: { in: ids } } };
  }

  return segment;
}
