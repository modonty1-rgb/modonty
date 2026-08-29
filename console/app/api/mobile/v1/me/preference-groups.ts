import { Prisma } from "@prisma/client";

/**
 * The two switches on S13, and the `Client.notificationPreferences` keys behind them.
 *
 * The screen shows TWO switches; the field documents FOUR keys
 * (`{ articlePublished, articleApproved, commentsNew, supportReplies }` — see the schema
 * comment). No fifth key is invented: a switch whose value has nowhere to live is a switch
 * that silently forgets. Each group therefore owns a subset, and flipping it writes every
 * key in that subset.
 *
 * Reading is `=== true`, exactly like the web form at `/dashboard/settings`. Treating an
 * absent key as ON would make the same account read «مفعّل» on the phone and «مطفأ» on the
 * browser, and neither surface would be wrong on its own — which is the worst kind of bug.
 */

export type NotificationGroupKey = "actionable" | "activity";

type NotificationPreferenceKey = "articlePublished" | "articleApproved" | "commentsNew" | "supportReplies";

type NotificationGroup = { key: NotificationGroupKey; label: string; description: string; preferenceKeys: NotificationPreferenceKey[] };

export const NOTIFICATION_GROUPS: NotificationGroup[] = [
  { key: "actionable", label: "ما يحتاج إجراء", description: "مقال أو سؤال أو فشل رفع", preferenceKeys: ["articleApproved", "supportReplies"] },
  { key: "activity", label: "نشاط المتابعين", description: "تعليقات، متابعات ومؤشرات", preferenceKeys: ["commentsNew", "articlePublished"] },
];

export type NotificationPreferences = Partial<Record<NotificationPreferenceKey, boolean>>;

/** Keeps unknown keys out but never rewrites them away — see `mergeNotificationPreferences`. */
export function readNotificationPreferences(stored: Prisma.JsonValue | null): NotificationPreferences {
  if (stored === null || typeof stored !== "object" || Array.isArray(stored)) return {};
  const raw = stored as Record<string, unknown>;
  const out: NotificationPreferences = {};
  for (const group of NOTIFICATION_GROUPS) {
    for (const key of group.preferenceKeys) {
      if (typeof raw[key] === "boolean") out[key] = raw[key];
    }
  }
  return out;
}

export function notificationToggles(preferences: NotificationPreferences) {
  return NOTIFICATION_GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    description: group.description,
    enabled: group.preferenceKeys.every((key) => preferences[key] === true),
  }));
}

/** Writes only this group's keys and carries every other stored key through untouched. */
export function mergeNotificationPreferences(stored: Prisma.JsonValue | null, groupKey: NotificationGroupKey, enabled: boolean): Prisma.InputJsonValue {
  const base: Record<string, unknown> = stored !== null && typeof stored === "object" && !Array.isArray(stored) ? { ...(stored as Record<string, unknown>) } : {};
  const group = NOTIFICATION_GROUPS.find((candidate) => candidate.key === groupKey);
  if (!group) return base as Prisma.InputJsonValue;
  for (const key of group.preferenceKeys) base[key] = enabled;
  return base as Prisma.InputJsonValue;
}
