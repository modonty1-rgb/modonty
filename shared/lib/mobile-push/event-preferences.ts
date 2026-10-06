import { Prisma } from "@prisma/client";
import { CLIENT_EVENT_CATALOG, type ClientEventKind } from "./client-event-catalog";
import { isGroupOn, type NotificationGroupKey, type NotificationPreferences } from "./preference-groups";

/**
 * المفتاح لكل حدث — القاعدة الوحيدة للمُرسِل والشاشة معاً.
 *
 * مفتاح الحدث المحفوظ يحكم؛ وإن غاب فمفتاح مجموعته القديم (والغائب هناك = مشغّل). فلا يُسكت
 * عميلٌ لم يفتح الإعدادات أبداً، ولا يُنسى اختيار من أطفأ مجموعة كاملة قبل ٦ أكتوبر ٢٠٢٦.
 */
export function isEventOn(preferences: NotificationPreferences, kind: ClientEventKind, group: NotificationGroupKey): boolean {
  const own = preferences.events?.[kind];
  return typeof own === "boolean" ? own : isGroupOn(preferences, group);
}

/** صفوف «حسابي»: كل الأحداث بترتيب الكتالوج، ولكل حدث حالته الفعلية. */
export function eventToggles(preferences: NotificationPreferences) {
  return CLIENT_EVENT_CATALOG.map((entry) => ({
    key: entry.kind,
    group: entry.group,
    section: entry.section,
    label: entry.label,
    enabled: isEventOn(preferences, entry.kind, entry.group),
  }));
}

/** يكتب مفتاح حدث واحد ويحمل بقية المحفوظ كما هو. */
export function mergeEventPreference(stored: Prisma.JsonValue | null, kind: ClientEventKind, enabled: boolean): Prisma.InputJsonValue {
  const base: Record<string, unknown> = stored !== null && typeof stored === "object" && !Array.isArray(stored) ? { ...(stored as Record<string, unknown>) } : {};
  const events = base.events !== null && typeof base.events === "object" && !Array.isArray(base.events) ? { ...(base.events as Record<string, unknown>) } : {};
  events[kind] = enabled;
  base.events = events;
  return base as Prisma.InputJsonValue;
}
