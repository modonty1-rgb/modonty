import { ArticleStatus, type Prisma } from "@prisma/client";

/**
 * Same contract as the client segments: every clickable number on the dashboard's
 * Articles section maps to a key here, and the key owns the exact `where` that
 * produced the count. One definition, used by both the card and the list — so the
 * number and the rows behind it can never disagree.
 */

// No "orphan" segment: Article.clientId is a required field, so an article without
// a client cannot exist. A card that can never fill is noise.
export type ArticleSegmentKey =
  | "published"
  | "awaiting-approval"
  | "scheduled"
  | "writing"
  | "draft"
  | "needs-revision"
  | "archived"
  | "ymyl-uncited"
  | "seo-imperfect"
  | "seo-perfect";

interface Segment {
  title: string;
  description: string;
  where: Prisma.ArticleWhereInput;
  // SEO score is COMPUTED (round((meta+jsonLd)/2)), not a Prisma column, so it can't
  // live in `where`. When set, the segment page keeps only rows on this side of 100
  // AFTER scoring — the exact split the dashboard count uses, so list === number.
  scoreFilter?: "perfect" | "imperfect";
}

const SEGMENTS: Record<ArticleSegmentKey, Segment> = {
  published: {
    title: "Published",
    description: "Live on modonty.com right now.",
    where: { status: ArticleStatus.PUBLISHED },
  },
  "awaiting-approval": {
    title: "Waiting for the client to approve",
    description: "We finished it. The ball is in their court — chase them.",
    where: { status: ArticleStatus.AWAITING_APPROVAL },
  },
  scheduled: {
    title: "Scheduled",
    description: "Approved and queued — it will publish itself on its date.",
    where: { status: ArticleStatus.SCHEDULED },
  },
  writing: {
    title: "Being written",
    description: "Still on our desk.",
    where: { status: ArticleStatus.WRITING },
  },
  draft: {
    title: "Drafts",
    description: "Written, not yet sent for approval.",
    where: { status: ArticleStatus.DRAFT },
  },
  "needs-revision": {
    title: "Needs revision",
    description: "The client asked for changes. Read their notes and fix it.",
    where: { status: ArticleStatus.NEEDS_REVISION },
  },
  archived: {
    title: "Archived",
    description: "Pulled from the site. Returns 410 to Google.",
    where: { status: ArticleStatus.ARCHIVED },
  },
  // E-E-A-T risk: a YMYL article (any category — medical, legal, financial) with an
  // empty citations list. Google won't trust YMYL claims without authoritative sources.
  // Archived ones are off the site, so they don't count — live/upcoming liability only.
  "ymyl-uncited": {
    title: "YMYL articles with no sources",
    description:
      "YMYL content (medical, legal, financial) Google won't trust without citations. Add authoritative sources before it loses ranking.",
    where: {
      status: { not: ArticleStatus.ARCHIVED },
      citations: { isEmpty: true },
      client: { isYmyl: true },
    },
  },
  // SEO health of EVERY article, any status (Khalid 2026-07-23: an article is an article
  // — the only question is whether it has an SEO problem). A draft with no generated
  // metadata scores low and lands here ON PURPOSE — it's a real to-do to follow up.
  // No `where`: same all-status scope as the dashboard count, so list === number.
  "seo-imperfect": {
    title: "Articles with SEO problems",
    description:
      "Any article — draft, published or in revision — that isn't a perfect 100 on the shared SEO rubric (meta + JSON-LD). Open each to see which checks are missing.",
    where: {},
    scoreFilter: "imperfect",
  },
  "seo-perfect": {
    title: "Articles with perfect SEO",
    description:
      "Any article that passes every check on the shared SEO rubric — nothing to fix.",
    where: {},
    scoreFilter: "perfect",
  },
};

export function getArticleSegment(key: string): Segment | null {
  return SEGMENTS[key as ArticleSegmentKey] ?? null;
}
