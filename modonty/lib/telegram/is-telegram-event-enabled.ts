import type { TelegramEventKey, TelegramEventPreferences } from "./telegram-events";

// Events that default to ON when a client never explicitly set a preference.
// bookingRequest is the most valuable lead — existing clients' prefs JSON lacks
// the key, so without this they'd silently miss every booking. Opt-out, not opt-in.
const DEFAULT_ON_EVENTS: ReadonlySet<TelegramEventKey> = new Set(["bookingRequest"]);

/** Should this event reach the client's Telegram, given the preferences they saved? */
export function isTelegramEventEnabled(
  prefs: TelegramEventPreferences | null | undefined,
  key: TelegramEventKey
): boolean {
  const pref = prefs?.[key];
  if (pref === undefined && DEFAULT_ON_EVENTS.has(key)) return true;
  return pref === true;
}
