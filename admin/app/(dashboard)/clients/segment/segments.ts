import {
  SubscriptionStatus,
  PaymentStatus,
  ClientCtaMode,
  ArticleStatus,
  type Prisma,
} from "@prisma/client";

import { db } from "@/lib/db";
import { hasStoredOgImage } from "@modonty/database/lib/seo/client/meta-score";

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
  | "unreachable";

interface Segment {
  title: string;
  description: string;
  where: Prisma.ClientWhereInput;
}

const live = { subscriptionStatus: SubscriptionStatus.ACTIVE };
const inAWeek = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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
      title: "Payment overdue",
      description: "They owe you money.",
      where: { paymentStatus: PaymentStatus.OVERDUE },
    },
    expired: {
      title: "Subscription expired",
      description: "Still live on the site, no longer paying.",
      where: { subscriptionStatus: SubscriptionStatus.EXPIRED },
    },
    "expiring-soon": {
      title: "Expiring this week",
      description: "Call them before it lapses.",
      where: { ...live, subscriptionEndDate: { gte: new Date(), lte: inAWeek() } },
    },
    pending: {
      title: "Waiting to be activated",
      description: "Signed up, not switched on yet.",
      where: { subscriptionStatus: SubscriptionStatus.PENDING },
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
    },
    unset: {
      title: "CTA never set",
      description:
        "Their record has no ctaMode field — it predates the field, and a schema push does not backfill. On the site they behave as if they had no button.",
      // Resolved below via raw MongoDB: no Prisma filter can match an absent field.
      where: {},
    },
    active: { title: "Active", description: "Paying and live.", where: live },
    ymyl: {
      title: "YMYL clients",
      description: "Medical, legal or financial — their booking form carries a liability disclaimer.",
      where: { ...live, isYmyl: true },
    },
    standard: {
      title: "Standard clients",
      description: "Everyone who is not YMYL.",
      where: { ...live, isYmyl: false },
    },
    cancelled: {
      title: "Cancelled",
      description: "They left us.",
      where: { subscriptionStatus: SubscriptionStatus.CANCELLED },
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
    },
    "no-hero": {
      title: "No hero image",
      description: "The banner at the top of their client page is empty.",
      where: {},
    },
    "no-og": {
      title: "No share image",
      description:
        "Their published metadata carries no og:image, so every link to them — WhatsApp, X, LinkedIn — previews blank. Worth 25 points of their SEO score.",
      where: {},
    },
    "no-image": {
      title: "No image at all",
      description:
        "No logo, no hero, no share image. Their page is text on white and their links preview blank. Start here.",
      where: {},
    },
    // The Today strip's business number: NONE plus the missing-field ones — every
    // client a visitor has no way to reach. Resolved to an id list below.
    unreachable: {
      title: "Unreachable clients",
      description:
        "No working contact button: ctaMode is NONE, or the field is missing entirely. A visitor who wants them has no way in — this is the conversion leak.",
      where: {},
    },
  };

  const segment = segments[key as SegmentKey];
  if (!segment) return null;

  if (key === "unset") {
    const ids = await getClientIdsMissingCtaMode();
    return { ...segment, where: { id: { in: ids } } };
  }

  if (key === "no-logo" || key === "no-hero" || key === "no-og" || key === "no-image") {
    const gaps = await getClientImageGaps();
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
