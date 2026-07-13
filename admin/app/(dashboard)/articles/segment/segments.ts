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
  | "archived";

interface Segment {
  title: string;
  description: string;
  where: Prisma.ArticleWhereInput;
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
};

export function getArticleSegment(key: string): Segment | null {
  return SEGMENTS[key as ArticleSegmentKey] ?? null;
}
