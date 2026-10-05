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
 * **An absent key is ON** (`!== false`) — on the phone, on the web form at
 * `/dashboard/settings`, and in the sender. Khalid, 5 Oct 2026: «احنا بنينا الكونسل عشان
 * موضوع النوتيفيكيشن». Reading absent as OFF muted every client who never opened settings —
 * i.e. all of them — so the app was installed, the OS permission granted, and nothing rang.
 * The OS permission is the consent; the switches are for opting OUT. Every reader of these
 * keys goes through `isPreferenceOn` so the three surfaces cannot drift apart again.
 */

export type NotificationGroupKey = "actionable" | "activity";

export type NotificationPreferenceKey = "articlePublished" | "articleApproved" | "commentsNew" | "supportReplies";

type NotificationGroup = { key: NotificationGroupKey; label: string; description: string; preferenceKeys: NotificationPreferenceKey[] };

export const NOTIFICATION_GROUPS: NotificationGroup[] = [
  { key: "actionable", label: "ما يحتاج إجراء", description: "مقال أو سؤال أو فشل رفع", preferenceKeys: ["articleApproved", "supportReplies"] },
  { key: "activity", label: "نشاط المتابعين", description: "تعليقات، متابعات ومؤشرات", preferenceKeys: ["commentsNew", "articlePublished"] },
];

export type NotificationPreferences = Partial<Record<NotificationPreferenceKey, boolean>>;

/** The one rule for every surface: only an explicit `false` turns a key off. */
export function isPreferenceOn(preferences: NotificationPreferences, key: NotificationPreferenceKey): boolean {
  return preferences[key] !== false;
}

/** Whether a whole group (one switch on S13) is on — every key it owns must be on. */
export function isGroupOn(preferences: NotificationPreferences, groupKey: NotificationGroupKey): boolean {
  const group = NOTIFICATION_GROUPS.find((candidate) => candidate.key === groupKey);
  return group !== undefined && group.preferenceKeys.every((key) => isPreferenceOn(preferences, key));
}

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
    enabled: isGroupOn(preferences, group.key),
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
