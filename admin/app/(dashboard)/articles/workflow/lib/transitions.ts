import { ArticleStatus } from "@prisma/client";

export interface TransitionConfig {
  from: ArticleStatus;
  to: ArticleStatus;
  fromLabel: string;
  toLabel: string;
  pageTitle: string;
  pageDescription: string;
  actionLabel: string;
  confirmTitle: string;
  confirmDescription: string;
  successMessage: string;
}

export const TRANSITIONS = {
  "writing-to-draft": {
    from: ArticleStatus.WRITING,
    to: ArticleStatus.DRAFT,
    fromLabel: "Writing",
    toLabel: "Draft",
    pageTitle: "Writing → Draft",
    pageDescription:
      "Articles currently being written. Move them to Draft when the writer marks them as complete and ready for internal review.",
    actionLabel: "Mark as Draft",
    confirmTitle: "Mark this article as Draft?",
    confirmDescription:
      "The article will move from Writing to Draft. The writer should consider it locked from further free-form editing.",
    successMessage: "Article moved to Draft",
  },
  "draft-to-approval": {
    from: ArticleStatus.DRAFT,
    to: ArticleStatus.AWAITING_APPROVAL,
    fromLabel: "Draft",
    toLabel: "Awaiting Approval",
    pageTitle: "Draft → Awaiting Approval",
    pageDescription:
      "Articles ready to send to the client for approval. Once sent, the client reviews them on the console.",
    actionLabel: "Send for Approval",
    confirmTitle: "Send this article to the client?",
    confirmDescription:
      "The article will move from Draft to Awaiting Approval. The client will be notified and asked to approve or request revision.",
    successMessage: "Article sent for client approval",
  },
  "approval-to-revision": {
    from: ArticleStatus.AWAITING_APPROVAL,
    to: ArticleStatus.NEEDS_REVISION,
    fromLabel: "Awaiting Approval",
    toLabel: "Needs Revision",
    pageTitle: "Approval → Revision",
    pageDescription:
      "Articles where the client has requested changes. Move them to Needs Revision to flag the writer.",
    actionLabel: "Request Revision",
    confirmTitle: "Request revision for this article?",
    confirmDescription:
      "The article will move from Awaiting Approval to Needs Revision. The writer will be notified to address the client feedback.",
    successMessage: "Article moved to Needs Revision",
  },
  "revision-to-draft": {
    from: ArticleStatus.NEEDS_REVISION,
    to: ArticleStatus.DRAFT,
    fromLabel: "Needs Revision",
    toLabel: "Draft",
    pageTitle: "Revision → Draft",
    pageDescription:
      "Articles the client requested changes on. Read the client's notes, edit the article, then re-submit for the Quality Gate before sending back to the client.",
    actionLabel: "Re-submit for Review",
    confirmTitle: "Re-submit this article?",
    confirmDescription:
      "The article will move from Needs Revision back to Draft. The Quality Gate will run again before you can send it to the client.",
    successMessage: "Article re-submitted to Draft",
  },
  "approval-to-scheduled": {
    from: ArticleStatus.AWAITING_APPROVAL,
    to: ArticleStatus.SCHEDULED,
    fromLabel: "Awaiting Approval",
    toLabel: "Scheduled",
    pageTitle: "Approval → Scheduled",
    pageDescription:
      "Articles approved by the client and scheduled for future publishing. The system will publish them automatically at the scheduled date.",
    actionLabel: "Schedule for Publish",
    confirmTitle: "Schedule this article for publishing?",
    confirmDescription:
      "The article will move from Awaiting Approval to Scheduled. Make sure the scheduled date is set correctly on the article.",
    successMessage: "Article scheduled for publishing",
  },
  "scheduled-to-published": {
    from: ArticleStatus.SCHEDULED,
    to: ArticleStatus.PUBLISHED,
    fromLabel: "Scheduled",
    toLabel: "Published",
    pageTitle: "Scheduled → Published",
    pageDescription:
      "Articles scheduled for publishing. Publish them now manually if you want to skip the scheduled date.",
    actionLabel: "Publish Now",
    confirmTitle: "Publish this article now?",
    confirmDescription:
      "The article will be live on modonty.com immediately. This action cannot be easily reversed.",
    successMessage: "Article published",
  },
} as const satisfies Record<string, TransitionConfig>;

export type TransitionSlug = keyof typeof TRANSITIONS;

export function isValidTransitionSlug(slug: string): slug is TransitionSlug {
  return slug in TRANSITIONS;
}

export function getTransition(slug: TransitionSlug): TransitionConfig {
  return TRANSITIONS[slug];
}
