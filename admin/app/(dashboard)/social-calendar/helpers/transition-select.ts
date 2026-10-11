import type { Prisma } from "@prisma/client";
import { CALENDAR_LABEL_SELECT } from "./calendar-label";

/**
 * ما يقرؤه كل أكشن انتقال حالة: الحالة الحالية (لآلة الحالات)، عدد الأصول (لشرط «جاهز
 * للمراجعة»)، وحقول الإشعار. مكان واحد كي يقرأ الخمسة نفس الشكل.
 */
export const TRANSITION_SELECT = {
  id: true,
  calendarId: true,
  status: true,
  idea: true,
  scheduledFor: true,
  format: true,
  funnelStages: true,
  channels: true,
  createdById: true,
  creativeAssigneeId: true,
  archivedAt: true,
  calendar: { select: CALENDAR_LABEL_SELECT },
  _count: { select: { assets: true } },
} satisfies Prisma.SocialPostSelect;

export type TransitionPost = Prisma.SocialPostGetPayload<{ select: typeof TRANSITION_SELECT }>;
