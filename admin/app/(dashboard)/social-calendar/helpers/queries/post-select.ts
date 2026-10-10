import type { Prisma } from "@prisma/client";

/**
 * الحقول التي يقرؤها التقويم والتفصيل والنماذج — مكان واحد كي لا يقرأ الجدول حقلاً ينساه
 * الحوار. لا تُقرأ حقول الترحيل (`legacyEntryId`).
 */
export const SOCIAL_POST_SELECT = {
  id: true,
  clientId: true,
  scheduledFor: true,
  status: true,
  statusUpdatedAt: true,
  productionStartedAt: true,
  productionCompletedAt: true,
  publishedAt: true,
  format: true,
  funnelStages: true,
  channels: true,
  idea: true,
  text: true,
  hook: true,
  cta: true,
  scriptUrl: true,
  voiceTone: true,
  inspiration: true,
  notes: true,
  rejectionNote: true,
  rejectionCount: true,
  paidKind: true,
  budget: true,
  currency: true,
  adDurationDays: true,
  publishAt: true,
  channelLinks: true,
  createdById: true,
  creativeAssigneeId: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
  assets: {
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, kind: true, url: true, label: true, width: true, height: true, bytes: true, bunnyVideoId: true },
  },
} satisfies Prisma.SocialPostSelect;

export type SocialPostRow = Prisma.SocialPostGetPayload<{ select: typeof SOCIAL_POST_SELECT }>;
export type SocialAssetRow = SocialPostRow["assets"][number];
